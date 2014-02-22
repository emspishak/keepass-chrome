function KeyFileParser(arraybuffer) {
  this.bytes_ = new BinaryReader(arraybuffer);
}
KeyFileParser.DATABASE_SIGNATURE_1 = 2594363651;
KeyFileParser.DATABASE_SIGNATURE_2 = 3041655653;
KeyFileParser.DATABASE_VERSION = 196612;
KeyFileParser.DATABASE_VERSION_MASK = 4294967040;

KeyFileParser.prototype.parse = function() {
  var result = {};
  result['header'] = this.parseHeader_();
  if (!this.verifyVersion_(result['header'])) {
    result['error'] = 'Invalid key file version';
    return result;
  }
  return result;
};

KeyFileParser.prototype.parseHeader_ = function() {
  return {
    "signature1": this.bytes_.readInt(),
    "signature2": this.bytes_.readInt(),
    "flags": this.parseHeaderFlags_(),
    "version": this.bytes_.readInt(),
    "masterSeed": this.bytes_.readBytes(16),
    "encryptionInitialValue": this.bytes_.readBytes(16),
    "groups": this.bytes_.readInt(),
    "entries": this.bytes_.readInt(),
    "contentsHash": this.bytes_.readBytes(32),
    "masterSeed2": this.bytes_.readBytes(32),
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
