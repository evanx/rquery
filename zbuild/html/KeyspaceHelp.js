'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = function (props) {
   var _Object$assign;

   logger.debug('props', Object.keys(props), Object.keys(Hx));
   return Object.assign(props, (_Object$assign = {
      title: [props.reqx.account, props.reqx.keyspace].join('/'),
      heading: Hc.b(props.reqx.account) + ' ' + Hc.tt(props.reqx.keyspace),
      helpPath: '/routes',
      icon: 'database'
   }, _defineProperty(_Object$assign, 'helpPath', ['routes']), _defineProperty(_Object$assign, 'content', [Hc.h3(props.result.message), renderUrls(props.result.exampleUrls), He.br(), renderCommands(props.result.keyspaceCommands)]), _Object$assign));
};

var _styles = require('./styles');

var _styles2 = _interopRequireDefault(_styles);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var logger = Loggers.create(module.filename);

function renderUrls(urls) {
   return urls.map(function (url, index) {
      var _ref = url.match(/^(https?:\/\/[^\/]+)\/ak\/[^\/]+\/[^\/]+\/([^\/]+)(\/\S+)?$/) || [];

      var _ref2 = _slicedToArray(_ref, 4);

      var matching = _ref2[0];
      var hostUrl = _ref2[1];
      var command = _ref2[2];
      var params = _ref2[3];

      if (matching) {
         return '\n         <div style="line-height:1.5">\n         <a href=' + url + '><b>' + command + '</b>' + (params || '') + '</a>\n         </div>\n         ';
      } else {
         return '\n         <div style="line-height:1.5">\n         <a href=' + url + '>' + url + '</a>\n         </div>\n         ';
      }
   });
}

function renderCommands(commands) {
   return commands.map(function (command, index) {
      return Hs.div(_styles2.default.keyspaceHelp.command, Hc.span(command));
   });
}
//# sourceMappingURL=KeyspaceHelp.js.map