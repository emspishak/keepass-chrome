var API_BASE = 'https://www.googleapis.com/drive/v2';

document.addEventListener('DOMContentLoaded', main);

function main() {
  document.getElementById('key-file-search').addEventListener('click', searchForKeyFile);
}

function checkError() {
  if (chrome.runtime.lastError) {
    document.getElementById('error').textContent = chrome.runtime.lastError.message;
  }
  return !!chrome.runtime.lastError;
}

function searchForKeyFile() {
  var query = document.getElementById('key-file-name').value;
  var encodedQuery = encodeURIComponent(query).replace("'", "\\'");
  sendXhr('GET', API_BASE + '/files?q=title+=+\'' + encodedQuery + '\'', displayFiles);
}

function sendXhr(method, url, callback) {
  chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
    if (checkError()) {
      return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
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
  var items = {'keyFileId': keyFileId};
  chrome.storage.sync.set(items, function() {
    if (checkError()) {
      return;
    }
  });
}
