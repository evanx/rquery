'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var logger = Loggers.create(module.filename);

var _class = function () {
   function _class() {
      _classCallCheck(this, _class);
   }

   _createClass(_class, [{
      key: 'render',
      value: function render(props) {
         this.props = props;
         logger.debug('props', props);
         return {
            req: props.req,
            title: 'Help | ' + props.config.serviceLabel,
            content: '\n         <h1>' + props.config.serviceLabel + '</h1>\n         <h3>Basic</h3>\n         ' + this.renderUrls(props.result.common).join('\n') + '\n         <h3>Telegram</h3>\n         ' + this.renderPaths(props.result.telegram).join('\n') + '\n         ' + this.renderAccount(props.result.account) + '\n         <h3>Account keyspace</h3>\n         ' + this.renderPaths(props.result.accountKeyspace).join('\n') + '\n         '
         };
      }
   }, {
      key: 'renderAccount',
      value: function renderAccount(account) {
         if (!account.length) {
            return '';
         } else {
            return '<h3>Account</h3>\n         ' + this.renderPaths(account).join('\n') + '\n         ';
         }
      }
   }, {
      key: 'renderUrls',
      value: function renderUrls(urls) {
         return urls.map(function (url, index) {
            var match = url.match(/^https:\/\/[^\/]+(\/\S+)$/);
            logger.debug('renderUrls', url, match);
            if (match) {
               return '\n            <div style=\'line-height: 1.5\'>\n            <a href=' + url + '>' + match.pop() + '</a>\n            </div>\n            ';
            } else {
               return '\n            <div style=\'line-height: 1.5\'>\n            <a href=' + url + '>' + url + '</a>\n            </div>\n            ';
            }
         });
      }
   }, {
      key: 'renderPaths',
      value: function renderPaths(paths) {
         return paths.map(function (path, index) {
            return '\n         <div>\n         <span>' + path + '</span>\n         </div>\n         ';
         });
      }
   }]);

   return _class;
}();

exports.default = _class;