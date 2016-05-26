'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = function (props) {
   logger.debug('props', Object.keys(props));
   return Object.assign(props, {
      title: props.config.serviceLabel,
      content: '\n      <h3>Basic</h3>\n      ' + renderUrls(props.result.common).join('\n') + '\n      <h3>Ephemeral</h3>\n      ' + renderPaths(props.result.ephemeral).join('\n') + '\n      <h3>Miscellaneous</h3>\n      ' + renderPaths(props.result.misc).join('\n') + '\n      <h3>Telegram</h3>\n      ' + renderPaths(props.result.telegram).join('\n') + '\n      ' + renderAccount(props.result.account) + '\n      <h3>Account keyspace</h3>\n      ' + renderPaths(props.result.accountKeyspace).join('\n') + '\n      '
   });
};

var _styles = require('./styles');

var _styles2 = _interopRequireDefault(_styles);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = Loggers.create(module.filename);

function renderAccount(account) {
   if (!account.length) {
      return '';
   } else {
      return '<h3>Account</h3>\n      ' + renderPaths(account).join('\n') + '\n      ';
   }
}

function renderUrls(urls) {
   return urls.map(function (url, index) {
      var _ref = url.match(/^https?:\/\/[^\/]+(\/\S+)$/) || [];

      var _ref2 = _slicedToArray(_ref, 2);

      var matching = _ref2[0];
      var path = _ref2[1];

      logger.debug('renderUrls', url, matching);
      if (matching) {
         return '\n         <div style="' + _styles2.default.help.linkContainer + '">\n         <a href=' + url + '>' + path + '</a>\n         </div>\n         ';
      } else {
         return '\n         <div style="' + _styles2.default.help.linkContainer + '">\n         <a href=' + url + '>' + url + '</a>\n         </div>\n         ';
      }
   });
}

function renderPaths(paths) {
   return paths.map(function (path, index) {
      var pathPaths = path.split('/');
      if (pathPaths[1] === 'ak') {
         var akPath = pathPaths.slice(0, 3).join('/');
         if (pathPaths.length > 4) {
            var commandKey = pathPaths[4];
            if (pathPaths.length > 6) {
               var params = pathPaths.slice(6).map(function (param) {
                  return param.replace(/^:/g, ' ');
               });
               return Hs.div(_styles2.default.routes.path, [Hc.b(commandKey), Hc.tt(params)]);
            }
            return Hs.div(_styles2.default.routes.path, [Hc.b(commandKey)]);
         }
      }
      return Hs.span(_styles2.default.routes.path, path);
   });
}
//# sourceMappingURL=Help.js.map