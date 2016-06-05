'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});
exports.render = render;
exports.assignDeps = assignDeps;

var _ContentArrayHtml = require('./ContentArrayHtml');

var ContentArrayHtml = _interopRequireWildcard(_ContentArrayHtml);

var _ContentArrayPlain = require('./ContentArrayPlain');

var ContentArrayPlain = _interopRequireWildcard(_ContentArrayPlain);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function render(format, content) {
   if (format === 'html') {
      ContentArrayHtml.render(content);
   } else {
      ContentArrayPlain.render(content);
   }
}

function assignDeps(g) {
   g.Ch = ContentArrayHtml;
   g.Cp = ContentArrayPlain;
}
//# sourceMappingURL=ContentArray.js.map