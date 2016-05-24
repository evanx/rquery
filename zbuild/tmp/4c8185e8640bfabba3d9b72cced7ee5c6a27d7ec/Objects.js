'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});
exports.mapEntries = mapEntries;
exports.translate = translate;

var logger = Loggers.create(__filename, 'info');

function mapEntries(object) {
   return Object.keys(object).map(function (key) {
      return { key: key, value: object[key] };
   });
}

function translate(object, other, fn) {
   Object.keys(object).forEach(function (key) {
      var entry = fn(key, object[key], other);
      if (!entry) {} else if (!Values.isDefined(entry.key)) {} else if (!Values.isDefined(entry.value)) {} else {
         other[entry.key] = entry.value;
      }
   });
   return other;
}