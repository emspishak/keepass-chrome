function KeyFileParser(arraybuffer) {
  this.bytes_ = new BinaryReader(arraybuffer);
}
KeyFileParser.DATABASE_SIGNATURE_1 = 2594363651;
KeyFileParser.DATABASE_SIGNATURE_2 = 3041655653;
KeyFileParser.DATABASE_VERSION = 196612;
KeyFileParser.DATABASE_VERSION_MASK = 4294967040;

KeyFileParser.prototype.parse = function(password) {
  var result = {};
  var header = this.parseHeader_();
  result['header'] = header;
  if (!this.verifyVersion_(header)) {
    result['error'] = 'Invalid key file version';
    return result;
  }
  var encryptedData = this.bytes_.readRestToWordArray();
  var key = this.transformKey_(password, header['masterSeed'], header['masterSeed2'],
      header['keyEncryptionRounds']);
  var decryptedData = this.decryptFile_(header['flags'], encryptedData, key,
      header['encryptionInitialValue'], header['contentsHash']);
  if (decryptedData['error']) {
    result['error'] = decryptedData['error'];
    return result;
  }
  result['decryptedData'] = decryptedData;
  var rest = BinaryReader.fromWordArray(decryptedData);
  this.parseContents_(rest, header);
  return result;
};

KeyFileParser.prototype.parseHeader_ = function() {
  return {
    "signature1": this.bytes_.readInt(),
    "signature2": this.bytes_.readInt(),
    "flags": this.parseHeaderFlags_(),
    "version": this.bytes_.readInt(),
    "masterSeed": this.bytes_.readWordArray(16),
    "encryptionInitialValue": this.bytes_.readWordArray(16),
    "groups": this.bytes_.readInt(),
    "entries": this.bytes_.readInt(),
    "contentsHash": this.bytes_.readWordArray(32),
    "masterSeed2": this.bytes_.readWordArray(32),
    "keyEncryptionRounds": this.bytes_.readInt()
  };
};

KeyFileParser.prototype.parseHeaderFlags_ = function() {
  var b = this.bytes_.readInt();
  return {
    "sha2": !!(b & 1),
    "rijndael": !!(b & 2),
    "arcfour": !!(b & 4),
    "twofish": !!(b & 8)
  };
};

KeyFileParser.prototype.verifyVersion_ = function(header) {
  return header['signature1'] == KeyFileParser.DATABASE_SIGNATURE_1
      && header['signature2'] == KeyFileParser.DATABASE_SIGNATURE_2
      && (header['version'] & KeyFileParser.DATABASE_VERSION_MASK)
          == (KeyFileParser.DATABASE_VERSION & KeyFileParser.DATABASE_VERSION_MASK);
};

KeyFileParser.prototype.transformKey_ = function(plainTextKey, masterSeed, masterSeed2,
      keyEncryptionRounds) {
  var hashedKey = CryptoJS.SHA256(plainTextKey);
  var encrypted = hashedKey;
  var cfg = {
    "mode": CryptoJS.mode.ECB,
    "padding": CryptoJS.pad.NoPadding
  };
  for (var i = 0; i < keyEncryptionRounds; i++) {
    encrypted = CryptoJS.AES.encrypt(encrypted, masterSeed2, cfg).ciphertext;
  }
  return CryptoJS.SHA256(masterSeed.concat(CryptoJS.SHA256(encrypted)));
};

KeyFileParser.prototype.decryptFile_ = function(headerFlags, encryptedData, key,
      encryptionInitialValue, contentsHash) {
  var cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: encryptedData
  });
  var cfg = {
    "mode": CryptoJS.mode.CBC,
    "iv": encryptionInitialValue,
    "padding": CryptoJS.pad.Pkcs7
  };
  var decryptedData;
  if (headerFlags['rijndael']) {
    decryptedData = this.decryptAes_(cipherParams, key, cfg);
  } else if (headerFlags['twofish']) {
    decryptedData = this.decryptTwoFish_(cipherParams, key, cfg);
  } else {
    return { "error": "Invalid encryption type" };
  }
  var hash = CryptoJS.SHA256(decryptedData);
  if (hash.toString() !== contentsHash.toString()) {
    return { "error": "Invalid password" };
  }
  return decryptedData;
};

KeyFileParser.prototype.decryptAes_ = function(cipherParams, key, cfg) {
  var decryptedData = CryptoJS.AES.decrypt(cipherParams, key, cfg);
  decryptedData.clamp();
  return decryptedData;
};

KeyFileParser.prototype.decryptTwoFish_ = function(cipherParams, key, cfg) {
  var decryptedData = CryptoJS.TwoFish.decrypt(cipherParams, key, cfg);
  decryptedData.clamp();
  return decryptedData;
};

KeyFileParser.prototype.parseContents_ = function(contents, header) {
  var groups = [];
  var levels = [];
  for (var curGroup = 0; curGroup < header['groups']; curGroup++) {
    groups.push(this.readGroup_(contents, levels));
  }
};

KeyFileParser.prototype.readGroup_ = function(contents, levels) {
  var group = {};
  var fieldType = -1;
  while (fieldType != 65535) {
    fieldType = contents.readShort();
    var fieldSize = contents.readInt();
    switch (fieldType) {
      case 1:
        group['id'] = contents.readInt();
        break;
      case 2:
        group['title'] = contents.readString();
        break;
      case 7:
        group['image'] = contents.readInt();
        break;
      case 8:
        levels.push(contents.readShort());
        break;
      // Unused field types
      case 0:
      case 3:
      case 4:
      case 5:
      case 6:
      case 9:
      case 65535:
      default:
        contents.readBytes(fieldSize);
        break;
    }
  }
  return group;
};
