'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});
exports.render = render;
exports.assignDeps = assignDeps;

var _ContentHtml = require('./ContentHtml');

var ContentHtml = _interopRequireWildcard(_ContentHtml);

var _ContentPlain = require('./ContentPlain');

var ContentPlain = _interopRequireWildcard(_ContentPlain);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function render(format, content) {
   if (format === 'html') {
      ContentHtml.render(content);
   } else {
      ContentPlain.render(content);
   }
}

function assignDeps(g) {
   g.Ch = ContentHtml;
   g.Cp = ContentPlain;
}