'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

exports.default = function (props) {
   assert(props.config.assetsUrl, 'assetsUrl');
   var reqx = props.reqx || {};
   var homePath = Hx.renderPath(reqx.helpPath) || '/routes';
   var clickScript = '';
   if (homePath) {
      clickScript = 'window.location.pathname=\'' + homePath + '\'';
   }
   return '\n   <header style="' + _styles.header.container + '" onClick="' + clickScript + '">\n      <img style="' + _styles.header.icon + '" src="' + props.config.assetsUrl + '/icomoon/png20-38/home.png"/>\n      <span style="' + _styles.header.title + '">' + props.title + '</span>\n   </header>\n   ';
};

var _styles = require('./styles');

var logger = Loggers.create(module.filename);

logger.info('zz', _styles.header);
//# sourceMappingURL=Header.js.map