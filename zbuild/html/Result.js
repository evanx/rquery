'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

exports.default = function (props) {
   logger.debug('props', Object.keys(props));
   return Object.assign(props, {
      title: '',
      content: '\n      '
   });
};

var _styles = require('./styles');

var _styles2 = _interopRequireDefault(_styles);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = Loggers.create(module.filename);
//# sourceMappingURL=Result.js.map