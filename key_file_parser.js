/**
 * Decrypts and parses a keyfile.
 */

/**
 * @param {!ArrayBuffer} arraybuffer The keyfile bytes.
 * @constructor
 */
KeyFileParser = function(arraybuffer) {

  /**
   * The encrypted bytes.
   * @type {!BinaryReader}
   */
  this.bytes_ = new BinaryReader(arraybuffer);
};
KeyFileParser.DATABASE_SIGNATURE_1 = 2594363651;
KeyFileParser.DATABASE_SIGNATURE_2 = 3041655653;
KeyFileParser.DATABASE_VERSION = 196612;
KeyFileParser.DATABASE_VERSION_MASK = 4294967040;


/**
 * Parses the keyfile with the given password.
 * @param {!string} password The password to decrypt the keyfile.
 * @return {Object} the parsed keyfile contents.
 */
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
  result['rootGroup'] = this.parseContents_(rest, header['groups'], header['entries']);
  return result;
};


/**
 * Parses the keyfile header.
 * @return {Object} The parsed header.
 * @private
 */
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


/**
 * Parses the header flags.
 * @return {Object} The parsed header flags.
 * @private
 */
KeyFileParser.prototype.parseHeaderFlags_ = function() {
  var b = this.bytes_.readInt();
  return {
    "sha2": !!(b & 1),
    "rijndael": !!(b & 2),
    "arcfour": !!(b & 4),
    "twofish": !!(b & 8)
  };
};


/**
 * Verifies that the keyfile is the supported version.
 * @param {!Object} The keyfile header.
 * @return {boolean} True if the keyfile is the supported verison, false otherwise.
 * @private
 */
KeyFileParser.prototype.verifyVersion_ = function(header) {
  return header['signature1'] == KeyFileParser.DATABASE_SIGNATURE_1
      && header['signature2'] == KeyFileParser.DATABASE_SIGNATURE_2
      && (header['version'] & KeyFileParser.DATABASE_VERSION_MASK)
          == (KeyFileParser.DATABASE_VERSION & KeyFileParser.DATABASE_VERSION_MASK);
};


/**
 * Transforms the password into the key used to decrypt the keyfile.
 * @param {!string} plainTextKey The password to decrypt the keyfile.
 * @param {!WordArray} masterSeed The master seed from the keyfile header.
 * @param {!WordArray} masterSeed2 The second master seed from the keyfile header.
 * @param {!number} keyEncryptionRounds The number of rounds needed to decrypt.
 * @return {WordArray} The key to decrypt the keyfile.
 */
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


/**
 * Decrypts the keyfile.
 * @param {!Object} headerFlags The header flags.
 * @param {!WordArray} encryptedData The encrypted part of the keyfile.
 * @param {!WordArray} key The key to decrypt the keyfile.
 * @param {!WordArray} encryptionInitialValue The IV key from the header.
 * @param {!WordArray} contentsHash The hash of the contents to check that the decryption succeeds.
 * @return {WordArray} The decrypted keyfile.
 * @private
 */
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


/**
 * Decrypts the keyfile with AES.
 * @param {!CipherParams} cipherParams The cipher params containing the bytes to decrypt.
 * @param {!WordArray} key The decryption key.
 * @param {!Object} config The decryption parameters.
 * @return {WordArray} The decrypted bytes.
 * @private
 */
KeyFileParser.prototype.decryptAes_ = function(cipherParams, key, cfg) {
  var decryptedData = CryptoJS.AES.decrypt(cipherParams, key, cfg);
  decryptedData.clamp();
  return decryptedData;
};


/**
 * Decrypts the keyfile with Two Fish.
 * @param {!CipherParams} cipherParams The cipher params containing the bytes to decrypt.
 * @param {!WordArray} key The decryption key.
 * @param {!Object} config The decryption parameters.
 * @return {WordArray} The decrypted bytes.
 * @private
 */
KeyFileParser.prototype.decryptTwoFish_ = function(cipherParams, key, cfg) {
  var decryptedData = CryptoJS.TwoFish.decrypt(cipherParams, key, cfg);
  decryptedData.clamp();
  return decryptedData;
};


/**
 * Parses the decryped key file.
 * @param {!BinaryReader} contents The decrypted key file.
 * @param {number} numGroups The number of groups in the key file.
 * @param {number} numEntries The number of entries in the key file.
 * @return {Group} The top group of the key file.
 * @private
 */
KeyFileParser.prototype.parseContents_ = function(contents, numGroups, numEntries) {
  var groups = [];
  var levels = [];
  for (var curGroup = 0; curGroup < numGroups; curGroup++) {
    groups.push(this.readGroup_(contents, levels));
  }
  var entries = [];
  for (var curEntry = 0; curEntry < numEntries; curEntry++) {
    entries.push(this.readEntry_(contents));
  }

  var rootGroup = new Group('$ROOT$', '$ROOT$');
  this.createGroupTree_(levels, groups, rootGroup);
  this.assignEntriesToGroups_(entries, groups, rootGroup);

  return rootGroup;
};


