import _classCallCheck from '../../../node_modules/@babel/runtime/helpers/classCallCheck.js';
import _createClass from '../../../node_modules/@babel/runtime/helpers/createClass.js';
import _assertThisInitialized from '../../../node_modules/@babel/runtime/helpers/assertThisInitialized.js';
import _inherits from '../../../node_modules/@babel/runtime/helpers/inherits.js';
import _possibleConstructorReturn from '../../../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js';
import _getPrototypeOf from '../../../node_modules/@babel/runtime/helpers/getPrototypeOf.js';
import _defineProperty from '../../../node_modules/@babel/runtime/helpers/defineProperty.js';
import React from 'react';
import propTypes from '../../../node_modules/prop-types/index.js';
import getDisplayName from '../../../node_modules/react-display-name/lib/getDisplayName.js';

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
// For a discussion on pitfalls, see
// https://gist.github.com/staltz/08bf613199092eeb41ac8137d51eb5e6

var Redraw = /*#__PURE__*/function (_React$PureComponent) {
  _inherits(Redraw, _React$PureComponent);

  var _super = _createSuper(Redraw);

  function Redraw() {
    var _this;

    _classCallCheck(this, Redraw);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "state", {
      lastDraw: -1
    });

    _defineProperty(_assertThisInitialized(_this), "draw", function () {
      _this.raf = requestAnimationFrame(_this.draw);
      var interval = _this.props.interval;
      var lastDraw = _this.state.lastDraw;
      var now = Date.now();
      var delta = now - lastDraw;

      if (lastDraw === -1 || delta > interval) {
        _this.setState({
          lastDraw: Math.round(now / interval) * interval
        });
      }
    });

    return _this;
  }

  _createClass(Redraw, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.raf = null;
      this.draw();
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.raf && cancelAnimationFrame(this.raf);
    }
  }, {
    key: "render",
    value: function render() {
      return this.props.children();
    }
  }]);

  return Redraw;
}(React.PureComponent);

_defineProperty(Redraw, "propTypes", {
  interval: propTypes.number,
  children: propTypes.func.isRequired
});

_defineProperty(Redraw, "defaultProps", {
  interval: 1000
});

var hocWrap = function hocWrap(Component, interval) {
  var HOC = function HOC(props) {
    return /*#__PURE__*/React.createElement(Redraw, {
      interval: interval
    }, function () {
      return /*#__PURE__*/React.createElement(Component, props);
    });
  };

  HOC.displayName = "Redraw(".concat(getDisplayName(Component), ")");
  return HOC;
};

Redraw.hocWrap = hocWrap;

export default Redraw;
export { Redraw, hocWrap };
//# sourceMappingURL=Redraw.js.map
