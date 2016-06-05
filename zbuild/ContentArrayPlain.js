"use strict";

Object.defineProperty(exports, "__esModule", {
   value: true
});
exports.render = render;
function render(content) {
   return lodash.flatten(content.map(function (element) {
      if (lodash.isObject(element)) {
         if (element.url && element.content) {
            return [element.content, element.url];
         }
      }
      return element;
   }));
}