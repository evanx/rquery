'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

exports.default = function (props) {
   var _He;

   assert(Values.isDefined(props.config.assetsUrl), 'assetsUrl');
   var reqx = props.reqx || {};
   var backUrl = Hx.renderPath(props.backUrl || reqx.backUrl) || '/routes';
   var helpPath = Hx.renderPath(props.helpPath || reqx.helpPath) || '/routes';
   if (helpPath) {
      backUrl = helpPath;
   }
   var clickScript = '';
   if (backUrl) {
      clickScript = 'window.location.pathname=\'' + backUrl + '\'';
   }
   var content = [];
   content.push(He.img({ style: _styles.header.icon,
      src: props.config.assetsUrl + '/icomoon/png20-38/' + (props.icon || 'database') + '.png' }));
   if (props.heading) {
      content.push(Hs.span(_styles.header.heading, props.heading));
   } else if (props.title) {
      content.push(Hs.span(_styles.header.title, props.title));
   }
   return (_He = He).header.apply(_He, [{ style: _styles.header.container, onClick: clickScript }].concat(content));
};

var _styles = require('./styles');

var logger = Loggers.create(module.filename);
//# sourceMappingURL=Header.js.map