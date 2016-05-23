'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

exports.default = function (props) {
   logger.debug('props', Object.keys(props));
   assert(props.config.assetsUrl, 'assetsUrl');
   var content = HtmlElements.renderContent(props.content);
   var reqx = props.reqx || {};
   var helpScript = '';
   if (reqx.helpPath) {
      helpScript = 'window.location.pathname = "' + reqx.helpPath + '"';
   }
   return '\n   <html>\n   <head>\n   <title>' + props.title + '</title>\n   <style>\n   a {\n      text-decoration: none;\n   }\n   pre {\n      background-color: #f8f8f8;\n      padding: 5px;\n   }\n   </style>\n   <meta name="viewport" content="' + viewportContentArray.join(', ') + '"/>\n   </head>\n   <body style="padding: ' + bodyPadding(props) + '; max-width: 768px">\n   ' + (0, _Header2.default)(props) + '\n   <article onClick="' + helpScript + '" style="padding-top:10px">\n   ' + content + '\n   </article>\n   </body>\n   </html>\n   ';
};

var _styles = require('./styles');

var _styles2 = _interopRequireDefault(_styles);

var _Header = require('./Header');

var _Header2 = _interopRequireDefault(_Header);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = Loggers.create(module.filename);

var viewportContentArray = ['width=device-width', 'maximum-scale=1.0', 'minimum-scale=1.0', 'initial-scale=1.0', 'user-scalable=no'];

function bodyPadding(_ref) {
   var req = _ref.req;

   if (req) {
      var ua = req.get('user-agent');
      if (ua.match(/Mobile/)) {} else {
         return '10px 10px 10px 100px';
      }
   }
   return '10px';
}
//# sourceMappingURL=Page.js.map