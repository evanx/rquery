'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

// Copyright (c) 2015, Evan Summers (twitter.com/evanxsummers)
// ISC license, see http://github.com/evanx/redexutil/LICENSE

var logger = Loggers.create(__filename, 'info');

var factors = {
   s: 1,
   m: 60,
   h: 60 * 60,
   d: 60 * 60 * 24
};

var that = {
   factors: factors,
   now: function now() {
      return Math.ceil(new Date().getTime() / 1000);
   },
   format: function format(seconds) {
      if (seconds < factors.m) {
         return '' + seconds + 's';
      } else if (seconds < factors.h) {
         return '' + parseInt(seconds / factors.m) + 'm';
      } else if (seconds < factors.d) {
         return '' + parseInt(seconds / factors.h) + 'h';
      } else {
         return '' + parseInt(seconds / factors.d) + 'd';
      }
   },
   parse: function parse(string, defaultValue) {
      if (!string) {
         logger.warn('parse empty', defaultValue, string);
         return defaultValue;
      }

      var _ref = string.match(/^([0-9]+)([a-z]?)$/) || [];

      var _ref2 = _slicedToArray(_ref, 2);

      var value = _ref2[0];
      var factorKey = _ref2[1];

      if (!Values.isDefined(value)) {
         throw new ValidationError('invalid seconds');
      } else if (factorKey) {
         var factor = factors[factorKey];
         if (!factor) {
            throw new ValidationError('invalid seconds factor key: ' + factorKey);
         }
         return value * factor;
      } else {
         return value;
      }
   },
   parsePropDefault: function parsePropDefault(object, key, defaultValue) {
      try {
         return that.parse(object[key], defaultValue);
      } catch (err) {
         throw new ValidationError(key + ': ' + err.message);
      }
   },
   parseOptionalKeyDefault: function parseOptionalKeyDefault(object, key, defaultValue) {
      if (!object) return defaultValue;
      if (!Values.isDefined(object[key])) return defaultValue;
      return that.parsePropDefault(object, key, defaultValue);
   },
   fromMinutes: function fromMinutes(minutes) {
      return minutes * factors.m;
   },
   fromHours: function fromHours(hours) {
      return hours * factors.h;
   },
   fromDays: function fromDays(days) {
      return days * factors.d;
   },
   toDays: function toDays(seconds) {
      return Math.ceil(seconds / factors.d);
   },
   assert: function (_assert) {
      function assert(_x, _x2) {
         return _assert.apply(this, arguments);
      }

      assert.toString = function () {
         return _assert.toString();
      };

      return assert;
   }(function (seconds, message) {
      message = message + ': ' + seconds;
      assert(seconds, message);
      var value = that.parse(seconds, -1);
      assert(value >= 0, message + ': ' + value);
      return value;
   })
};

function getMessage(seconds, message) {
   return message + ': ' + seconds;
}

module.exports = that;