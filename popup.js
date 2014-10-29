document.addEventListener('DOMContentLoaded', function() {
  new Popup().start();
});

Popup = function() {};
Popup.API_BASE = 'https://www.googleapis.com/drive/v2';

Popup.prototype.start = function() {
  this.onEnter_('key-file-name', this.searchForKeyFile_.bind(this));
  document.getElementById('key-file-search').addEventListener('click', this.searchForKeyFile_.bind(this));
};

Popup.prototype.showError_ = function(message) {
  document.getElementById('error').textContent = message;
};

Popup.prototype.hideError_ = function() {
  document.getElementById('error').innerHTML = '';
};

Popup.prototype.checkError_ = function() {
  if (chrome.runtime.lastError) {
    this.showError_(chrome.runtime.lastError.message);
  }
  return !!chrome.runtime.lastError;
};

Popup.prototype.searchForKeyFile_ = function() {
  var query = document.getElementById('key-file-name').value;
  var encodedQuery = encodeURIComponent(query).replace("'", "\\'");
  document.getElementById('files').innerHTML = '';
  this.showLoading_('Searching Drive...');
  this.sendXhr_('GET', Popup.API_BASE + '/files?q=title+=+\'' + encodedQuery + '\'', this.displayFiles_.bind(this));
};

Popup.prototype.sendXhr_ = function(method, url, callback, opt_responseType) {
  chrome.identity.getAuthToken({ 'interactive': true }, this.getAuthTokenCallback_.bind(this, method, url, callback, opt_responseType));
};

Popup.prototype.getAuthTokenCallback_ = function(method, url, callback, opt_responseType, token) {
  if (this.checkError_()) {
    return;
  }
  var xhr = new XMLHttpRequest();
  xhr.open(method, url);
  if (opt_responseType) {
    xhr.responseType = opt_responseType;
  }
  xhr.setRequestHeader('Authorization', 'Bearer ' + token);
  xhr.onload = function() {
    callback(this);
  };
  xhr.send();
};

Popup.prototype.displayFiles_ = function(request) {
  var files = JSON.parse(request.responseText);
  var ul = document.getElementById('files');
  ul.innerHTML = '';
  if (files.items.length) {
    for (var i = 0; i < files.items.length; i++) {
      var file = files.items[i];
      var li = document.createElement('li');
      li.textContent = file.title;
      li.addEventListener('click', this.handleKeyFileClick_.bind(this, file.id));
      ul.appendChild(li);
    }
  } else {
    var li = document.createElement('li');
    li.textContent = 'No results';
    ul.appendChild(li);
  }
  this.hideLoading_();
};

Popup.prototype.handleKeyFileClick_ = function(keyFileId) {
  if (!keyFileId) {
    this.showError_('No key file ID');
    return;
  }
  document.getElementById('key-file-select').style.display = 'none';
  var callback = this.handleMasterPasswordOkClick_.bind(this, keyFileId);
  this.onEnter_('master-password', callback);
  document.getElementById('master-password-ok').addEventListener('click', callback);
  this.showMasterPassword_();
};

Popup.prototype.handleMasterPasswordOkClick_ = function(keyFileId) {
  // If the 'invalid password' error is shown.
  this.hideError_();
  document.getElementById('master-password-enter').style.display = 'none';
  this.showLoading_('Getting key file...');
  this.sendXhr_('GET', Popup.API_BASE + '/files/' + keyFileId, this.fetchKeyFile_.bind(this));
};

Popup.prototype.fetchKeyFile_ = function(request) {
  var file = JSON.parse(request.responseText);
  var downloadUrl = file['downloadUrl'];
  this.sendXhr_('GET', downloadUrl, this.processKeyFile_.bind(this), 'arraybuffer');
};

Popup.prototype.processKeyFile_ = function(request) {
  this.showLoading_('Processing key file...');
  var password = document.getElementById('master-password').value;
  var file = new KeyFileParser(request.response).parse(password);
  this.hideLoading_();
  if (file['error']) {
    this.showError_(file['error']);
    this.showMasterPassword_();
    return;
  }
  this.showGroups_(file.rootGroup);
};

Popup.prototype.showGroups_ = function(rootGroup) {
  var passwords = document.getElementById('passwords');
  passwords.style.display = 'initial';
  var groups = document.createElement('ol');
  for (var i = 0; i < rootGroup.getChildren().length; i++) {
    groups.appendChild(this.createGroupElement_(rootGroup.getChildren()[i]));
  }
  passwords.appendChild(groups);
};

Popup.prototype.createGroupElement_ = function(group) {
  var groupElement = document.createElement('li');
  var title = document.createElement('h2');
  title.innerHTML = group.getTitle();
  groupElement.appendChild(title);
  var children = document.createElement('ol');
  for (var i = 0; i < group.getChildren().length; i++) {
    children.appendChild(this.createGroupElement_(group.getChildren()[i]));
  }
  for (var i = 0; i < group.getEntries().length; i++) {
    var entry = group.getEntries()[i];
    if (this.shouldDisplayEntry_(entry)) {
      children.appendChild(this.createEntryElement_(entry));
    }
  }
  groupElement.appendChild(children);
  return groupElement;
};

Popup.prototype.createEntryElement_ = function(entry) {
  var entryElement = document.createElement('li');
  var title = document.createElement('h3');
  title.innerHTML = entry.title;
  entryElement.appendChild(title);

  var usernameButton = document.createElement('button');
  usernameButton.innerHTML = 'Copy username';
  usernameButton.onclick = function() {
    console.log(entry.username);
  };
  entryElement.appendChild(usernameButton);

  var passwordButton = document.createElement('button');
  passwordButton.innerHTML = 'Copy password';
  passwordButton.onclick = function() {
    console.log(entry.password);
  };
  entryElement.appendChild(passwordButton);

  return entryElement;
};

Popup.prototype.shouldDisplayEntry_ = function(entry) {
  return typeof entry.binary === 'undefined'
    || typeof entry.comment === 'undefined' || entry.comment === ''
    || entry.binaryDesc != 'bin-stream'
    || entry.title != 'Meta-Info'
    || entry.username != 'SYSTEM'
    || entry.url != '$'
    || entry.image != 0;
};

Popup.prototype.showLoading_ = function(message) {
  document.getElementById('loading-message').textContent = message;
  document.getElementById('loading').style.display = 'initial';
};

Popup.prototype.hideLoading_ = function() {
  document.getElementById('loading').style.display = 'none';
};

Popup.prototype.showMasterPassword_ = function() {
  document.getElementById('master-password-enter').style.display = 'initial';
  document.getElementById('master-password').focus();
};

Popup.prototype.onEnter_ = function(id, callback) {
  document.getElementById(id).addEventListener('keyup', function(event) {
    if (event.keyCode == 13) {
      callback();
    }
  });
};
