/**
 * Reads binary data.
 */

/**
 * @param {!ArrayBuffer} arraybuffer The binary data to read.
 * @param {number=} opt_length The length of the data, uses the ArrayBuffers byte length if this isn't specified.
 * @constructor
 */
BinaryReader = function(arraybuffer, opt_length) {
  this.data_ = new Uint8Array(arraybuffer);
  this.length_ = opt_length || arraybuffer.byteLength;
  this.pos_ = 0;
};


/**
 * Creates a BinaryReader from a WordArray.
 * @param {!WordArray} wordArray The WordArray.
 * @return {BinaryReader} A new BinaryReader.
 */
BinaryReader.fromWordArray = function(wordArray) {
  var length = Math.ceil(wordArray.sigBytes / Uint32Array.BYTES_PER_ELEMENT) *
                   Uint32Array.BYTES_PER_ELEMENT;
  var buf = new ArrayBuffer(length);
  var words = new Uint32Array(buf);
  // swap endianness, from http://stackoverflow.com/questions/5320439/#answer-5320624
  words.set(wordArray.words.map(function(val) {
    return ((val & 0xFF) << 24)
           | ((val & 0xFF00) << 8)
           | ((val >> 8) & 0xFF00)
           | ((val >> 24) & 0xFF);
  }));
  return new BinaryReader(buf, wordArray.sigBytes);
};


/**
 * @return {boolean} True if there's at least one more byte.
 */
BinaryReader.prototype.hasNextByte = function() {
  return this.pos_ < this.length_;
};


/**
 * @return {boolean} True if there's at least one more int.
 */
BinaryReader.prototype.hasNextInt = function() {
  return this.pos_ < this.length_ - 3;
};


/**
 * @return {number} The next byte.
 */
BinaryReader.prototype.readByte = function() {
  if (!this.hasNextByte()) {
    throw new RangeError();
  }
  return this.data_[this.pos_++];
};


/**
 * @param {!number} The number of bytes to read.
 * @return {Array.<number>} The bytes.
 */
BinaryReader.prototype.readBytes = function(num) {
  var bytes = [];
  for (var i = 0; i < num; i++) {
    bytes.push(this.readByte());
  }
  return bytes;
};


/**
 * @param {!number} The numbers of bytes to read.
 * @return {number} The number.
 * @private
 */
BinaryReader.prototype.readNumber_ = function(numBytes) {
  var bytes = this.readBytes(numBytes);
  var result = 0;
  for (var i = bytes.length - 1; i >= 0; i--) {
    result = (result * 256) + bytes[i];
  }
  return result;
};


/**
 * @return {number} The short.
 */
BinaryReader.prototype.readShort = function() {
  return this.readNumber_(2);
};


/**
 * @return {number} The int.
 */
BinaryReader.prototype.readInt = function() {
  return this.readNumber_(4);
};


/**
 * @return {number} The word.
 */
BinaryReader.prototype.readWord = function() {
  var bytes = this.readBytes(4);
  var result = 0;
  for (var i = 0; i < bytes.length; i++) {
    result = (result * 256) + bytes[i];
  }
  return result;
};


/**
 * @param {!number} num The number of bytes to read.
 * @return {WordArray} The bytes.
 */
BinaryReader.prototype.readWordArray = function(num) {
  var words = [];
  while (num > 0) {
    words.push(this.readWord());
    num -= 4;
  }
  return CryptoJS.lib.WordArray.create(words);
};


/**
 * @return {WordArray} The bytes.
 */
BinaryReader.prototype.readRestToWordArray = function() {
  var restOfFile = [];
  var numBytes = 0;
  while (this.hasNextInt()) {
    restOfFile.push(this.readWord());
    numBytes += 4;
  }
  return CryptoJS.lib.WordArray.create(restOfFile, numBytes);
};


/**
 * Reads in a null-terminated string.
 * @return {string} The string;
 */
BinaryReader.prototype.readString = function() {
  var result = '';
  var b = this.readByte();
  while (b != 0) {
    result += String.fromCharCode(b);
    b = this.readByte();
  }
  return result;
};


/**
 * @return {Date} The date.
 */
BinaryReader.prototype.readDate = function() {
  var bytes = this.readBytes(5);

  var year = (bytes[0] << 6) | (bytes[1] >> 2);
  var month = ((bytes[1] & 3) << 2) | (bytes[2] >> 6);
  var day = (bytes[2] >> 1) & 31;
  var hour = ((bytes[2] & 1) << 4) | (bytes[3] >> 4);
  var min = ((bytes[3] & 15) << 2) | (bytes[4] >> 6);
  var sec = bytes[4] & 63;

  return new Date(year, month - 1, day, hour, min, sec);
};
