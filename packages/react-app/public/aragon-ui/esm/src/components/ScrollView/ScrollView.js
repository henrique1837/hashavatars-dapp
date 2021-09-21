import _extends from '../../../node_modules/@babel/runtime/helpers/extends.js';
import _objectWithoutProperties from '../../../node_modules/@babel/runtime/helpers/objectWithoutProperties.js';
import _styled from 'styled-components';
import React from 'react';
import propTypes from '../../../node_modules/prop-types/index.js';

var _StyledDiv = _styled("div").withConfig({
  displayName: "ScrollView___StyledDiv",
  componentId: "sc-1hhoqwn-0"
})(["position:relative;z-index:0;height:100%;overflow-x:", ";overflow-y:", ";"], function (p) {
  return p._css;
}, function (p) {
  return p._css2;
});

function ScrollView(_ref) {
  var children = _ref.children,
      horizontal = _ref.horizontal,
      vertical = _ref.vertical,
      props = _objectWithoutProperties(_ref, ["children", "horizontal", "vertical"]);

  return /*#__PURE__*/React.createElement(_StyledDiv, _extends({}, props, {
    _css: horizontal ? 'auto' : 'hidden',
    _css2: vertical ? 'auto' : 'hidden'
  }), children);
}

ScrollView.propTypes = {
  vertical: propTypes.bool,
  horizontal: propTypes.bool,
  children: propTypes.node
};
ScrollView.defaultProps = {
  vertical: true,
  horizontal: true
};

export default ScrollView;
//# sourceMappingURL=ScrollView.js.map