/**
 * Reads in a group from the decrypted key file.
 * @param {!BinaryReader} contents The decrypted key file.
 * @param {!Array.<number>} levels A list of the levels.
 * @return {Group} the parsed group.
 * @private
 */
KeyFileParser.prototype.readGroup_ = function(contents, levels) {
  var id = undefined;
  var title = undefined;
  var image = undefined;

  var fieldType = -1;
  while (fieldType != 65535) {
    fieldType = contents.readShort();
    var fieldSize = contents.readInt();
    switch (fieldType) {
      case 1:
        id = contents.readInt();
        break;
      case 2:
        title = contents.readString();
        break;
      case 7:
        image = contents.readInt();
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
  return new Group(id, title, image);
};


/**
 * Reads in an entry from the decrypted key file.
 * @param {!BinaryReader} contents The decrypted key file.
 * @return {Object} The parsed entry.
 * @private
 */
KeyFileParser.prototype.readEntry_ = function(contents) {
  var entry = {};
  var fieldType = -1;
  while (fieldType != 65535) {
    fieldType = contents.readShort();
    var fieldSize = contents.readInt();
    switch (fieldType) {
      case 1:
        entry['uuid'] = contents.readBytes(16);
        break;
      case 2:
        entry['groupId'] = contents.readInt();
        break;
      case 3:
        entry['image'] = contents.readInt();
        break;
      case 4:
        entry['title'] = contents.readString();
        break;
      case 5:
        entry['url'] = contents.readString();
        break;
      case 6:
        entry['username'] = contents.readString();
        break;
      case 7:
        entry['password'] = contents.readString();
        break;
      case 8:
        entry['comment'] = contents.readString();
        break;
      case 9:
        entry['creation'] = contents.readDate();
        break;
      case 10:
        entry['lastModified'] = contents.readDate();
        break;
      case 11:
        entry['lastAccessed'] = contents.readDate();
        break;
      case 12:
        entry['expires'] = contents.readDate();
        break;
      case 13:
        entry['binaryDesc'] = contents.readString();
        break;
      case 14:
        entry['binary'] = contents.readBytes(fieldSize);
        break;

      // Unused field types
      case 0:
      case 65535:
      default:
        contents.readBytes(fieldSize);
        break;
    }
  }
  return entry;
};


/**
 * Builds the groups into a tree.
 * @param {!Array.<number>} levels A list of the levels.
 * @param {!Array.<Group>} groups The groups.
 * @param {!Group} rootGroup The top group.
 * @private
 */
KeyFileParser.prototype.createGroupTree_ = function(levels, groups, rootGroup) {
  for (var i = 0; i < groups.length; i++) {
    if (levels[i] == 0) {
      rootGroup.addChild(groups[i]);
    } else {
      var parentGroupIndex = this.findParentGroupIndex_(i, levels);
      var parentGroup = (parentGroupIndex == -1) ? rootGroup : groups[parentGroupIndex];
      parentGroup.addChild(groups[i]);
    }
  }
};

/**
 * Finds the index in the levels for the parent group of the current group.
 * @param {number} currentGroupIndex The index of the current group.
 * @param {!Array.<number>} levels A list of the levels.
 * @return {number} The index in the levels of the parent group.
 * @private
 */
KeyFileParser.prototype.findParentGroupIndex_ = function(currentGroupIndex, levels) {
  var j;
  for (j = currentGroupIndex - 1; j >= 0; j--) {
    if (levels[j] < levels[currentGroupIndex]) {
      if (levels[currentGroupIndex] - levels[j] != 1) {
        return -1;
      } else {
        return j;
      }
    }
  }
  return -1;
};


/**
 * Puts entries in their group.
 * @param {!Array.<Object>} entries The entries.
 * @param {!Array.<Group>} groups The groups.
 * @param {!Group} rootGroup The top group.
 * @private
 */
KeyFileParser.prototype.assignEntriesToGroups_ = function(entries, groups, rootGroup) {
  for (var e = 0; e < entries.length; e++) {
    var group = this.findGroup_(entries[e], groups, rootGroup);
    group.addEntry(entries[e]);
  }
};


/**
 * Finds the group that the given entry belongs in.
 * @param {!Object} entry The entry.
 * @param {!Array.<Group>} groups The groups.
 * @param {!Group} rootGroup The top group.
 * @return {Group} The group that the entry belongs in, or the first group if the entry's group doesn't exist.
 */
KeyFileParser.prototype.findGroup_ = function(entry, groups, rootGroup) {
  for (var g = 0; g < groups.length; g++) {
    if (entry.groupId == groups[g].getId()) {
      return groups[g];
    }
  }

  return rootGroup.getChild(0);
};
