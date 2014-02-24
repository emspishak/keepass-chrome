var API_BASE = 'https://www.googleapis.com/drive/v2';

document.addEventListener('DOMContentLoaded', main);

function main() {
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
  document.getElementById('master-password-ok').addEventListener('click',
      handleMasterPasswordOkClick.bind(undefined, keyFileId));
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
  console.log(file);
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
