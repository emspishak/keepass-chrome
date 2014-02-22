function KeyFileParser(arraybuffer) {
  this.bytes_ = new BinaryReader(arraybuffer);
}

KeyFileParser.prototype.parse = function() {
  return {
    "header": this.parseHeader_()
  };
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
