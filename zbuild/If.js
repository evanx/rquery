'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});
exports.defined = defined;
exports.callable = callable;
exports.thenElse = thenElse;
exports.then = then;

var logger = Loggers.create(__filename, 'info');

function defined(value) {
   return value !== undefined;
}

function callable(value) {
   if (lodash.isFunction(value)) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
         args[_key - 1] = arguments[_key];
      }

      return value.apply(undefined, args);
   } else {
      return value;
   }
}

function thenElse(truthy, then, else_) {
   if (truthy) {
      return [true, truthy, callable(then, truthy)];
   } else {
      return [false, truthy, callable(then, truthy)];
   }
}

function then(truthy, then) {
   if (truthy) {
      return [true, truthy, callable(then, truthy)];
   } else {
      return [false, truthy];
   }
}
//# sourceMappingURL=If.js.map