var API_BASE = 'https://www.googleapis.com/drive/v2';

document.addEventListener('DOMContentLoaded', main);

function main() {
  document.getElementById('key-file-search').addEventListener('click', searchForKeyFile);
}

function showError(message) {
  document.getElementById('error').textContent = message;
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
}

function handleKeyFileClick(keyFileId) {
  chrome.storage.sync.set({'keyFileId': keyFileId}, function() {
    if (checkError()) {
      return;
    }
    fetchKeyFileMetadata(keyFileId);
  });
}

function fetchKeyFileMetadata(keyFileId) {
  if (!keyFileId) {
    showError('No key file ID');
  }
  sendXhr('GET', API_BASE + '/files/' + keyFileId, fetchKeyFile);
}

function fetchKeyFile() {
  var file = JSON.parse(this.responseText);
  var downloadUrl = file['downloadUrl'];
  sendXhr('GET', downloadUrl, processKeyFile, 'arraybuffer');
}

function processKeyFile() {
  var data = this.response;
}
