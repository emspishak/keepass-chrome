/**
 * @fileoverview A struct that stores the data needed to decrypt a key file.
 */



/**
 * @param {!keepasschrome.KeyFileHeader.Flags} headerFlags
 * @param {!Uint8Array} encryptedData
 * @param {!Uint8Array} encryptionInitialValue
 * @param {!Uint8Array} contentsHash
 * @param {!ArrayBuffer} key
 * @constructor
 * @struct
 */
keepasschrome.DecryptParams = function(
    headerFlags, encryptedData, encryptionInitialValue, contentsHash, key) {

  /** @type {!keepasschrome.KeyFileHeader.Flags} */
  this.headerFlags = headerFlags;

  /** @type {!Uint8Array} */
  this.encryptedData = encryptedData;

  /** @type {!Uint8Array} */
  this.encryptionInitialValue = encryptionInitialValue;

  /** @type {!Uint8Array} */
  this.contentsHash = contentsHash;

  /** @type {!ArrayBuffer} */
  this.key = key;

  /** @type {!webCrypto.CryptoKey} */
  this.cryptoKey;

  /** @type {!ArrayBuffer} */
  this.decryptedData;
};
