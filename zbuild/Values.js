'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});
exports.isDefined = isDefined;
exports.isInteger = isInteger;

var logger = Loggers.create(__filename, 'info');

function isDefined(value) {
   return value !== undefined;
}

function isInteger(value) {
   return parseInt(value) === value;
}
//# sourceMappingURL=Values.js.map