"use strict";

Object.defineProperty(exports, "__esModule", {
   value: true
});
exports.render = render;
function render(content) {
   return content.map(function (element) {
      if (lodash.isObject(element)) {
         if (element.url && element.content) {
            return He.a({ href: element.url }, element.content);
         }
      }
      return element;
   });
}
//# sourceMappingURL=ContentArrayHtml.js.map