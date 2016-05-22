'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});
exports.translate = translate;

var logger = Loggers.create(__filename, 'info');

function translate(object, fn) {
   var result = {};
   Object.keys(object).forEach(function (key) {
      var entry = fn(key, object[key], result);
      if (!entry) {} else if (entry.result) {
         result = entry.result;
      } else if (entry.key !== undefined) {
         if (entry.value !== undefined) {
            result[entry.key] = entry.value;
         }
      } else {}
   });
   return result;
}
//# sourceMappingURL=Objects.js.map