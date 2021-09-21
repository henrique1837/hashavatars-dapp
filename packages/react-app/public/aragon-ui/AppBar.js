'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _extends = require('./extends-5150c1f4.js');
var objectWithoutProperties = require('./objectWithoutProperties-5d2c0728.js');
var getPrototypeOf = require('./getPrototypeOf-e2e819f3.js');
var defineProperty = require('./defineProperty-fdbd3c46.js');
var _styled = require('styled-components');
var React = require('react');
var index$1 = require('./index-37353731.js');
var web = require('./web-7e5f0d11.js');
var index = require('./index-c33eeeef.js');
var Text = require('./Text.js');
var Theme = require('./Theme.js');
var css = require('./css.js');
var springs = require('./springs.js');
var miscellaneous = require('./miscellaneous.js');
var PublicUrl = require('./PublicUrl-4684cbb6.js');
require('./_commonjsHelpers-1b94f6bc.js');
require('./objectWithoutPropertiesLoose-34dfcdd4.js');
require('react-dom');
require('./environment.js');
require('./font.js');
require('./slicedToArray-bb07ac16.js');
require('./unsupportedIterableToArray-d5a3ce67.js');
require('./theme-dark.js');
require('./theme-light.js');
require('./color.js');
require('./toConsumableArray-0f2dcfe0.js');
require('./getDisplayName-7f913e84.js');
require('./url.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _styled__default = /*#__PURE__*/_interopDefaultLegacy(_styled);
var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

var chevronSvg = "data:image/svg+xml,%3Csvg%20width%3D%227%22%20height%3D%2212%22%20viewBox%3D%220%200%207%2012%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M.446%2012a.512.512%200%2001-.172-.03.422.422%200%2001-.146-.087A.37.37%200%20010%2011.6a.37.37%200%2001.128-.281l5.826-5.361L.217.692A.376.376%200%2001.089.405.378.378%200%2001.217.117.444.444%200%2001.529%200c.123%200%20.228.04.313.117l6.03%205.56A.37.37%200%20017%205.96a.37.37%200%2001-.128.281l-6.12%205.643A.477.477%200%2001.446%2012z%22%20fill%3D%22%2300CBE6%22%20fill-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E";

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = getPrototypeOf._getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = getPrototypeOf._getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return getPrototypeOf._possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var BAR_HEIGHT = 64;

var _StyledDiv = _styled__default['default']("div").withConfig({
  displayName: "AppBar___StyledDiv",
  componentId: "sc-11q0awo-0"
})(["overflow:hidden;display:flex;flex-direction:column;width:100%;min-height:", "px;background:", ";", ";padding-bottom:1px;&:after{content:'';position:absolute;left:0;right:0;bottom:0;border-bottom:1px solid ", ";}"], BAR_HEIGHT, function (p) {
  return p._css;
}, function (p) {
  return p._css2;
}, function (p) {
  return p._css3;
});

var _StyledDiv2 = _styled__default['default']("div").withConfig({
  displayName: "AppBar___StyledDiv2",
  componentId: "sc-11q0awo-1"
})(["display:flex;align-items:center;justify-content:flex-start;width:100%;height:", "px;"], function (p) {
  return p._css4;
});

var _StyledDiv3 = _styled__default['default']("div").withConfig({
  displayName: "AppBar___StyledDiv3",
  componentId: "sc-11q0awo-2"
})(["display:flex;align-items:center;height:100%;padding-left:", "px;"], function (p) {
  return p._css5;
});

var _StyledDiv4 = _styled__default['default']("div").withConfig({
  displayName: "AppBar___StyledDiv4",
  componentId: "sc-11q0awo-3"
})(["display:flex;align-items:center;height:100%;margin-left:auto;padding-right:", "px;"], function (p) {
  return p._css6;
});

var AppBar = /*#__PURE__*/function (_React$Component) {
  getPrototypeOf._inherits(AppBar, _React$Component);

  var _super = _createSuper(AppBar);

  function AppBar() {
    var _this;

    getPrototypeOf._classCallCheck(this, AppBar);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    defineProperty._defineProperty(getPrototypeOf._assertThisInitialized(_this), "state", {
      tabsHeight: 0
    });

    defineProperty._defineProperty(getPrototypeOf._assertThisInitialized(_this), "_tabsRef", /*#__PURE__*/React__default['default'].createRef());

    return _this;
  }

  getPrototypeOf._createClass(AppBar, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.updateTabsHeight();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      if (Boolean(prevProps.tabs) !== Boolean(this.props.tabs)) {
        this.updateTabsHeight();
      }
    }
  }, {
    key: "updateTabsHeight",
    value: function updateTabsHeight() {
      var el = this._tabsRef.current;

      if (el) {
        this.setState({
          tabsHeight: el.clientHeight
        });
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var tabsHeight = this.state.tabsHeight;

      var _this$props = this.props,
          children = _this$props.children,
          endContent = _this$props.endContent,
          onTitleClick = _this$props.onTitleClick,
          padding = _this$props.padding,
          tabs = _this$props.tabs,
          title = _this$props.title,
          theme = _this$props.theme,
          props = objectWithoutProperties._objectWithoutProperties(_this$props, ["children", "endContent", "onTitleClick", "padding", "tabs", "title", "theme"]);

      return /*#__PURE__*/React__default['default'].createElement(index.i, {
        name: "AppBar"
      }, /*#__PURE__*/React__default['default'].createElement(_StyledDiv, {
        _css: theme.surface,
        _css2: css.unselectable(),
        _css3: theme.border
      }, /*#__PURE__*/React__default['default'].createElement(_StyledDiv2, _extends._extends({}, props, {
        _css4: BAR_HEIGHT - 1
      }), title && /*#__PURE__*/React__default['default'].createElement(_StyledDiv3, {
        _css5: padding
      }, /*#__PURE__*/React__default['default'].createElement(AppBarTitle, {
        chevron: Boolean(children),
        clickable: Boolean(onTitleClick),
        onClick: onTitleClick
      }, typeof title === 'string' ? /*#__PURE__*/React__default['default'].createElement(Text['default'], {
        size: "xxlarge",
        deprecationNotice: false
      }, title) : title)), children, endContent && /*#__PURE__*/React__default['default'].createElement(_StyledDiv4, {
        _css6: padding
      }, endContent)), /*#__PURE__*/React__default['default'].createElement(web.Transition, {
        items: tabs,
        from: {
          opacity: 0,
          height: 0
        },
        enter: {
          opacity: 1,
          height: tabsHeight || 'auto'
        },
        leave: {
          opacity: 0,
          height: 0
        },
        initial: null,
        config: springs.springs.smooth,
        native: true
      }, function (tabs) {
        return tabs && function (styles) {
          return /*#__PURE__*/React__default['default'].createElement(TabsWrapper, {
            style: styles
          }, /*#__PURE__*/React__default['default'].createElement("div", {
            ref: _this2._tabsRef
          }, tabs));
        };
      })));
    }
  }]);

  return AppBar;
}(React__default['default'].Component);

