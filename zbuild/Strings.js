'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});
exports.splitSpace = splitSpace;
exports.matches = matches;
function splitSpace(string) {
   return lodash.trim(string).replace(/\s+/g, ' ').split(' ');
}

function matches(string, regex) {
   var match = string.match(regex);
   if (!match) {
      return [];
   } else {
      return match.slice(1);
   }
}
//# sourceMappingURL=Strings.js.map