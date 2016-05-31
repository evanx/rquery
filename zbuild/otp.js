'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _bluebird = require('bluebird');

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _season = require('season');

var _season2 = _interopRequireDefault(_season);

var _thirtyTwo = require('thirty-two');

var _thirtyTwo2 = _interopRequireDefault(_thirtyTwo);

var _speakeasy = require('speakeasy');

var _speakeasy2 = _interopRequireDefault(_speakeasy);

var _totp = require('otplib/lib/totp');

var _totp2 = _interopRequireDefault(_totp);

var _concatStream = require('concat-stream');

var _concatStream2 = _interopRequireDefault(_concatStream);

var _Files = require('./Files');

var Files = _interopRequireWildcard(_Files);

var _Express = require('./Express');

var Express = _interopRequireWildcard(_Express);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var unsupportedAuth = ['twitter.com', 'github.com', 'gitlab.com', 'bitbucket.org'];
var supportedAuth = ['telegram.org'];

var _class = function () {
   function _class() {
      _classCallCheck(this, _class);
   }

   _createClass(_class, [{
      key: 'init',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee() {
            return regeneratorRuntime.wrap(function _callee$(_context) {
               while (1) {
                  switch (_context.prev = _context.next) {
                     case 0:
                        this.logger.info('init');

                     case 1:
                     case 'end':
                        return _context.stop();
                  }
               }
            }, _callee, this);
         }));

         function init() {
            return ref.apply(this, arguments);
         }

         return init;
      }()
   }, {
      key: 'start',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee2() {
            var _this = this;

            return regeneratorRuntime.wrap(function _callee2$(_context2) {
               while (1) {
                  switch (_context2.prev = _context2.next) {
                     case 0:
                        this.redis = redisLib.createClient(this.config.redisUrl);
                        this.expressApp = (0, _express2.default)();
                        this.expressApp.use(function (req, res, next) {
                           req.pipe((0, _concatStream2.default)(function (content) {
                              req.body = content;
                              next();
                           }));
                        });
                        this.addRoutes();
                        if (this.config.disableTelegramHook) {
                           this.logger.warn('telegram webhook disabled');
                        } else {
                           this.addTelegramWebhook();
                        }
                        this.expressApp.use(function (req, res) {
                           return _this.sendErrorRoute(req, res);
                        });
                        _context2.next = 8;
                        return Express.listen(this.expressApp, this.config.port);

                     case 8:
                        this.expressServer = _context2.sent;

                        this.logger.info('listen', this.config.port);

                     case 10:
                     case 'end':
                        return _context2.stop();
                  }
               }
            }, _callee2, this);
         }));

         function start() {
            return ref.apply(this, arguments);
         }

         return start;
      }()
   }, {
      key: 'sendErrorRoute',
      value: function sendErrorRoute(req, res) {
         try {
            if (/^\/favicon.ico$/.test(req.path)) {
               res.status(404).send('Invalid path: ' + req.path + '\n');
               return;
            }

            var _req$path$match = req.path.match(/^\/ak\/([a-z]+)\/([^\/]+)\//);

            var _req$path$match2 = _slicedToArray(_req$path$match, 3);

            var matching = _req$path$match2[0];
            var account = _req$path$match2[1];
            var keyspace = _req$path$match2[2];

            this.logger.debug('sendErrorRoute', req.path, account, keyspace, this.isBrowser(req));
            if (this.isBrowser(req)) {
               var redirectPath = '/routes';
               if (account && keyspace) {
                  redirectPath = ['/ak', account, keyspace, 'help'].join('/');
               }
               res.redirect(302, redirectPath);
            } else {
               res.status(404).send('Invalid: ' + req.path + '. Try /routes or /help.\n');
            }
         } catch (err) {
            this.logger.warn(err);
            throw err;
         }
      }
   }, {
      key: 'addSecureDomain',
      value: function addSecureDomain() {
         var _this2 = this;

         this.addPublicCommand({
            key: 'genkey-otp-webhook',
            params: ['host', 'user', 'webhookDomain']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee3(req, res) {
               var _req$params, user, host, webhook, supportedDomains, uri, url, response;

               return regeneratorRuntime.wrap(function _callee3$(_context3) {
                  while (1) {
                     switch (_context3.prev = _context3.next) {
                        case 0:
                           _req$params = req.params;
                           user = _req$params.user;
                           host = _req$params.host;
                           webhook = _req$params.webhook;

                           if (/^[a-z][a-z0-9-\.]+\.[a-z]+$/.test(webhookDomain)) {
                              _context3.next = 6;
                              break;
                           }

                           throw { message: 'Invalid webhook host' };

                        case 6:
                           supportedDomains = ['test.redishub.com'];

                           if (!(webhookDomain !== supportedDomains[0])) {
                              _context3.next = 9;
                              break;
                           }

                           throw { message: 'Webhook host not supported. Try: ' + supportedDomains[0] };

                        case 9:
                           uri = ['webhook', _this2.config.serviceName, host, user].join('/');
                           url = 'https://' + webhook + '/' + uri;

                           _this2.logger.debug('webhook url', url, host, user);
                           _context3.next = 14;
                           return Requests.head({ url: url, timeout: _this2.config.webhookTimeout });

                        case 14:
                           response = _context3.sent;

                           if (!(response.statusCode !== 200)) {
                              _context3.next = 17;
                              break;
                           }

                           throw { message: 'Webhook ' + response.statusCode, url: url };

                        case 17:
                           return _context3.abrupt('return', _this2.buildQrReply({ user: user, host: host }));

                        case 18:
                        case 'end':
                           return _context3.stop();
                     }
                  }
               }, _callee3, _this2);
            }));
            return function (_x, _x2) {
               return ref.apply(this, arguments);
            };
         }());
      }
   }, {
      key: 'end',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee4() {
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
               while (1) {
                  switch (_context4.prev = _context4.next) {
                     case 0:
                        this.logger.info('end');

                        if (!redis) {
                           _context4.next = 4;
                           break;
                        }

                        _context4.next = 4;
                        return this.redis.quitAsync();

                     case 4:
                        if (this.expressServer) {
                           this.expressServer.close();
                        }

                     case 5:
                     case 'end':
                        return _context4.stop();
                  }
               }
            }, _callee4, this);
         }));

         function end() {
            return ref.apply(this, arguments);
         }

         return end;
      }()
   }]);

   return _class;
}();

exports.default = _class;
//# sourceMappingURL=otp.js.map