'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});
exports.renderStyles = renderStyles;
exports.renderKeys = renderKeys;

var logger = Loggers.create(module.filename, 'info');

var IntegerKeys = ['lineHeight'];

function renderStyles(object) {
   return Objects.translate(object, function (key, value) {
      return { key: key, value: renderKeys(value) };
   });
}

function renderKeys(object) {
   return Object.keys(object).map(function (key) {
      return { key: renderKey(key), value: renderKeyValue(key, object[key]) };
   }).map(function (entry) {
      return entry.key + ':' + entry.value;
   }).join(';');
}

function renderKey(key) {
   return lodash.kebabCase(key);
}

function renderKeyValue(key, value) {
   if (Values.isInteger(value)) {
      if (IntegerKeys.includes(key)) {
         return value.toString();
      } else {
         return value + 'px';
      }
   } else if (lodash.isArray(value)) {
      return value.map(function (v) {
         return renderKeyValue(key, v);
      }).join(' ');
   }
   return value;
}
//# sourceMappingURL=Styles.js.map