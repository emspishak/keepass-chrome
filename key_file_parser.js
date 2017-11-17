/**
 * @fileoverview Decrypts and parses a keyfile.
 */

/**
 * @param {!ArrayBuffer} arraybuffer The keyfile bytes.
 * @constructor
 */
keepasschrome.KeyFileParser = function(arraybuffer) {

  /**
   * @type {!keepasschrome.BinaryReader}
   * @private
   */
  this.bytes_ = new keepasschrome.BinaryReader(arraybuffer);

  /**
   * @type {!keepasschrome.DecryptProgressBar}
   * @private
   */
  this.progressBar_;
};
/** @const */ keepasschrome.KeyFileParser.DATABASE_SIGNATURE_1 = 2594363651;
/** @const */ keepasschrome.KeyFileParser.DATABASE_SIGNATURE_2 = 3041655653;
/** @const */ keepasschrome.KeyFileParser.DATABASE_VERSION = 196612;
/** @const */ keepasschrome.KeyFileParser.DATABASE_VERSION_MASK = 4294967040;
/** @const */ keepasschrome.KeyFileParser.ECB_BLOCK_SIZE = 16;
/** @const */ keepasschrome.KeyFileParser.SHA256_HASH_LENGTH = 32;


/**
 * Parses the keyfile with the given password.
 * @param {string} password The password to decrypt the keyfile.
 * @param {!keepasschrome.DecryptProgressBar} progressBar A progress bar to show
 *     the decryption status.
 * @return {!Promise<!keepasschrome.Group>} A promise that resolves to the top
 *     group of the keyfile.
 */
keepasschrome.KeyFileParser.prototype.parse = function(password, progressBar) {
  this.progressBar_ = progressBar;
  var header = this.parseHeader_();
  if (!this.verifyVersion_(header)) {
    throw new Error('Invalid key file version');
  }
  this.progressBar_.setTotalEncryptionRounds(header.keyEncryptionRounds);
  var encryptedData = this.bytes_.readRest();
  return this.transformKey_(password, header.masterSeed,
          header.masterSeed2, header.keyEncryptionRounds)
      .then(this.decryptFile_.bind(this, header.flags, encryptedData,
          header.encryptionInitialValue, header.contentsHash))
      .then(this.parseContents_.bind(this, header.groups, header.entries));
};


/**
 * Parses the keyfile header.
 * @return {!keepasschrome.KeyFileHeader} The parsed header.
 * @private
 */
keepasschrome.KeyFileParser.prototype.parseHeader_ = function() {
  return new keepasschrome.KeyFileHeader(
      this.bytes_.readInt() /* signature1 */,
      this.bytes_.readInt() /* signature2 */,
      this.parseHeaderFlags_() /* flags */,
      this.bytes_.readInt() /* version */,
      this.bytes_.readBytes(16) /* masterSeed */,
      this.bytes_.readBytes(16) /* encryptionInitialValue */,
      this.bytes_.readInt() /* groups */,
      this.bytes_.readInt() /* entries */,
      this.bytes_.readBytes(32) /* contentsHash */,
      this.bytes_.readBytes(32) /* masterSeed2*/,
      this.bytes_.readInt() /* keyEncryptionRounds */);
};


/**
 * Parses the header flags.
 * @return {!keepasschrome.KeyFileHeader.Flags} The parsed header flags.
 * @private
 */
keepasschrome.KeyFileParser.prototype.parseHeaderFlags_ = function() {
  var b = this.bytes_.readInt();

  var flags = new keepasschrome.KeyFileHeader.Flags();
  flags.sha2 = !!(b & 1);
  flags.rijndael = !!(b & 2);
  flags.arcfour = !!(b & 4);
  flags.twofish = !!(b & 8);

  return flags;
};


/**
 * Verifies that the keyfile is the supported version.
 * @param {!keepasschrome.KeyFileHeader} header The keyfile header.
 * @return {boolean} True if the keyfile is the supported verison, false
 *     otherwise.
 * @private
 */
