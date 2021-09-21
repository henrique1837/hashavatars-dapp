'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var getPrototypeOf = require('./getPrototypeOf-e2e819f3.js');
var React = require('react');
var index = require('./index-37353731.js');
var Timer = require('./Timer.js');
var environment = require('./environment.js');
require('./_commonjsHelpers-1b94f6bc.js');
require('./extends-5150c1f4.js');
require('./defineProperty-fdbd3c46.js');
require('./toConsumableArray-0f2dcfe0.js');
require('./unsupportedIterableToArray-d5a3ce67.js');
require('styled-components');
require('./_baseGetTag-6ec23aaa.js');
require('./dayjs.min-ac79806e.js');
require('./date.js');
require('./slicedToArray-bb07ac16.js');
require('./Theme.js');
require('./theme-dark.js');
require('./theme-light.js');
require('./color.js');
require('./IconClock.js');
require('./objectWithoutProperties-5d2c0728.js');
require('./IconPropTypes-f5b14dc5.js');
require('./index-c33eeeef.js');
require('./constants.js');
require('./Redraw-53d2c4f3.js');
require('./getDisplayName-7f913e84.js');
require('./text-styles.js');
require('./font.js');
require('./css.js');
require('./miscellaneous.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = getPrototypeOf._getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = getPrototypeOf._getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return getPrototypeOf._possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var Countdown = /*#__PURE__*/function (_React$Component) {
  getPrototypeOf._inherits(Countdown, _React$Component);

  var _super = _createSuper(Countdown);

  function Countdown() {
    getPrototypeOf._classCallCheck(this, Countdown);

    return _super.apply(this, arguments);
  }

  getPrototypeOf._createClass(Countdown, [{
    key: "deprecationWarning",
    value: function deprecationWarning() {
      environment.warnOnce('Countdown', '"Countdown" has been deprecated. Please use "Timer" instead.');
    }
  }, {
    key: "render",
    value: function render() {
      this.deprecationWarning();
      var _this$props = this.props,
          end = _this$props.end,
          removeDaysAndHours = _this$props.removeDaysAndHours;
      var format = removeDaysAndHours ? 'ms' : 'dhms';
      return /*#__PURE__*/React__default['default'].createElement(Timer['default'], {
        end: end,
        format: format
      });
    }
  }]);

  return Countdown;
}(React__default['default'].Component);

Countdown.propTypes = {
  end: index.propTypes.instanceOf(Date).isRequired,
  removeDaysAndHours: index.propTypes.bool
};
Countdown.defaultProps = {
  removeDaysAndHours: false
};

exports.default = Countdown;
//# sourceMappingURL=Countdown.js.map
