'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var logger = Loggers.create(module.filename);

var viewportContentArray = ['width=device-width', 'maximum-scale=1.0', 'minimum-scale=1.0', 'initial-scale=1.0', 'user-scalable=no'];

var _class = function (_React$Component) {
   _inherits(_class, _React$Component);

   function _class() {
      _classCallCheck(this, _class);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));
   }

   _createClass(_class, [{
      key: 'render',
      value: function render() {
         logger.debug('props', this.props);
         return _react2.default.createElement(
            'html',
            null,
            _react2.default.createElement(
               'head',
               null,
               _react2.default.createElement(
                  'title',
                  null,
                  this.props.reqx.account,
                  '/',
                  this.props.reqx.keyspace
               ),
               _react2.default.createElement('meta', { name: 'viewport', content: viewportContentArray.join(', ') })
            ),
            _react2.default.createElement(
               'body',
               { style: { padding: 10 } },
               _react2.default.createElement(
                  'h1',
                  null,
                  '/ak/',
                  this.props.reqx.account,
                  '/',
                  this.props.reqx.keyspace
               ),
               _react2.default.createElement(
                  'h3',
                  null,
                  this.props.result.message
               ),
               this.renderUrls(this.props.result.exampleUrls),
               this.renderCommands(this.props.result.keyspaceCommands)
            )
         );
      }
   }, {
      key: 'renderUrls',
      value: function renderUrls(urls) {
         return urls.map(function (url, index) {
            var match = url.match(/^https:\/\/[a-z]+\.redishub\.com(\/\S+)$/);
            if (match) {
               return _react2.default.createElement(
                  'p',
                  { key: index },
                  _react2.default.createElement(
                     'a',
                     { href: url },
                     match.pop()
                  )
               );
            } else {
               return _react2.default.createElement(
                  'p',
                  null,
                  _react2.default.createElement(
                     'a',
                     { href: url },
                     url
                  )
               );
            }
         });
      }
   }, {
      key: 'renderCommands',
      value: function renderCommands(commands) {
         return commands.map(function (command, index) {
            return _react2.default.createElement(
               'div',
               { key: index },
               _react2.default.createElement(
                  'span',
                  null,
                  command
               )
            );
         });
      }
   }]);

   return _class;
}(_react2.default.Component);

exports.default = _class;