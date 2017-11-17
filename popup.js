/**
 * @fileoverview Manages the UI of the KeePass Chrome extension.
 */

var keepasschrome = {};

document.addEventListener('DOMContentLoaded', function() {
  new keepasschrome.Popup().start();
});



/**
 * @constructor
 */
keepasschrome.Popup = function() {};
/** @const */ keepasschrome.Popup.API_BASE =
    'https://www.googleapis.com/drive/v2';


/**
 * Starts the KeyPass Chrome extension.
 */
keepasschrome.Popup.prototype.start = function() {
  this.onEnter_('key-file-name', this.searchForKeyFile_.bind(this));
  document.getElementById('key-file-search')
      .addEventListener('click', this.searchForKeyFile_.bind(this));
};


/**
 * @param {string} message The error message to show.
 * @private
 */
keepasschrome.Popup.prototype.showError_ = function(message) {
  document.getElementById('error').textContent = message;
};


/**
 * @private
 */
keepasschrome.Popup.prototype.hideError_ = function() {
  document.getElementById('error').innerHTML = '';
};


/**
 * Shows the last API error, if there was one.
 * @return {boolean} True if the last API call resulted in an error, false
 *     otherwise.
 * @private
 */
keepasschrome.Popup.prototype.checkError_ = function() {
  if (chrome.runtime.lastError) {
    this.showError_(chrome.runtime.lastError.message || 'Unknown error.');
  }
  return !!chrome.runtime.lastError;
};


/**
 * Queries Drive for a keyfile with a name matching what the user typed in.
 * @private
 */
keepasschrome.Popup.prototype.searchForKeyFile_ = function() {
  var query = (/** @type {!HTMLInputElement} */ (
      document.getElementById('key-file-name'))).value;
  var encodedQuery = encodeURIComponent(query).replace('\'', '\\\'');
  document.getElementById('files').innerHTML = '';
  this.showLoading_('Searching Drive...');
  this.sendXhr_(
      'GET',
      keepasschrome.Popup.API_BASE + '/files?q=title+=+\'' + encodedQuery +
          '\'',
      this.displayFiles_.bind(this));
};


/**
 * Sends an authenticated XHR.
 * @param {string} method The HTTP method to use (GET, POST, etc.).
 * @param {string} url The URL to send the request to.
 * @param {function(!XMLHttpRequest)} callback The function to call when the
 *     request is complete.
 * @param {string=} opt_responseType The type of the response property, defaults
 *     to string.
 * @private
 */
keepasschrome.Popup.prototype.sendXhr_ = function(
    method, url, callback, opt_responseType) {
  chrome.identity.getAuthToken(
      {'interactive': true},
      this.getAuthTokenCallback_.bind(
          this, method, url, callback, opt_responseType));
};


/**
 * Sends an XHR with the given authentication token.
 * @param {string} method The HTTP method to use (GET, POST, etc.).
 * @param {string} url The URL to send the request to.
 * @param {function(!XMLHttpRequest)} callback The function to call when the
 *     request is complete.
 * @param {string|undefined} responseType The type of the response property,
 *     defaults to string.
 * @param {string=} opt_token The authentication token.
 * @private
 */
keepasschrome.Popup.prototype.getAuthTokenCallback_ = function(
    method, url, callback, responseType, opt_token) {
  if (this.checkError_()) {
    return;
  } else if (!opt_token) {
    this.showError_('Got undefined auth token.');
    return;
  }
  var xhr = new XMLHttpRequest();
  xhr.open(method, url);
  if (responseType) {
    xhr.responseType = responseType;
  }
  xhr.setRequestHeader('Authorization', 'Bearer ' + opt_token);
  xhr.onload = function() {
    callback(xhr);
  };
  xhr.send();
};


/**
 * Displays the files that match the types in keyfile name.
 * @param {!XMLHttpRequest} request The XMLHttpRequest of the request to search
 *     for the keyfile.
 * @private
 */
keepasschrome.Popup.prototype.displayFiles_ = function(request) {
  var files =
      /** @type {drive.FilesListResponse} */ (JSON.parse(request.responseText));
  var ul = document.getElementById('files');
  ul.innerHTML = '';
  if (files.items.length) {
    for (var i = 0; i < files.items.length; i++) {
      var file = files.items[i];
      var filename = document.createElement('div');
      filename.textContent = file.title;
      var modified = document.createElement('div');
      modified.textContent = 'Last modified: ' + new Date(file.modifiedDate);
      var li = document.createElement('li');
      li.appendChild(filename);
      li.appendChild(modified);
      li.addEventListener(
          'click', this.handleKeyFileClick_.bind(this, file.id));
      ul.appendChild(li);
    }
  } else {
    var li = document.createElement('li');
    li.textContent = 'No results';
    ul.appendChild(li);
  }
  this.hideLoading_();
};


/**
 * Called on a click on a keyfile name, shows the password field for the
 * keyfile.
 * @param {string=} opt_keyFileId The ID of the keyfile.
 * @private
 */
keepasschrome.Popup.prototype.handleKeyFileClick_ = function(opt_keyFileId) {
  if (!opt_keyFileId) {
    this.showError_('No key file ID');
    return;
  }
  document.getElementById('key-file-select').style.display = 'none';
  var callback = this.handleMasterPasswordOkClick_.bind(this, opt_keyFileId);
  this.onEnter_('master-password', callback);
  document.getElementById('master-password-ok')
      .addEventListener('click', callback);
  this.showMasterPassword_();
};


