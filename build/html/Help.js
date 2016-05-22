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
            title: 'Help | ' + props.config.serviceLabel,
            content: '\n         <h1>' + props.config.serviceLabel + '</h1>\n         <h3>Basic</h3>\n         ' + this.renderUrls(props.result.common).join('\n') + '\n         <h3>Ephemeral</h3>\n         ' + this.renderPaths(props.result.ephemeral).join('\n') + '\n         <h3>Miscellaneous</h3>\n         ' + this.renderPaths(props.result.misc).join('\n') + '\n         <h3>Telegram</h3>\n         ' + this.renderPaths(props.result.telegram).join('\n') + '\n         ' + this.renderAccount(props.result.account) + '\n         <h3>Account keyspace</h3>\n         ' + this.renderPaths(props.result.accountKeyspace).join('\n') + '\n         '
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
            var _ref = url.match(/^https?:\/\/[^\/]+(\/\S+)$/) || [];

            var _ref2 = _slicedToArray(_ref, 2);

            var matching = _ref2[0];
            var path = _ref2[1];

            logger.debug('renderUrls', url, matching);
            if (matching) {
               return '\n            <div style=\'line-height: 1.5\'>\n            <a href=' + url + '>' + path + '</a>\n            </div>\n            ';
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
//# sourceMappingURL=Help.js.map