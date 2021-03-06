'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});
exports.ifElseFn = ifElseFn;
exports.isInteger = isInteger;

var logger = Loggers.create(__filename, 'info');

function callable(value, ...args) {
   if (lodash.isFunction(value)) {
      return value(...args);
   } else {
      return value;
   }
}

function ifElseFn(truthy, elseValue, then) {
   if (!truthy) {
      return value;
   } else {
      return then(truthy);
   }
}

function isInteger(value) {
   return parseInt(value) === value;
}
