'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _styled = require('styled-components');
var React = require('react');
var index = require('./index-37353731.js');
var Radio = require('./Radio.js');
var Theme = require('./Theme.js');
var css = require('./css.js');
var constants = require('./constants.js');
require('./_commonjsHelpers-1b94f6bc.js');
require('./extends-5150c1f4.js');
require('./objectWithoutProperties-5d2c0728.js');
require('./getPrototypeOf-e2e819f3.js');
require('./defineProperty-fdbd3c46.js');
require('./Checkbox.js');
require('./web-7e5f0d11.js');
require('./objectWithoutPropertiesLoose-34dfcdd4.js');
require('react-dom');
require('./FocusVisible.js');
require('./springs.js');
require('./miscellaneous.js');
require('./slicedToArray-bb07ac16.js');
require('./unsupportedIterableToArray-d5a3ce67.js');
require('./theme-dark.js');
require('./theme-light.js');
require('./environment.js');
require('./color.js');
require('./toConsumableArray-0f2dcfe0.js');
require('./RadioGroup.js');
require('./components.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _styled__default = /*#__PURE__*/_interopDefaultLegacy(_styled);
var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

var _StyledLabel = _styled__default['default']("label").withConfig({
  displayName: "RadioListItem___StyledLabel",
  componentId: "sc-1utxw89-0"
})(["display:flex;", ";& + &{margin-top:", "px;}"], function (p) {
  return p._css;
}, function (p) {
  return p._css2;
});

var _StyledRadio = _styled__default['default'](Radio['default']).withConfig({
  displayName: "RadioListItem___StyledRadio",
  componentId: "sc-1utxw89-1"
})(["flex-shrink:0;"]);

var _StyledDiv = _styled__default['default']("div").withConfig({
  displayName: "RadioListItem___StyledDiv",
  componentId: "sc-1utxw89-2"
})(["flex-grow:1;margin-left:12px;padding:12px 12px;border-radius:3px;transition:border 100ms ease-in-out;cursor:pointer;border:1px ", " solid;&:hover{border-color:", ";}"], function (p) {
  return p._css3;
}, function (p) {
  return p._css4;
});

var _StyledDiv2 = _styled__default['default']("div").withConfig({
  displayName: "RadioListItem___StyledDiv2",
  componentId: "sc-1utxw89-3"
})(["margin-top:", "px;"], function (p) {
  return p._css5;
});

var RadioListItem = /*#__PURE__*/React__default['default'].memo(function RadioListItem(_ref) {
  var description = _ref.description,
      index = _ref.index,
      title = _ref.title;
  var theme = Theme.useTheme();
  return /*#__PURE__*/React__default['default'].createElement(_StyledLabel, {
    _css: css.unselectable(),
    _css2: 1 * constants.GU
  }, /*#__PURE__*/React__default['default'].createElement(_StyledRadio, {
    id: index
  }), /*#__PURE__*/React__default['default'].createElement(_StyledDiv, {
    _css3: theme.border,
    _css4: theme.accent.alpha(0.35)
  }, /*#__PURE__*/React__default['default'].createElement("strong", null, title), /*#__PURE__*/React__default['default'].createElement(_StyledDiv2, {
    _css5: 0.5 * constants.GU
  }, description)));
});
RadioListItem.propTypes = {
  description: index.propTypes.node.isRequired,
  index: index.propTypes.number.isRequired,
  title: index.propTypes.node.isRequired
};

exports.default = RadioListItem;
//# sourceMappingURL=RadioListItem.js.map
