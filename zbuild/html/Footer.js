'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

exports.default = function (props) {
   assert(Values.isDefined(props.config.assetsUrl), 'assetsUrl');
   var reqx = props.reqx || {};
   var backPath = Hx.renderPath(props.helpPath || reqx.helpPath) || '/routes';
   var clickScript = If.elseFn(backPath, '', HtmlElements.onClick);
   var content = [];
   content.push(He.img({ style: _styles.footer.icon,
      src: props.config.assetsUrl + '/icomoon/png20-38/' + (props.icon || 'database') + '.png' }));
   return Hs.footer(_styles.footer.container, '');
};

var _styles = require('./styles');

var logger = Loggers.create(module.filename);