'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.renderPath = renderPath;
exports.renderContent = renderContent;
exports.el = el;
exports.styled = styled;
exports.createElements = createElements;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var logger = Loggers.create(__filename, 'info');

var ElementNames = ['div', 'span', 'pre', 'p'];

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

function renderContent(content) {
   if (lodash.isArray(content)) {
      content = content.join('\n');
   } else if (lodash.isString(content)) {} else if (lodash.isInteger(content)) {} else {
      logger.warn('content type', typeof content === 'undefined' ? 'undefined' : _typeof(content));
   }
   return content.toString().replace(/\n\s*/g, '\n');
}

function el(name, attributes) {
   var content = [];
   var attrs = Objects.mapEntries(attributes).filter(function (e) {
      return e.value && e.value.toString();
   }).map(function (e) {
      return Object.assign(e, { value: e.value.toString() });
   }).map(function (e) {
      return e.key + '="' + e.value + '"';
   });
   logger.debug('el', name, attrs);
   if (attrs.length) {
      content.push('<' + name + ' ' + attrs.join(' ') + '>');
   } else {
      content.push('<' + name + '>');
   }

   for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      children[_key - 2] = arguments[_key];
   }

   content.push(children.map(function (child) {
      return child.toString();
   }));
   content.push('</' + name + '>');
   logger.debug('el', name, attrs, content);
   return lodash.flatten(content).join('\n');
}

function styled(name, style) {
   for (var _len2 = arguments.length, children = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
      children[_key2 - 2] = arguments[_key2];
   }

   return el.apply(undefined, [name, { style: style }].concat(children));
}

function createElements(x) {
   exports.styled = {};
   ElementNames.forEach(function (name) {
      x[name] = function () {
         for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
         }

         return el.apply(undefined, [name].concat(args));
      };
      x.styled[name] = function () {
         for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
         }

         return styled.apply(undefined, [name].concat(args));
      };
   });
}

createElements(module.exports);
//# sourceMappingURL=HtmlElements.js.map