keepasschrome.KeyFileParser.prototype.verifyVersion_ = function(header) {
  var Constants = keepasschrome.KeyFileParser;
  return header.signature1 == Constants.DATABASE_SIGNATURE_1 &&
      header.signature2 == Constants.DATABASE_SIGNATURE_2 &&
      (header.version & Constants.DATABASE_VERSION_MASK) ==
          (Constants.DATABASE_VERSION & Constants.DATABASE_VERSION_MASK);
};


/**
 * Transforms the password into the key used to decrypt the keyfile.
 * @param {string} plainTextKey The password to decrypt the keyfile.
 * @param {!Uint8Array} masterSeed The master seed from the keyfile header.
 * @param {!Uint8Array} masterSeed2 The second master seed from the
 *     keyfile header.
 * @param {number} keyEncryptionRounds The number of rounds needed to decrypt.
 * @return {!Promise<!ArrayBuffer>} A promise that resolves to the key to
 *     decrypt the keyfile.
 * @private
 */
keepasschrome.KeyFileParser.prototype.transformKey_ = function(plainTextKey,
    masterSeed, masterSeed2, keyEncryptionRounds) {
  var zeroIv = new Uint8Array(
      new ArrayBuffer(keepasschrome.KeyFileParser.ECB_BLOCK_SIZE));
  for (var i = 0; i < keepasschrome.KeyFileParser.ECB_BLOCK_SIZE; i++) {
    zeroIv[i] = 0;
  }
  var params = new keepasschrome.TransformKeyParams(
      plainTextKey, masterSeed, masterSeed2, zeroIv);
  var transformKey = Promise.resolve(params)
      .then(this.hashKey_.bind(this))
      .then(this.generateCryptoKey_.bind(this));
  for (var i = 0; i < keyEncryptionRounds; i++) {
    transformKey = transformKey.then(this.encryptKey_.bind(this));
  }
  return transformKey
      .then(function(params) {
          return params.encryptedKey;
      })
      .then(this.hash_.bind(this))
      .then(function(hashedKey) {
          var masterSeedAndKey = new Uint8Array(masterSeed.byteLength +
              hashedKey.byteLength);
          masterSeedAndKey.set(masterSeed);
          masterSeedAndKey.set(new Uint8Array(hashedKey),
              masterSeed.byteLength);
          return masterSeedAndKey.buffer;
      })
      .then(this.hash_.bind(this));
};


/**
 * Hashes the plain text key.
 * @param {!keepasschrome.TransformKeyParams} params The transform key params.
 * @return {!Promise<!keepasschrome.TransformKeyParams>} The transform key
 *     params with the hashed plain text key.
 * @private
 */
keepasschrome.KeyFileParser.prototype.hashKey_ = function(params) {
  var encodedKey = new TextEncoder().encode(params.plainTextKey);
  return this.hash_(encodedKey).then(
      function(hashedKey) {
          params.encryptedKey = hashedKey;
          return params;
      });
};


/**
 * Hashes the given array buffer.
 * @param {!ArrayBuffer|!ArrayBufferView} arrayBuffer The array buffer to hash.
 * @return {!Promise<!ArrayBuffer>} A promise that resolves to the hashed
 *     input.
 * @private
 */
keepasschrome.KeyFileParser.prototype.hash_ = function(arrayBuffer) {
  return crypto.subtle.digest({'name': 'SHA-256'}, arrayBuffer);
};


/**
 * Generates the crypto key to encrypt the key.
 * @param {!keepasschrome.TransformKeyParams} params The transform key params.
 * @return {!Promise<!keepasschrome.TransformKeyParams>} The transform key
 *     params with the crypto key.
 * @private
 */
keepasschrome.KeyFileParser.prototype.generateCryptoKey_ = function(params) {
  var algoParams = {
    'name': 'AES-CBC',
    'iv': params.initialValue
  };
  return crypto.subtle.importKey(
      'raw', params.masterSeed2, algoParams, false, ['encrypt'])
          .then(function(cryptoKey) {
              params.cryptoKey = cryptoKey;
              return params;
          });
};


/**
 * AES-ECB encrypts the key once. WebCrypto doesn't support AES-ECB encryption
 * (it's not secure) so this uses AES-CBC encryption as described at
 * http://crypto.stackexchange.com/a/21050 to get AES-EBC encryption.
 * @param {!keepasschrome.TransformKeyParams} params The transform key params.
 * @return {!Promise<!keepasschrome.TransformKeyParams>}
 * @private
 */
