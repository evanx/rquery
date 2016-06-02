'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

exports.default = function (props) {
   var _He;

   assert(Values.isDefined(props.config.assetsUrl), 'assetsUrl');
   var reqx = props.reqx || {};
   var helpPath = props.helpPath || reqx.helpPath || '/routes';
   var backPath = props.backPath || reqx.backPath || helpPath;
   var clickScript = If.elseFn(backPath, '', HtmlElements.onClick);
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