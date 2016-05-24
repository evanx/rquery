'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.renderStyles = renderStyles;
exports.renderStyleSheet = renderStyleSheet;
exports.getCachedUserAgentStyleSheet = getCachedUserAgentStyleSheet;
exports.setUserAgentStyleSheet = setUserAgentStyleSheet;
exports.getUserAgentStyleSheet = getUserAgentStyleSheet;
exports.renderUserAgentStylesheet = renderUserAgentStylesheet;
exports.renderKeys = renderKeys;
exports.renderValue = renderValue;

var logger = Loggers.create(module.filename, 'debug');

var IntegerKeys = ['lineHeight'];
var CssKeys = Strings.splitSpace('\n   color background\n   width height\n   cursor\n   display position float clear\n   textDecoration\n   ');
var CssKeyPrefixes = Strings.splitSpace('\n   text\n   margin padding border\n   font background min\n   ');

var CssKeyRegex = new RegExp(createCssKeyRegexString());

function test() {
   logger.debug('CssKeys', CssKeys.join('|'));
   logger.debug('CssKeyRegex', createCssKeyRegexString());
}

if (process.env.NODE_ENV !== 'production') {
   test();
}

function createCssKeyRegexString() {
   var prefixes = CssKeys.concat(CssKeyPrefixes);
   return ['^(', prefixes.join('|'), ')'].join('');
}

// exports

function renderStyles(object) {
   var styles = renderKeys(object, 'root');
   logger.debug('styles', styles);
   return styles;
}

function renderStyleSheet(object) {
   return Object.keys(object).map(function (key) {
      return Objects.kv(object, key);
   }).filter(function (kv) {
      return lodash.isString(kv.value);
   }).map(function (kv) {
      return [kv.key, '{', kv.value, '}'].join(' ');
   }).join('\n');
}

var userAgentCache = new Map();

function getUserAgentType(key, ua) {
   if (ua.match(/Mobile/)) {
      return 'm';
   } else {
      return 'o';
   }
}

function getCachedUserAgentStyleSheet(options) {
   var styles = options.styles;
   var key = options.key;
   var ua = options.ua;

   assert.equal(_typeof(styles[key]), 'object', 'css stylesheet object');
   options.uaType = getUserAgentType(key, ua);
   options.uaKey = [options.uaType, key].join(':');
   var entry = userAgentCache.get(options.uaKey);
   if (entry) {
      if (entry.expire && entry.expire < new Date().getTime()) {} else if (entry.value) {
         return entry.value;
      }
   }
   return setUserAgentStyleSheet(options);
}

function setUserAgentStyleSheet(_ref) {
   var styles = _ref.styles;
   var key = _ref.key;
   var uaKey = _ref.uaKey;
   var uaType = _ref.uaType;

   var entry = { expire: 0 };
   entry.value = getUserAgentStyleSheet(styles[key]);
   if (uaType === 'o') {
      var mediaKey = '_768';
      var mediaStyles = styles[mediaKey];
      if (mediaStyles) {
         var styleSheet = mediaStyles[key];
         if (!styleSheet) {
            logger.debug('stylesheet empty', key, mediaKey);
         } else {
            entry.value += getUserAgentStyleSheet(styleSheet);
         }
      }
   }
   userAgentCache.set(uaKey, entry);
   return entry.value;
}

function getUserAgentStyleSheet(object) {
   return Object.keys(object).map(function (key) {
      return Objects.kv(object, key);
   }).filter(function (kv) {
      return lodash.isString(kv.value);
   }).map(function (kv) {
      return [kv.key, '{', kv.value, '}'].join(' ');
   }).join('\n');
}

function renderUserAgentStylesheet(userAgent, object) {
   return Object.keys(object).map(function (key) {
      return Objects.kv(object, key);
   }).filter(function (kv) {
      return lodash.isString(kv.value);
   }).map(function (kv) {
      return [kv.key, '{', kv.value, '}'].join(' ');
   }).join('\n');
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