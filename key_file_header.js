/**
 * @fileoverview A keyfile header.
 */

/**
 * @param {number} signature1
 * @param {number} signature2
 * @param {!keepasschrome.KeyFileHeader.Flags} flags
 * @param {number} version
 * @param {!Uint8Array} masterSeed
 * @param {!Uint8Array} encryptionInitialValue
 * @param {number} groups
 * @param {number} entries
 * @param {!Uint8Array} contentsHash
 * @param {!Uint8Array} masterSeed2
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

  /** @type {!Uint8Array} */
  this.masterSeed = masterSeed;

  /** @type {!Uint8Array} */
  this.encryptionInitialValue = encryptionInitialValue;

  /** @type {number} */
  this.groups = groups;

  /** @type {number} */
  this.entries = entries;

  /** @type {!Uint8Array} */
  this.contentsHash = contentsHash;

  /** @type {!Uint8Array} */
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
