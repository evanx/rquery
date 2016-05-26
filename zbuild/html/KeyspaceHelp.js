'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _templateObject = _taggedTemplateLiteral(['\n         <div style="', '">\n         <a href=', '><b>', '</b>', '</a>\n         </div>\n         '], ['\n         <div style="', '">\n         <a href=', '><b>', '</b>', '</a>\n         </div>\n         ']),
    _templateObject2 = _taggedTemplateLiteral(['\n         <div style="', '">\n         <a href=', '>', '</a>\n         </div>\n         '], ['\n         <div style="', '">\n         <a href=', '>', '</a>\n         </div>\n         ']);

exports.obscureKeyspaceLabel = obscureKeyspaceLabel;
exports.render = render;

var _styles = require('./styles');

var _styles2 = _interopRequireDefault(_styles);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var logger = Loggers.create(module.filename);

function obscureKeyspaceLabel(reqx) {
   if (reqx.account === 'hub' && reqx.keyspace.length > 6) {
      return reqx.keyspace.substring(0, 4);
   } else {
      return reqx.keyspace;
   }
}

function render(props) {
   var _Object$assign;

   var keyspaceLabel = obscureKeyspaceLabel(props.reqx);
   logger.debug('props', keyspaceLabel, Object.keys(props), Object.keys(Hx));
   return Object.assign(props, (_Object$assign = {
      title: [props.reqx.account, keyspaceLabel].join('/'),
      heading: [Hc.b(props.reqx.account), Hs.tt(_styles2.default.header.keyspace, keyspaceLabel)].join(''),
      helpPath: '/routes',
      icon: 'database'
   }, _defineProperty(_Object$assign, 'helpPath', ['routes']), _defineProperty(_Object$assign, 'content', [Hc.h3(props.result.message), He.p(Styles.meta('repeat', _styles2.default.result.description), props.result.description), renderUrls(props.result.exampleUrls), He.br(), renderCommands(props.result.keyspaceCommands)]), _Object$assign));
}

function renderUrls(urls) {
   return urls.map(function (url, index) {
      var _ref = url.match(/^(https?:\/\/[^\/]+)\/ak\/[^\/]+\/[^\/]+\/([^\/]+)(\/\S+)?$/) || [];

      var _ref2 = _slicedToArray(_ref, 4);

      var matching = _ref2[0];
      var hostUrl = _ref2[1];
      var command = _ref2[2];
      var params = _ref2[3];

      if (matching) {
         return html(_templateObject, _styles2.default.keyspaceHelp.linkContainer, url, command, params || '');
      } else {
         return html(_templateObject2, _styles2.default.keyspaceHelp.linkContainer, url, url);
      }
   });
}

function renderCommands(commands) {
   return commands.map(function (command, index) {
      return Hs.div(_styles2.default.keyspaceHelp.command, Hc.span(command));
   });
}
//# sourceMappingURL=KeyspaceHelp.js.map