/**
 * @fileoverview A keyfile header.
 */

/**
 * @param {number} signature1
 * @param {number} signature2
 * @param {!keepasschrome.KeyFileHeader.Flags} flags
 * @param {number} version
 * @param {!CryptoJS.lib.WordArray} masterSeed
 * @param {!CryptoJS.lib.WordArray} encryptionInitialValue
 * @param {number} groups
 * @param {number} entries
 * @param {!CryptoJS.lib.WordArray} contentsHash
 * @param {!CryptoJS.lib.WordArray} masterSeed2
 * @param {number} keyEncryptionRounds
 * @constructor
 * @struct
 */
keepasschrome.KeyFileHeader = function(
    signature1, signature2, flags, version, masterSeed, encryptionInitialValue,
    groups, entries, contentsHash, masterSeed2, keyEncryptionRounds) {

  /** @type {number} */
  this.signature1 = signature1;

  /** @type {number} */
  this.signature2 = signature2;

  /** @type {!keepasschrome.KeyFileHeader.Flags} */
  this.flags = flags;

  /** @type {number} */
  this.version = version;

  /** @type {!CryptoJS.lib.WordArray} */
  this.masterSeed = masterSeed;

  /** @type {!CryptoJS.lib.WordArray} */
  this.encryptionInitialValue = encryptionInitialValue;

  /** @type {number} */
  this.groups = groups;

  /** @type {number} */
  this.entries = entries;

  /** @type {!CryptoJS.lib.WordArray} */
  this.contentsHash = contentsHash;

  /** @type {!CryptoJS.lib.WordArray} */
  this.masterSeed2 = masterSeed2;

  /** @type {number} */
  this.keyEncryptionRounds = keyEncryptionRounds;
};


/**
 * @constructor
 * @struct
 */
keepasschrome.KeyFileHeader.Flags = function() {

  /** @type {boolean} */
  this.sha2;

  /** @type {boolean} */
  this.rijndael;

  /** @type {boolean} */
  this.arcfour;

  /** @type {boolean} */
  this.twofish;
};
