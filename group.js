function Group(id, title, image) {
  this.id = id;
  this.title = title;
  this.image = image;

  this.parent = undefined;
  this.index = -1;
  this.children = [];
  this.entries = [];
};

Group.prototype.getId = function() {
  return this.id;
};

Group.prototype.getTitle = function() {
  return this.title;
};

Group.prototype.getImage = function() {
  return this.image;
};

Group.prototype.addChild = function(child) {
  child.parent = this;
  child.index = this.children.length;
  this.children.push(child);
};

Group.prototype.getChild = function(index) {
  return this.children[index];
};

Group.prototype.addEntry = function(entry) {
  entry.group = this;
  entry.index = this.entries.length;
  this.entries.push(entry);
};
