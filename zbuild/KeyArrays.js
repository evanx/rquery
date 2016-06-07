'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});
exports.reduceAssign = reduceAssign;

var logger = Loggers.create(__filename, 'info');

function reduceAssign(keys, producer, initialValue) {
   return keys.reduce(function (object, key) {
      return Objects.assignKey(object, key, producer(key));
   }, initialValue);
}
//# sourceMappingURL=KeyArrays.js.map