'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

exports.default = function (props) {
   assert(Values.isDefined(props.config.assetsUrl), 'assetsUrl');
   var reqx = props.reqx || {};
   var helpPath = props.helpPath || reqx.helpPath || '/routes';
   var backPath = props.backPath || reqx.backPath || helpPath;
   var content = [];
   content.push(He.img({ style: _styles.header.icon,
      src: props.config.assetsUrl + '/icomoon/png20-38/' + (props.icon || 'database') + '.png' }));
   if (props.heading) {
      content.push(Hs.span(_styles.header.heading, props.heading));
   } else if (props.title) {
      content.push(Hs.span(_styles.header.title, props.title));
   }
   if (backPath[0] != '/') {
      var _He;

      return (_He = He).a.apply(_He, [{ style: _styles.header.container, href: backPath, target: '_blank' }].concat(content));
   } else {
      var _He2;

      return (_He2 = He).header.apply(_He2, [{
         style: _styles.header.container,
         onClick: HtmlElements.onClick({ href: backPath, target: '_blank' })
      }].concat(content));
   }
};

var _styles = require('./styles');

var logger = Loggers.create(module.filename);