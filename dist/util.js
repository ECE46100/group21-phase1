"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOwnerAndPackageName = getOwnerAndPackageName;
exports.handleOutput = handleOutput;
/**
 * @function handleOutput
 * @description Handles the output of the result, error message, or log file. At least one of the message/errorMessage must be specified.
 * @param {string} message - Optional message to log.
 * @param {string} errorMessage - Optional error message to log.
 * @param {number} endpoint - Display endpoint for output (0: console, 1: log file).
 */
function handleOutput() {
  var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var errorMessage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var endpoint = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  switch (endpoint) {
    case 0:
      {
        if (message != '') console.log(message);
        if (errorMessage != '') console.error(errorMessage);
        break;
      }
    case 1:
      {
        break;
      }
    default:
      {
        if (message != '') console.log(message);
        if (errorMessage != '') console.error(new Error(errorMessage));
        break;
      }
  }
}

/**
 * @function getOwnerAndPackageName
 * @description A function that extracts owner and packageName from a valid github repo url
 * @param {string} packageUrl - The GitHub repository url(string).
 * @returns {[string, string]} - [Owner, packageName]
 */
function getOwnerAndPackageName(packageUrl) {
  var pathSegments = packageUrl.split('/').filter(Boolean);
  var owner = pathSegments[pathSegments.length - 2];
  var packageName = pathSegments[pathSegments.length - 1].replace('.git', '');
  return [owner, packageName];
}