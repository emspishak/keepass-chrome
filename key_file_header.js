/**
 * @fileoverview A keyfile header.
 */

/**
 * @param {!number} signature1
 * @param {!number} signature2
 * @param {!keepasschrome.KeyFileHeader.Flags} flags
 * @param {!number} version
 * @param {!CryptoJS.lib.WordArray} masterSeed
 * @param {!CryptoJS.lib.WordArray} encryptionInitialValue
 * @param {!number} groups
 * @param {!number} entries
 * @param {!CryptoJS.lib.WordArray} contentsHash
 * @param {!CryptoJS.lib.WordArray} masterSeed2
 * @param {!number} keyEncryptionRounds
 * @constructor
 * @struct
 */
keepasschrome.KeyFileHeader = function(
    signature1, signature2, flags, version, masterSeed, encryptionInitialValue,
    groups, entries, contentsHash, masterSeed2, keyEncryptionRounds) {

  this.signature1 = signature1;
  this.signature2 = signature2;
  this.flags = flags;
  this.version = version;
  this.masterSeed = masterSeed;
  this.encryptionInitialValue = encryptionInitialValue;
  this.groups = groups;
  this.entries = entries;
  this.contentsHash = contentsHash;
  this.masterSeed2 = masterSeed2;
  this.keyEncryptionRounds = keyEncryptionRounds;
};


/**
 * @constructor
 * @struct
 */
keepasschrome.KeyFileHeader.Flags = function() {

  /**
   * @type {boolean}
   */
  this.sha2;

  /**
   * @type {boolean}
   */
  this.rijndael;

  /**
   * @type {boolean}
   */
  this.arcfour;

  /**
   * @type {boolean}
   */
  this.twofish;
};
