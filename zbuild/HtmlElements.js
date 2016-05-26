'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.html = html;
exports.ms = ms;
exports.onClick = onClick;
exports.renderPath = renderPath;
exports.element = element;
exports.createElements = createElements;
exports.createStyleElements = createStyleElements;
exports.createMetaElements = createMetaElements;
exports.createMetaStyleElements = createMetaStyleElements;
exports.createMetaContentElements = createMetaContentElements;
exports.createContentElements = createContentElements;
exports.assignDeps = assignDeps;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var logger = Loggers.create(__filename, 'info');

var SelfClosingElementNames = Strings.splitSpace('\n   area base basefont br hr input img link meta\n   ');

var ElementNames = Strings.splitSpace('\n   html head meta link script body\n   header nav h1 h2 h3 h4 h5 h6\n   section article aside\n   table thead tbody th tr td\n   div span pre p a hr br img i b tt\n   ');

var Element = function Element(_ref) {
   var name = _ref.name;
   var attributes = _ref.attributes;
   var children = _ref.children;

   _classCallCheck(this, Element);
};

var HtmlElement = function () {
   function HtmlElement(_ref2) {
      var name = _ref2.name;
      var attributes = _ref2.attributes;
      var children = _ref2.children;

      _classCallCheck(this, HtmlElement);
   }

   _createClass(HtmlElement, [{
      key: 'toString',
      value: function toString() {
         return '';
      }
   }]);

   return HtmlElement;
}();

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
      if (!Values.isDefined(value)) {
         value = '';
      }
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

function ms(meta, style) {
   return { meta: meta, style: style };
}

function onClick(path) {
   return 'window.location.pathname=\'' + path + '\'';
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
      return ['<', name, '/>'].join('');
   }

   for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
      args[_key2 - 2] = arguments[_key2];
   }

   var children = lodash.compact(lodash.flatten(args));
   if (!lodash.isObject(attributes)) {
      throw { message: 'attributes: ' + (typeof attributes === 'undefined' ? 'undefined' : _typeof(attributes)), context: { name: name, attributes: attributes, children: children } };
   }
   var attrs = Objects.kvs(attributes).filter(function (kv) {
      return kv.key !== 'meta';
   }).filter(function (kv) {
      return kv.value && kv.value.toString();
   }).map(function (kv) {
      return { key: kv.key, value: kv.value.toString() };
   }).map(function (kv) {
      return kv.key + '="' + kv.value + '"';
   });
   logger.debug('element', name, attrs);
   return renderElements(name, attributes, attrs, children);
}

function renderElements(name, attributes, attrs, children) {
   if (isMeta(attributes, 'repeat')) {
      if (!children.length) {
         return '';
      } else if (!lodash.isArray(children)) {
         throw { message: 'children type: ' + (typeof children === 'undefined' ? 'undefined' : _typeof(children)), name: name, attributes: attributes, children: children };
      } else if (lodash.isEmpty(children)) {
         return '';
      } else {
         return lodash.flatten(children).map(function (child) {
            return renderElementChildren(name, attributes, attrs, child);
         }).join('\n');
      }
   } else {
      return renderElementChildren(name, attributes, attrs, children);
   }
}

function renderElementChildren(name, attributes, attrs) {
   for (var _len3 = arguments.length, children = Array(_len3 > 3 ? _len3 - 3 : 0), _key3 = 3; _key3 < _len3; _key3++) {
      children[_key3 - 3] = arguments[_key3];
   }

   var content = [];
   children = lodash.flatten(children);
   if (!attrs.length && !children.length) {
      if (isMeta(attributes, 'optional')) {} else {
         if (SelfClosingElementNames.includes(name)) {
            return '<' + name + '/>';
         } else {
            return '<' + name + '></' + name + '>';
         }
      }
   } else if (attrs.length && children.length) {
      content.push('<' + name + ' ' + attrs.join(' ') + '>');
      content.push(joinContent(name, attributes, children));
      content.push('</' + name + '>');
   } else if (attrs.length) {
      if (SelfClosingElementNames.includes(name)) {
         content.push('<' + name + ' ' + attrs.join(' ') + '/>');
      } else {
         content.push('<' + name + ' ' + attrs.join(' ') + '></' + name + '>');
      }
   } else {
      content.push('<' + name + '>');
      content.push(joinContent(name, attributes, children));
      content.push('</' + name + '>');
   }
   return joinContent(name, attributes, content);
}

