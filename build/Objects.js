'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.kvs = kvs;
exports.kv = kv;
exports.translate = translate;

var logger = Loggers.create(__filename, 'info');

function kvs(object) {
   return Object.keys(object).map(function (key) {
      return kv(object, key);
   });
}

function kv(object, key) {
   assert.equal(typeof key === 'undefined' ? 'undefined' : _typeof(key), 'string');
   return { key: key, value: object[key] };
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
//# sourceMappingURL=Objects.js.map