keepasschrome.KeyFileParser.prototype.encryptKey_ = function(params) {
  var Constants = keepasschrome.KeyFileParser;
  return Promise.all([
          this.encryptPartialKey_(params, 0),
          this.encryptPartialKey_(params, Constants.ECB_BLOCK_SIZE)])
      .then(function(partialKeys) {
          var firstHalf = partialKeys[0];
          var secondHalf = partialKeys[1];

          var combined = new ArrayBuffer(Constants.SHA256_HASH_LENGTH);
          var combinedView = new Uint8Array(combined);
          combinedView.set(firstHalf);
          combinedView.set(secondHalf, Constants.ECB_BLOCK_SIZE);
          params.encryptedKey = combined;
          this.progressBar_.encryptionRoundComplete();
          return params;
      }.bind(this));
};


/**
 * AES-ECB encrypts a single block (16 bytes).
 * @param {!keepasschrome.TransformKeyParams} params The transform key params.
 * @param {number} startIndex The starting index of the block to encrypt.
 * @return {!Promise<!Uint8Array>} The encrypted block.
 * @private
 */
keepasschrome.KeyFileParser.prototype.encryptPartialKey_ = function(params,
    startIndex) {
  var algoParams = {
    'name': 'AES-CBC',
    'iv': params.initialValue
  };
  var blockToEncrypt = new Uint8Array(params.encryptedKey)
      .subarray(startIndex,
          startIndex + keepasschrome.KeyFileParser.ECB_BLOCK_SIZE);
  return crypto.subtle.encrypt(algoParams, params.cryptoKey, blockToEncrypt)
      .then(function(encryptedBlock) {
          return new Uint8Array(encryptedBlock)
              .subarray(0, keepasschrome.KeyFileParser.ECB_BLOCK_SIZE);
      });
};


/**
 * Decrypts the keyfile.
 * @param {!keepasschrome.KeyFileHeader.Flags} headerFlags The header flags.
 * @param {!Uint8Array} encryptedData The encrypted key file.
 * @param {!Uint8Array} encryptionInitialValue The initial value for
 *     encryption.
 * @param {!Uint8Array} contentsHash The correct hash of the contents.
 * @param {!ArrayBuffer} key The key to decrypt the key file.
 * @return {!Promise<!ArrayBuffer>} A promise that resolves to the decrypted
 *     keyfile.
 * @private
 */
keepasschrome.KeyFileParser.prototype.decryptFile_ = function(headerFlags,
    encryptedData, encryptionInitialValue, contentsHash, key) {
  var decryptParams = new keepasschrome.DecryptParams(headerFlags,
      encryptedData, encryptionInitialValue, contentsHash, key);
  if (decryptParams.headerFlags.rijndael) {
    return this.generateDecryptCryptoKey_(decryptParams)
        .then(this.decryptAes_.bind(this))
        .then(this.verifyDecryptedData_.bind(this));
  } else {
    throw new Error('Invalid encryption type');
  }
};


/**
 * Generates the crypto key to decrypt the file.
 * @param {!keepasschrome.DecryptParams} decryptParams The decrypt params.
 * @return {!Promise<!keepasschrome.DecryptParams>} The decrypt params with the
 *     crypto key.
 * @private
 */
keepasschrome.KeyFileParser.prototype.generateDecryptCryptoKey_ = function(
    decryptParams) {
  var algoParams = {
    'name': 'AES-CBC',
    'iv': decryptParams.encryptionInitialValue
  };
  return crypto.subtle.importKey(
      'raw', decryptParams.key, algoParams, false, ['decrypt'])
          .then(function(cryptoKey) {
              decryptParams.cryptoKey = cryptoKey;
              return decryptParams;
          });
};


/**
 * Decrypts the keyfile with AES.
 * @param {!keepasschrome.DecryptParams} decryptParams The decrypt params.
 * @return {!Promise<!keepasschrome.DecryptParams>} A promise that resolves to
 *     the decrypt params with the decrypted key file.
 * @private
 */
