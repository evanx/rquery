'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.on = on;

var logger = Loggers.create(__filename, 'info');

function invokable(value) {
   if (lodash.isFunction(value)) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
         args[_key - 1] = arguments[_key];
      }

      return value.apply(undefined, args);
   } else {
      return value;
   }
}

function on(defaultValue) {
   for (var _len2 = arguments.length, clauses = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      clauses[_key2 - 1] = arguments[_key2];
   }

   var _ref = clauses.find(function (clause) {
      return clause[0];
   }) || [];

   var _ref2 = _slicedToArray(_ref, 2);

   var match = _ref2[0];
   var result = _ref2[1];

   if (!match) {
      return invokable(defaultValue, match);
   } else {
      return invokable(result, match);
   }
}