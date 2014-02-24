function BinaryReader(arraybuffer) {
  this.data_ = new Uint8Array(arraybuffer);
  this.pos_ = 0;
}

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
