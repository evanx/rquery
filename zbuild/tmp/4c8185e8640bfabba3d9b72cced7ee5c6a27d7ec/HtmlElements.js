'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});
exports.el = el;
exports.div = div;
exports.styled = styled;

var logger = Loggers.create(__filename, 'info');

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

function div(attr) {
   for (var _len2 = arguments.length, children = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      children[_key2 - 1] = arguments[_key2];
   }

   return el.apply(undefined, ['div', attr].concat(children));
}

function styled(name, style) {
   for (var _len3 = arguments.length, children = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
      children[_key3 - 2] = arguments[_key3];
   }

   return el.apply(undefined, [name, { style: style }].concat(children));
}