'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _extends = require('./extends-5150c1f4.js');
var _styled = require('styled-components');
var React = require('react');
var ButtonBase = require('./ButtonBase.js');
var Theme = require('./Theme.js');
var textStyles = require('./text-styles.js');
var css = require('./css.js');
require('./_commonjsHelpers-1b94f6bc.js');
require('./slicedToArray-bb07ac16.js');
require('./unsupportedIterableToArray-d5a3ce67.js');
require('./objectWithoutProperties-5d2c0728.js');
require('./defineProperty-fdbd3c46.js');
require('./index-37353731.js');
require('./FocusVisible.js');
require('./getPrototypeOf-e2e819f3.js');
require('./keycodes.js');
require('./constants.js');
require('./environment.js');
require('./miscellaneous.js');
require('./theme-dark.js');
require('./theme-light.js');
require('./color.js');
require('./toConsumableArray-0f2dcfe0.js');
require('./font.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _styled__default = /*#__PURE__*/_interopDefaultLegacy(_styled);
var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

var _StyledButtonBase = _styled__default['default'](ButtonBase['default']).withConfig({
  displayName: "ContextMenuItem___StyledButtonBase",
  componentId: "sc-6mg7lj-0"
})(["display:flex;align-items:center;padding:5px 16px 5px 10px;cursor:pointer;white-space:nowrap;width:100%;", " ", ";&:active{background:", ";}"], function (p) {
  return p._css;
}, function (p) {
  return p._css2;
}, function (p) {
  return p._css3;
});

var ContextMenuItem = /*#__PURE__*/React__default['default'].memo(function ContextMenuItem(props) {
  var theme = Theme.useTheme();
  return /*#__PURE__*/React__default['default'].createElement(_StyledButtonBase, _extends._extends({}, props, {
    _css: textStyles.textStyle('body2'),
    _css2: css.unselectable(),
    _css3: theme.surfacePressed
  }));
});

exports.default = ContextMenuItem;
//# sourceMappingURL=ContextMenuItem.js.map
