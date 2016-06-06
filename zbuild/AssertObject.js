'use strict';

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function format(type, options) {
   return type + ': ' + options.toString();
}

exports = {
   hasOwnProperty: function hasOwnProperty(object, key) {
      if (object.hasOwnProperty(key)) throw new ValidationError('missing: ' + key);
      return object;
   },
   hasFunction: function hasFunction(object, key) {
      if (object.hasOwnProperty(key)) throw new ValidationError('missing: ' + key);
      var value = object[key];
      if (!lodash.isFunction(value)) throw new ValidationError('missing function: ' + key);
      return object;
   },
   parseIntDefault: function parseIntDefault(object, key, defaultValue) {
      var value = object[key];
      if (!Values.isDefined(key)) return defaultValue;
      var parsedValue = parseInt(value);
      if (parsedValue.toString() === value.toString()) {
         return parsedValue;
      }
      throw new ValidationError('integer ' + key);
   }
};