defineProperty._defineProperty(AppBar, "propTypes", {
  children: index$1.propTypes.node,
  endContent: index$1.propTypes.node,
  onTitleClick: index$1.propTypes.func,
  padding: index$1.propTypes.number,
  tabs: index$1.propTypes.element,
  theme: index$1.propTypes.object,
  title: index$1.propTypes.node
});

defineProperty._defineProperty(AppBar, "defaultProps", {
  onTitleClick: miscellaneous.noop,
  padding: 30,
  title: ''
});

var AppBarTitle = PublicUrl.PublicUrl.hocWrap(_styled__default['default'].h1.withConfig({
  displayName: "AppBar__AppBarTitle",
  componentId: "sc-11q0awo-4"
})(["padding-right:20px;margin-right:calc(20px - 7px);white-space:nowrap;background-image:", ";background-position:100% 50%;background-repeat:no-repeat;cursor:", ";"], function (_ref) {
  var chevron = _ref.chevron;
  return chevron ? _styled.css(["url(", ")"], PublicUrl.PublicUrl.styledUrl(chevronSvg)) : 'none';
}, function (_ref2) {
  var clickable = _ref2.clickable;
  return clickable ? 'pointer' : 'default';
}));
var TabsWrapper = _styled__default['default'](web.extendedAnimated.div).withConfig({
  displayName: "AppBar__TabsWrapper",
  componentId: "sc-11q0awo-5"
})(["position:relative;z-index:1;"]);
function AppBar$1 (props) {
  var theme = Theme.useTheme();
  return /*#__PURE__*/React__default['default'].createElement(AppBar, _extends._extends({}, props, {
    theme: theme
  }));
}

exports.default = AppBar$1;
//# sourceMappingURL=AppBar.js.map
