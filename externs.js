var CryptoJS = {};


CryptoJS.AES = {};


/**
 * @param {!CryptoJS.lib.CipherParams} ciphertext
 * @param {!CryptoJS.lib.WordArray} key
 * @param {Object} cfg
 * @return {!CryptoJS.lib.WordArray}
 */
CryptoJS.AES.decrypt = function(ciphertext, key, cfg) {};


/**
 * @param {!CryptoJS.lib.WordArray} message
 * @param {!CryptoJS.lib.WordArray} key
 * @param {!Object} cfg
 * @return {!CryptoJS.lib.CipherParams}
 */
CryptoJS.AES.encrypt = function(message, key, cfg) {};


CryptoJS.lib = {};


/**
 * @constructor
 */
CryptoJS.lib.CipherParams = function() {};


/**
 * @type {!CryptoJS.lib.WordArray}
 */
CryptoJS.lib.CipherParams.prototype.ciphertext;


/**
 * @constructor
 */
CryptoJS.lib.WordArray = function() {};


/**
 * @param {Array} words
 * @param {number=} opt_sigBytes
 */
CryptoJS.lib.WordArray.create = function(words, opt_sigBytes) {};


/**
 * @type {number}
 */
CryptoJS.lib.WordArray.prototype.sigBytes = 0;


/**
 * @type {Array}
 */
CryptoJS.lib.WordArray.prototype.words = [];


CryptoJS.lib.WordArray.prototype.clamp = function() {};


/**
 * @param {!CryptoJS.lib.WordArray} wordArray
 * @return {!CryptoJS.lib.WordArray}
 */
CryptoJS.lib.WordArray.prototype.concat = function(wordArray) {};


CryptoJS.mode = {};


CryptoJS.mode.CBC;


CryptoJS.mode.ECB;


CryptoJS.pad = {};


CryptoJS.pad.NoPadding;


CryptoJS.pad.Pkcs7;


/**
 * @param {!string|!CryptoJS.lib.WordArray} message
 * @return {!CryptoJS.lib.WordArray}
 */
CryptoJS.SHA256 = function(message) {};


CryptoJS.TwoFish = {};


/**
 * @param {!CryptoJS.lib.CipherParams} ciphertext
 * @param {!CryptoJS.lib.WordArray} key
 * @param {Object} cfg
 * @return {!CryptoJS.lib.WordArray}
 */
CryptoJS.TwoFish.decrypt = function(ciphertext, key, cfg) {};
