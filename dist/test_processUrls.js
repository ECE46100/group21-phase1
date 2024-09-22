"use strict";

var _processUrls = _interopRequireDefault(require("./processUrls"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
console.log('Running test_processURLs.ts');
var filePath = 'src/test_input.txt';
try {
  (0, _processUrls["default"])(filePath);
} catch (error) {
  console.error('Error running test_processUrls.ts:', error);
}