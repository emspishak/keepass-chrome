/**
 * @fileoverview A struct that stores the data needed to transform a key.
 */

/**
 * @param {string} plainTextKey
 * @param {!Uint8Array} masterSeed
 * @param {!Uint8Array} masterSeed2
 * @param {!Uint8Array} initialValue
 * @constructor
 * @struct
 */
keepasschrome.TransformKeyParams = function(
    plainTextKey, masterSeed, masterSeed2, initialValue) {

  /** @type {string} */
  this.plainTextKey = plainTextKey;

  /** @type {!Uint8Array} */
  this.masterSeed = masterSeed;

  /** @type {!Uint8Array} */
  this.masterSeed2 = masterSeed2;

  /** @type {!Uint8Array} */
  this.initialValue = initialValue;

  /** @type {!ArrayBuffer} */
  this.encryptedKey;

  /** @type {!webCrypto.CryptoKey} */
  this.cryptoKey;
};
