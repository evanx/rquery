'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});
exports.mkdirp = mkdirp;
exports.readFile = readFile;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _Promises = require('./Promises');

var Promises = _interopRequireWildcard(_Promises);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function mkdirp(directory) {
   return Promises.promisify(function (callback) {
      (0, _mkdirp2.default)(directory, callback);
   });
}

function readFile(file) {
   return Promises.promisify(function (callback) {
      return _fs2.default.readFile(file, callback);
   });
}
//# sourceMappingURL=Files.js.map