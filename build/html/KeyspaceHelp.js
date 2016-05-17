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
            title: props.config.serviceLabel + ' | ' + props.reqx.account + '/' + props.reqx.keyspace,
            content: '\n         <h1>/ak/' + props.reqx.account + '/' + props.reqx.keyspace + '</h1>\n         <h3>' + props.result.message + '</h3>\n         ' + this.renderUrls(this.props.result.exampleUrls).join('\n') + '\n         ' + this.renderCommands(this.props.result.keyspaceCommands).join('\n') + '\n         '
         };
      }
   }, {
      key: 'renderUrls',
      value: function renderUrls(urls) {
         return urls.map(function (url, index) {
            var match = url.match(/^https:\/\/[a-z]+\.redishub\.com(\/\S+)$/);
            if (match) {
               return '\n            <p>\n            <a href=' + url + '>' + match.pop() + '</a>\n            </p>\n            ';
            } else {
               return '\n            <p>\n            <a href=' + url + '>' + url + '</a>\n            </p>\n            ';
            }
         });
      }
   }, {
      key: 'renderCommands',
      value: function renderCommands(commands) {
         return commands.map(function (command, index) {
            return '\n         <div>\n         <span>' + command + '</span>\n         </div>\n         ';
         });
      }
   }]);

   return _class;
}();

exports.default = _class;
//# sourceMappingURL=KeyspaceHelp.js.map