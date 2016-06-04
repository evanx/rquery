'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.html = html;
exports.element = element;
exports.createElements = createElements;
exports.onClick = onClick;
exports.renderScript = renderScript;
exports.renderPath = renderPath;
exports.ms = ms;
exports.assignDeps = assignDeps;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var logger = Loggers.create(__filename, 'info');

var SelfClosingElementNames = Strings.splitSpace('\n   area base basefont br hr input img link meta\n   ');

var ElementNames = Strings.splitSpace('\n   html head meta link script body\n   header footer nav section article aside\n   h1 h2 h3 h4 h5 h6\n   table thead tbody th tr td\n   div span pre p a hr br img i b tt\n   ');

// experimental

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

// html template literal function

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

// element renderer

function element(name, attributes) {
   for (var _len2 = arguments.length, children = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
      children[_key2 - 2] = arguments[_key2];
   }

   var content = [];
   if (!attributes) {
      return ['<', name, '/>'].join('');
   }
   children = lodash.compact(lodash.flatten(children));
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
   logger.debug('isMeta', attributes, metaName);
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

function createElements(fn) {
   return ElementNames.reduce(function (result, name) {
      result[name] = function () {
         for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
            args[_key5] = arguments[_key5];
         }

         return fn.apply(undefined, [name].concat(args));
      };
      return result;
   }, {});
}

// util

function onClick(url) {
   var parts = ['document.body.style.opacity=.4'];
   if (!url) {
      logger.debug('onClick empty');
   } else if (/^https?:\/\//.test(url)) {
      return renderScript.apply(undefined, parts.concat(['window.location=\'' + renderPath(url) + '\'']));
   } else if (url[0] === '/') {
      return renderScript.apply(undefined, parts.concat(['window.location.pathname=\'' + renderPath(url) + '\'']));
   } else {
      return renderScript.apply(undefined, parts.concat(['window.location.pathname=\'/' + renderPath(url) + '\'']));
   }
}

function renderScript() {
   for (var _len6 = arguments.length, lines = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
      lines[_key6] = arguments[_key6];
   }

   return lodash.compact(lines).join(';');
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

// util

function ms(meta, style) {
   return { meta: meta, style: style };
}

//

function assignElements(r) {
   Object.assign(r, createElements(function (name) {
      for (var _len7 = arguments.length, args = Array(_len7 > 1 ? _len7 - 1 : 0), _key7 = 1; _key7 < _len7; _key7++) {
         args[_key7 - 1] = arguments[_key7];
      }

      return element.apply(undefined, [name].concat(args));
   }));
   return r;
}

function assignDeps(g) {
   g.He = assignElements({});
   g.Hs = createElements(function (name, style) {
      for (var _len8 = arguments.length, children = Array(_len8 > 2 ? _len8 - 2 : 0), _key8 = 2; _key8 < _len8; _key8++) {
         children[_key8 - 2] = arguments[_key8];
      }

      logger.debug('_style', name, style, children);
      if (typeof style !== 'string') {
         throw { message: 'style type: ' + (typeof style === 'undefined' ? 'undefined' : _typeof(style)), name: name, style: style, children: children };
      } else {
         return element.apply(undefined, [name, { style: style }].concat(children));
      }
   });
   g.Hm = createElements(function (name, meta, attributes) {
      for (var _len9 = arguments.length, args = Array(_len9 > 3 ? _len9 - 3 : 0), _key9 = 3; _key9 < _len9; _key9++) {
         args[_key9 - 3] = arguments[_key9];
      }

      return element(name, Object.assign({ meta: meta }, attributes), args);
   });
   g.Hso = createElements(function (name, style) {
      for (var _len10 = arguments.length, args = Array(_len10 > 2 ? _len10 - 2 : 0), _key10 = 2; _key10 < _len10; _key10++) {
         args[_key10 - 2] = arguments[_key10];
      }

      return element(name, Object.assign({ meta: 'optional', style: style }), args);
   });
   g.Hms = createElements(function (name, meta, style) {
      for (var _len11 = arguments.length, args = Array(_len11 > 3 ? _len11 - 3 : 0), _key11 = 3; _key11 < _len11; _key11++) {
         args[_key11 - 3] = arguments[_key11];
      }

      return element(name, Object.assign({ meta: meta, style: style }), args);
   });
   g.Hc = createElements(function (name) {
      for (var _len12 = arguments.length, args = Array(_len12 > 1 ? _len12 - 1 : 0), _key12 = 1; _key12 < _len12; _key12++) {
         args[_key12 - 1] = arguments[_key12];
      }

      return element(name, {}, args);
   });
   g.Hmc = createElements(function (name, meta) {
      for (var _len13 = arguments.length, args = Array(_len13 > 2 ? _len13 - 2 : 0), _key13 = 2; _key13 < _len13; _key13++) {
         args[_key13 - 2] = arguments[_key13];
      }

      return element(name, { meta: meta }, args);
   });
   g.Hco = createElements(function (name) {
      for (var _len14 = arguments.length, args = Array(_len14 > 1 ? _len14 - 1 : 0), _key14 = 1; _key14 < _len14; _key14++) {
         args[_key14 - 1] = arguments[_key14];
      }

      return element(name, { meta: 'optional' }, args);
   });
   g.Hx = module.exports;
   g.html = html;
}
//# sourceMappingURL=HtmlElements.js.map