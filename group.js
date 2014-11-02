/**
 * @param {!string} id The group's ID.
 * @param {!string} title The title of the group.
 * @param {!string} image The group's image.
 * @constructor
 */
keepasschrome.Group = function(id, title, image) {

  /**
   * @type {!string}
   */
  this.id = id;

  /**
   * @type {!string}
   */
  this.title = title;

  /**
   * @type {!string}
   */
  this.image = image;

  /**
   * @type {?Group}
   */
  this.parent = null;

  /**
   * @type {number}
   */
  this.index = -1;

  /**
   * @type {Array.<Group>}
   */
  this.children = [];

  /**
   * @type {Array.<Object>}
   */
  this.entries = [];
};


/**
 * @return {string} The ID.
 */
keepasschrome.Group.prototype.getId = function() {
  return this.id;
};


/**
 * @return {string} The title.
 */
keepasschrome.Group.prototype.getTitle = function() {
  return this.title;
};


/**
 * @return {string} The image.
 */
keepasschrome.Group.prototype.getImage = function() {
  return this.image;
};


/**
 * @param {!Group} child The child to add.
 */
keepasschrome.Group.prototype.addChild = function(child) {
  child.parent = this;
  child.index = this.children.length;
  this.children.push(child);
};


/**
 * @param {number} index The index of the child to get.
 * @return {Group} The child group at the given index.
 */
keepasschrome.Group.prototype.getChild = function(index) {
  return this.children[index];
};


/**
 * @return {Array.<Group>} The child groups.
 */
keepasschrome.Group.prototype.getChildren = function() {
  return this.children;
};


/**
 * @param {!Object} entry The entry to add.
 */
keepasschrome.Group.prototype.addEntry = function(entry) {
  entry.group = this;
  entry.index = this.entries.length;
  this.entries.push(entry);
};


/**
 * @return {Array.<entry>} The entries.
 */
keepasschrome.Group.prototype.getEntries = function() {
  return this.entries;
};
