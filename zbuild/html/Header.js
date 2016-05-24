'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

exports.default = function (props) {
   var _He;

   assert(props.config.assetsUrl, 'assetsUrl');
   var reqx = props.reqx || {};
   var homePath = Hx.renderPath(reqx.helpPath) || '/routes';
   var clickScript = '';
   if (homePath) {
      clickScript = 'window.location.pathname=\'' + homePath + '\'';
   }
   var content = [He.img({ style: _styles.header.icon, src: props.config.assetsUrl + '/icomoon/png20-38/' + props.icon + '.png' }), He.span({ style: _styles.header.title }, props.heading || props.title)];
   return (_He = He).header.apply(_He, [{ style: _styles.header.container, onClick: clickScript }].concat(content));
};

var _styles = require('./styles');

var logger = Loggers.create(module.filename);