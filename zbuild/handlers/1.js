"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require("bluebird");

var logger = Loggers.create(module.filename);
var rquery = global.rquery;

exports.default = function () {
  var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee(req, res, reqx) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return function (_x, _x2, _x3) {
    return ref.apply(this, arguments);
  };
}();