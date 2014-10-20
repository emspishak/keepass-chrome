var API_BASE = 'https://www.googleapis.com/drive/v2';

document.addEventListener('DOMContentLoaded', main);

function main() {
  onEnter('key-file-name', searchForKeyFile);
  document.getElementById('key-file-search').addEventListener('click', searchForKeyFile);
}

function showError(message) {
  document.getElementById('error').textContent = message;
}

function hideError() {
  document.getElementById('error').innerHTML = '';
}

function checkError() {
  if (chrome.runtime.lastError) {
    showError(chrome.runtime.lastError.message);
  }
  return !!chrome.runtime.lastError;
}

function searchForKeyFile() {
  var query = document.getElementById('key-file-name').value;
  var encodedQuery = encodeURIComponent(query).replace("'", "\\'");
  document.getElementById('files').innerHTML = '';
  showLoading("Searching Drive...");
  sendXhr('GET', API_BASE + '/files?q=title+=+\'' + encodedQuery + '\'', displayFiles);
}

function sendXhr(method, url, callback, opt_responseType) {
  chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
    if (checkError()) {
      return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    if (opt_responseType) {
      xhr.responseType = opt_responseType;
    }
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.onload = callback;
    xhr.send();
  });
}

function displayFiles() {
  var files = JSON.parse(this.responseText);
  var ul = document.getElementById('files');
  ul.innerHTML = '';
  if (files.items.length) {
    for (var i = 0; i < files.items.length; i++) {
      var file = files.items[i];
      var li = document.createElement('li');
      li.textContent = file.title;
      li.addEventListener('click', handleKeyFileClick.bind(undefined, file.id));
      ul.appendChild(li);
    }
  } else {
    var li = document.createElement('li');
    li.textContent = 'No results';
    ul.appendChild(li);
  }
  hideLoading();
}

function handleKeyFileClick(keyFileId) {
  if (!keyFileId) {
    showError('No key file ID');
    return;
  }
  document.getElementById('key-file-select').style.display = 'none';
  var callback = handleMasterPasswordOkClick.bind(undefined, keyFileId);
  onEnter('master-password', callback);
  document.getElementById('master-password-ok').addEventListener('click', callback);
  showMasterPassword();
}

function handleMasterPasswordOkClick(keyFileId) {
  // If the 'invalid password' error is shown.
  hideError();
  document.getElementById('master-password-enter').style.display = 'none';
  showLoading('Getting key file...');
  sendXhr('GET', API_BASE + '/files/' + keyFileId, fetchKeyFile);
}

function fetchKeyFile() {
  var file = JSON.parse(this.responseText);
  var downloadUrl = file['downloadUrl'];
  sendXhr('GET', downloadUrl, processKeyFile, 'arraybuffer');
}

function processKeyFile() {
  showLoading('Processing key file...');
  var password = document.getElementById('master-password').value;
  var file = new KeyFileParser(this.response).parse(password);
  hideLoading();
  if (file['error']) {
    showError(file['error']);
    showMasterPassword();
    return;
  }
  showGroups(file.rootGroup);
}

function showGroups(rootGroup) {
  var passwords = document.getElementById('passwords');
  passwords.style.display = 'initial';
  var groups = document.createElement('ol');
  for (var i = 0; i < rootGroup.getChildren().length; i++) {
    groups.appendChild(createGroupElement(rootGroup.getChildren()[i]));
  }
  passwords.appendChild(groups);
}

function createGroupElement(group) {
  var groupElement = document.createElement('li');
  var title = document.createElement('h2');
  title.innerHTML = group.getTitle();
  groupElement.appendChild(title);
  var children = document.createElement('ol');
  for (var i = 0; i < group.getChildren().length; i++) {
    children.appendChild(createGroupElement(group.getChildren()[i]));
  }
  for (var i = 0; i < group.getEntries().length; i++) {
    var entry = group.getEntries()[i];
    if (shouldDisplayEntry(entry)) {
      children.appendChild(createEntryElement(entry));
    }
  }
  groupElement.appendChild(children);
  return groupElement;
}

function createEntryElement(entry) {
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
}

function shouldDisplayEntry(entry) {
  return typeof entry.binary === 'undefined'
    || typeof entry.comment === 'undefined' || entry.comment === ''
    || entry.binaryDesc != 'bin-stream'
    || entry.title != 'Meta-Info'
    || entry.username != "SYSTEM"
    || entry.url != '$'
    || entry.image != 0;
}

function showLoading(message) {
  document.getElementById('loading-message').textContent = message;
  document.getElementById('loading').style.display = 'initial';
}

function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}

function showMasterPassword() {
  document.getElementById('master-password-enter').style.display = 'initial';
  document.getElementById('master-password').focus();
}

function onEnter(id, callback) {
  document.getElementById(id).addEventListener('keyup', function(event) {
    if (event.keyCode == 13) {
      callback();
    }
  });
}
