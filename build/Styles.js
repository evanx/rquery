'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.renderStyles = renderStyles;
exports.renderKeys = renderKeys;
exports.renderValue = renderValue;

var logger = Loggers.create(module.filename, 'debug');

var IntegerKeys = ['lineHeight'];
var CssKeys = Strings.splitSpace('\ncolor background\nwidth height\ndisplay position cursor\n');
var CssKeyPrefixes = Strings.splitSpace('\nmargin padding border\nfont background min\n');
var CssKeyRegex = new RegExp(createCssKeyRegexString());

function createCssKeyRegexString() {
   var prefixes = CssKeys.concat(CssKeyPrefixes);
   return ['^(', prefixes.join('|'), ')'].join();
}

function renderStyles(object) {
   var styles = renderKeys(object, 'root');
   logger.debug('styles', styles);
   return styles;
}

function renderKeys(object, key) {
   if (Object.keys(object).filter(function (key) {
      return isCssKey(key);
   }).length) {
      return lodash.compact(Object.keys(object).map(function (key) {
         return { key: renderKey(key), value: renderValue(object[key], key) };
      }).map(function (entry) {
         if (entry.key && lodash.isString(entry.value)) {
            return entry.key + ':' + entry.value;
         } else {
            logger.warn('renderKeys', entry.key, _typeof(entry.value));
         }
      })).join(';');
   } else {
      return Object.keys(object).reduce(function (result, key) {
         result[key] = renderValue(object[key], key);
         return result;
      }, {});
   }
}

function renderValue(value, key) {
   if (!Values.isDefined(value)) {
      logger.debug('renderValue empty', key);
      return '';
   } else if (Values.isInteger(value)) {
      if (IntegerKeys.includes(key)) {
         return value.toString();
      } else {
         return value + 'px';
      }
   } else if (lodash.isString(value)) {
      return value;
   } else if (lodash.isArray(value)) {
      return value.map(function (v) {
         return renderValue(v, key);
      }).join(' ');
   } else if (lodash.isObject(value)) {
      return renderKeys(value);
   } else {
      throw { message: 'Unsupported type: ' + (typeof value === 'undefined' ? 'undefined' : _typeof(value)), key: key };
   }
}

function renderKey(key) {
   return lodash.kebabCase(key);
}

function isCssKey(key) {
   return IntegerKeys.includes(key) || key.match(CssKeyRegex);
}
//# sourceMappingURL=Styles.js.map