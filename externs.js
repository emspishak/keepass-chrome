/**
 * @constructor
 */
var CryptoKey = function() {};


var crypto = {};


crypto.subtle = {};

/**
 * @param {!Object} algoParams
 * @param {!CryptoKey} cryptoKey
 * @param {!ArrayBuffer|!ArrayBufferView} cipherText
 * @return {!Promise.<!ArrayBuffer>}
 */
crypto.subtle.decrypt = function(algoParams, cryptoKey, cipherText) {};


/**
 * @param {!Object} algoParams
 * @param {!ArrayBuffer|!ArrayBufferView} textToHash
 * @return {!Promise.<!ArrayBuffer>}
 */
crypto.subtle.digest = function(algoParams, textToHash) {};


/**
 * @param {!Object} algoParams
 * @param {!CryptoKey} cryptoKey
 * @param {!ArrayBuffer|!ArrayBufferView} clearText
 * @return {!Promise.<!ArrayBuffer>}
 */
crypto.subtle.encrypt = function(algoParams, cryptoKey, clearText) {};


/**
 * @param {string} format
 * @param {!ArrayBuffer|!ArrayBufferView} keyData
 * @param {!Object} algoParams
 * @param {boolean} extractable
 * @param {!Array.<string>} usages
 * @return {!Promise.<!CryptoKey>}
 */
crypto.subtle.importKey = function(format, keyData, algoParams, extractable,
    usages) {};
