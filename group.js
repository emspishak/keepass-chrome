/** @fileoverview A group in a keyfile. */



/**
 * @param {number} id The group's ID.
 * @param {string} title The title of the group.
 * @param {number} image The group's image.
 * @constructor
 */
keepasschrome.Group = function(id, title, image) {

  /** @private @const {number} */
  this.id_ = id;

  /** @private @const {string} */
  this.title_ = title;

  /** @private @const {number} */
  this.image_ = image;

  /** @private {?keepasschrome.Group} */
  this.parent_ = null;

  /** @private {number} */
  this.index_ = -1;

  /** @private @const {!Array<!keepasschrome.Group>} */
  this.children_ = [];

  /** @private @const {!Array<!keepasschrome.Entry>} */
  this.entries_ = [];
};


/** @return {number} The ID. */
keepasschrome.Group.prototype.getId = function() {
  return this.id_;
};


/** @return {string} The title. */
keepasschrome.Group.prototype.getTitle = function() {
  return this.title_;
};


/** @return {number} The image. */
keepasschrome.Group.prototype.getImage = function() {
  return this.image_;
};


/** @param {!keepasschrome.Group} child The child to add. */
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


/** @return {!Array<!keepasschrome.Group>} The child groups. */
keepasschrome.Group.prototype.getChildren = function() {
  return this.children_;
};


/** @param {!keepasschrome.Entry} entry The entry to add. */
keepasschrome.Group.prototype.addEntry = function(entry) {
  entry.group = this;
  entry.index = this.entries_.length;
  this.entries_.push(entry);
};


/** @return {!Array<!keepasschrome.Entry>} The entries. */
keepasschrome.Group.prototype.getEntries = function() {
  return this.entries_;
};
