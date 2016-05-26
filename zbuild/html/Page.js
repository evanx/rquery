'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _templateObject = _taggedTemplateLiteral(['<article>', '</article>'], ['<article>', '</article>']),
    _templateObject2 = _taggedTemplateLiteral(['\n   <html>\n   <head>\n   <title>', '</title>\n   <style>', '</style>\n   <meta name="viewport" content=', '/>\n   </head>\n   <body>\n   ', '\n   ', '\n   </body>\n   </html>\n   '], ['\n   <html>\n   <head>\n   <title>', '</title>\n   <style>', '</style>\n   <meta name="viewport" content=', '/>\n   </head>\n   <body>\n   ', '\n   ', '\n   </body>\n   </html>\n   ']);

exports.default = function (props) {
   logger.debug('props', Object.keys(props));
   assert(Values.isDefined(props.config.assetsUrl), 'assetsUrl');
   var reqx = props.reqx || {};
   var article = void 0;
   if (reqx.helpPath) {
      var helpScript = 'window.location.pathname=\'' + reqx.helpPath + '\'';
      article = html(_templateObject, props.content);
   } else {
      article = html(_templateObject, props.content);
   }
   var ua = props.req.get('user-agent');
   var styleSheet = Styles.getCachedUserAgentStyleSheet({ styles: _styles2.default, key: 'resets', ua: ua });
   return html(_templateObject2, props.title, styleSheet, viewportContentArray.join(', '), (0, _Header2.default)(Object.assign({ icon: 'home' }, props)), article);
};

var _styles = require('./styles');

var _styles2 = _interopRequireDefault(_styles);

var _Header = require('./Header');

var _Header2 = _interopRequireDefault(_Header);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var logger = Loggers.create(module.filename);

var viewportContentArray = ['width=device-width', 'initial-scale=1'];
//'maximum-scale=1.0',
//'minimum-scale=1.0',
//'user-scalable=no'
//# sourceMappingURL=Page.js.map