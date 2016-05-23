'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var logger = Loggers.create(module.filename);

var viewportContentArray = ['width=device-width', 'maximum-scale=1.0', 'minimum-scale=1.0', 'initial-scale=1.0', 'user-scalable=no'];

var _class = function () {
   function _class() {
      _classCallCheck(this, _class);
   }

   _createClass(_class, [{
      key: 'render',
      value: function render(props) {
         this.props = props;
         logger.debug('props', Object.keys(props));
         assert(props.config.assetsUrl, 'assetsUrl');
         var content = '';
         if (lodash.isArray(props.content)) {
            content = props.content.join('\n');
         } else if (lodash.isString(props.content)) {
            content = props.content;
         } else {
            logger.error('props.content type', _typeof(props.content));
            content = props.content.toString();
         }
         content = content.replace(/\n\s*/g, '\n');
         this.reqx = props.reqx || {};
         var helpScript = '';
         if (this.reqx.helpPath) {
            helpScript = 'window.location.pathname = \'' + this.reqx.helpPath + '\'';
         }
         return '\n      <html>\n      <head>\n      <title>' + props.title + '</title>\n      <style>\n         a {\n            text-decoration: none;\n         }\n         pre {\n            background-color: #f8f8f8;\n            padding: 5px;\n         }\n      </style>\n      <meta name=\'viewport\' content=' + viewportContentArray.join(', ') + '/>\n      </head>\n      <body style=\'padding: ' + this.bodyPadding(props) + '; max-width: 768px\'>\n      <header style=\'\'>\n      <img style=\'opacity:.5\' src=\'' + props.config.assetsUrl + '/icomoon/png20-38/home.png\'/>\n      </header>\n      <article onClick="' + helpScript + '"  style=\'padding-top: 10px\'>\n      ' + content + '\n      </article>\n      </body>\n      </html>\n      ';
      }
   }, {
      key: 'bodyPadding',
      value: function bodyPadding(_ref) {
         var req = _ref.req;

         if (req) {
            var ua = req.get('user-agent');
            if (ua.match(/Mobile/)) {} else {
               return '10px 10px 10px 100px';
            }
         }
         return '10px';
      }
   }]);

   return _class;
}();

exports.default = _class;
//# sourceMappingURL=Page.js.map