function isMeta(attributes, metaName) {
   if (!attributes.meta) {
      return false;
   } else if (lodash.isString(attributes.meta)) {
      return attributes.meta === metaName;
   } else if (lodash.isArray(attributes.meta)) {
      return attributes.meta.includes(metaName);
   } else {
      throw { message: 'Meta type: ' + _typeof(attributes.meta), attributes: attributes };
   }
}

function joinContent(name, attributes) {
   for (var _len4 = arguments.length, children = Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
      children[_key4 - 2] = arguments[_key4];
   }

   children = lodash.flatten(children);
   if (name === 'pre') {
      return children.join('\n');
   } else {
      return children.join('');
   }
}

function _style(name, style) {
   for (var _len5 = arguments.length, children = Array(_len5 > 2 ? _len5 - 2 : 0), _key5 = 2; _key5 < _len5; _key5++) {
      children[_key5 - 2] = arguments[_key5];
   }

   logger.debug('_style', name, style, children);
   if (typeof style !== 'string') {
      throw { message: 'style type: ' + (typeof style === 'undefined' ? 'undefined' : _typeof(style)), name: name, style: style, children: children };
   } else {
      return element.apply(undefined, [name, { style: style }].concat(children));
   }
}

function _content(name) {
   for (var _len6 = arguments.length, children = Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
      children[_key6 - 1] = arguments[_key6];
   }

   return element.apply(undefined, [name, {}].concat(children));
}

function createElements() {
   return ElementNames.reduce(function (result, name) {
      result[name] = function () {
         for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
            args[_key7] = arguments[_key7];
         }

         return element.apply(undefined, [name].concat(args));
      };
      return result;
   }, {});
}

function createStyleElements() {
   return ElementNames.reduce(function (result, name) {
      result[name] = function () {
         for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
            args[_key8] = arguments[_key8];
         }

         return _style.apply(undefined, [name].concat(args));
      };
      return result;
   }, {});
}

function createMetaElements() {
   return ElementNames.reduce(function (result, name) {
      result[name] = function (meta, attributes) {
         for (var _len9 = arguments.length, args = Array(_len9 > 2 ? _len9 - 2 : 0), _key9 = 2; _key9 < _len9; _key9++) {
            args[_key9 - 2] = arguments[_key9];
         }

         return element.apply(undefined, [name, Object.assign({ meta: meta }, attributes)].concat(args));
      };
      return result;
   }, {});
}

function createMetaStyleElements(meta) {
   return ElementNames.reduce(function (result, name) {
      result[name] = function (style) {
         for (var _len10 = arguments.length, args = Array(_len10 > 1 ? _len10 - 1 : 0), _key10 = 1; _key10 < _len10; _key10++) {
            args[_key10 - 1] = arguments[_key10];
         }

         return element.apply(undefined, [name, { meta: meta, style: style }].concat(args));
      };
      return result;
   }, {});
}

function createMetaContentElements(meta) {
   return ElementNames.reduce(function (result, name) {
      result[name] = function () {
         for (var _len11 = arguments.length, args = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
            args[_key11] = arguments[_key11];
         }

         return element.apply(undefined, [name, { meta: meta }].concat(args));
      };
      return result;
   }, {});
}

function createContentElements() {
   return ElementNames.reduce(function (result, name) {
      result[name] = function () {
         for (var _len12 = arguments.length, args = Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
            args[_key12] = arguments[_key12];
         }

         return _content.apply(undefined, [name].concat(args));
      };
      return result;
   }, {});
}

function assignDeps(g) {
   g.He = createElements();
   g.Hs = createStyleElements();
   g.Hm = createMetaElements();
   g.Hso = createMetaStyleElements('optional');
   g.Hc = createContentElements();
   g.Hco = createMetaContentElements('optional');
   g.Hx = module.exports;
   g.html = html;
}
//# sourceMappingURL=HtmlElements.js.map