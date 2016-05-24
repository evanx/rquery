'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.html = html;
exports.renderPath = renderPath;
exports.element = element;
exports.createElements = createElements;
exports.createStyleElements = createStyleElements;
exports.createContentElements = createContentElements;
exports.assignDeps = assignDeps;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var logger = Loggers.create(__filename, 'info');

var SelfClosingElementNames = Strings.splitSpace('\n   area base basefont br hr input img link meta\n   ');

var ElementNames = Strings.splitSpace('\n   html head meta link script body\n   header nav h1 h2 h3 h4 h5 h6\n   section article aside\n   table thead tbody th tr td\n   div span pre p hr br img i b tt\n   ');

function html(strings) {
   strings = strings.map(function (string) {
      return string.replace(/^\s*\n\s*/, '');
   });

   for (var _len = arguments.length, values = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      values[_key - 1] = arguments[_key];
   }

   logger.debug('html', strings, values);
   var previousString = strings[0];
   return values.reduce(function (result, value, index) {
      var nextString = strings[index + 1];
      try {
         if (lodash.endsWith(previousString, '=')) {
            if (/^["']/.test(nextString)) {
               throw { message: 'quotes' };
            } else if (lodash.isString(value)) {
               value = '"' + value + '"';
            } else {
               throw { message: typeof value === 'undefined' ? 'undefined' : _typeof(value) };
            }
         }
         if (lodash.endsWith(previousString, '=\'')) {
            if (!/^'/.test(nextString)) {
               throw { message: 'missing closing single quote' };
            } else if (lodash.isString(value)) {} else {
               throw { message: typeof value === 'undefined' ? 'undefined' : _typeof(value) };
            }
         }
         if (lodash.endsWith(previousString, '=\"')) {
            if (!/^"/.test(nextString)) {
               throw { message: 'missing closing double quote' };
            } else if (lodash.isString(value)) {} else {
               throw { message: typeof value === 'undefined' ? 'undefined' : _typeof(value) };
            }
         }
         if (lodash.isArray(value)) {
            value = lodash.flatten(value).join('\n');
         } else if (lodash.isString(value)) {} else {
            throw { message: 'value type: ' + (typeof value === 'undefined' ? 'undefined' : _typeof(value)) };
         }
      } catch (err) {
         logger.error('html', err.message, { previousString: previousString, value: value, nextString: nextString });
         throw err;
      }
      previousString = nextString;
      return result + value + nextString;
   }, previousString);
}

function renderPath(path) {
   if (lodash.isArray(path)) {
      return [''].concat(_toConsumableArray(path)).join('/');
   } else if (lodash.isString(path)) {
      return path;
   } else {
      return '/routes';
      logger.warn('path type', typeof path === 'undefined' ? 'undefined' : _typeof(path));
   }
}

function element(name, attributes) {
   var content = [];
   if (!attributes) {
      content.push('<' + name + '/>');
   } else {
      assert(lodash.isObject(attributes), 'attributes');

      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
         args[_key2 - 2] = arguments[_key2];
      }

      var children = args;
      var attrs = Objects.kvs(attributes).filter(function (kv) {
         return kv.value && kv.value.toString();
      }).map(function (kv) {
         return { key: kv.key, value: kv.value.toString() };
      }).map(function (kv) {
         return kv.key + '="' + kv.value + '"';
      });
      logger.debug('element', name, attrs);
      if (attrs.length) {
         if (children.length) {
            content.push('<' + name + ' ' + attrs.join(' ') + '>');
            content.push(children);
            content.push('</' + name + '>');
         } else {
            content.push('<' + name + ' ' + attrs.join(' ') + '/>');
         }
      } else {
         if (children.length) {
            content.push('<' + name + '>');
            content.push(children);
            content.push('</' + name + '>');
         } else {
            content.push('<' + name + '/>');
         }
      }
   }
   return lodash.flatten(content).join('\n');
}

function _style(name, style) {
   assert.equal(typeof style === 'undefined' ? 'undefined' : _typeof(style), 'string', 'style type: ' + name);

   for (var _len3 = arguments.length, children = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
      children[_key3 - 2] = arguments[_key3];
   }

   return element.apply(undefined, [name, { style: style }].concat(children));
}

function _content(name) {
   for (var _len4 = arguments.length, children = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      children[_key4 - 1] = arguments[_key4];
   }

   return element.apply(undefined, [name, {}].concat(children));
}

function createElements() {
   return ElementNames.reduce(function (result, name) {
      result[name] = function () {
         for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
            args[_key5] = arguments[_key5];
         }

         return element.apply(undefined, [name].concat(args));
      };
      return result;
   }, {});
}

function createStyleElements() {
   return ElementNames.reduce(function (result, name) {
      result[name] = function () {
         for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
            args[_key6] = arguments[_key6];
         }

         return _style.apply(undefined, [name].concat(args));
      };
      return result;
   }, {});
}

function createContentElements() {
   return ElementNames.reduce(function (result, name) {
      result[name] = function () {
         for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
            args[_key7] = arguments[_key7];
         }

         return _content.apply(undefined, [name].concat(args));
      };
      return result;
   }, {});
}

function assignDeps(g) {
   g.He = createElements();
   g.Hs = createStyleElements();
   g.Hc = createContentElements();
   g.Hx = module.exports;
   g.html = html;
}