/**
 * Called after typing the password and clicking OK. Commences fetching the
 * keyfile, decrypting it, and display the contents.
 * @param {string} keyFileId The ID of the keyfile.
 * @private
 */
keepasschrome.Popup.prototype.handleMasterPasswordOkClick_ = function(
    keyFileId) {
  // If the 'invalid password' error is shown.
  this.hideError_();
  document.getElementById('master-password-enter').style.display = 'none';
  this.showLoading_('Getting key file...');
  this.sendXhr_(
      'GET', keepasschrome.Popup.API_BASE + '/files/' + keyFileId,
      this.fetchKeyFile_.bind(this));
};


/**
 * Actually fetches the keyfile after the API call to get the keyfile URL.
 * @param {!XMLHttpRequest} request The XMLHttpRequest of the request to get the
 *     key file metadata.
 * @private
 */
keepasschrome.Popup.prototype.fetchKeyFile_ = function(request) {
  var file = /** @type {!drive.File} */ (JSON.parse(request.responseText));
  this.sendXhr_(
      'GET', file.downloadUrl, this.processKeyFile_.bind(this), 'arraybuffer');
};


/**
 * Decrypts and displays the keyfile.
 * @param {!XMLHttpRequest} request The XMLHttpRequest of the request with the
 *     keyfile contents.
 * @private
 */
keepasschrome.Popup.prototype.processKeyFile_ = function(request) {
  this.showLoading_('Processing key file...');
  var password = (/** @type {HTMLInputElement} */ (
      document.getElementById('master-password'))).value;
  var response = request.response;
  if (!(response instanceof ArrayBuffer)) {
    this.showError_(
        'XHR response expected to be ArrayBuffer but got ' +
        response.toString());
    this.showMasterPassword_();
    return;
  }
  var progressBar = new keepasschrome.DecryptProgressBar();
  var loadingElement = document.getElementById('loading');
  if (loadingElement) {
    progressBar.render(loadingElement);
  }
  new keepasschrome.KeyFileParser(response)
      .parse(password, progressBar)
      .then(
          this.displayKeyFile_.bind(this),
          this.displayDecryptionError_.bind(this));
};


/**
 * Displays the key file.
 * @param {!keepasschrome.Group} rootGroup The root of the group tree.
 * @private
 */
keepasschrome.Popup.prototype.displayKeyFile_ = function(rootGroup) {
  this.showGroups_(rootGroup);
  this.hideLoading_();
};


/**
 * Displays an error message if it was unable to decrypt the key file.
 * @param {*} e The error.
 * @private
 */
keepasschrome.Popup.prototype.displayDecryptionError_ = function(e) {
  e = /** @type {!Error} */ (e);
  if (e.message) {
    this.showError_(e.message);
  } else {
    this.showError_('Error decrypting, the password is probably wrong.');
  }
  this.showMasterPassword_();
  this.hideLoading_();
};


/**
 * Displays the keyfile.
 * @param {!keepasschrome.Group} rootGroup The topmost group.
 * @private
 */
keepasschrome.Popup.prototype.showGroups_ = function(rootGroup) {
  var passwords = document.getElementById('passwords');
  passwords.style.display = 'initial';
  var groups = document.createElement('ol');
  for (var i = 0; i < rootGroup.getChildren().length; i++) {
    groups.appendChild(this.createGroupElement_(rootGroup.getChildren()[i]));
  }
  passwords.appendChild(groups);
};


/**
 * Creates a group element to display on the page.
 * @param {!keepasschrome.Group} group The group to create the element for.
 * @return {!Element} The element.
 * @private
 */
keepasschrome.Popup.prototype.createGroupElement_ = function(group) {
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


/**
 * Creates an entry element to display on the page.
 * @param {!keepasschrome.Entry} entry The entry to create the element for.
 * @return {!Element} The element.
 * @private
 */
keepasschrome.Popup.prototype.createEntryElement_ = function(entry) {
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


/**
 * Determines if the given entry should be displayed.
 * @param {!keepasschrome.Entry} entry The entry.
 * @return {boolean} True if the entry should be displayed, false otherwise.
 * @private
 */
keepasschrome.Popup.prototype.shouldDisplayEntry_ = function(entry) {
  return typeof entry.binary === 'undefined' ||
      typeof entry.comment === 'undefined' || entry.comment === '' ||
      entry.binaryDesc != 'bin-stream' ||
      entry.title != 'Meta-Info' ||
      entry.username != 'SYSTEM' ||
      entry.url != '$' ||
      entry.image != 0;
};


/**
 * Shows the loading screen with the given message.
 * @param {string} message The loading message to display.
 * @private
 */
keepasschrome.Popup.prototype.showLoading_ = function(message) {
  document.getElementById('loading-message').textContent = message;
  document.getElementById('loading').style.display = 'initial';
};


/**
 * Hides the loading screen.
 * @private
 */
keepasschrome.Popup.prototype.hideLoading_ = function() {
  document.getElementById('loading').style.display = 'none';
};


/**
 * Shows the master password screen.
 * @private
 */
keepasschrome.Popup.prototype.showMasterPassword_ = function() {
  document.getElementById('master-password-enter').style.display = 'initial';
  document.getElementById('master-password').focus();
};


/**
 * Sets the element with the given ID to call the given callback when the user
 * presses enter.
 * @param {string} id The ID to set the callback on.
 * @param {function()} callback The callback.
 * @private
 */
keepasschrome.Popup.prototype.onEnter_ = function(id, callback) {
  document.getElementById(id).addEventListener('keyup', function(event) {
    if (event.keyCode == 13) {
      callback();
    }
  });
};