keepasschrome.KeyFileParser.prototype.decryptAes_ = function(decryptParams) {
  var algoParams = {
    'name': 'AES-CBC',
    'iv': decryptParams.encryptionInitialValue
  };
  return crypto.subtle.decrypt(algoParams, decryptParams.cryptoKey,
      decryptParams.encryptedData)
      .then(function(decryptedData) {
          decryptParams.decryptedData = decryptedData;
          return decryptParams;
      });
};


/**
 * Verifies that the data was correctly decrypted, mainly to determine if the
 * password was correct.
 * @param {!keepasschrome.DecryptParams} decryptParams The decrypt params.
 * @return {!Promise<!ArrayBuffer>} A promise that resolves to the decrpyted
 *     data.
 * @private
 */
keepasschrome.KeyFileParser.prototype.verifyDecryptedData_ = function(
    decryptParams) {
  return this.hash_(decryptParams.decryptedData)
      .then(function(decryptedDataHash) {
          if (this.arrayBuffersEqual_(decryptParams.contentsHash,
              decryptedDataHash)) {
            return decryptParams.decryptedData;
          } else {
            throw new Error('Invalid password');
          }
      }.bind(this));
};


/**
 * Determines if the two ArrayBuffers are equal.
 * @param {ArrayBuffer|ArrayBufferView} buffer1 The first ArrayBuffer to
 *     compare.
 * @param {ArrayBuffer|ArrayBufferView} buffer2 The second ArrayBuffer to
 *     compare.
 * @return {boolean} true if the two ArrayBuffers have the same content, false
 *     otherwise.
 * @private
 */
keepasschrome.KeyFileParser.prototype.arrayBuffersEqual_ = function(buffer1,
    buffer2) {
  if (buffer1 === buffer2) {
    return true;
  } else if (buffer1 === null || buffer2 === null) {
    return false;
  } else if (buffer1.byteLength !== buffer2.byteLength) {
    return false;
  } else {
    var array1 = new Uint8Array(buffer1);
    var array2 = new Uint8Array(buffer2);
    for (var i = 0; i < array1.length; i++) {
      if (array1[i] !== array2[i]) {
        return false;
      }
    }
    return true;
  }
};


/**
 * Parses the decryped key file.
 * @param {number} numGroups The number of groups in the key file.
 * @param {number} numEntries The number of entries in the key file.
 * @param {!ArrayBuffer} decryptedData The decrypted key file data.
 * @return {!keepasschrome.Group} The top group of the key file.
 * @private
 */
keepasschrome.KeyFileParser.prototype.parseContents_ = function(numGroups,
    numEntries, decryptedData) {
  var contents = new keepasschrome.BinaryReader(decryptedData);
  var groups = [];
  var levels = [];
  for (var curGroup = 0; curGroup < numGroups; curGroup++) {
    groups.push(this.readGroup_(contents, levels));
  }
  var entries = [];
  for (var curEntry = 0; curEntry < numEntries; curEntry++) {
    entries.push(this.readEntry_(contents));
  }

  var rootGroup = new keepasschrome.Group(0, '$ROOT$', 0);
  this.createGroupTree_(levels, groups, rootGroup);
  this.assignEntriesToGroups_(entries, groups, rootGroup);

  return rootGroup;
};


/**
 * Reads in a group from the decrypted key file.
 * @param {!keepasschrome.BinaryReader} contents The decrypted key file.
 * @param {!Array<number>} levels A list of the levels.
 * @return {!keepasschrome.Group} the parsed group.
 * @private
 */
keepasschrome.KeyFileParser.prototype.readGroup_ = function(contents, levels) {
  var id = 0;
  var title = '';
  var image = 0;

  var fieldType = -1;
  while (fieldType != 65535) {
    fieldType = contents.readShort();
    var fieldSize = contents.readInt();
    switch (fieldType) {
      case 1:
        id = contents.readInt();
        break;
      case 2:
        title = contents.readString();
        break;
      case 7:
        image = contents.readInt();
        break;
      case 8:
        levels.push(contents.readShort());
        break;

      // Unused field types
      case 0:
      case 3:
      case 4:
      case 5:
      case 6:
      case 9:
      case 65535:
      default:
        contents.readBytes(fieldSize);
        break;
    }
  }
  return new keepasschrome.Group(id, title, image);
};


