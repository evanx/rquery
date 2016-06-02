'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});
exports.thenElse = thenElse;
exports.elseFn = elseFn;

var logger = Loggers.create(__filename, 'info');

function thenElse(truthy, thenValue, elseValue) {
   if (truthy) {
      return thenValue;
   } else {
      return elseValue;
   }
}

function elseFn(truthy, elseValue, then) {
   if (!truthy) {
      return value;
   } else {
      return then(truthy);
   }
}
//# sourceMappingURL=If.js.map