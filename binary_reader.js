function BinaryReader(arraybuffer) {
  this.data_ = new Uint8Array(arraybuffer);
  this.pos_ = 0;
}

BinaryReader.fromWordArray = function(wordArray) {
  var buf = new ArrayBuffer(wordArray.sigBytes);
  var words = new Uint32Array(buf);
  // swap endianness, from http://stackoverflow.com/questions/5320439/#answer-5320624
  words.set(wordArray.words.map(function(val) {
    return ((val & 0xFF) << 24)
           | ((val & 0xFF00) << 8)
           | ((val >> 8) & 0xFF00)
           | ((val >> 24) & 0xFF);
  }));
  return new BinaryReader(buf);
};

BinaryReader.prototype.hasNextByte = function() {
  return this.pos_ < this.data_.length;
};

BinaryReader.prototype.hasNextInt = function() {
  return this.pos_ < this.data_.length - 3;
};

BinaryReader.prototype.readByte = function() {
  if (!this.hasNextByte()) {
    throw new RangeError();
  }
  return this.data_[this.pos_++];
};

BinaryReader.prototype.readBytes = function(num) {
  var bytes = [];
  for (var i = 0; i < num; i++) {
    bytes.push(this.readByte());
  }
  return bytes;
};

BinaryReader.prototype.readInt = function() {
  var bytes = this.readBytes(4);
  var result = 0;
  for (var i = bytes.length - 1; i >= 0; i--) {
    result = (result * 256) + bytes[i];
  }
  return result;
};

BinaryReader.prototype.readWord = function() {
  var bytes = this.readBytes(4);
  var result = 0;
  for (var i = 0; i < bytes.length; i++) {
    result = (result * 256) + bytes[i];
  }
  return result;
};

BinaryReader.prototype.readWordArray = function(num) {
  var words = [];
  while (num > 0) {
    words.push(this.readWord());
    num -= 4;
  }
  return CryptoJS.lib.WordArray.create(words);
};

BinaryReader.prototype.readRestToWordArray = function() {
  var restOfFile = [];
  var numBytes = 0;
  while (this.hasNextInt()) {
    restOfFile.push(this.readWord());
    numBytes += 4;
  }
  return CryptoJS.lib.WordArray.create(restOfFile, numBytes);
};