/**
 * Reads in an entry from the decrypted key file.
 * @param {!keepasschrome.BinaryReader} contents The decrypted key file.
 * @return {!keepasschrome.Entry} The parsed entry.
 * @private
 */
keepasschrome.KeyFileParser.prototype.readEntry_ = function(contents) {
  var entry = new keepasschrome.Entry();
  var fieldType = -1;
  while (fieldType != 65535) {
    fieldType = contents.readShort();
    var fieldSize = contents.readInt();
    switch (fieldType) {
      case 1:
        entry.uuid = contents.readBytes(16);
        break;
      case 2:
        entry.groupId = contents.readInt();
        break;
      case 3:
        entry.image = contents.readInt();
        break;
      case 4:
        entry.title = contents.readString();
        break;
      case 5:
        entry.url = contents.readString();
        break;
      case 6:
        entry.username = contents.readString();
        break;
      case 7:
        entry.password = contents.readString();
        break;
      case 8:
        entry.comment = contents.readString();
        break;
      case 9:
        entry.creation = contents.readDate();
        break;
      case 10:
        entry.lastModified = contents.readDate();
        break;
      case 11:
        entry.lastAccessed = contents.readDate();
        break;
      case 12:
        entry.expires = contents.readDate();
        break;
      case 13:
        entry.binaryDesc = contents.readString();
        break;
      case 14:
        entry.binary = contents.readBytes(fieldSize);
        break;

      // Unused field types
      case 0:
      case 65535:
      default:
        contents.readBytes(fieldSize);
        break;
    }
  }
  return entry;
};


/**
 * Builds the groups into a tree.
 * @param {!Array<number>} levels A list of the levels.
 * @param {!Array<!keepasschrome.Group>} groups The groups.
 * @param {!keepasschrome.Group} rootGroup The top group.
 * @private
 */
keepasschrome.KeyFileParser.prototype.createGroupTree_ = function(levels,
    groups, rootGroup) {
  for (var i = 0; i < groups.length; i++) {
    if (levels[i] == 0) {
      rootGroup.addChild(groups[i]);
    } else {
      var parentGroupIndex = this.findParentGroupIndex_(i, levels);
      var parentGroup = (parentGroupIndex == -1) ?
          rootGroup :
          groups[parentGroupIndex];
      parentGroup.addChild(groups[i]);
    }
  }
};

/**
 * Finds the index in the levels for the parent group of the current group.
 * @param {number} currentGroupIndex The index of the current group.
 * @param {!Array<number>} levels A list of the levels.
 * @return {number} The index in the levels of the parent group.
 * @private
 */
keepasschrome.KeyFileParser.prototype.findParentGroupIndex_ = function(
    currentGroupIndex, levels) {
  var j;
  for (j = currentGroupIndex - 1; j >= 0; j--) {
    if (levels[j] < levels[currentGroupIndex]) {
      if (levels[currentGroupIndex] - levels[j] != 1) {
        return -1;
      } else {
        return j;
      }
    }
  }
  return -1;
};


/**
 * Puts entries in their group.
 * @param {!Array<!keepasschrome.Entry>} entries The entries.
 * @param {!Array<!keepasschrome.Group>} groups The groups.
 * @param {!keepasschrome.Group} rootGroup The top group.
 * @private
 */
keepasschrome.KeyFileParser.prototype.assignEntriesToGroups_ = function(entries,
    groups, rootGroup) {
  for (var e = 0; e < entries.length; e++) {
    var group = this.findGroup_(entries[e], groups, rootGroup);
    group.addEntry(entries[e]);
  }
};


/**
 * Finds the group that the given entry belongs in.
 * @param {!keepasschrome.Entry} entry The entry.
 * @param {!Array<!keepasschrome.Group>} groups The groups.
 * @param {!keepasschrome.Group} rootGroup The top group.
 * @return {!keepasschrome.Group} The group that the entry belongs in, or the
 *     first group if the entry's group doesn't exist.
 * @private
 */
keepasschrome.KeyFileParser.prototype.findGroup_ = function(entry, groups,
    rootGroup) {
  for (var g = 0; g < groups.length; g++) {
    if (entry.groupId == groups[g].getId()) {
      return groups[g];
    }
  }

  return rootGroup.getChild(0);
};
