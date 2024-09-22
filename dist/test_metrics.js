"use strict";

var _metrics = _interopRequireDefault(require("./metrics"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
console.log('Running test_metrics.ts');
(0, _metrics["default"])('https://www.react.com', 'cloned_repos/cloudinary cloudinary_npm').then(function (result) {
  console.log('Metrics computed:');
  console.log(result);
})["catch"](function (error) {
  console.error('Error computing metrics:');
  console.error(error);
});