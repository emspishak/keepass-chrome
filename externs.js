/** A namespace for the Drive API v2:
 * https://developers.google.com/drive/v2/web/about-sdk
 */
var drive;


/**
 * A Drive API v2 Files list response. From
 * https://developers.google.com/drive/v2/reference/files/list
 * @constructor
 */
drive.FilesListResponse = function() {};

/** @type {!Array<drive.File>} */
drive.FilesListResponse.prototype.items;


/**
 * A Drive API v2 File object.
 * From https://developers.google.com/drive/v2/reference/files
 * @constructor
 */
drive.File = function() {};

/** @type {string} */
drive.File.prototype.title;

/** @type {string} */
drive.File.prototype.modifiedDate;

/** @type {string} */
drive.File.prototype.id;

/** @type {string} */
drive.File.prototype.downloadUrl;
