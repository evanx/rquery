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

var logger = Loggers.create(module.filename);
//# sourceMappingURL=Result.js.map