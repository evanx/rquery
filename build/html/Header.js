'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

exports.default = function (props) {
   assert(props.config.assetsUrl, 'assetsUrl');
   var reqx = props.reqx || {};
   var helpScript = '';
   if (reqx.helpPath) {
      helpScript = 'window.location.pathname = "' + reqx.helpPath + '"';
   }
   return '\n   <header style="" onClick="' + helpScript + '">\n   <a href="' + reqx.helpPath + '">\n      <img style="opacity:.5;min-height:20px\' src=\'' + props.config.assetsUrl + '/icomoon/png20-38/home.png"/>\n      <span style="">' + props.title + '</span>\n   </a>\n   </header>\n   ';
};

var logger = Loggers.create(module.filename);
//# sourceMappingURL=Header.js.map