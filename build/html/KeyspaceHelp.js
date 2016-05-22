'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
         logger.debug('props', Object.keys(props));
         return {
            req: props.req,
            title: props.config.serviceLabel + ' | ' + props.reqx.account + '/' + props.reqx.keyspace,
            content: '\n         <h2>/ak/' + props.reqx.account + '/' + props.reqx.keyspace + '</h2>\n         <h3>' + props.result.message + '</h3>\n         ' + this.renderUrls(this.props.result.exampleUrls).join('\n') + '\n         <br/>\n         ' + this.renderCommands(this.props.result.keyspaceCommands).join('\n') + '\n         '
         };
      }
   }, {
      key: 'renderUrls',
      value: function renderUrls(urls) {
         return urls.map(function (url, index) {
            var _ref = url.match(/^(https?:\/\/[^\/]+)\/ak\/[^\/]+\/[^\/]+\/(\S+)$/) || [];

            var _ref2 = _slicedToArray(_ref, 3);

            var matching = _ref2[0];
            var hostUrl = _ref2[1];
            var path = _ref2[2];

            if (matching) {
               return '\n            <div style=\'line-height: 1.5\'>\n            <a href=' + url + '>' + path + '</a>\n            </div>\n            ';
            } else {
               return '\n            <div style=\'line-height: 1.5\'>\n            <a href=' + url + '>' + url + '</a>\n            </div>\n            ';
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