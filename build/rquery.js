'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _bluebird = require('bluebird');

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _brucedown = require('brucedown');

var _brucedown2 = _interopRequireDefault(_brucedown);

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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _Files = require('./Files');

var Files = _interopRequireWildcard(_Files);

var _Express = require('./Express');

var Express = _interopRequireWildcard(_Express);

var _Page = require('./html/Page');

var _Page2 = _interopRequireDefault(_Page);

var _Help = require('./html/Help');

var _Help2 = _interopRequireDefault(_Help);

var _KeyspaceHelp = require('./html/KeyspaceHelp');

var _KeyspaceHelp2 = _interopRequireDefault(_KeyspaceHelp);

var _KeyspaceHelpPage = require('./jsx/KeyspaceHelpPage');

var _KeyspaceHelpPage2 = _interopRequireDefault(_KeyspaceHelpPage);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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

                        this.logger.info('listen', this.config.port, Express.getRoutes(this.expressApp), this.expressServer);

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

            var _Strings$matches = Strings.matches(req.path, /^\/ak\/([^\/]+)\/([^\/]+)\//);

            var _Strings$matches2 = _slicedToArray(_Strings$matches, 2);

            var account = _Strings$matches2[0];
            var keyspace = _Strings$matches2[1];

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
      value: function addSecureDomain() {}
   }, {
      key: 'addTelegramWebhook',
      value: function addTelegramWebhook() {
         var _this2 = this;

         if (!this.config.botSecret) {
            this.logger.error('addTelegramWebhook botSecret');
         } else {
            this.expressApp.post('/webhook-telegram/*', function () {
               var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee3(req, res) {
                  var body;
                  return regeneratorRuntime.wrap(function _callee3$(_context3) {
                     while (1) {
                        switch (_context3.prev = _context3.next) {
                           case 0:
                              _context3.prev = 0;

                              _this2.logger.debug('webhook auth', req.params[0], _this2.config.botSecret);

                              if (!(req.params[0] !== _this2.config.botSecret)) {
                                 _context3.next = 4;
                                 break;
                              }

                              throw 'Invalid telegram webhook';

                           case 4:
                              body = req.body.toString('utf8');

                              _this2.logger.debug('body', body);

                              if (/^["{\[]/.test(body)) {
                                 _context3.next = 10;
                                 break;
                              }

                              throw { message: 'body not JSON', body: body };

                           case 10:
                              _context3.next = 12;
                              return _this2.handleTelegram(req, res, JSON.parse(body));

                           case 12:
                              res.send('');

                           case 13:
                              _context3.next = 19;
                              break;

                           case 15:
                              _context3.prev = 15;
                              _context3.t0 = _context3['catch'](0);

                              _this2.logger.error(_context3.t0);
                              res.status(500).send('Internal error: ' + _context3.t0.message + '\n');

                           case 19:
                           case 'end':
                              return _context3.stop();
                        }
                     }
                  }, _callee3, _this2, [[0, 15]]);
               }));
               return function (_x, _x2) {
                  return ref.apply(this, arguments);
               };
            }());
         }
      }
   }, {
      key: 'handleTelegram',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee4(req, res, telegram) {
            var message, content;
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
               while (1) {
                  switch (_context4.prev = _context4.next) {
                     case 0:
                        this.logger.debug('telegram', telegram);
                        message = {};
                        content = void 0;

                        if (!telegram.message) {
                           _context4.next = 9;
                           break;
                        }

                        message.type = 'message';
                        content = telegram.message;
                        if (!content.text) {} else {
                           message.text = content.text;
                        }
                        _context4.next = 17;
                        break;

                     case 9:
                        if (!telegram.inline_query) {
                           _context4.next = 15;
                           break;
                        }

                        message.type = 'query';
                        content = telegram.inline_query;
                        if (!content.query) {} else {
                           message.text = content.query;
                        }
                        _context4.next = 17;
                        break;

                     case 15:
                        this.logger.warn('telegram', telegram);
                        return _context4.abrupt('return');

                     case 17:
                        if (!content.chat) {} else if (!content.chat.id) {} else {
                           message.chatId = content.chat.id;
                        }
                        this.logger.debug('tcm', { telegram: telegram, content: content, message: message });

                        if (content.from) {
                           _context4.next = 22;
                           break;
                        }

                        _context4.next = 46;
                        break;

                     case 22:
                        if (content.from.username) {
                           _context4.next = 25;
                           break;
                        }

                        _context4.next = 46;
                        break;

                     case 25:
                        if (content.from.id) {
                           _context4.next = 28;
                           break;
                        }

                        _context4.next = 46;
                        break;

                     case 28:
                        message.fromId = content.from.id;
                        message.greetName = content.from.username;
                        if (true && content.from.first_name) {
                           message.greetName = content.from.first_name;
                        } else if (content.from.first_name && content.from.last_name) {
                           message.greetName = [content.from.first_name, content.from.last_name].join(' ');
                        }
                        message.username = content.from.username;

                        if (!/verify/.test(content.text)) {
                           _context4.next = 38;
                           break;
                        }

                        message.action = 'verify';
                        _context4.next = 36;
                        return this.handleTelegramVerify(message);

                     case 36:
                        _context4.next = 46;
                        break;

                     case 38:
                        if (!/grant/.test(content.text)) {
                           _context4.next = 44;
                           break;
                        }

                        message.action = 'grant';
                        _context4.next = 42;
                        return this.handleTelegramGrant(message);

                     case 42:
                        _context4.next = 46;
                        break;

                     case 44:
                        _context4.next = 46;
                        return this.sendTelegramReply(message, {
                           content: 'Commands:\n               /verify - verify your Telegram identity to redishub.com\n               '
                        });

                     case 46:
                        this.logger.info('telegram message', message, telegram);

                     case 47:
                     case 'end':
                        return _context4.stop();
                  }
               }
            }, _callee4, this);
         }));

         function handleTelegram(_x3, _x4, _x5) {
            return ref.apply(this, arguments);
         }

         return handleTelegram;
      }()
   }, {
      key: 'handleTelegramVerify',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee5(request) {
            var _this3 = this;

            var now, userKey, _ref, _ref2, sadd, verified, secret, _ref3, _ref4, hmset, duration;

            return regeneratorRuntime.wrap(function _callee5$(_context5) {
               while (1) {
                  switch (_context5.prev = _context5.next) {
                     case 0:
                        now = new Date().getTime();

                        this.logger.info('handleTelegramVerify', request);
                        userKey = this.adminKey('telegram', 'user', request.username);
                        _context5.next = 5;
                        return this.redis.multiExecAsync(function (multi) {
                           multi.sadd(_this3.adminKey('telegram:verified:users'), request.username);
                           multi.hget(userKey, 'verified');
                           multi.hget(userKey, 'secret');
                        });

                     case 5:
                        _ref = _context5.sent;
                        _ref2 = _slicedToArray(_ref, 3);
                        sadd = _ref2[0];
                        verified = _ref2[1];
                        secret = _ref2[2];

                        if (!secret) {
                           secret = this.generateTokenKey();
                        }

                        if (!(sadd || !verified)) {
                           _context5.next = 21;
                           break;
                        }

                        _context5.next = 14;
                        return this.redis.multiExecAsync(function (multi) {
                           multi.hsetnx(userKey, 'verified', now);
                           multi.hsetnx(userKey, 'id', request.fromId);
                           multi.hsetnx(userKey, 'secret', secret);
                        });

                     case 14:
                        _ref3 = _context5.sent;
                        _ref4 = _slicedToArray(_ref3, 1);
                        hmset = _ref4[0];
                        _context5.next = 19;
                        return this.sendTelegramReply(request, {
                           format: 'html',
                           content: 'Thanks, ' + request.greetName + '.\n            Your identity as is now verified to <b>' + this.config.serviceLabel + '</b>\n            as <code>telegram.me/' + request.username + '.</code>\n            '
                        });

                     case 19:
                        _context5.next = 24;
                        break;

                     case 21:
                        duration = now - parseInt(verified);
                        _context5.next = 24;
                        return this.sendTelegramReply(request, {
                           format: 'html',
                           content: 'Hi ' + request.greetName + '.\n            Your identity as was already verified to <b>' + this.config.serviceLabel + '</b>\n            ' + Millis.formatDuration(duration) + ' ago as <code>@' + request.username + '</code>\n            '
                        });

                     case 24:
                     case 'end':
                        return _context5.stop();
                  }
               }
            }, _callee5, this);
         }));

         function handleTelegramVerify(_x6) {
            return ref.apply(this, arguments);
         }

         return handleTelegramVerify;
      }()
   }, {
      key: 'handleTelegramGrant',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee6(request) {
            var _this4 = this;

            var now, userKey, _ref5, _ref6, ismember, verified, secret;

            return regeneratorRuntime.wrap(function _callee6$(_context6) {
               while (1) {
                  switch (_context6.prev = _context6.next) {
                     case 0:
                        now = new Date().getTime();

                        this.logger.info('handleTelegramGrant', request);
                        userKey = this.adminKey('telegram', 'user', request.username);
                        _context6.next = 5;
                        return this.redis.multiExecAsync(function (multi) {
                           multi.sismember(_this4.adminKey('telegram:verified:users'), request.username);
                           multi.hget(userKey, 'verified');
                           multi.hget(userKey, 'secret');
                        });

                     case 5:
                        _ref5 = _context6.sent;
                        _ref6 = _slicedToArray(_ref5, 3);
                        ismember = _ref6[0];
                        verified = _ref6[1];
                        secret = _ref6[2];
                        throw { message: 'Not implemented' };

                     case 11:
                     case 'end':
                        return _context6.stop();
                  }
               }
            }, _callee6, this);
         }));

         function handleTelegramGrant(_x7) {
            return ref.apply(this, arguments);
         }

         return handleTelegramGrant;
      }()
   }, {
      key: 'sendTelegramReply',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee7(request, response) {
            var content, uri, url;
            return regeneratorRuntime.wrap(function _callee7$(_context7) {
               while (1) {
                  switch (_context7.prev = _context7.next) {
                     case 0:
                        this.logger.info('sendTelegramReply', response);
                        _context7.prev = 1;

                        assert(request.fromId, 'fromId');
                        content = lodash.trim(response.content.replace(/\s\s+/g, ' '));
                        uri = 'sendMessage?chat_id=' + request.fromId;

                        uri += '&disable_notification=true';
                        if (response.format === 'markdown') {
                           uri += '&parse_mode=Markdown';
                        } else if (response.format === 'html') {
                           uri += '&parse_mode=HTML';
                        }
                        uri += '&text=' + encodeURIComponent(content);
                        url = [this.config.botUrl, uri].join('/');

                        this.logger.info('sendTelegramReply url', url);
                        _context7.next = 12;
                        return Requests.head({ url: url });

                     case 12:
                        _context7.next = 17;
                        break;

                     case 14:
                        _context7.prev = 14;
                        _context7.t0 = _context7['catch'](1);

                        this.logger.error(_context7.t0);

                     case 17:
                     case 'end':
                        return _context7.stop();
                  }
               }
            }, _callee7, this, [[1, 14]]);
         }));

         function sendTelegramReply(_x8, _x9) {
            return ref.apply(this, arguments);
         }

         return sendTelegramReply;
      }()
   }, {
      key: 'addRoutes',
      value: function addRoutes() {
         var _this5 = this;

         this.addPublicCommand({
            key: 'routes',
            access: 'debug',
            aliases: ['/'],
            sendResult: function () {
               var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee8(req, res, reqx, result) {
                  return regeneratorRuntime.wrap(function _callee8$(_context8) {
                     while (1) {
                        switch (_context8.prev = _context8.next) {
                           case 0:
                              if (!_this5.isCliDomain(req)) {
                                 _context8.next = 4;
                                 break;
                              }

                              return _context8.abrupt('return', result);

                           case 4:
                              res.set('Content-Type', 'text/html');
                              res.send(new _Page2.default().render(new _Help2.default().render({
                                 req: req, result: result, config: _this5.config
                              })));

                           case 6:
                           case 'end':
                              return _context8.stop();
                        }
                     }
                  }, _callee8, _this5);
               }));

               function sendResult(_x10, _x11, _x12, _x13) {
                  return ref.apply(this, arguments);
               }

               return sendResult;
            }()
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee9(req, res, reqx) {
               var routes, accountOnlyRoutes;
               return regeneratorRuntime.wrap(function _callee9$(_context9) {
                  while (1) {
                     switch (_context9.prev = _context9.next) {
                        case 0:
                           routes = Express.getRoutes(_this5.expressApp).filter(function (route) {
                              return !['/', '/routes', '/webhook-telegram/*', '/help'].includes(route);
                           });
                           accountOnlyRoutes = routes.filter(function (route) {
                              return route.includes(':account') && !route.includes(':keyspace');
                           });
                           return _context9.abrupt('return', {
                              common: routes.filter(function (route) {
                                 return route && !route.includes(':') && !['/epoch'].includes(route);
                              }).map(function (route) {
                                 return '' + _this5.config.hostUrl + route;
                              }),

                              misc: routes.filter(function (route) {
                                 return route.includes(':') && !route.includes('telegram') && !/\:(keyspace|account)/.test(route);
                              }).map(function (route) {
                                 return '' + route;
                              }),

                              telegram: routes.filter(function (route) {
                                 return route.includes('telegram');
                              }).map(function (route) {
                                 return '' + route;
                              }),

                              account: accountOnlyRoutes.map(function (route) {
                                 return '' + route;
                              }),

                              accountKeyspace: routes.filter(function (route) {
                                 return route.includes(':account') && route.includes(':keyspace');
                              }).map(function (route) {
                                 return '' + route;
                              })
                           });

                        case 3:
                        case 'end':
                           return _context9.stop();
                     }
                  }
               }, _callee9, _this5);
            }));
            return function (_x14, _x15, _x16) {
               return ref.apply(this, arguments);
            };
         }());
         this.addPublicCommand({
            key: 'about',
            access: 'redirect'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee10(req, res) {
               return regeneratorRuntime.wrap(function _callee10$(_context10) {
                  while (1) {
                     switch (_context10.prev = _context10.next) {
                        case 0:
                           if (_this5.config.aboutUrl) {
                              res.redirect(302, _this5.config.aboutUrl);
                           }

                        case 1:
                        case 'end':
                           return _context10.stop();
                     }
                  }
               }, _callee10, _this5);
            }));
            return function (_x17, _x18) {
               return ref.apply(this, arguments);
            };
         }());
         this.expressApp.get('', function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee11(req, res) {
               return regeneratorRuntime.wrap(function _callee11$(_context11) {
                  while (1) {
                     switch (_context11.prev = _context11.next) {
                        case 0:
                           res.redirect(302, '/routes');

                        case 1:
                        case 'end':
                           return _context11.stop();
                     }
                  }
               }, _callee11, _this5);
            }));
            return function (_x19, _x20) {
               return ref.apply(this, arguments);
            };
         }());
         this.addPublicRoute('help', function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee12(req, res) {
               var content;
               return regeneratorRuntime.wrap(function _callee12$(_context12) {
                  while (1) {
                     switch (_context12.prev = _context12.next) {
                        case 0:
                           if (!_this5.isBrowser(req)) {
                              _context12.next = 12;
                              break;
                           }

                           if (!_this5.config.helpUrl) {
                              _context12.next = 5;
                              break;
                           }

                           res.redirect(302, _this5.config.helpUrl);
                           _context12.next = 10;
                           break;

                        case 5:
                           if (!false) {
                              _context12.next = 10;
                              break;
                           }

                           _context12.next = 8;
                           return Files.readFile('README.md');

                        case 8:
                           content = _context12.sent;

                           if (false) {
                              (0, _brucedown2.default)('README.md', function (err, htmlResult) {
                                 _this5.logger.debug('brucedown', htmlResult);
                              });
                           } else {
                              content = new _Page2.default().render({
                                 req: req,
                                 title: _this5.config.serviceLabel,
                                 content: (0, _marked2.default)(content.toString())
                              });
                              res.set('Content-Type', 'text/html');
                              res.send(content);
                           }

                        case 10:
                           _context12.next = 17;
                           break;

                        case 12:
                           if (!_this5.isCliDomain(req)) {
                              _context12.next = 16;
                              break;
                           }

                           return _context12.abrupt('return', _this5.listCommands());

                        case 16:
                           return _context12.abrupt('return', _this5.listCommands());

                        case 17:
                        case 'end':
                           return _context12.stop();
                     }
                  }
               }, _callee12, _this5);
            }));
            return function (_x21, _x22) {
               return ref.apply(this, arguments);
            };
         }());
         if (this.config.allowInfo) {
            this.addPublicRoute('info', function () {
               var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee13(req, res) {
                  return regeneratorRuntime.wrap(function _callee13$(_context13) {
                     while (1) {
                        switch (_context13.prev = _context13.next) {
                           case 0:
                              res.set('Content-Type', 'text/plain');
                              _context13.t0 = res;
                              _context13.next = 4;
                              return _this5.redis.infoAsync();

                           case 4:
                              _context13.t1 = _context13.sent;

                              _context13.t0.send.call(_context13.t0, _context13.t1);

                           case 6:
                           case 'end':
                              return _context13.stop();
                        }
                     }
                  }, _callee13, _this5);
               }));
               return function (_x23, _x24) {
                  return ref.apply(this, arguments);
               };
            }());
         }
         if (this.config.allowKeyspaces) {
            this.addPublicRoute('keyspaces', function () {
               return _this5.redis.smembersAsync(_this5.adminKey('keyspaces'));
            });
         }
         this.addPublicRoute('epoch', (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee14() {
            var time;
            return regeneratorRuntime.wrap(function _callee14$(_context14) {
               while (1) {
                  switch (_context14.prev = _context14.next) {
                     case 0:
                        _context14.next = 2;
                        return _this5.redis.timeAsync();

                     case 2:
                        time = _context14.sent;
                        return _context14.abrupt('return', time[0]);

                     case 4:
                     case 'end':
                        return _context14.stop();
                  }
               }
            }, _callee14, _this5);
         })));
         this.addPublicRoute('time/seconds', (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee15() {
            var time;
            return regeneratorRuntime.wrap(function _callee15$(_context15) {
               while (1) {
                  switch (_context15.prev = _context15.next) {
                     case 0:
                        _context15.next = 2;
                        return _this5.redis.timeAsync();

                     case 2:
                        time = _context15.sent;
                        return _context15.abrupt('return', time[0]);

                     case 4:
                     case 'end':
                        return _context15.stop();
                  }
               }
            }, _callee15, _this5);
         })));
         this.addPublicRoute('time/milliseconds', (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee16() {
            var time;
            return regeneratorRuntime.wrap(function _callee16$(_context16) {
               while (1) {
                  switch (_context16.prev = _context16.next) {
                     case 0:
                        _context16.next = 2;
                        return _this5.redis.timeAsync();

                     case 2:
                        time = _context16.sent;
                        return _context16.abrupt('return', Math.ceil(time[0] * 1000 + time[1] / 1000));

                     case 4:
                     case 'end':
                        return _context16.stop();
                  }
               }
            }, _callee16, _this5);
         })));
         this.addPublicRoute('time/nanoseconds', (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee17() {
            var time;
            return regeneratorRuntime.wrap(function _callee17$(_context17) {
               while (1) {
                  switch (_context17.prev = _context17.next) {
                     case 0:
                        _context17.next = 2;
                        return _this5.redis.timeAsync();

                     case 2:
                        time = _context17.sent;
                        return _context17.abrupt('return', Math.ceil(time[0] * 1000 * 1000 + parseInt(time[1])));

                     case 4:
                     case 'end':
                        return _context17.stop();
                  }
               }
            }, _callee17, _this5);
         })));
         this.addPublicRoute('time', function () {
            return _this5.redis.timeAsync();
         });
         this.addPublicCommand({
            key: 'genkey-otp',
            params: ['user', 'host']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee18(req, res) {
               var _req$params, user, host;

               return regeneratorRuntime.wrap(function _callee18$(_context18) {
                  while (1) {
                     switch (_context18.prev = _context18.next) {
                        case 0:
                           _req$params = req.params;
                           user = _req$params.user;
                           host = _req$params.host;

                           _this5.logger.debug('genkey-otp', user, host);
                           return _context18.abrupt('return', _this5.buildQrReply({ user: user, host: host }));

                        case 5:
                        case 'end':
                           return _context18.stop();
                     }
                  }
               }, _callee18, _this5);
            }));
            return function (_x25, _x26) {
               return ref.apply(this, arguments);
            };
         }());
         this.addPublicCommand({
            key: 'genkey-ga',
            params: ['address', 'issuer']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee19(req, res) {
               var _req$params2, address, issuer;

               return regeneratorRuntime.wrap(function _callee19$(_context19) {
                  while (1) {
                     switch (_context19.prev = _context19.next) {
                        case 0:
                           _req$params2 = req.params;
                           address = _req$params2.address;
                           issuer = _req$params2.issuer;

                           _this5.logger.debug('genkey-ga', address, issuer);
                           return _context19.abrupt('return', _this5.buildQrReply({ account: address, issuer: issuer }));

                        case 5:
                        case 'end':
                           return _context19.stop();
                     }
                  }
               }, _callee19, _this5);
            }));
            return function (_x27, _x28) {
               return ref.apply(this, arguments);
            };
         }());
         if (!this.config.secureDomain) {
            this.logger.warn('insecure mode');
         } else {
            this.addPublicCommand({
               key: 'gentoken',
               params: ['account']
            }, function () {
               var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee20(req, res) {
                  var account, accountKey, _ref7, _ref8, _ref8$, time, registered, admined, accessed, certs, duration, errorMessage, token;

                  return regeneratorRuntime.wrap(function _callee20$(_context20) {
                     while (1) {
                        switch (_context20.prev = _context20.next) {
                           case 0:
                              account = req.params.account;
                              accountKey = _this5.adminKey('account', account);
                              _context20.next = 4;
                              return _this5.redis.multiExecAsync(function (multi) {
                                 multi.time();
                                 multi.hget(accountKey, 'registered');
                                 multi.hget(accountKey, 'admined');
                                 multi.hget(accountKey, 'accessed');
                                 multi.smembers(_this5.adminKey('account', account, 'certs'));
                              });

                           case 4:
                              _ref7 = _context20.sent;
                              _ref8 = _slicedToArray(_ref7, 5);
                              _ref8$ = _slicedToArray(_ref8[0], 1);
                              time = _ref8$[0];
                              registered = _ref8[1];
                              admined = _ref8[2];
                              accessed = _ref8[3];
                              certs = _ref8[4];
                              duration = time - admined;

                              if (!(duration < _this5.config.adminLimit)) {
                                 _context20.next = 15;
                                 break;
                              }

                              return _context20.abrupt('return', 'Admin command interval not elapsed: ' + _this5.config.adminLimit + 's');

                           case 15:
                              _this5.logger.debug('gentoken', accountKey);
                              errorMessage = _this5.validateCert(req, certs, account);

                              if (!errorMessage) {
                                 _context20.next = 19;
                                 break;
                              }

                              return _context20.abrupt('return', errorMessage);

                           case 19:
                              token = _this5.generateTokenKey(6);
                              _context20.next = 22;
                              return _this5.redis.setexAsync([accountKey, token].join(':'), _this5.config.keyExpire, token);

                           case 22:
                              return _context20.abrupt('return', token);

                           case 23:
                           case 'end':
                              return _context20.stop();
                        }
                     }
                  }, _callee20, _this5);
               }));
               return function (_x29, _x30) {
                  return ref.apply(this, arguments);
               };
            }());
            this.addSecureDomain();
         }
         this.addPublicCommand({
            key: 'verify-user-telegram',
            params: ['user']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee21(req, res) {
               var user, userKey, _ref9, _ref10, _ref10$, now, sismember, verified, secret, duration;

               return regeneratorRuntime.wrap(function _callee21$(_context21) {
                  while (1) {
                     switch (_context21.prev = _context21.next) {
                        case 0:
                           user = req.params.user;
                           userKey = _this5.adminKey('telegram', 'user', user);
                           _context21.next = 4;
                           return _this5.redis.multiExecAsync(function (multi) {
                              multi.time();
                              multi.sismember(_this5.adminKey('telegram:verified:users'), user);
                              multi.hget(userKey, 'verified');
                              multi.hget(userKey, 'secret');
                           });

                        case 4:
                           _ref9 = _context21.sent;
                           _ref10 = _slicedToArray(_ref9, 4);
                           _ref10$ = _slicedToArray(_ref10[0], 1);
                           now = _ref10$[0];
                           sismember = _ref10[1];
                           verified = _ref10[2];
                           secret = _ref10[3];

                           if (!sismember) {
                              _context21.next = 20;
                              break;
                           }

                           if (!verified) {
                              _context21.next = 17;
                              break;
                           }

                           duration = parseInt(now) - parseInt(verified);
                           return _context21.abrupt('return', 'OK: ' + user + '@telegram.me, verified ' + Millis.formatDuration(duration) + ' ago');

                        case 17:
                           return _context21.abrupt('return', 'OK: ' + user + '@telegram.me');

                        case 18:
                           _context21.next = 21;
                           break;

                        case 20:
                           return _context21.abrupt('return', 'Telegram user not yet verified: ' + user + '. Please Telegram \'@redishub_bot /verify\' e.g. via https://web.telegram.org');

                        case 21:
                        case 'end':
                           return _context21.stop();
                     }
                  }
               }, _callee21, _this5);
            }));
            return function (_x31, _x32) {
               return ref.apply(this, arguments);
            };
         }());
         this.addRegisterRoutes();
         this.addAccountRoutes();
         this.addKeyspaceCommand({
            key: 'help',
            access: 'debug',
            resultObjectType: 'KeyedArrays',
            sendResult: function () {
               var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee22(req, res, reqx, result) {
                  return regeneratorRuntime.wrap(function _callee22$(_context22) {
                     while (1) {
                        switch (_context22.prev = _context22.next) {
                           case 0:
                              if (!true) {
                                 _context22.next = 5;
                                 break;
                              }

                              res.set('Content-Type', 'text/html');
                              res.send(new _Page2.default().render(new _KeyspaceHelp2.default().render({
                                 req: req, reqx: reqx, result: result, config: _this5.config
                              })));
                              _context22.next = 11;
                              break;

                           case 5:
                              if (_this5.isMobile(req)) {
                                 _context22.next = 10;
                                 break;
                              }

                              res.set('Content-Type', 'text/html');
                              res.send(_server2.default.renderToString(_react2.default.createElement(_KeyspaceHelpPage2.default, { reqx: reqx, result: result })));
                              _context22.next = 11;
                              break;

                           case 10:
                              return _context22.abrupt('return', result);

                           case 11:
                           case 'end':
                              return _context22.stop();
                        }
                     }
                  }, _callee22, _this5);
               }));

               function sendResult(_x33, _x34, _x35, _x36) {
                  return ref.apply(this, arguments);
               }

               return sendResult;
            }()
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee23(req, res, reqx) {
               var _req$params3, account, keyspace, message, exampleUrls;

               return regeneratorRuntime.wrap(function _callee23$(_context23) {
                  while (1) {
                     switch (_context23.prev = _context23.next) {
                        case 0:
                           _req$params3 = req.params;
                           account = _req$params3.account;
                           keyspace = _req$params3.keyspace;

                           _this5.logger.ndebug('help', req.params, _this5.commands.map(function (command) {
                              return command.key;
                           }).join('/'));
                           message = 'Usage: e.g. sadd/myset/myvalue, smembers/myset etc as follows:';
                           exampleUrls = [_this5.config.hostUrl + '/ak/' + account + '/' + keyspace + '/set/mykey/myvalue', _this5.config.hostUrl + '/ak/' + account + '/' + keyspace + '/get/mykey', _this5.config.hostUrl + '/ak/' + account + '/' + keyspace + '/sadd/myset/myvalue', _this5.config.hostUrl + '/ak/' + account + '/' + keyspace + '/smembers/myset', _this5.config.hostUrl + '/ak/' + account + '/' + keyspace + '/lpush/mylist/myvalue', _this5.config.hostUrl + '/ak/' + account + '/' + keyspace + '/lrange/mylist/0/-1', _this5.config.hostUrl + '/ak/' + account + '/' + keyspace + '/ttls'];
                           return _context23.abrupt('return', { message: message, exampleUrls: exampleUrls, keyspaceCommands: _this5.listCommands('keyspace') });

                        case 7:
                        case 'end':
                           return _context23.stop();
                     }
                  }
               }, _callee23, _this5);
            }));
            return function (_x37, _x38, _x39) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'register-keyspace',
            access: 'admin'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee24(req, res, _ref11, multi) {
               var time = _ref11.time;
               var account = _ref11.account;
               var keyspace = _ref11.keyspace;
               var accountKey = _ref11.accountKey;
               var replies;
               return regeneratorRuntime.wrap(function _callee24$(_context24) {
                  while (1) {
                     switch (_context24.prev = _context24.next) {
                        case 0:
                           _context24.next = 2;
                           return _this5.redis.multiExecAsync(function (multi) {
                              multi.hsetnx(accountKey, 'registered', time);
                           });

                        case 2:
                           replies = _context24.sent;
                           return _context24.abrupt('return', replies);

                        case 4:
                        case 'end':
                           return _context24.stop();
                     }
                  }
               }, _callee24, _this5);
            }));
            return function (_x40, _x41, _x42, _x43) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'deregister-keyspace',
            access: 'admin'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee25(req, res, _ref12, multi) {
               var account = _ref12.account;
               var keyspace = _ref12.keyspace;
               var accountKey = _ref12.accountKey;
               var keyspaceKey = _ref12.keyspaceKey;

               var _ref13, _ref14, keys, _ref15, _ref16, keyspaces, keyIndex, multiReply;

               return regeneratorRuntime.wrap(function _callee25$(_context25) {
                  while (1) {
                     switch (_context25.prev = _context25.next) {
                        case 0:
                           _context25.next = 2;
                           return _this5.redis.multiExecAsync(function (multi) {
                              multi.keys(_this5.keyspaceKey(account, keyspace, '*'));
                           });

                        case 2:
                           _ref13 = _context25.sent;
                           _ref14 = _slicedToArray(_ref13, 1);
                           keys = _ref14[0];
                           _context25.next = 7;
                           return _this5.redis.multiExecAsync(function (multi) {
                              multi.smembers(_this5.accountKey(account, 'keyspaces'));
                           });

                        case 7:
                           _ref15 = _context25.sent;
                           _ref16 = _slicedToArray(_ref15, 1);
                           keyspaces = _ref16[0];

                           _this5.logger.info('deregister', keyspace, keys.length, keyspaces);
                           keyIndex = _this5.keyIndex(account, keyspace);
                           _context25.next = 14;
                           return _this5.redis.multiExecAsync(function (multi) {
                              keys.forEach(function (key) {
                                 return multi.del(key);
                              });
                              multi.del(_this5.accountKey(account, 'keyspaces'), keyspace);
                              multi.del(_this5.accountKey(account, 'certs'));
                              multi.del(accountKey);
                           });

                        case 14:
                           multiReply = _context25.sent;
                           return _context25.abrupt('return', keys.map(function (key) {
                              return key.substring(keyIndex);
                           }));

                        case 16:
                        case 'end':
                           return _context25.stop();
                     }
                  }
               }, _callee25, _this5);
            }));
            return function (_x44, _x45, _x46, _x47) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'flush',
            access: 'admin'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee26(req, res) {
               var _req$params4, account, keyspace, keys, keyIndex, multi, multiReply;

               return regeneratorRuntime.wrap(function _callee26$(_context26) {
                  while (1) {
                     switch (_context26.prev = _context26.next) {
                        case 0:
                           _req$params4 = req.params;
                           account = _req$params4.account;
                           keyspace = _req$params4.keyspace;
                           _context26.next = 5;
                           return _this5.redis.keysAsync(_this5.keyspaceKey(account, keyspace, '*'));

                        case 5:
                           keys = _context26.sent;
                           keyIndex = _this5.keyIndex(account, keyspace);
                           multi = _this5.redis.multi();

                           keys.forEach(function (key) {
                              return multi.del(key);
                           });
                           _context26.next = 11;
                           return multi.execAsync();

                        case 11:
                           multiReply = _context26.sent;
                           return _context26.abrupt('return', keys.map(function (key) {
                              return key.substring(keyIndex);
                           }));

                        case 13:
                        case 'end':
                           return _context26.stop();
                     }
                  }
               }, _callee26, _this5);
            }));
            return function (_x48, _x49) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'getconfig',
            access: 'debug'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee27(req, res, _ref17) {
               var accountKey = _ref17.accountKey;
               return regeneratorRuntime.wrap(function _callee27$(_context27) {
                  while (1) {
                     switch (_context27.prev = _context27.next) {
                        case 0:
                           _context27.next = 2;
                           return _this5.redis.hgetallAsync(accountKey);

                        case 2:
                           return _context27.abrupt('return', _context27.sent);

                        case 3:
                        case 'end':
                           return _context27.stop();
                     }
                  }
               }, _callee27, _this5);
            }));
            return function (_x50, _x51, _x52) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'keys',
            access: 'debug'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee28(req, res, _ref18) {
               var account = _ref18.account;
               var keyspace = _ref18.keyspace;
               var keys, keyIndex;
               return regeneratorRuntime.wrap(function _callee28$(_context28) {
                  while (1) {
                     switch (_context28.prev = _context28.next) {
                        case 0:
                           _context28.next = 2;
                           return _this5.redis.keysAsync(_this5.keyspaceKey(account, keyspace, '*'));

                        case 2:
                           keys = _context28.sent;
                           keyIndex = _this5.keyIndex(account, keyspace);
                           return _context28.abrupt('return', keys.map(function (key) {
                              return key.substring(keyIndex);
                           }));

                        case 5:
                        case 'end':
                           return _context28.stop();
                     }
                  }
               }, _callee28, _this5);
            }));
            return function (_x53, _x54, _x55) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'types',
            access: 'debug'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee29(req, res, _ref19) {
               var account = _ref19.account;
               var keyspace = _ref19.keyspace;
               var keys, keyIndex, multi, results, result;
               return regeneratorRuntime.wrap(function _callee29$(_context29) {
                  while (1) {
                     switch (_context29.prev = _context29.next) {
                        case 0:
                           _context29.next = 2;
                           return _this5.redis.keysAsync(_this5.keyspaceKey(account, keyspace, '*'));

                        case 2:
                           keys = _context29.sent;

                           _this5.logger.debug('ttl ak', account, keyspace, keys);
                           keyIndex = _this5.keyIndex(account, keyspace);
                           multi = _this5.redis.multi();

                           keys.forEach(function (key) {
                              return multi.type(key);
                           });
                           _context29.next = 9;
                           return multi.execAsync();

                        case 9:
                           results = _context29.sent;
                           result = {};

                           keys.forEach(function (key, index) {
                              return result[key.substring(keyIndex)] = results[index];
                           });
                           return _context29.abrupt('return', result);

                        case 13:
                        case 'end':
                           return _context29.stop();
                     }
                  }
               }, _callee29, _this5);
            }));
            return function (_x56, _x57, _x58) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'ttl',
            params: ['key'],
            access: 'debug'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee30(req, res, _ref20) {
               var keyspaceKey = _ref20.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee30$(_context30) {
                  while (1) {
                     switch (_context30.prev = _context30.next) {
                        case 0:
                           _context30.next = 2;
                           return _this5.redis.ttlAsync(keyspaceKey);

                        case 2:
                           return _context30.abrupt('return', _context30.sent);

                        case 3:
                        case 'end':
                           return _context30.stop();
                     }
                  }
               }, _callee30, _this5);
            }));
            return function (_x59, _x60, _x61) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'ttls',
            access: 'debug'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee31(req, res, _ref21) {
               var account = _ref21.account;
               var keyspace = _ref21.keyspace;
               var keys, keyIndex, multi, results, result;
               return regeneratorRuntime.wrap(function _callee31$(_context31) {
                  while (1) {
                     switch (_context31.prev = _context31.next) {
                        case 0:
                           _context31.next = 2;
                           return _this5.redis.keysAsync(_this5.keyspaceKey(account, keyspace, '*'));

                        case 2:
                           keys = _context31.sent;

                           _this5.logger.debug('ttl ak', account, keyspace, keys);
                           keyIndex = _this5.keyIndex(account, keyspace);
                           multi = _this5.redis.multi();

                           keys.forEach(function (key) {
                              return multi.ttl(key);
                           });
                           _context31.next = 9;
                           return multi.execAsync();

                        case 9:
                           results = _context31.sent;
                           result = {};

                           keys.forEach(function (key, index) {
                              return result[key.substring(keyIndex)] = results[index];
                           });
                           return _context31.abrupt('return', result);

                        case 13:
                        case 'end':
                           return _context31.stop();
                     }
                  }
               }, _callee31, _this5);
            }));
            return function (_x62, _x63, _x64) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'type',
            params: ['key'],
            access: 'debug'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee32(req, res, _ref22) {
               var keyspaceKey = _ref22.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee32$(_context32) {
                  while (1) {
                     switch (_context32.prev = _context32.next) {
                        case 0:
                           _this5.logger.debug('type', keyspaceKey);
                           _context32.next = 3;
                           return _this5.redis.typeAsync(keyspaceKey);

                        case 3:
                           return _context32.abrupt('return', _context32.sent);

                        case 4:
                        case 'end':
                           return _context32.stop();
                     }
                  }
               }, _callee32, _this5);
            }));
            return function (_x65, _x66, _x67) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'set-encrypt',
            params: ['key', 'value'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee33(req, res, _ref23) {
               var keyspaceKey = _ref23.keyspaceKey;

               var _req$params5, key, value, cert, encrypted, reply;

               return regeneratorRuntime.wrap(function _callee33$(_context33) {
                  while (1) {
                     switch (_context33.prev = _context33.next) {
                        case 0:
                           _req$params5 = req.params;
                           key = _req$params5.key;
                           value = _req$params5.value;
                           cert = req.get('ssl_client_cert');

                           if (cert) {
                              _context33.next = 6;
                              break;
                           }

                           throw { message: 'No client cert' };

                        case 6:
                           cert = cert.replace(/\t/g, '\n');
                           encrypted = _crypto2.default.publicEncrypt(cert, new Buffer(value)).toString('base64');
                           _context33.next = 10;
                           return _this5.redis.setAsync(keyspaceKey, encrypted);

                        case 10:
                           reply = _context33.sent;
                           return _context33.abrupt('return', { key: key, encrypted: encrypted, reply: reply });

                        case 12:
                        case 'end':
                           return _context33.stop();
                     }
                  }
               }, _callee33, _this5);
            }));
            return function (_x68, _x69, _x70) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'set',
            params: ['key', 'value'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee34(req, res, _ref24) {
               var keyspaceKey = _ref24.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee34$(_context34) {
                  while (1) {
                     switch (_context34.prev = _context34.next) {
                        case 0:
                           _context34.next = 2;
                           return _this5.redis.setAsync(keyspaceKey, req.params.value);

                        case 2:
                           return _context34.abrupt('return', _context34.sent);

                        case 3:
                        case 'end':
                           return _context34.stop();
                     }
                  }
               }, _callee34, _this5);
            }));
            return function (_x71, _x72, _x73) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'setex',
            params: ['key', 'seconds', 'value'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee35(req, res, _ref25) {
               var keyspaceKey = _ref25.keyspaceKey;

               var _req$params6, seconds, value;

               return regeneratorRuntime.wrap(function _callee35$(_context35) {
                  while (1) {
                     switch (_context35.prev = _context35.next) {
                        case 0:
                           _req$params6 = req.params;
                           seconds = _req$params6.seconds;
                           value = _req$params6.value;
                           _context35.next = 5;
                           return _this5.redis.setexAsync(keyspaceKey, seconds, value);

                        case 5:
                           return _context35.abrupt('return', _context35.sent);

                        case 6:
                        case 'end':
                           return _context35.stop();
                     }
                  }
               }, _callee35, _this5);
            }));
            return function (_x74, _x75, _x76) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'setnx',
            params: ['key', 'value'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee36(req, res, _ref26) {
               var keyspaceKey = _ref26.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee36$(_context36) {
                  while (1) {
                     switch (_context36.prev = _context36.next) {
                        case 0:
                           _context36.next = 2;
                           return _this5.redis.setnxAsync(keyspaceKey, req.params.value);

                        case 2:
                           return _context36.abrupt('return', _context36.sent);

                        case 3:
                        case 'end':
                           return _context36.stop();
                     }
                  }
               }, _callee36, _this5);
            }));
            return function (_x77, _x78, _x79) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'get',
            params: ['key']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee37(req, res, _ref27) {
               var keyspaceKey = _ref27.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee37$(_context37) {
                  while (1) {
                     switch (_context37.prev = _context37.next) {
                        case 0:
                           _context37.next = 2;
                           return _this5.redis.getAsync(keyspaceKey);

                        case 2:
                           return _context37.abrupt('return', _context37.sent);

                        case 3:
                        case 'end':
                           return _context37.stop();
                     }
                  }
               }, _callee37, _this5);
            }));
            return function (_x80, _x81, _x82) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'getjson',
            params: ['key']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee38(req, res, _ref28) {
               var key = _ref28.key;
               var keyspaceKey = _ref28.keyspaceKey;
               var value;
               return regeneratorRuntime.wrap(function _callee38$(_context38) {
                  while (1) {
                     switch (_context38.prev = _context38.next) {
                        case 0:
                           _context38.next = 2;
                           return _this5.redis.getAsync(keyspaceKey);

                        case 2:
                           value = _context38.sent;

                           _this5.logger.info('getjson', typeof value === 'undefined' ? 'undefined' : _typeof(value), value);
                           if (value) {
                              res.json(JSON.parse(value));
                           } else {
                              res.status(404).send('Not found: ' + key);
                           }

                        case 5:
                        case 'end':
                           return _context38.stop();
                     }
                  }
               }, _callee38, _this5);
            }));
            return function (_x83, _x84, _x85) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'incr',
            params: ['key'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee39(req, res, _ref29) {
               var keyspaceKey = _ref29.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee39$(_context39) {
                  while (1) {
                     switch (_context39.prev = _context39.next) {
                        case 0:
                           _context39.next = 2;
                           return _this5.redis.incrAsync(keyspaceKey);

                        case 2:
                           return _context39.abrupt('return', _context39.sent);

                        case 3:
                        case 'end':
                           return _context39.stop();
                     }
                  }
               }, _callee39, _this5);
            }));
            return function (_x86, _x87, _x88) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'exists',
            params: ['key']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee40(req, res, _ref30) {
               var keyspaceKey = _ref30.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee40$(_context40) {
                  while (1) {
                     switch (_context40.prev = _context40.next) {
                        case 0:
                           _context40.next = 2;
                           return _this5.redis.existsAsync(keyspaceKey);

                        case 2:
                           return _context40.abrupt('return', _context40.sent);

                        case 3:
                        case 'end':
                           return _context40.stop();
                     }
                  }
               }, _callee40, _this5);
            }));
            return function (_x89, _x90, _x91) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'del',
            params: ['key'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee41(req, res, _ref31) {
               var keyspaceKey = _ref31.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee41$(_context41) {
                  while (1) {
                     switch (_context41.prev = _context41.next) {
                        case 0:
                           _context41.next = 2;
                           return _this5.redis.delAsync(keyspaceKey);

                        case 2:
                           return _context41.abrupt('return', _context41.sent);

                        case 3:
                        case 'end':
                           return _context41.stop();
                     }
                  }
               }, _callee41, _this5);
            }));
            return function (_x92, _x93, _x94) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'sadd',
            params: ['key', 'member'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee42(req, res, _ref32) {
               var keyspaceKey = _ref32.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee42$(_context42) {
                  while (1) {
                     switch (_context42.prev = _context42.next) {
                        case 0:
                           _context42.next = 2;
                           return _this5.redis.saddAsync(keyspaceKey, req.params.member);

                        case 2:
                           return _context42.abrupt('return', _context42.sent);

                        case 3:
                        case 'end':
                           return _context42.stop();
                     }
                  }
               }, _callee42, _this5);
            }));
            return function (_x95, _x96, _x97) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'srem',
            params: ['key', 'member'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee43(req, res, _ref33) {
               var keyspaceKey = _ref33.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee43$(_context43) {
                  while (1) {
                     switch (_context43.prev = _context43.next) {
                        case 0:
                           _context43.next = 2;
                           return _this5.redis.sremAsync(keyspaceKey, req.params.member);

                        case 2:
                           return _context43.abrupt('return', _context43.sent);

                        case 3:
                        case 'end':
                           return _context43.stop();
                     }
                  }
               }, _callee43, _this5);
            }));
            return function (_x98, _x99, _x100) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'smove',
            params: ['key', 'dest', 'member'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee44(req, res, _ref34, multi) {
               var account = _ref34.account;
               var keyspace = _ref34.keyspace;
               var keyspaceKey = _ref34.keyspaceKey;

               var _req$params7, dest, member, destKey, result;

               return regeneratorRuntime.wrap(function _callee44$(_context44) {
                  while (1) {
                     switch (_context44.prev = _context44.next) {
                        case 0:
                           _req$params7 = req.params;
                           dest = _req$params7.dest;
                           member = _req$params7.member;
                           destKey = _this5.keyspaceKey(account, keyspace, dest);
                           _context44.next = 6;
                           return _this5.redis.smoveAsync(keyspaceKey, destKey, member);

                        case 6:
                           result = _context44.sent;

                           multi.expire(destKey, _this5.getKeyExpire(account));
                           return _context44.abrupt('return', result);

                        case 9:
                        case 'end':
                           return _context44.stop();
                     }
                  }
               }, _callee44, _this5);
            }));
            return function (_x101, _x102, _x103, _x104) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'spop',
            params: ['key'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee45(req, res, _ref35) {
               var keyspaceKey = _ref35.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee45$(_context45) {
                  while (1) {
                     switch (_context45.prev = _context45.next) {
                        case 0:
                           _context45.next = 2;
                           return _this5.redis.spopAsync(keyspaceKey);

                        case 2:
                           return _context45.abrupt('return', _context45.sent);

                        case 3:
                        case 'end':
                           return _context45.stop();
                     }
                  }
               }, _callee45, _this5);
            }));
            return function (_x105, _x106, _x107) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'smembers',
            params: ['key']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee46(req, res, _ref36) {
               var keyspaceKey = _ref36.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee46$(_context46) {
                  while (1) {
                     switch (_context46.prev = _context46.next) {
                        case 0:
                           _context46.next = 2;
                           return _this5.redis.smembersAsync(keyspaceKey);

                        case 2:
                           return _context46.abrupt('return', _context46.sent);

                        case 3:
                        case 'end':
                           return _context46.stop();
                     }
                  }
               }, _callee46, _this5);
            }));
            return function (_x108, _x109, _x110) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'sismember',
            params: ['key', 'member']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee47(req, res, _ref37) {
               var keyspaceKey = _ref37.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee47$(_context47) {
                  while (1) {
                     switch (_context47.prev = _context47.next) {
                        case 0:
                           _context47.next = 2;
                           return _this5.redis.sismemberAsync(keyspaceKey, req.params.member);

                        case 2:
                           return _context47.abrupt('return', _context47.sent);

                        case 3:
                        case 'end':
                           return _context47.stop();
                     }
                  }
               }, _callee47, _this5);
            }));
            return function (_x111, _x112, _x113) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'scard',
            params: ['key']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee48(req, res, _ref38) {
               var keyspaceKey = _ref38.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee48$(_context48) {
                  while (1) {
                     switch (_context48.prev = _context48.next) {
                        case 0:
                           _context48.next = 2;
                           return _this5.redis.scardAsync(keyspaceKey);

                        case 2:
                           return _context48.abrupt('return', _context48.sent);

                        case 3:
                        case 'end':
                           return _context48.stop();
                     }
                  }
               }, _callee48, _this5);
            }));
            return function (_x114, _x115, _x116) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'lpush',
            params: ['key', 'value'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee49(req, res, _ref39) {
               var keyspaceKey = _ref39.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee49$(_context49) {
                  while (1) {
                     switch (_context49.prev = _context49.next) {
                        case 0:
                           _context49.next = 2;
                           return _this5.redis.lpushAsync(keyspaceKey, req.params.value);

                        case 2:
                           return _context49.abrupt('return', _context49.sent);

                        case 3:
                        case 'end':
                           return _context49.stop();
                     }
                  }
               }, _callee49, _this5);
            }));
            return function (_x117, _x118, _x119) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'lpushtrim',
            params: ['key', 'length', 'value'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee50(req, res, _ref40, multi) {
               var keyspaceKey = _ref40.keyspaceKey;

               var _req$params8, value, length;

               return regeneratorRuntime.wrap(function _callee50$(_context50) {
                  while (1) {
                     switch (_context50.prev = _context50.next) {
                        case 0:
                           _req$params8 = req.params;
                           value = _req$params8.value;
                           length = _req$params8.length;

                           multi.lpush(keyspaceKey, value);
                           multi.trim(keyspaceKey, length);

                        case 5:
                        case 'end':
                           return _context50.stop();
                     }
                  }
               }, _callee50, _this5);
            }));
            return function (_x120, _x121, _x122, _x123) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'rpush',
            params: ['key', 'value'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee51(req, res, _ref41) {
               var keyspaceKey = _ref41.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee51$(_context51) {
                  while (1) {
                     switch (_context51.prev = _context51.next) {
                        case 0:
                           _context51.next = 2;
                           return _this5.redis.rpushAsync(keyspaceKey, req.params.value);

                        case 2:
                           return _context51.abrupt('return', _context51.sent);

                        case 3:
                        case 'end':
                           return _context51.stop();
                     }
                  }
               }, _callee51, _this5);
            }));
            return function (_x124, _x125, _x126) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'lpop',
            params: ['key'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee52(req, res, _ref42) {
               var keyspaceKey = _ref42.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee52$(_context52) {
                  while (1) {
                     switch (_context52.prev = _context52.next) {
                        case 0:
                           _context52.next = 2;
                           return _this5.redis.lpopAsync(keyspaceKey);

                        case 2:
                           return _context52.abrupt('return', _context52.sent);

                        case 3:
                        case 'end':
                           return _context52.stop();
                     }
                  }
               }, _callee52, _this5);
            }));
            return function (_x127, _x128, _x129) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'blpop',
            params: ['key', 'timeout'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee53(req, res, _ref43) {
               var keyspaceKey = _ref43.keyspaceKey;
               var reply;
               return regeneratorRuntime.wrap(function _callee53$(_context53) {
                  while (1) {
                     switch (_context53.prev = _context53.next) {
                        case 0:
                           _context53.next = 2;
                           return _this5.redis.blpopAsync(keyspaceKey, req.params.timeout);

                        case 2:
                           reply = _context53.sent;

                           if (reply) {
                              _context53.next = 7;
                              break;
                           }

                           return _context53.abrupt('return', null);

                        case 7:
                           return _context53.abrupt('return', reply[1]);

                        case 8:
                        case 'end':
                           return _context53.stop();
                     }
                  }
               }, _callee53, _this5);
            }));
            return function (_x130, _x131, _x132) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'brpop',
            params: ['key', 'timeout'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee54(req, res, _ref44) {
               var keyspaceKey = _ref44.keyspaceKey;
               var reply;
               return regeneratorRuntime.wrap(function _callee54$(_context54) {
                  while (1) {
                     switch (_context54.prev = _context54.next) {
                        case 0:
                           _context54.next = 2;
                           return _this5.redis.brpopAsync(keyspaceKey, req.params.timeout);

                        case 2:
                           reply = _context54.sent;

                           if (reply) {
                              _context54.next = 7;
                              break;
                           }

                           return _context54.abrupt('return', null);

                        case 7:
                           return _context54.abrupt('return', reply[1]);

                        case 8:
                        case 'end':
                           return _context54.stop();
                     }
                  }
               }, _callee54, _this5);
            }));
            return function (_x133, _x134, _x135) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'rpop',
            params: ['key'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee55(req, res, _ref45) {
               var keyspaceKey = _ref45.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee55$(_context55) {
                  while (1) {
                     switch (_context55.prev = _context55.next) {
                        case 0:
                           _context55.next = 2;
                           return _this5.redis.rpopAsync(keyspaceKey);

                        case 2:
                           return _context55.abrupt('return', _context55.sent);

                        case 3:
                        case 'end':
                           return _context55.stop();
                     }
                  }
               }, _callee55, _this5);
            }));
            return function (_x136, _x137, _x138) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'brpoplpush',
            params: ['key', 'dest', 'timeout'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee56(req, res, _ref46, multi) {
               var account = _ref46.account;
               var keyspace = _ref46.keyspace;
               var keyspaceKey = _ref46.keyspaceKey;

               var _req$params9, dest, timeout, destKey, result;

               return regeneratorRuntime.wrap(function _callee56$(_context56) {
                  while (1) {
                     switch (_context56.prev = _context56.next) {
                        case 0:
                           _req$params9 = req.params;
                           dest = _req$params9.dest;
                           timeout = _req$params9.timeout;
                           destKey = _this5.keyspaceKey(account, keyspace, dest);
                           _context56.next = 6;
                           return _this5.redis.brpoplpushAsync(keyspaceKey, destKey, timeout);

                        case 6:
                           result = _context56.sent;

                           multi.expire(destKey, _this5.getKeyExpire(account));
                           return _context56.abrupt('return', result);

                        case 9:
                        case 'end':
                           return _context56.stop();
                     }
                  }
               }, _callee56, _this5);
            }));
            return function (_x139, _x140, _x141, _x142) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'llen',
            params: ['key'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee57(req, res, _ref47) {
               var keyspaceKey = _ref47.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee57$(_context57) {
                  while (1) {
                     switch (_context57.prev = _context57.next) {
                        case 0:
                           _context57.next = 2;
                           return _this5.redis.llenAsync(keyspaceKey);

                        case 2:
                           return _context57.abrupt('return', _context57.sent);

                        case 3:
                        case 'end':
                           return _context57.stop();
                     }
                  }
               }, _callee57, _this5);
            }));
            return function (_x143, _x144, _x145) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'lindex',
            params: ['key', 'index']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee58(req, res, _ref48) {
               var keyspaceKey = _ref48.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee58$(_context58) {
                  while (1) {
                     switch (_context58.prev = _context58.next) {
                        case 0:
                           _context58.next = 2;
                           return _this5.redis.lindexAsync(keyspaceKey, req.params.index);

                        case 2:
                           return _context58.abrupt('return', _context58.sent);

                        case 3:
                        case 'end':
                           return _context58.stop();
                     }
                  }
               }, _callee58, _this5);
            }));
            return function (_x146, _x147, _x148) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'lrem',
            params: ['key', 'count', 'value'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee59(req, res, _ref49) {
               var keyspaceKey = _ref49.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee59$(_context59) {
                  while (1) {
                     switch (_context59.prev = _context59.next) {
                        case 0:
                           _context59.next = 2;
                           return _this5.redis.lremAsync(keyspaceKey, req.params.count, req.params.value);

                        case 2:
                           return _context59.abrupt('return', _context59.sent);

                        case 3:
                        case 'end':
                           return _context59.stop();
                     }
                  }
               }, _callee59, _this5);
            }));
            return function (_x149, _x150, _x151) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'lset',
            params: ['key', 'index', 'value'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee60(req, res, _ref50) {
               var keyspaceKey = _ref50.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee60$(_context60) {
                  while (1) {
                     switch (_context60.prev = _context60.next) {
                        case 0:
                           _context60.next = 2;
                           return _this5.redis.lsetAsync(keyspaceKey, req.params.index, req.params.value);

                        case 2:
                           return _context60.abrupt('return', _context60.sent);

                        case 3:
                        case 'end':
                           return _context60.stop();
                     }
                  }
               }, _callee60, _this5);
            }));
            return function (_x152, _x153, _x154) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'ltrim',
            params: ['key', 'start', 'stop'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee61(req, res, _ref51) {
               var keyspaceKey = _ref51.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee61$(_context61) {
                  while (1) {
                     switch (_context61.prev = _context61.next) {
                        case 0:
                           _context61.next = 2;
                           return _this5.redis.ltrimAsync(keyspaceKey, req.params.start, req.params.stop);

                        case 2:
                           return _context61.abrupt('return', _context61.sent);

                        case 3:
                        case 'end':
                           return _context61.stop();
                     }
                  }
               }, _callee61, _this5);
            }));
            return function (_x155, _x156, _x157) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'lrange',
            params: ['key', 'start', 'stop']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee62(req, res, _ref52) {
               var keyspaceKey = _ref52.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee62$(_context62) {
                  while (1) {
                     switch (_context62.prev = _context62.next) {
                        case 0:
                           _context62.next = 2;
                           return _this5.redis.lrangeAsync(keyspaceKey, req.params.start, req.params.stop);

                        case 2:
                           return _context62.abrupt('return', _context62.sent);

                        case 3:
                        case 'end':
                           return _context62.stop();
                     }
                  }
               }, _callee62, _this5);
            }));
            return function (_x158, _x159, _x160) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'hset',
            params: ['key', 'field', 'value'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee63(req, res, _ref53) {
               var keyspaceKey = _ref53.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee63$(_context63) {
                  while (1) {
                     switch (_context63.prev = _context63.next) {
                        case 0:
                           _context63.next = 2;
                           return _this5.redis.hsetAsync(keyspaceKey, req.params.field, req.params.value);

                        case 2:
                           return _context63.abrupt('return', _context63.sent);

                        case 3:
                        case 'end':
                           return _context63.stop();
                     }
                  }
               }, _callee63, _this5);
            }));
            return function (_x161, _x162, _x163) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'hsetnx',
            params: ['key', 'field', 'value'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee64(req, res, _ref54) {
               var keyspaceKey = _ref54.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee64$(_context64) {
                  while (1) {
                     switch (_context64.prev = _context64.next) {
                        case 0:
                           _context64.next = 2;
                           return _this5.redis.hsetnxAsync(keyspaceKey, req.params.field, req.params.value);

                        case 2:
                           return _context64.abrupt('return', _context64.sent);

                        case 3:
                        case 'end':
                           return _context64.stop();
                     }
                  }
               }, _callee64, _this5);
            }));
            return function (_x164, _x165, _x166) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'hget',
            params: ['key', 'field']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee65(req, res, _ref55) {
               var keyspaceKey = _ref55.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee65$(_context65) {
                  while (1) {
                     switch (_context65.prev = _context65.next) {
                        case 0:
                           _context65.next = 2;
                           return _this5.redis.hgetAsync(keyspaceKey, req.params.field);

                        case 2:
                           return _context65.abrupt('return', _context65.sent);

                        case 3:
                        case 'end':
                           return _context65.stop();
                     }
                  }
               }, _callee65, _this5);
            }));
            return function (_x167, _x168, _x169) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'hdel',
            params: ['key', 'field'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee66(req, res, _ref56) {
               var keyspaceKey = _ref56.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee66$(_context66) {
                  while (1) {
                     switch (_context66.prev = _context66.next) {
                        case 0:
                           _context66.next = 2;
                           return _this5.redis.hdelAsync(keyspaceKey, req.params.field);

                        case 2:
                           return _context66.abrupt('return', _context66.sent);

                        case 3:
                        case 'end':
                           return _context66.stop();
                     }
                  }
               }, _callee66, _this5);
            }));
            return function (_x170, _x171, _x172) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'hincrby',
            params: ['key', 'field', 'increment'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee67(req, res, _ref57) {
               var keyspaceKey = _ref57.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee67$(_context67) {
                  while (1) {
                     switch (_context67.prev = _context67.next) {
                        case 0:
                           _context67.next = 2;
                           return _this5.redis.hincrbyAsync(keyspaceKey, req.params.field, req.params.increment);

                        case 2:
                           return _context67.abrupt('return', _context67.sent);

                        case 3:
                        case 'end':
                           return _context67.stop();
                     }
                  }
               }, _callee67, _this5);
            }));
            return function (_x173, _x174, _x175) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'hexists',
            params: ['key', 'field']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee68(req, res, _ref58) {
               var keyspaceKey = _ref58.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee68$(_context68) {
                  while (1) {
                     switch (_context68.prev = _context68.next) {
                        case 0:
                           _context68.next = 2;
                           return _this5.redis.hexistsAsync(keyspaceKey, req.params.field);

                        case 2:
                           return _context68.abrupt('return', _context68.sent);

                        case 3:
                        case 'end':
                           return _context68.stop();
                     }
                  }
               }, _callee68, _this5);
            }));
            return function (_x176, _x177, _x178) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'hlen',
            params: ['key']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee69(req, res, _ref59) {
               var keyspaceKey = _ref59.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee69$(_context69) {
                  while (1) {
                     switch (_context69.prev = _context69.next) {
                        case 0:
                           _context69.next = 2;
                           return _this5.redis.hlenAsync(keyspaceKey);

                        case 2:
                           return _context69.abrupt('return', _context69.sent);

                        case 3:
                        case 'end':
                           return _context69.stop();
                     }
                  }
               }, _callee69, _this5);
            }));
            return function (_x179, _x180, _x181) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'hkeys',
            params: ['key']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee70(req, res, _ref60) {
               var keyspaceKey = _ref60.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee70$(_context70) {
                  while (1) {
                     switch (_context70.prev = _context70.next) {
                        case 0:
                           _context70.next = 2;
                           return _this5.redis.hkeysAsync(keyspaceKey);

                        case 2:
                           return _context70.abrupt('return', _context70.sent);

                        case 3:
                        case 'end':
                           return _context70.stop();
                     }
                  }
               }, _callee70, _this5);
            }));
            return function (_x182, _x183, _x184) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'hgetall',
            params: ['key']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee71(req, res, _ref61) {
               var keyspaceKey = _ref61.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee71$(_context71) {
                  while (1) {
                     switch (_context71.prev = _context71.next) {
                        case 0:
                           _context71.next = 2;
                           return _this5.redis.hgetallAsync(keyspaceKey);

                        case 2:
                           return _context71.abrupt('return', _context71.sent);

                        case 3:
                        case 'end':
                           return _context71.stop();
                     }
                  }
               }, _callee71, _this5);
            }));
            return function (_x185, _x186, _x187) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'zcard',
            params: ['key']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee72(req, res, _ref62) {
               var keyspaceKey = _ref62.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee72$(_context72) {
                  while (1) {
                     switch (_context72.prev = _context72.next) {
                        case 0:
                           _context72.next = 2;
                           return _this5.redis.zcardAsync(keyspaceKey);

                        case 2:
                           return _context72.abrupt('return', _context72.sent);

                        case 3:
                        case 'end':
                           return _context72.stop();
                     }
                  }
               }, _callee72, _this5);
            }));
            return function (_x188, _x189, _x190) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'zadd',
            params: ['key', 'score', 'member'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee73(req, res, _ref63) {
               var keyspaceKey = _ref63.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee73$(_context73) {
                  while (1) {
                     switch (_context73.prev = _context73.next) {
                        case 0:
                           _context73.next = 2;
                           return _this5.redis.zaddAsync(keyspaceKey, req.params.score, req.params.member);

                        case 2:
                           return _context73.abrupt('return', _context73.sent);

                        case 3:
                        case 'end':
                           return _context73.stop();
                     }
                  }
               }, _callee73, _this5);
            }));
            return function (_x191, _x192, _x193) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'zrem',
            params: ['key', 'member'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee74(req, res, _ref64) {
               var keyspaceKey = _ref64.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee74$(_context74) {
                  while (1) {
                     switch (_context74.prev = _context74.next) {
                        case 0:
                           _context74.next = 2;
                           return _this5.redis.zremAsync(keyspaceKey, req.params.member);

                        case 2:
                           return _context74.abrupt('return', _context74.sent);

                        case 3:
                        case 'end':
                           return _context74.stop();
                     }
                  }
               }, _callee74, _this5);
            }));
            return function (_x194, _x195, _x196) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'zrange',
            params: ['key', 'start', 'stop']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee75(req, res, _ref65) {
               var keyspaceKey = _ref65.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee75$(_context75) {
                  while (1) {
                     switch (_context75.prev = _context75.next) {
                        case 0:
                           _context75.next = 2;
                           return _this5.redis.zrangeAsync(keyspaceKey, req.params.start, req.params.stop);

                        case 2:
                           return _context75.abrupt('return', _context75.sent);

                        case 3:
                        case 'end':
                           return _context75.stop();
                     }
                  }
               }, _callee75, _this5);
            }));
            return function (_x197, _x198, _x199) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'zrevrange',
            params: ['key', 'start', 'stop']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee76(req, res, _ref66) {
               var keyspaceKey = _ref66.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee76$(_context76) {
                  while (1) {
                     switch (_context76.prev = _context76.next) {
                        case 0:
                           _context76.next = 2;
                           return _this5.redis.zrevrangeAsync(keyspaceKey, req.params.start, req.params.stop);

                        case 2:
                           return _context76.abrupt('return', _context76.sent);

                        case 3:
                        case 'end':
                           return _context76.stop();
                     }
                  }
               }, _callee76, _this5);
            }));
            return function (_x200, _x201, _x202) {
               return ref.apply(this, arguments);
            };
         }());
      }
   }, {
      key: 'listCommands',
      value: function listCommands(context) {
         return this.commands.filter(function (command) {
            return command.access !== 'redirect';
         }).filter(function (command) {
            return !context || command.context === context;
         }).map(function (command) {
            return [command.key].concat(_toConsumableArray(command.params)).join(' ');
         });
      }
   }, {
      key: 'formatCommandUri',
      value: function formatCommandUri(command) {
         if (command.params.length) {
            return [command.key].concat(_toConsumableArray(command.params.map(function (param) {
               return ':' + param;
            }))).join('/');
         } else {
            return command.key;
         }
      }
   }, {
      key: 'addPublicCommand',
      value: function addPublicCommand(command, fn) {
         var _this6 = this;

         var uri = command.key;
         if (command.params) {
            uri = [command.key].concat(_toConsumableArray(command.params.map(function (param) {
               return ':' + param;
            }))).join('/');
         }
         this.expressApp.get([this.config.location, uri].join('/'), function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee77(req, res) {
               var match, result;
               return regeneratorRuntime.wrap(function _callee77$(_context77) {
                  while (1) {
                     switch (_context77.prev = _context77.next) {
                        case 0:
                           _context77.prev = 0;
                           match = req.path.match(/\/:([^\/]+)/);

                           if (!match) {
                              _context77.next = 4;
                              break;
                           }

                           throw { message: 'Invalid path: leading colon. Try substituting parameter: ' + match.pop() };

                        case 4:
                           _context77.next = 6;
                           return fn(req, res);

                        case 6:
                           result = _context77.sent;

                           if (!(command.access === 'redirect')) {
                              _context77.next = 10;
                              break;
                           }

                           _context77.next = 12;
                           break;

                        case 10:
                           _context77.next = 12;
                           return _this6.sendResult(command, req, res, {}, result);

                        case 12:
                           _context77.next = 17;
                           break;

                        case 14:
                           _context77.prev = 14;
                           _context77.t0 = _context77['catch'](0);

                           _this6.sendError(req, res, _context77.t0);

                        case 17:
                        case 'end':
                           return _context77.stop();
                     }
                  }
               }, _callee77, _this6, [[0, 14]]);
            }));
            return function (_x203, _x204) {
               return ref.apply(this, arguments);
            };
         }());
         this.commands.push(command);
      }
   }, {
      key: 'addPublicRoute',
      value: regeneratorRuntime.mark(function addPublicRoute(uri, fn) {
         var _this7 = this;

         return regeneratorRuntime.wrap(function addPublicRoute$(_context79) {
            while (1) {
               switch (_context79.prev = _context79.next) {
                  case 0:
                     this.expressApp.get([this.config.location, uri].join('/'), function () {
                        var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee78(req, res) {
                           var result;
                           return regeneratorRuntime.wrap(function _callee78$(_context78) {
                              while (1) {
                                 switch (_context78.prev = _context78.next) {
                                    case 0:
                                       _context78.prev = 0;
                                       _context78.next = 3;
                                       return fn(req, res);

                                    case 3:
                                       result = _context78.sent;

                                       if (!(result !== undefined)) {
                                          _context78.next = 7;
                                          break;
                                       }

                                       _context78.next = 7;
                                       return _this7.sendResult({}, req, res, {}, result);

                                    case 7:
                                       _context78.next = 12;
                                       break;

                                    case 9:
                                       _context78.prev = 9;
                                       _context78.t0 = _context78['catch'](0);

                                       _this7.sendError(req, res, _context78.t0);

                                    case 12:
                                    case 'end':
                                       return _context78.stop();
                                 }
                              }
                           }, _callee78, _this7, [[0, 9]]);
                        }));
                        return function (_x205, _x206) {
                           return ref.apply(this, arguments);
                        };
                     }());

                  case 1:
                  case 'end':
                     return _context79.stop();
               }
            }
         }, addPublicRoute, this);
      })
   }, {
      key: 'addRegisterRoutes',
      value: function addRegisterRoutes() {
         var _this8 = this;

         this.expressApp.get(this.config.location + '/register-expire', function (req, res) {
            return _this8.registerExpire(req, res);
         });
         if (this.config.secureDomain) {
            this.expressApp.get(this.config.location + '/register-account-telegram/:account', function (req, res) {
               return _this8.registerAccount(req, res);
            });
            this.addPublicCommand({
               key: 'register-cert'
            }, function () {
               var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee79(req, res) {
                  var dn, clientCert, dns;
                  return regeneratorRuntime.wrap(function _callee79$(_context80) {
                     while (1) {
                        switch (_context80.prev = _context80.next) {
                           case 0:
                              dn = req.get('ssl_client_s_dn');
                              clientCert = req.get('ssl_client_cert');

                              if (clientCert) {
                                 _context80.next = 4;
                                 break;
                              }

                              throw { message: 'No client cert' };

                           case 4:
                              if (dn) {
                                 _context80.next = 6;
                                 break;
                              }

                              throw { message: 'No client cert DN' };

                           case 6:
                              dns = _this8.parseDn(dn);
                              throw { message: 'Unimplemented', dns: dns };

                           case 8:
                           case 'end':
                              return _context80.stop();
                        }
                     }
                  }, _callee79, _this8);
               }));
               return function (_x207, _x208) {
                  return ref.apply(this, arguments);
               };
            }());
         }
      }
   }, {
      key: 'parseDn',
      value: function parseDn(dn) {
         var _this9 = this;

         var parts = {};
         dn.split('/').filter(function (part) {
            return part.length;
         }).forEach(function (part) {
            var _part$split = part.split('=');

            var _part$split2 = _slicedToArray(_part$split, 2);

            var name = _part$split2[0];
            var value = _part$split2[1];

            if (name && value) {
               parts[name] = value;
            } else {
               _this9.logger.warn('parseDn', dn, part, name, value);
            }
         });
         return parts;
      }
   }, {
      key: 'addAccountRoutes',
      value: function addAccountRoutes() {
         var _this10 = this;

         if (this.config.secureDomain) {
            this.addAccountCommand({
               key: 'grant-cert',
               params: ['account', 'role', 'certId'],
               defaultParams: {
                  group: 'admin'
               },
               access: 'admin'
            }, function () {
               var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee80(req, res, _ref67) {
                  var account = _ref67.account;
                  var accountKey = _ref67.accountKey;
                  var time = _ref67.time;
                  var clientCertDigest = _ref67.clientCertDigest;

                  var _ref68, _ref69, cert;

                  return regeneratorRuntime.wrap(function _callee80$(_context81) {
                     while (1) {
                        switch (_context81.prev = _context81.next) {
                           case 0:
                              _context81.next = 2;
                              return _this10.redis.multiExecAsync(function (multi) {
                                 multi.hgetall(_this10.adminKey('cert', certId));
                              });

                           case 2:
                              _ref68 = _context81.sent;
                              _ref69 = _slicedToArray(_ref68, 1);
                              cert = _ref69[0];
                              throw { message: 'Unimplemented' };

                           case 6:
                           case 'end':
                              return _context81.stop();
                        }
                     }
                  }, _callee80, _this10);
               }));
               return function (_x209, _x210, _x211) {
                  return ref.apply(this, arguments);
               };
            }());
         }
      }
   }, {
      key: 'registerAccount',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee82(req, res) {
            var _this11 = this;

            var _ret;

            return regeneratorRuntime.wrap(function _callee82$(_context83) {
               while (1) {
                  switch (_context83.prev = _context83.next) {
                     case 0:
                        _context83.prev = 0;
                        return _context83.delegateYield(regeneratorRuntime.mark(function _callee81() {
                           var errorMessage, account, v, dn, clientCert, clientCertDigest, otpSecret, accountKey, _ref70, _ref71, hsetnx, saddAccount, saddCert, result;

                           return regeneratorRuntime.wrap(function _callee81$(_context82) {
                              while (1) {
                                 switch (_context82.prev = _context82.next) {
                                    case 0:
                                       errorMessage = _this11.validateRegisterTime();

                                       if (!errorMessage) {
                                          _context82.next = 4;
                                          break;
                                       }

                                       _this11.sendError(req, res, { message: errorMessage });
                                       return _context82.abrupt('return', {
                                          v: void 0
                                       });

                                    case 4:
                                       account = req.params.account;
                                       v = _this11.validateRegisterAccount(account);

                                       if (!v) {
                                          _context82.next = 8;
                                          break;
                                       }

                                       throw { message: v, account: account };

                                    case 8:
                                       dn = req.get('ssl_client_s_dn');
                                       clientCert = req.get('ssl_client_cert');

                                       _this11.logger.info('registerAccount dn', dn);

                                       if (clientCert) {
                                          _context82.next = 13;
                                          break;
                                       }

                                       throw { message: 'No client cert' };

                                    case 13:
                                       clientCertDigest = _this11.digestPem(clientCert);
                                       otpSecret = _this11.generateTokenKey();
                                       accountKey = _this11.adminKey('account', account);
                                       _context82.next = 18;
                                       return _this11.redis.multiExecAsync(function (multi) {
                                          multi.hsetnx(accountKey, 'registered', new Date().getTime());
                                          multi.sadd(_this11.adminKey('accounts'), account);
                                          multi.sadd(_this11.adminKey('account', account, 'topt'), otpSecret);
                                          multi.sadd(_this11.adminKey('account', account, 'certs'), clientCertDigest);
                                       });

                                    case 18:
                                       _ref70 = _context82.sent;
                                       _ref71 = _slicedToArray(_ref70, 3);
                                       hsetnx = _ref71[0];
                                       saddAccount = _ref71[1];
                                       saddCert = _ref71[2];

                                       if (hsetnx) {
                                          _context82.next = 25;
                                          break;
                                       }

                                       throw { message: 'Account exists' };

                                    case 25:
                                       if (!saddAccount) {
                                          _this11.logger.error('sadd account');
                                       }
                                       if (!saddCert) {
                                          _this11.logger.error('sadd cert');
                                       }
                                       result = _this11.buildQrReply({
                                          otpSecret: otpSecret,
                                          user: account,
                                          host: _this11.config.hostname,
                                          label: _this11.config.serviceLabel
                                       });
                                       _context82.next = 30;
                                       return _this11.sendResult({}, req, res, {}, result);

                                    case 30:
                                    case 'end':
                                       return _context82.stop();
                                 }
                              }
                           }, _callee81, _this11);
                        })(), 't0', 2);

                     case 2:
                        _ret = _context83.t0;

                        if (!((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object")) {
                           _context83.next = 5;
                           break;
                        }

                        return _context83.abrupt('return', _ret.v);

                     case 5:
                        _context83.next = 10;
                        break;

                     case 7:
                        _context83.prev = 7;
                        _context83.t1 = _context83['catch'](0);

                        this.sendError(req, res, _context83.t1);

                     case 10:
                     case 'end':
                        return _context83.stop();
                  }
               }
            }, _callee82, this, [[0, 7]]);
         }));

         function registerAccount(_x212, _x213) {
            return ref.apply(this, arguments);
         }

         return registerAccount;
      }()
   }, {
      key: 'addAccountCommand',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee85(command, fn) {
            var _this12 = this;

            var uri;
            return regeneratorRuntime.wrap(function _callee85$(_context86) {
               while (1) {
                  switch (_context86.prev = _context86.next) {
                     case 0:
                        uri = [command.key];

                        if (command.params) {
                           uri = [command.key].concat(_toConsumableArray(command.params.map(function (param) {
                              return ':' + param;
                           })));
                        }
                        this.expressApp.get([this.config.location].concat(_toConsumableArray(uri)).join('/'), function () {
                           var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee84(req, res) {
                              var _ret2;

                              return regeneratorRuntime.wrap(function _callee84$(_context85) {
                                 while (1) {
                                    switch (_context85.prev = _context85.next) {
                                       case 0:
                                          _context85.prev = 0;
                                          return _context85.delegateYield(regeneratorRuntime.mark(function _callee83() {
                                             var message, account, accountKey, _ref72, _ref73, _ref73$, time, admined, certs, duration, dn, result;

                                             return regeneratorRuntime.wrap(function _callee83$(_context84) {
                                                while (1) {
                                                   switch (_context84.prev = _context84.next) {
                                                      case 0:
                                                         message = _this12.validatePath(req);

                                                         if (!message) {
                                                            _context84.next = 3;
                                                            break;
                                                         }

                                                         throw { message: message };

                                                      case 3:
                                                         account = req.params.account;
                                                         accountKey = _this12.adminKey('account', account);
                                                         _context84.next = 7;
                                                         return _this12.redis.multiExecAsync(function (multi) {
                                                            multi.time();
                                                            multi.hget(accountKey, 'admined');
                                                            multi.smembers(_this12.adminKey('account', account, 'certs'));
                                                         });

                                                      case 7:
                                                         _ref72 = _context84.sent;
                                                         _ref73 = _slicedToArray(_ref72, 3);
                                                         _ref73$ = _slicedToArray(_ref73[0], 1);
                                                         time = _ref73$[0];
                                                         admined = _ref73[1];
                                                         certs = _ref73[2];

                                                         if (admined) {
                                                            _context84.next = 15;
                                                            break;
                                                         }

                                                         throw { message: 'Invalid account' };

                                                      case 15:
                                                         if (!lodash.isEmpty(certs)) {
                                                            _context84.next = 17;
                                                            break;
                                                         }

                                                         throw { message: 'No certs' };

                                                      case 17:
                                                         duration = time - admined;

                                                         if (!(duration < _this12.config.adminLimit)) {
                                                            _context84.next = 20;
                                                            break;
                                                         }

                                                         return _context84.abrupt('return', {
                                                            v: 'Admin command interval not elapsed: ' + _this12.config.adminLimit + 's'
                                                         });

                                                      case 20:
                                                         message = _this12.validateCert(req, certs, account);

                                                         if (!message) {
                                                            _context84.next = 23;
                                                            break;
                                                         }

                                                         throw { message: message };

                                                      case 23:
                                                         dn = req.get('ssl_client_s_dn');
                                                         _context84.next = 26;
                                                         return fn(req, res, { account: account, accountKey: accountKey, time: time, admined: admined, clientCertDigest: clientCertDigest });

                                                      case 26:
                                                         result = _context84.sent;

                                                         if (!(result !== undefined)) {
                                                            _context84.next = 30;
                                                            break;
                                                         }

                                                         _context84.next = 30;
                                                         return _this12.sendResult({}, req, res, {}, result);

                                                      case 30:
                                                      case 'end':
                                                         return _context84.stop();
                                                   }
                                                }
                                             }, _callee83, _this12);
                                          })(), 't0', 2);

                                       case 2:
                                          _ret2 = _context85.t0;

                                          if (!((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object")) {
                                             _context85.next = 5;
                                             break;
                                          }

                                          return _context85.abrupt('return', _ret2.v);

                                       case 5:
                                          _context85.next = 10;
                                          break;

                                       case 7:
                                          _context85.prev = 7;
                                          _context85.t1 = _context85['catch'](0);

                                          _this12.sendError(req, res, _context85.t1);

                                       case 10:
                                       case 'end':
                                          return _context85.stop();
                                    }
                                 }
                              }, _callee84, _this12, [[0, 7]]);
                           }));
                           return function (_x216, _x217) {
                              return ref.apply(this, arguments);
                           };
                        }());

                     case 3:
                     case 'end':
                        return _context86.stop();
                  }
               }
            }, _callee85, this);
         }));

         function addAccountCommand(_x214, _x215) {
            return ref.apply(this, arguments);
         }

         return addAccountCommand;
      }()
   }, {
      key: 'generateTokenKey',
      value: function generateTokenKey() {
         var length = arguments.length <= 0 || arguments[0] === undefined ? 16 : arguments[0];

         var Base32Symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
         return lodash.reduce(_crypto2.default.randomBytes(length), function (result, value) {
            return result + Base32Symbols[Math.floor(value * Base32Symbols.length / 256)];
         }, '');
      }
   }, {
      key: 'formatTokenKey',
      value: function formatTokenKey(tokenKey) {
         return tokenKey.match(/.{1,4}/g).join(' ');
      }
   }, {
      key: 'generateTokenCode',
      value: function generateTokenCode(otpSecret, time) {
         // TODO test generating a TOTP token from secret
         try {
            time = Math.floor((time || new Date().getTime() / 1000) / 30);
            this.logger.info('base32', Object.keys(_thirtyTwo2.default));
            this.logger.info('speakeasy', Object.keys(_speakeasy2.default.totp));
            this.logger.debug('otplib generateSecret', _totp2.default.utils.generateSecret());
            this.logger.debug('otplib', _totp2.default.topt.generate(_thirtyTwo2.default.decode(otpSecret), time));
         } catch (err) {
            this.logger.error('generateTokenCode', err);
         }
      }
   }, {
      key: 'buildQrReply',
      value: function buildQrReply(options) {
         var label = options.label;
         var account = options.account;
         var user = options.user;
         var host = options.host;
         var otpSecret = options.otpSecret;
         var issuer = options.issuer;

         if (!otpSecret) {
            otpSecret = this.generateTokenKey();
         }
         //this.logger.debug('code', this.generateTokenCode(otpSecret));
         if (!issuer) {
            issuer = label || host;
         }
         if (!account && user && host) {
            account = user + '@' + host;
         }
         if (!account || !issuer) {
            throw { message: 'Invalid' };
         }
         var uri = account + '?secret=' + otpSecret + '&issuer=' + issuer;
         var otpauth = 'otpauth://totp/' + encodeURIComponent(uri);
         var googleChartUrl = 'http://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=' + otpauth;
         return { otpSecret: otpSecret, uri: uri, otpauth: otpauth, googleChartUrl: googleChartUrl };
      }
   }, {
      key: 'validateRegisterTime',
      value: function validateRegisterTime() {
         var time = new Date().getTime();
         if (!this.registerTime) {
            this.registerTime = time;
         } else {
            var duration = time - this.registerTime;
            if (duration > 1000) {
               this.registerTime = time;
               this.registerCount = 0;
            } else {
               this.registerCount++;
            }
            if (this.registerCount > this.config.registerLimit) {
               this.logger.error('registerCount');
               return 'Global register rate exceeed: ' + this.config.registerLimit + ' per second';
            }
         }
         this.registerTime = time;
      }
   }, {
      key: 'registerExpire',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee87(req, res, previousError) {
            var _this13 = this;

            var _ret3;

            return regeneratorRuntime.wrap(function _callee87$(_context88) {
               while (1) {
                  switch (_context88.prev = _context88.next) {
                     case 0:
                        if (previousError) {
                           this.logger.warn('registerExpire retry');
                        }
                        _context88.prev = 1;
                        return _context88.delegateYield(regeneratorRuntime.mark(function _callee86() {
                           var errorMessage, account, keyspace, clientIp, accountKey, replies, replyPath;
                           return regeneratorRuntime.wrap(function _callee86$(_context87) {
                              while (1) {
                                 switch (_context87.prev = _context87.next) {
                                    case 0:
                                       _this13.logger.debug('registerExpire');
                                       errorMessage = _this13.validateRegisterTime();

                                       if (!errorMessage) {
                                          _context87.next = 5;
                                          break;
                                       }

                                       _this13.sendError(req, res, { message: errorMessage });
                                       return _context87.abrupt('return', {
                                          v: void 0
                                       });

                                    case 5:
                                       account = '@' + _this13.generateTokenKey().substring(0, 6).toLowerCase();
                                       keyspace = _this13.generateTokenKey().substring(0, 6).toLowerCase();
                                       clientIp = req.get('x-forwarded-for');
                                       accountKey = _this13.accountKeyspace(account, keyspace);

                                       _this13.logger.debug('registerExpire clientIp', clientIp, account, keyspace, accountKey);
                                       _context87.next = 12;
                                       return _this13.redis.multiExecAsync(function (multi) {
                                          multi.hsetnx(accountKey, 'registered', new Date().getTime());
                                          multi.expire(accountKey, _this13.config.ephemeralAccountExpire);
                                          if (clientIp) {
                                             multi.hsetnx(accountKey, 'clientIp', clientIp);
                                             if (_this13.config.addClientIp) {
                                                multi.sadd(_this13.adminKey('keyspaces:expire:ips'), clientIp);
                                             }
                                          }
                                          _this13.count(multi, 'keyspaces:expire');
                                       });

                                    case 12:
                                       replies = _context87.sent;

                                       if (replies[0]) {
                                          _context87.next = 18;
                                          break;
                                       }

                                       _this13.logger.error('keyspace clash', account, keyspace);

                                       if (previousError) {
                                          _context87.next = 17;
                                          break;
                                       }

                                       return _context87.abrupt('return', {
                                          v: _this13.registerExpire(req, res, { message: 'keyspace clash' })
                                       });

                                    case 17:
                                       throw { message: 'Expire keyspace clash' };

                                    case 18:
                                       replyPath = ['ak', account, keyspace].join('/');

                                       _this13.logger.debug('registerExpire', keyspace, clientIp, replyPath);

                                       if (!_this13.isBrowser(req)) {
                                          _context87.next = 24;
                                          break;
                                       }

                                       if (true) {
                                          res.redirect(302, [replyPath, 'help'].join('/'));
                                       } else {
                                          res.send(replyPath);
                                       }
                                       _context87.next = 26;
                                       break;

                                    case 24:
                                       _context87.next = 26;
                                       return _this13.sendResult({}, req, res, {}, replyPath);

                                    case 26:
                                    case 'end':
                                       return _context87.stop();
                                 }
                              }
                           }, _callee86, _this13);
                        })(), 't0', 3);

                     case 3:
                        _ret3 = _context88.t0;

                        if (!((typeof _ret3 === 'undefined' ? 'undefined' : _typeof(_ret3)) === "object")) {
                           _context88.next = 6;
                           break;
                        }

                        return _context88.abrupt('return', _ret3.v);

                     case 6:
                        _context88.next = 11;
                        break;

                     case 8:
                        _context88.prev = 8;
                        _context88.t1 = _context88['catch'](1);

                        this.sendError(req, res, _context88.t1);

                     case 11:
                     case 'end':
                        return _context88.stop();
                  }
               }
            }, _callee87, this, [[1, 8]]);
         }));

         function registerExpire(_x219, _x220, _x221) {
            return ref.apply(this, arguments);
         }

         return registerExpire;
      }()
   }, {
      key: 'count',
      value: function count(multi, key) {
         multi.incr(this.adminKey('metrics:' + key + ':count'));
      }
   }, {
      key: 'validateImportTime',
      value: function validateImportTime() {
         var time = new Date().getTime();
         if (!this.importTime) {
            this.importTime = time;
         } else {
            var duration = time - this.importTime;
            if (duration > 1000) {
               this.importTime = time;
               this.importCount = 0;
            } else {
               this.importCount++;
            }
            if (this.importCount > this.config.importLimit) {
               this.logger.error('importCount');
               return 'Global import rate exceeed: ' + this.config.importLimit + ' per second';
            }
         }
         this.importTime = time;
      }
   }, {
      key: 'addKeyspaceCommand',
      value: function addKeyspaceCommand(command, fn) {
         assert(command.key, 'command.key');
         command.context = 'keyspace';
         var uri = 'ak/:account/:keyspace';
         command.params = command.params || [];
         var key = command.key + command.params.length;
         this.logger.debug('addKeyspaceCommand', command.key, key, uri);
         this.commands.push(command);
         var handler = this.createKeyspaceHandler(command, fn);
         if (command.key === this.config.indexCommand) {
            this.expressApp.get([this.config.location, uri].join('/'), handler);
         }
         uri += '/' + command.key;
         if (command.params.length) {
            assert(command.key !== this.config.indexCommand, 'indexCommand');
            uri += '/' + command.params.map(function (param) {
               return ':' + param;
            }).join('/');
         }
         this.expressApp.get([this.config.location, uri].join('/'), handler);
         this.logger.debug('add', command.key, uri);
      }
   }, {
      key: 'createKeyspaceHandler',
      value: function createKeyspaceHandler(command, fn) {
         var _this14 = this;

         return function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee89(req, res) {
               var _ret4;

               return regeneratorRuntime.wrap(function _callee89$(_context90) {
                  while (1) {
                     switch (_context90.prev = _context90.next) {
                        case 0:
                           _context90.prev = 0;
                           return _context90.delegateYield(regeneratorRuntime.mark(function _callee88() {
                              var _req$params10, account, keyspace, key, timeout, accountKey, v, isSecureAccount, _ref74, _ref75, _ref75$, time, registered, admined, accessed, certs, hostname, hostHashes, multi, reqx, result;

                              return regeneratorRuntime.wrap(function _callee88$(_context89) {
                                 while (1) {
                                    switch (_context89.prev = _context89.next) {
                                       case 0:
                                          _req$params10 = req.params;
                                          account = _req$params10.account;
                                          keyspace = _req$params10.keyspace;
                                          key = _req$params10.key;
                                          timeout = _req$params10.timeout;

                                          assert(account, 'account');
                                          assert(keyspace, 'keyspace');
                                          accountKey = _this14.accountKeyspace(account, keyspace);
                                          v = void 0;
                                          //await this.migrateKeyspace(req.params);

                                          v = _this14.validateAccount(account);

                                          if (!v) {
                                             _context89.next = 13;
                                             break;
                                          }

                                          _this14.sendStatusMessage(req, res, 400, 'Invalid account: ' + v);
                                          return _context89.abrupt('return', {
                                             v: void 0
                                          });

                                       case 13:
                                          v = _this14.validateKeyspace(keyspace);

                                          if (!v) {
                                             _context89.next = 17;
                                             break;
                                          }

                                          _this14.sendStatusMessage(req, res, 400, 'Invalid keyspace: ' + v);
                                          return _context89.abrupt('return', {
                                             v: void 0
                                          });

                                       case 17:
                                          v = _this14.validateKey(key);

                                          if (!v) {
                                             _context89.next = 21;
                                             break;
                                          }

                                          _this14.sendStatusMessage(req, res, 400, 'Invalid key: ' + v);
                                          return _context89.abrupt('return', {
                                             v: void 0
                                          });

                                       case 21:
                                          if (!timeout) {
                                             _context89.next = 25;
                                             break;
                                          }

                                          if (/^[0-9]$/.test(timeout)) {
                                             _context89.next = 25;
                                             break;
                                          }

                                          _this14.sendStatusMessage(req, res, 400, 'Invalid timeout: require range 1 to 9 seconds');
                                          return _context89.abrupt('return', {
                                             v: void 0
                                          });

                                       case 25:
                                          isSecureAccount = !/^@/.test(account);
                                          _context89.next = 28;
                                          return _this14.redis.multiExecAsync(function (multi) {
                                             multi.time();
                                             multi.hget(accountKey, 'registered');
                                             multi.hget(accountKey, 'admined');
                                             multi.hget(accountKey, 'accessed');
                                             if (isSecureAccount) {
                                                multi.smembers(_this14.adminKey('account', account, 'certs'));
                                             }
                                          });

                                       case 28:
                                          _ref74 = _context89.sent;
                                          _ref75 = _slicedToArray(_ref74, 5);
                                          _ref75$ = _slicedToArray(_ref75[0], 1);
                                          time = _ref75$[0];
                                          registered = _ref75[1];
                                          admined = _ref75[2];
                                          accessed = _ref75[3];
                                          certs = _ref75[4];

                                          v = _this14.validateAccess({ command: command, req: req, account: account, keyspace: keyspace, time: time, registered: registered, admined: admined, accessed: accessed, certs: certs });

                                          if (!v) {
                                             _context89.next = 40;
                                             break;
                                          }

                                          _this14.sendStatusMessage(req, res, 403, v);
                                          return _context89.abrupt('return', {
                                             v: void 0
                                          });

                                       case 40:
                                          hostname = void 0;

                                          if (!(req.hostname === _this14.config.hostname)) {
                                             _context89.next = 44;
                                             break;
                                          }

                                          _context89.next = 56;
                                          break;

                                       case 44:
                                          if (!lodash.endsWith(req.hostname, _this14.config.keyspaceHostname)) {
                                             _context89.next = 56;
                                             break;
                                          }

                                          hostname = req.hostname.replace(/\..*$/, '');
                                          _context89.next = 48;
                                          return _this14.redis.hgetallAsync(_this14.adminKey('host', hostname));

                                       case 48:
                                          hostHashes = _context89.sent;

                                          if (hostHashes) {
                                             _context89.next = 51;
                                             break;
                                          }

                                          throw new ValidationError('Invalid hostname: ' + hostname);

                                       case 51:
                                          _this14.logger.debug('hostHashes', hostHashes);

                                          if (hostHashes.keyspaces) {
                                             _context89.next = 54;
                                             break;
                                          }

                                          throw new ValidationError('Invalid hostname: ' + hostname);

                                       case 54:
                                          if (lodash.includes(hostHashes.keyspaces, keyspace)) {
                                             _context89.next = 56;
                                             break;
                                          }

                                          throw new ValidationError('Invalid keyspace: ' + keyspace);

                                       case 56:
                                          if (keyspace) {
                                             _context89.next = 58;
                                             break;
                                          }

                                          throw new ValidationError('Missing keyspace: ' + req.path);

                                       case 58:
                                          if (!timeout) {
                                             _context89.next = 61;
                                             break;
                                          }

                                          if (!(timeout < 1 || timeout > 10)) {
                                             _context89.next = 61;
                                             break;
                                          }

                                          throw new ValidationError('Timeout must range from 1 to 10 seconds: ' + timeout);

                                       case 61:
                                          multi = _this14.redis.multi();
                                          reqx = { time: time, account: account, keyspace: keyspace, accountKey: accountKey, key: key };

                                          if (key) {
                                             reqx.keyspaceKey = _this14.keyspaceKey(account, keyspace, key);
                                          }
                                          multi.sadd(_this14.adminKey('keyspaces'), keyspace);
                                          multi.hset(accountKey, 'accessed', time);
                                          if (command && command.access === 'admin') {
                                             multi.hset(accountKey, 'admined', time);
                                          }
                                          if (key) {
                                             assert(reqx.keyspaceKey);
                                             multi.expire(reqx.keyspaceKey, _this14.getKeyExpire(account));
                                          }
                                          if (account[0] === '@') {
                                             multi.expire(accountKey, _this14.config.ephemeralAccountExpire);
                                          }
                                          _context89.next = 71;
                                          return multi.execAsync();

                                       case 71:
                                          _context89.next = 73;
                                          return fn(req, res, reqx, multi);

                                       case 73:
                                          result = _context89.sent;

                                          if (!(result !== undefined)) {
                                             _context89.next = 77;
                                             break;
                                          }

                                          _context89.next = 77;
                                          return _this14.sendResult(command, req, res, reqx, result);

                                       case 77:
                                       case 'end':
                                          return _context89.stop();
                                    }
                                 }
                              }, _callee88, _this14);
                           })(), 't0', 2);

                        case 2:
                           _ret4 = _context90.t0;

                           if (!((typeof _ret4 === 'undefined' ? 'undefined' : _typeof(_ret4)) === "object")) {
                              _context90.next = 5;
                              break;
                           }

                           return _context90.abrupt('return', _ret4.v);

                        case 5:
                           _context90.next = 10;
                           break;

                        case 7:
                           _context90.prev = 7;
                           _context90.t1 = _context90['catch'](0);

                           _this14.sendError(req, res, _context90.t1);

                        case 10:
                        case 'end':
                           return _context90.stop();
                     }
                  }
               }, _callee89, _this14, [[0, 7]]);
            }));
            return function (_x222, _x223) {
               return ref.apply(this, arguments);
            };
         }();
      }
   }, {
      key: 'getKeyExpire',
      value: function getKeyExpire(account) {
         if (account[0] === '@') {
            return this.config.ephemeralKeyExpire;
         } else {
            return this.config.keyExpire;
         }
      }
   }, {
      key: 'migrateKeyspace',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee90(_ref76) {
            var account = _ref76.account;
            var keyspace = _ref76.keyspace;

            var accountKey, _ref77, _ref78, accessToken, token, _ref79, _ref80, hsetnx, hdel;

            return regeneratorRuntime.wrap(function _callee90$(_context91) {
               while (1) {
                  switch (_context91.prev = _context91.next) {
                     case 0:
                        accountKey = this.accountKeyspace(account, keyspace);
                        _context91.next = 3;
                        return this.redis.multiExecAsync(function (multi) {
                           multi.hget(accountKey, 'accessToken');
                           multi.hget(accountKey, 'token');
                        });

                     case 3:
                        _ref77 = _context91.sent;
                        _ref78 = _slicedToArray(_ref77, 2);
                        accessToken = _ref78[0];
                        token = _ref78[1];

                        if (!(!token && accessToken)) {
                           _context91.next = 20;
                           break;
                        }

                        _context91.next = 10;
                        return this.redis.multiExecAsync(function (multi) {
                           multi.hsetnx(accountKey, 'token', accessToken);
                           multi.hdel(accountKey, 'accessToken');
                        });

                     case 10:
                        _ref79 = _context91.sent;
                        _ref80 = _slicedToArray(_ref79, 2);
                        hsetnx = _ref80[0];
                        hdel = _ref80[1];

                        if (hsetnx) {
                           _context91.next = 18;
                           break;
                        }

                        throw new Error('Migrate keyspace hset failed');

                     case 18:
                        if (hdel) {
                           _context91.next = 20;
                           break;
                        }

                        throw new Error('Migrate keyspace hdel failed');

                     case 20:
                     case 'end':
                        return _context91.stop();
                  }
               }
            }, _callee90, this);
         }));

         function migrateKeyspace(_x224) {
            return ref.apply(this, arguments);
         }

         return migrateKeyspace;
      }()
   }, {
      key: 'validateRegisterAccount',
      value: function validateRegisterAccount(account) {
         if (lodash.isEmpty(account)) {
            return 'Invalid account (empty)';
         } else if (account[0] === '@') {
            return 'Invalid account (leading @ symbol reserved for ephemeral keyspaces)';
         } else if (!/^[\-_a-z0-9]+$/.test(account)) {
            return 'Account name is invalid. Try only lowercase/numeric with dash/underscore.';
         }
      }
   }, {
      key: 'validatePath',
      value: function validatePath(req) {
         var match = req.path.match(/\/:([^\/]+)/);
         if (match) {
            return 'Invalid path: leading colon. Try substituting parameter: ' + match.pop();
         }
      }
   }, {
      key: 'validateRegisterKeyspace',
      value: function validateRegisterKeyspace(keyspace) {
         if (/~/.test(keyspace)) {
            return 'contains tilde';
         }
      }
   }, {
      key: 'validateAccount',
      value: function validateAccount(account) {
         if (/^:/.test(account)) {
            return 'leading colon';
         }
      }
   }, {
      key: 'validateKeyspace',
      value: function validateKeyspace(keyspace) {
         if (/^:/.test(keyspace)) {
            return 'leading colon';
         }
         if (/::/.test(keyspace)) {
            return 'double colon';
         }
         if (/:$/.test(keyspace)) {
            return 'trailing colon';
         }
      }
   }, {
      key: 'validateKey',
      value: function validateKey(key) {
         if (/^:/.test(key)) {
            return 'leading colon';
         }
      }
   }, {
      key: 'isReadCommand',
      value: function isReadCommand(command) {
         if (!command) {
            return false;
         } else if (!command.access) {
            return true;
         } else if (command.access === 'debug') {
            return true;
         }
         return false;
      }
   }, {
      key: 'validateAccess',
      value: function validateAccess(_ref81) {
         var req = _ref81.req;
         var command = _ref81.command;
         var account = _ref81.account;
         var keyspace = _ref81.keyspace;
         var time = _ref81.time;
         var registered = _ref81.registered;
         var admined = _ref81.admined;
         var accessed = _ref81.accessed;
         var certs = _ref81.certs;

         var scheme = req.get('X-Forwarded-Proto');
         this.logger.debug('validateAccess scheme', scheme, account, keyspace, command);
         if (this.isSecureDomain(req)) {
            if (scheme === 'http') {
               return 'Insecure scheme ' + scheme + ': ' + req.hostname;
            }
         }
         if (command.access) {
            if (command.access === 'admin') {
               if (!admined) {
                  this.logger.warn('validateAccess admined', keyspace, command.key, time);
               } else {
                  var duration = time - admined;
                  if (duration < this.config.adminLimit) {
                     return 'Admin command interval not elapsed: ' + this.config.adminLimit + 's';
                  }
               }
            } else if (command.access === 'debug') {} else if (command.access === 'set') {} else if (command.access === 'get') {} else {}
         }
         var isSecureAccount = !/^@/.test(account);
         if (this.isSecureDomain(req) && account[0] !== '@') {
            var errorMessage = this.validateCert(req, certs, account);
            if (errorMessage) {
               return errorMessage;
            }
         } else if (command.key === 'register-keyspace') {} else if (!registered) {
            if (account[0] === '@') {
               return { message: 'Expired (or unregistered) keyspace', hintUri: 'register-expire' };
            } else {
               return { message: 'Unregistered keyspace', hintUri: 'register-expire' };
            }
         } else if (isSecureAccount) {
            this.logger.error('validateAccess', account, keyspace);
            return 'Invalid access';
         }
      }
   }, {
      key: 'validateCert',
      value: function validateCert(req, certs, account) {
         if (this.config.disableValidateCert) {
            return null;
         }
         if (!certs) {
            return 'No enrolled certs';
         }
         var clientCert = req.get('ssl_client_cert');
         if (!clientCert) {
            return 'No client cert';
         }
         var clientCertDigest = this.digestPem(clientCert);
         this.logger.info('validateCert', clientCertDigest, account);
         if (!certs.includes(clientCertDigest)) {
            return 'Invalid cert';
         }
         return null;
      }
   }, {
      key: 'keyIndex',
      value: function keyIndex(account, keyspace) {
         return [this.config.redisKeyspace, account, keyspace].reduce(function (previousValue, currentValue) {
            return previousValue + currentValue.length;
         }, 3);
      }
   }, {
      key: 'accountKey',
      value: function accountKey(account) {
         return this.adminKey('account', account);
      }
   }, {
      key: 'accountKeyspace',
      value: function accountKeyspace(account, keyspace) {
         return [this.config.redisKeyspace, 'ak', account, keyspace].join(':');
      }
   }, {
      key: 'keyspaceKey',
      value: function keyspaceKey(account, keyspace, key) {
         return [this.config.redisKeyspace, account, keyspace, key].join('~');
      }
   }, {
      key: 'adminKey',
      value: function adminKey() {
         for (var _len = arguments.length, parts = Array(_len), _key = 0; _key < _len; _key++) {
            parts[_key] = arguments[_key];
         }

         return [this.config.redisKeyspace].concat(parts).join(':');
      }
   }, {
      key: 'sendResult',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee91(command, req, res, reqx, result) {
            var userAgent, uaMatch, mobile, otherResult, resultString;
            return regeneratorRuntime.wrap(function _callee91$(_context92) {
               while (1) {
                  switch (_context92.prev = _context92.next) {
                     case 0:
                        userAgent = req.get('User-Agent');
                        uaMatch = userAgent.match(/\s([A-Z][a-z]*\/[\.0-9]+)\s/);

                        this.logger.debug('sendResult ua', !uaMatch ? userAgent : uaMatch[1]);
                        command = command || {};
                        if (this.isDebugReq(req)) {
                           this.logger.ndebug('sendResult', command.command, req.params, req.query, result);
                        }
                        mobile = this.isMobile(req);

                        if (!command.sendResult) {
                           _context92.next = 19;
                           break;
                        }

                        if (!lodash.isFunction(command.sendResult)) {
                           _context92.next = 18;
                           break;
                        }

                        _context92.next = 10;
                        return command.sendResult(req, res, reqx, result);

                     case 10:
                        otherResult = _context92.sent;

                        if (!(otherResult === undefined)) {
                           _context92.next = 15;
                           break;
                        }

                        return _context92.abrupt('return');

                     case 15:
                        result = otherResult;

                     case 16:
                        _context92.next = 19;
                        break;

                     case 18:
                        throw 'command.sendResult type: ' + _typeof(command.sendResult);

                     case 19:
                        resultString = '';

                        if (Values.isDefined(result)) {
                           _context92.next = 23;
                           break;
                        }

                        _context92.next = 60;
                        break;

                     case 23:
                        if (!Values.isDefined(req.query.json)) {
                           _context92.next = 28;
                           break;
                        }

                        res.json(result);
                        return _context92.abrupt('return');

                     case 28:
                        if (!Values.isDefined(req.query.quiet)) {
                           _context92.next = 31;
                           break;
                        }

                        _context92.next = 60;
                        break;

                     case 31:
                        if (!(this.config.defaultFormat === 'cli' || Values.isDefined(req.query.line) || this.isCliDomain(req) || command.format === 'cli')) {
                           _context92.next = 36;
                           break;
                        }

                        res.set('Content-Type', 'text/plain');
                        if (lodash.isArray(result)) {
                           if (mobile) {} else {
                              resultString = result.join('\n');
                           }
                        } else if (lodash.isObject(result)) {
                           if (command.resultObjectType === 'KeyedArrays') {
                              resultString = lodash.flatten(Object.keys(result).map(function (key) {
                                 var value = result[key];
                                 if (lodash.isArray(value)) {
                                    return ['', key + ':'].concat(_toConsumableArray(value));
                                 } else if (typeof value === 'string') {
                                    if (key === 'message') {
                                       return value;
                                    } else {
                                       return key + ': ' + value;
                                    }
                                 } else {
                                    return ['', key + ':', 'type:' + (typeof value === 'undefined' ? 'undefined' : _typeof(value))];
                                 }
                              })).join('\n');
                           } else {
                              resultString = Object.keys(result).map(function (key) {
                                 var value = result[key];
                                 if (parseInt(value) === value) {
                                    value = parseInt(value);
                                 } else {
                                    value = '\'' + value + '\'';
                                 }
                                 return [key, value].join('=');
                              }).join('\n');
                           }
                        } else if (result === null) {} else {
                           resultString = result.toString();
                        }
                        _context92.next = 60;
                        break;

                     case 36:
                        if (!(this.config.defaultFormat === 'plain' || Values.isDefined(req.query.plain) || command.format === 'plain')) {
                           _context92.next = 41;
                           break;
                        }

                        res.set('Content-Type', 'text/plain');
                        resultString = result.toString();
                        _context92.next = 60;
                        break;

                     case 41:
                        if (!(this.config.defaultFormat === 'html' || Values.isDefined(req.query.html) || command.format === 'html' || this.isHtmlDomain(req))) {
                           _context92.next = 53;
                           break;
                        }

                        if (!(result === null)) {
                           _context92.next = 47;
                           break;
                        }

                        this.sendStatusMessage(req, res, 404, reqx.key ? '\'' + reqx.key + '\' is empty' : 'Empty');
                        return _context92.abrupt('return');

                     case 47:
                        if (lodash.isString(result)) {
                           resultString = result;
                        } else if (lodash.isArray(result)) {
                           resultString = result.toString();
                        } else if (lodash.isObject(result)) {
                           resultString = result.toString();
                        } else {
                           resultString = result.toString();
                        }

                     case 48:
                        res.set('Content-Type', 'text/html');
                        if (reqx.key) {
                           res.send(new _Page2.default().render({
                              req: req,
                              title: reqx.key,
                              content: '<h3>' + reqx.key + ': ' + resultString + '</h3>'
                           }));
                        } else {
                           res.send(new _Page2.default().render({
                              req: req,
                              title: req.path,
                              content: '<h3>' + resultString + '</h3>'
                           }));
                        }
                        return _context92.abrupt('return');

                     case 53:
                        if (!(this.config.defaultFormat !== 'json')) {
                           _context92.next = 58;
                           break;
                        }

                        this.sendError(req, res, { message: 'Invalid default format: ' + this.config.defaultFormat });
                        return _context92.abrupt('return');

                     case 58:
                        res.json(result);
                        return _context92.abrupt('return');

                     case 60:
                        res.send(resultString + '\n');

                     case 61:
                     case 'end':
                        return _context92.stop();
                  }
               }
            }, _callee91, this);
         }));

         function sendResult(_x225, _x226, _x227, _x228, _x229) {
            return ref.apply(this, arguments);
         }

         return sendResult;
      }()
   }, {
      key: 'isDebugReq',
      value: function isDebugReq(req) {
         return req.hostname === 'localhost';
      }
   }, {
      key: 'isSecureDomain',
      value: function isSecureDomain(req) {
         if (this.config.secureDomain) {
            return true;
         }
         if (/^(secure|cli)\./.test(req.hostname)) {
            this.logger.warn('isSecureDomain', req.hostname);
            return true;
         }
         return false;
      }
   }, {
      key: 'isMobile',
      value: function isMobile(req) {
         return (/Mobile/.test(req.get('User-Agent'))
         );
      }
   }, {
      key: 'isBrowser',
      value: function isBrowser(req) {
         return !/^curl\//.test(req.get('User-Agent'));
      }
   }, {
      key: 'isHtmlDomain',
      value: function isHtmlDomain(req) {
         return (/^web/.test(req.hostname)
         );
      }
   }, {
      key: 'isJsonDomain',
      value: function isJsonDomain(req) {
         return (/^json/.test(req.hostname)
         );
      }
   }, {
      key: 'isCliDomain',
      value: function isCliDomain(req) {
         return (/^cli/.test(req.hostname) || !this.isBrowser(req)
         );
      }
   }, {
      key: 'sendError',
      value: function sendError(req, res, err) {
         this.logger.warn(err);
         try {
            this.sendStatusMessage(req, res, 500, err);
         } catch (error) {
            this.logger.error(error);
         }
      }
   }, {
      key: 'sendStatusMessage',
      value: function sendStatusMessage(req, res, statusCode, err) {
         this.logger.warn('status', req.path, statusCode, typeof err === 'undefined' ? 'undefined' : _typeof(err), err);
         var messageLines = [];
         if (!err) {
            this.logger.error('sendStatusMessage empty');
            err = 'empty error message';
         }
         var title = req.path;
         if (lodash.isString(err)) {
            title = err;
            messageLines.push(err);
         } else if (lodash.isArray(err)) {
            messageLines = messageLines.concat(err);
         } else if ((typeof err === 'undefined' ? 'undefined' : _typeof(err)) === 'object') {
            if (err.message) {
               title = err.message;
               messageLines.push(err.message);
            }
            if (err.hintUri) {
               var url = void 0;
               if (this.isBrowser(req)) {
                  url = '/' + err.hintUri;
               } else if (/localhost/.test(req.hostname)) {
                  url = 'http://localhost:8765/' + err.hintUri;
               } else {
                  url = 'https://' + req.hostname + '/' + err.hintUri;
               }
               if (this.isBrowser(req)) {
                  url = 'Try <a href="' + url + '">' + url + '</a>';
               }
               messageLines.push(url);
            }
            if (err.stack) {
               messageLines = messageLines.concat(err.stack.split('\n').slice(0, 5));
            }
         } else {
            this.logger.error('sendStatusMessage type', typeof err === 'undefined' ? 'undefined' : _typeof(err), err);
            err = 'unexpected error type: ' + (typeof err === 'undefined' ? 'undefined' : _typeof(err));
            messageLines.push(Object.keys(err).join(' '));
         }
         if (this.isBrowser(req)) {
            res.set('Content-Type', 'text/html');
            res.status(statusCode).send(new _Page2.default().render({
               req: req,
               title: title,
               content: '\n            <h2>Status ' + statusCode + ': ' + title + '</h2>\n            <pre>\n            ' + messageLines.join('\n') + '\n            </pre>\n            '
            }));
         } else {
            this.logger.warn('status lines', req.path, statusCode, typeof err === 'undefined' ? 'undefined' : _typeof(err), Object.keys(err), messageLines.length);
            res.status(statusCode).send(messageLines.join('\n') + '\n');
         }
      }
   }, {
      key: 'digestPem',
      value: function digestPem(pem) {
         var lines = pem.split(/[\n\t]/);
         if (lines.length < 8) {
            throw new ValidationError('Invalid lines');
         }
         if (!/^-+BEGIN CERTIFICATE/.test(lines[0])) {
            throw new ValidationError('Invalid first line');
         }
         var contentLines = lines.filter(function (line) {
            return line.length > 16 && /^[\w\/\+]+$/.test(line);
         });
         if (contentLines.length < 8) {
            throw new ValidationError('Invalid lines');
         }
         var sha1 = _crypto2.default.createHash('sha1');
         contentLines.forEach(function (line) {
            return sha1.update(new Buffer(line));
         });
         var digest = sha1.digest('hex');
         if (digest.length < 32) {
            throw new ValidationError('Invalid cert length');
         }
         return digest;
      }
   }, {
      key: 'end',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee92() {
            return regeneratorRuntime.wrap(function _callee92$(_context93) {
               while (1) {
                  switch (_context93.prev = _context93.next) {
                     case 0:
                        this.logger.info('end');

                        if (!redis) {
                           _context93.next = 4;
                           break;
                        }

                        _context93.next = 4;
                        return this.redis.quitAsync();

                     case 4:
                        if (this.expressServer) {
                           this.expressServer.close();
                        }

                     case 5:
                     case 'end':
                        return _context93.stop();
                  }
               }
            }, _callee92, this);
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
//# sourceMappingURL=rquery.js.map