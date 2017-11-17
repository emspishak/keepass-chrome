/**
 * @fileoverview Reads binary data.
 */



/**
 * @param {!ArrayBuffer} arraybuffer The binary data to read.
 * @constructor
 */
keepasschrome.BinaryReader = function(arraybuffer) {

  /**
   * @type {!Uint8Array}
   * @private
   */
  this.data_ = new Uint8Array(arraybuffer);

  /**
   * @type {number}
   * @private
   */
  this.pos_ = 0;
};


/**
 * @return {boolean} True if there's at least one more byte.
 */
keepasschrome.BinaryReader.prototype.hasNextByte = function() {
  return this.pos_ < this.data_.length;
};


/**
 * @return {boolean} True if there's at least one more int.
 */
keepasschrome.BinaryReader.prototype.hasNextInt = function() {
  return this.pos_ < this.data_.length - 3;
};


/**
 * @return {number} The next byte.
 * @private
 */
keepasschrome.BinaryReader.prototype.readByte_ = function() {
  if (!this.hasNextByte()) {
    throw new RangeError();
  }
  return this.data_[this.pos_++];
};


/**
 * @param {number} num The number of bytes to read.
 * @return {!Uint8Array} The bytes.
 */
keepasschrome.BinaryReader.prototype.readBytes = function(num) {
  var bytes = this.data_.subarray(this.pos_, this.pos_ + num);
  this.pos_ += num;
  return bytes;
};


/**
 * @param {number} numBytes The numbers of bytes to read.
 * @return {number} The number.
 * @private
 */
keepasschrome.BinaryReader.prototype.readNumber_ = function(numBytes) {
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
keepasschrome.BinaryReader.prototype.readShort = function() {
  return this.readNumber_(2);
};


/**
 * @return {number} The int.
 */
keepasschrome.BinaryReader.prototype.readInt = function() {
  return this.readNumber_(4);
};


/**
 * @return {!Uint8Array} The bytes.
 */
keepasschrome.BinaryReader.prototype.readRest = function() {
  var bytes = this.data_.subarray(this.pos_);
  this.pos_ = this.data_.length;
  return bytes;
};


/**
 * Reads in a null-terminated string.
 * @return {string} The string;
 */
keepasschrome.BinaryReader.prototype.readString = function() {
  var result = '';
  var b = this.readByte_();
  while (b != 0) {
    result += String.fromCharCode(b);
    b = this.readByte_();
  }
  return result;
};


/**
 * @return {!Date} The date.
 */
keepasschrome.BinaryReader.prototype.readDate = function() {
  var bytes = this.readBytes(5);

  var year = (bytes[0] << 6) | (bytes[1] >> 2);
  var month = ((bytes[1] & 3) << 2) | (bytes[2] >> 6);
  var day = (bytes[2] >> 1) & 31;
  var hour = ((bytes[2] & 1) << 4) | (bytes[3] >> 4);
  var min = ((bytes[3] & 15) << 2) | (bytes[4] >> 6);
  var sec = bytes[4] & 63;

  return new Date(year, month - 1, day, hour, min, sec);
};
