/**
 * @fileoverview A group in a keyfile.
 */



/**
 * @param {number} id The group's ID.
 * @param {string} title The title of the group.
 * @param {number} image The group's image.
 * @constructor
 */
keepasschrome.Group = function(id, title, image) {

  /**
   * @type {number}
   * @private
   */
  this.id_ = id;

  /**
   * @type {string}
   * @private
   */
  this.title_ = title;

  /**
   * @type {number}
   * @private
   */
  this.image_ = image;

  /**
   * @type {?keepasschrome.Group}
   * @private
   */
  this.parent_ = null;

  /**
   * @type {number}
   * @private
   */
  this.index_ = -1;

  /**
   * @type {!Array<!keepasschrome.Group>}
   * @private
   */
  this.children_ = [];

  /**
   * @type {!Array<!keepasschrome.Entry>}
   * @private
   */
  this.entries_ = [];
};


/**
 * @return {number} The ID.
 */
keepasschrome.Group.prototype.getId = function() {
  return this.id_;
};


/**
 * @return {string} The title.
 */
keepasschrome.Group.prototype.getTitle = function() {
  return this.title_;
};


/**
 * @return {number} The image.
 */
keepasschrome.Group.prototype.getImage = function() {
  return this.image_;
};


/**
 * @param {!keepasschrome.Group} child The child to add.
 */
keepasschrome.Group.prototype.addChild = function(child) {
  child.parent_ = this;
  child.index_ = this.children_.length;
  this.children_.push(child);
};


/**
 * @param {number} index The index of the child to get.
 * @return {!keepasschrome.Group} The child group at the given index.
 */
keepasschrome.Group.prototype.getChild = function(index) {
  return this.children_[index];
};


/**
 * @return {!Array<!keepasschrome.Group>} The child groups.
 */
keepasschrome.Group.prototype.getChildren = function() {
  return this.children_;
};


/**
 * @param {!keepasschrome.Entry} entry The entry to add.
 */
keepasschrome.Group.prototype.addEntry = function(entry) {
  entry.group = this;
  entry.index = this.entries_.length;
  this.entries_.push(entry);
};


/**
 * @return {!Array<!keepasschrome.Entry>} The entries.
 */
keepasschrome.Group.prototype.getEntries = function() {
  return this.entries_;
};
