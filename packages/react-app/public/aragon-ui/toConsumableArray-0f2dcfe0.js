'use strict';

var _commonjsHelpers = require('./_commonjsHelpers-1b94f6bc.js');
var unsupportedIterableToArray = require('./unsupportedIterableToArray-d5a3ce67.js');

var arrayWithoutHoles = _commonjsHelpers.createCommonjsModule(function (module) {
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return unsupportedIterableToArray.arrayLikeToArray(arr);
}

module.exports = _arrayWithoutHoles;
module.exports["default"] = module.exports, module.exports.__esModule = true;
});

var iterableToArray = _commonjsHelpers.createCommonjsModule(function (module) {
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

module.exports = _iterableToArray;
module.exports["default"] = module.exports, module.exports.__esModule = true;
});

var nonIterableSpread = _commonjsHelpers.createCommonjsModule(function (module) {
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

module.exports = _nonIterableSpread;
module.exports["default"] = module.exports, module.exports.__esModule = true;
});

var toConsumableArray = _commonjsHelpers.createCommonjsModule(function (module) {
function _toConsumableArray(arr) {
  return arrayWithoutHoles(arr) || iterableToArray(arr) || unsupportedIterableToArray.unsupportedIterableToArray(arr) || nonIterableSpread();
}

module.exports = _toConsumableArray;
module.exports["default"] = module.exports, module.exports.__esModule = true;
});

var _toConsumableArray = /*@__PURE__*/_commonjsHelpers.unwrapExports(toConsumableArray);

exports._toConsumableArray = _toConsumableArray;
//# sourceMappingURL=toConsumableArray-0f2dcfe0.js.map
