/**
 * @fileoverview An entry in a keyfile.
 */

/**
 * @constructor
 * @struct
 */
keepasschrome.Entry = function() {

  /**
   * @type {Array.<!number>}
   */
  this.uuid;

  /**
   * @type {number}
   */
  this.groupId;

  /**
   * @type {number}
   */
  this.image;

  /**
   * @type {string}
   */
  this.title;

  /**
   * @type {string}
   */
  this.url;

  /**
   * @type {string}
   */
  this.username;

  /**
   * @type {string}
   */
  this.password;

  /**
   * @type {string}
   */
  this.comment;

  /**
   * @type {Date}
   */
  this.creation;

  /**
   * @type {Date}
   */
  this.lastModified;

  /**
   * @type {Date}
   */
  this.lastAccessed;

  /**
   * @type {Date}
   */
  this.expires;

  /**
   * @type {string}
   */
  this.binaryDesc;

  /**
   * @type {Array.<!number>}
   */
  this.binary;

  /**
   * @type {keepasschrome.Group}
   */
  this.group;

  /**
   * @type {number}
   */
  this.index;
};
