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

var _certScript = require('./handlers/certScript');

var _Page = require('./html/Page');

var _Page2 = _interopRequireDefault(_Page);

var _KeyspaceHelp = require('./html/KeyspaceHelp');

var KeyspaceHelp = _interopRequireWildcard(_KeyspaceHelp);

var _Result = require('./handlers/Result');

var Result = _interopRequireWildcard(_Result);

var _KeyspaceHelpPage = require('./jsx/KeyspaceHelpPage');

var _KeyspaceHelpPage2 = _interopRequireDefault(_KeyspaceHelpPage);

var _styles = require('./html/styles');

var _styles2 = _interopRequireDefault(_styles);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AccessKeys = ['open', 'private', 'add'];

var logger = Loggers.create(module.filename);

var rquery = function () {
   function rquery() {
      _classCallCheck(this, rquery);
   }

   _createClass(rquery, [{
      key: 'testExit',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee() {
            return regeneratorRuntime.wrap(function _callee$(_context) {
               while (1) {
                  switch (_context.prev = _context.next) {
                     case 0:
                        return _context.abrupt('return', false);

                     case 1:
                     case 'end':
                        return _context.stop();
                  }
               }
            }, _callee, this);
         }));

         function testExit() {
            return ref.apply(this, arguments);
         }

         return testExit;
      }()
   }, {
      key: 'init',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee2() {
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
               while (1) {
                  switch (_context2.prev = _context2.next) {
                     case 0:
                        this.commandMap = new Map();
                        this.logger.info('init', this.config.redisUrl);
                        _context2.next = 4;
                        return this.testExit();

                     case 4:
                        if (!_context2.sent) {
                           _context2.next = 6;
                           break;
                        }

                        process.exit(1);

                     case 6:
                        this.hints = {
                           signup: {
                              message: 'Try "@' + this.config.adminBotName + ' /signup" on https://web.telegram.org',
                              url: 'https://telegram.me/' + this.config.adminBotName + '?start'
                           },
                           grantCert: {
                              message: 'Try "@' + this.config.adminBotName + ' /grantcert certId" e.g. via https://web.telegram.org',
                              url: 'https://telegram.me/' + this.config.adminBotName + '?start'
                           },
                           registerCert: {
                              message: 'Try <tt>/register-cert</tt>',
                              url: '/register-cert'
                           },
                           routes: {
                              message: 'Try <tt>/routes</tt>',
                              url: '/routes'
                           },
                           createEphemeral: {
                              uri: 'create-ephemeral',
                              description: 'Create a new ephemeral keyspace'
                           }
                        };
                        this.redis = redisLib.createClient(this.config.redisUrl);
                        this.expressApp = (0, _express2.default)();

                     case 9:
                     case 'end':
                        return _context2.stop();
                  }
               }
            }, _callee2, this);
         }));

         function init() {
            return ref.apply(this, arguments);
         }

         return init;
      }()
   }, {
      key: 'start',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee4() {
            var _this = this;

            return regeneratorRuntime.wrap(function _callee4$(_context4) {
               while (1) {
                  switch (_context4.prev = _context4.next) {
                     case 0:
                        assert(global.rquery.config === this.config, 'global config');
                        this.expressApp.use(function (req, res, next) {
                           var scheme = req.get('X-Forwarded-Proto');
                           if (_this.config.serviceKey === 'development') {
                              next();
                           } else if (scheme !== 'https') {
                              var redirectUrl = 'https://' + req.hostname + req.url;
                              _this.logger.debug('redirect scheme', scheme, redirectUrl);
                              res.redirect(302, redirectUrl);
                           } else {
                              next();
                           }
                        });
                        this.expressApp.use(function (req, res, next) {
                           req.pipe((0, _concatStream2.default)(function (content) {
                              req.body = content;
                              next();
                           }));
                        });
                        this.addMonitoringRoutes();
                        this.addRoutes();
                        if (this.config.disableTelegramHook) {
                           this.logger.warn('telegram webhook disabled');
                        } else {
                           this.addTelegramWebhook();
                        }
                        this.expressApp.use(function () {
                           var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee3(req, res, next) {
                              return regeneratorRuntime.wrap(function _callee3$(_context3) {
                                 while (1) {
                                    switch (_context3.prev = _context3.next) {
                                       case 0:
                                          _context3.prev = 0;
                                          _context3.next = 3;
                                          return _this.handlePublish(req, res, next);

                                       case 3:
                                          _context3.next = 8;
                                          break;

                                       case 5:
                                          _context3.prev = 5;
                                          _context3.t0 = _context3['catch'](0);

                                          _this.sendError(req, res, _context3.t0);

                                       case 8:
                                       case 'end':
                                          return _context3.stop();
                                    }
                                 }
                              }, _callee3, _this, [[0, 5]]);
                           }));
                           return function (_x, _x2, _x3) {
                              return ref.apply(this, arguments);
                           };
                        }());
                        this.expressApp.use(function (req, res) {
                           try {
                              _this.sendErrorRoute(req, res);
                           } catch (err) {
                              _this.sendError(req, res, err);
                           }
                        });
                        this.expressApp.use(function (req, res) {
                           return _this.sendErrorRoute(req, res);
                        });
                        _context4.next = 11;
                        return Express.listen(this.expressApp, this.config.port);

                     case 11:
                        this.expressServer = _context4.sent;

                        this.logger.info('listen', this.config.port, this.config.redisUrl);

                     case 13:
                     case 'end':
                        return _context4.stop();
                  }
               }
            }, _callee4, this);
         }));

         function start() {
            return ref.apply(this, arguments);
         }

         return start;
      }()
   }, {
      key: 'handlePublish',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee5(req, res, next) {
            var parts, reqx, _parts, account, keyspace, commandKey, _key, _parts2, _account, _keyspace, _key2, _parts3, _account2, _keyspace2, _parts4, _account3;

            return regeneratorRuntime.wrap(function _callee5$(_context5) {
               while (1) {
                  switch (_context5.prev = _context5.next) {
                     case 0:
                        parts = req.url.slice(1).split('/');
                        reqx = {};

                        reqx.published = true;

                        if (!(parts.length == 4)) {
                           _context5.next = 15;
                           break;
                        }

                        _parts = _slicedToArray(parts, 4);
                        account = _parts[0];
                        keyspace = _parts[1];
                        commandKey = _parts[2];
                        _key = _parts[3];

                        if (['get', 'smembers'].includes(commandKey)) {
                           _context5.next = 11;
                           break;
                        }

                        return _context5.abrupt('return', next());

                     case 11:
                        Object.assign(reqx, { account: account, keyspace: keyspace, commandKey: commandKey, key: _key });
                        return _context5.abrupt('return', this.handlePublishKeyCommand(req, res, next, reqx));

                     case 15:
                        if (!(parts.length == 3)) {
                           _context5.next = 24;
                           break;
                        }

                        _parts2 = _slicedToArray(parts, 3);
                        _account = _parts2[0];
                        _keyspace = _parts2[1];
                        _key2 = _parts2[2];

                        Object.assign(reqx, { account: _account, keyspace: _keyspace, key: _key2 });
                        return _context5.abrupt('return', this.handlePublishKey(req, res, next, reqx));

                     case 24:
                        if (!(parts.length == 2)) {
                           _context5.next = 32;
                           break;
                        }

                        _parts3 = _slicedToArray(parts, 2);
                        _account2 = _parts3[0];
                        _keyspace2 = _parts3[1];

                        Object.assign(reqx, { account: _account2, keyspace: _keyspace2 });
                        return _context5.abrupt('return', this.handlePublishKeyspace(req, res, next, reqx));

                     case 32:
                        if (!(parts.length == 1)) {
                           _context5.next = 39;
                           break;
                        }

                        _parts4 = _slicedToArray(parts, 1);
                        _account3 = _parts4[0];

                        Object.assign(reqx, { account: _account3 });
                        return _context5.abrupt('return', this.handlePublishAccount(req, res, next, reqx));

                     case 39:
                        return _context5.abrupt('return', next());

                     case 40:
                     case 'end':
                        return _context5.stop();
                  }
               }
            }, _callee5, this);
         }));

         function handlePublish(_x4, _x5, _x6) {
            return ref.apply(this, arguments);
         }

         return handlePublish;
      }()
   }, {
      key: 'handlePublishKeyCommand',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee6(req, res, next, reqx) {
            var accountKeyspace, keyspaceKey, accountKey, _ref, _ref2, access, type, result, command;

            return regeneratorRuntime.wrap(function _callee6$(_context6) {
               while (1) {
                  switch (_context6.prev = _context6.next) {
                     case 0:
                        this.logger.debug('handlePublishKeyCommand', req.url, reqx);
                        accountKeyspace = this.accountKeyspace(reqx.account, reqx.keyspace);
                        keyspaceKey = this.keyspaceKey(reqx.account, reqx.keyspace, reqx.key);
                        accountKey = this.adminKey('account', reqx.account);
                        _context6.next = 6;
                        return this.redis.multiExecAsync(function (multi) {
                           multi.hget(accountKeyspace, 'access');
                           multi.type(keyspaceKey);
                           if (reqx.commandKey === 'get') {
                              multi.get(keyspaceKey);
                           } else if (reqx.commandKey === 'smembers') {
                              multi.smembers(keyspaceKey);
                           } else {
                              throw new ValidationError('Unsupported: ' + reqx.commandKey);
                           }
                        });

                     case 6:
                        _ref = _context6.sent;
                        _ref2 = _slicedToArray(_ref, 3);
                        access = _ref2[0];
                        type = _ref2[1];
                        result = _ref2[2];

                        if (!(access !== 'open')) {
                           _context6.next = 13;
                           break;
                        }

                        throw new ValidationError({ status: 403, message: 'Access Prohibited e.g. unpublished keyspace' });

                     case 13:
                        reqx.backPath = '/' + reqx.account + '/' + req.keyspace;
                        command = this.commandMap.get(reqx.commandKey);
                        _context6.next = 17;
                        return Result.sendResult(command, req, res, reqx, result);

                     case 17:
                     case 'end':
                        return _context6.stop();
                  }
               }
            }, _callee6, this);
         }));

         function handlePublishKeyCommand(_x7, _x8, _x9, _x10) {
            return ref.apply(this, arguments);
         }

         return handlePublishKeyCommand;
      }()
   }, {
      key: 'handlePublishKey',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee7(req, res, next, reqx) {
            var accountKeyspace, keyspaceKey, accountKey, _ref3, _ref4, access, type, result, command;

            return regeneratorRuntime.wrap(function _callee7$(_context7) {
               while (1) {
                  switch (_context7.prev = _context7.next) {
                     case 0:
                        this.logger.debug('handlePublishKey', req.url, reqx);
                        accountKeyspace = this.accountKeyspace(reqx.account, reqx.keyspace);
                        keyspaceKey = this.keyspaceKey(reqx.account, reqx.keyspace, reqx.key);
                        accountKey = this.adminKey('account', reqx.account);
                        _context7.next = 6;
                        return this.redis.multiExecAsync(function (multi) {
                           multi.hget(accountKeyspace, 'access');
                           multi.type(keyspaceKey);
                        });

                     case 6:
                        _ref3 = _context7.sent;
                        _ref4 = _slicedToArray(_ref3, 2);
                        access = _ref4[0];
                        type = _ref4[1];

                        if (!(access !== 'open')) {
                           _context7.next = 12;
                           break;
                        }

                        throw new ValidationError({ status: 403, message: 'Access Prohibited e.g. unpublished keyspace' });

                     case 12:
                        result = void 0;

                        if (!(type === 'none')) {
                           _context7.next = 17;
                           break;
                        }

                        throw new ValidationError({ message: 'Unpublished', status: 404 });

                     case 17:
                        if (!(type === 'set')) {
                           _context7.next = 24;
                           break;
                        }

                        reqx.commandKey = 'smembers';
                        _context7.next = 21;
                        return this.redis.smembersAsync(keyspaceKey);

                     case 21:
                        result = _context7.sent;
                        _context7.next = 41;
                        break;

                     case 24:
                        if (!(type === 'string')) {
                           _context7.next = 31;
                           break;
                        }

                        reqx.commandKey = 'get';
                        _context7.next = 28;
                        return this.redis.getAsync(keyspaceKey);

                     case 28:
                        result = _context7.sent;
                        _context7.next = 41;
                        break;

                     case 31:
                        if (!(type === 'list')) {
                           _context7.next = 40;
                           break;
                        }

                        reqx.commandKey = 'lrange';
                        req.params.start = 0;
                        req.params.stop = this.config.lrangeStop;
                        _context7.next = 37;
                        return this.redis.lrangeAsync(keyspaceKey, req.params.start, req.params.stop);

                     case 37:
                        result = _context7.sent;
                        _context7.next = 41;
                        break;

                     case 40:
                        throw new ValidationError('Unsupported publish key type: ' + type);

                     case 41:
                        if (result) {
                           _context7.next = 43;
                           break;
                        }

                        throw new ValidationError({ message: 'Not found: ' + key, status: 404 });

                     case 43:
                        command = this.commandMap.get(reqx.commandKey);

                        reqx.backPath = '/' + reqx.account;
                        _context7.next = 47;
                        return Result.sendResult(command, req, res, reqx, result);

                     case 47:
                     case 'end':
                        return _context7.stop();
                  }
               }
            }, _callee7, this);
         }));

         function handlePublishKey(_x11, _x12, _x13, _x14) {
            return ref.apply(this, arguments);
         }

         return handlePublishKey;
      }()
   }, {
      key: 'handlePublishKeyspace',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee8(req, res, next, reqx) {
            var accountKeyspace, _ref5, _ref6, access, publishedKeys, renderedResult;

            return regeneratorRuntime.wrap(function _callee8$(_context8) {
               while (1) {
                  switch (_context8.prev = _context8.next) {
                     case 0:
                        this.logger.debug('publishKeyspace', req.url, reqx);
                        accountKeyspace = this.accountKeyspace(reqx.account, reqx.keyspace);
                        _context8.next = 4;
                        return this.redis.multiExecAsync(function (multi) {
                           multi.hget(accountKeyspace, 'access');
                        });

                     case 4:
                        _ref5 = _context8.sent;
                        _ref6 = _slicedToArray(_ref5, 1);
                        access = _ref6[0];

                        if (!(access !== 'open')) {
                           _context8.next = 9;
                           break;
                        }

                        throw new ValidationError({ status: 403, message: 'Access Prohibited e.g. unpublished keyspace' });

                     case 9:
                        _context8.next = 11;
                        return this.redis.smembersAsync(this.accountKeyspace(reqx.account, reqx.keyspace, 'published-keys'));

                     case 11:
                        publishedKeys = _context8.sent;
                        renderedResult = publishedKeys.map(function (key) {
                           return '<a href="' + req.url + '/' + key + '">' + key + '</a>';
                        });
                        _context8.next = 15;
                        return Result.sendResult({}, req, res, reqx, renderedResult);

                     case 15:
                     case 'end':
                        return _context8.stop();
                  }
               }
            }, _callee8, this);
         }));

         function handlePublishKeyspace(_x15, _x16, _x17, _x18) {
            return ref.apply(this, arguments);
         }

         return handlePublishKeyspace;
      }()
   }, {
      key: 'handlePublishAccount',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee9(req, res, next, reqx) {
            var keyspaces;
            return regeneratorRuntime.wrap(function _callee9$(_context9) {
               while (1) {
                  switch (_context9.prev = _context9.next) {
                     case 0:
                        this.logger.debug('publishAccount', req.url, reqx);

                        if (!(reqx.account === 'hub')) {
                           _context9.next = 3;
                           break;
                        }

                        throw new ValidationError('Invalid request');

                     case 3:
                        _context9.next = 5;
                        return this.redis.smembersAsync(this.accountKey(reqx.account, 'open-keyspaces'));

                     case 5:
                        _context9.t0 = function (keyspace) {
                           return '<a href="' + req.url + '/' + keyspace + '">' + keyspace + '</a>';
                        };

                        keyspaces = _context9.sent.map(_context9.t0);
                        _context9.next = 9;
                        return Result.sendResult({}, req, res, reqx, keyspaces);

                     case 9:
                     case 'end':
                        return _context9.stop();
                  }
               }
            }, _callee9, this);
         }));

         function handlePublishAccount(_x19, _x20, _x21, _x22) {
            return ref.apply(this, arguments);
         }

         return handlePublishAccount;
      }()
   }, {
      key: 'addMonitoringRoutes',
      value: function addMonitoringRoutes() {// TODO
      }
   }, {
      key: 'sendErrorRoute',
      value: function sendErrorRoute(req, res) {
         try {
            if (/^\/favicon.ico$/.test(req.path)) {
               res.status(404).send('Invalid path: ' + req.path + '\n');
               return;
            }

            var _ref7 = req.path.match(/^\/ak\/([^\/]+)\/([^\/]+)\//) || [];

            var _ref8 = _slicedToArray(_ref7, 3);

            var matching = _ref8[0];
            var account = _ref8[1];
            var keyspace = _ref8[2];

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
               var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee10(req, res) {
                  var body;
                  return regeneratorRuntime.wrap(function _callee10$(_context10) {
                     while (1) {
                        switch (_context10.prev = _context10.next) {
                           case 0:
                              _context10.prev = 0;

                              _this2.logger.debug('webhook auth', req.params[0].substring(0, 4));

                              if (!(req.params[0] !== _this2.config.botSecret)) {
                                 _context10.next = 4;
                                 break;
                              }

                              throw { message: 'Invalid telegram webhook' };

                           case 4:
                              body = req.body.toString('utf8');

                              _this2.logger.debug('body', body);

                              if (/^["{\[]/.test(body)) {
                                 _context10.next = 10;
                                 break;
                              }

                              throw { message: 'body not JSON', body: body };

                           case 10:
                              _context10.next = 12;
                              return _this2.handleTelegram(req, res, JSON.parse(body));

                           case 12:
                              res.send('');

                           case 13:
                              _context10.next = 19;
                              break;

                           case 15:
                              _context10.prev = 15;
                              _context10.t0 = _context10['catch'](0);

                              _this2.logger.error(_context10.t0);
                              res.status(500).send('Internal error: ' + _context10.t0.message + '\n');

                           case 19:
                           case 'end':
                              return _context10.stop();
                        }
                     }
                  }, _callee10, _this2, [[0, 15]]);
               }));
               return function (_x23, _x24) {
                  return ref.apply(this, arguments);
               };
            }());
         }
      }
   }, {
      key: 'handleTelegram',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee11(req, res, telegram) {
            var cert, dn, message, content;
            return regeneratorRuntime.wrap(function _callee11$(_context11) {
               while (1) {
                  switch (_context11.prev = _context11.next) {
                     case 0:
                        cert = this.getClientCert(req);

                        if (!cert) {
                           //throw {message: 'No client cert'};
                        } else {
                              this.logger.debug('telegram cert', cert.split('\n')[0]);
                              dn = this.parseCertDn(req);

                              this.logger.debug('telegram', telegram, dn);
                           }
                        message = {};
                        content = void 0;

                        if (!telegram.message) {
                           _context11.next = 10;
                           break;
                        }

                        message.type = 'message';
                        content = telegram.message;
                        if (!content.text) {} else {
                           message.text = content.text;
                        }
                        _context11.next = 18;
                        break;

                     case 10:
                        if (!telegram.inline_query) {
                           _context11.next = 16;
                           break;
                        }

                        message.type = 'query';
                        content = telegram.inline_query;
                        if (!content.query) {} else {
                           message.text = content.query;
                        }
                        _context11.next = 18;
                        break;

                     case 16:
                        this.logger.warn('telegram', telegram);
                        return _context11.abrupt('return');

                     case 18:
                        if (!content.chat) {} else if (!content.chat.id) {} else {
                           message.chatId = content.chat.id;
                        }
                        this.logger.debug('telegram tcm', JSON.stringify({ telegram: telegram, content: content, message: message }, null, 2));

                        if (content.from) {
                           _context11.next = 24;
                           break;
                        }

                        this.logger.warn('telegram tcm', { telegram: telegram, content: content, message: message });
                        _context11.next = 53;
                        break;

                     case 24:
                        message.fromId = content.from.id;
                        if (content.from.username) {
                           message.username = content.from.username;
                        }
                        message.greetName = content.from.username;
                        if (content.from.first_name) {
                           message.greetName = content.from.first_name;
                        } else if (content.from.first_name && content.from.last_name) {
                           message.greetName = [content.from.first_name, content.from.last_name].join(' ');
                        }

                        if (message.username) {
                           _context11.next = 33;
                           break;
                        }

                        _context11.next = 31;
                        return this.sendTelegram(message.chatId, 'html', ['You must set your Telegram username under Settings via the top hamburger menu.', 'We use this for your ' + this.config.serviceLabel + ' account name.']);

                     case 31:
                        _context11.next = 53;
                        break;

                     case 33:
                        if (!/\/verify/.test(content.text)) {
                           _context11.next = 39;
                           break;
                        }

                        message.action = 'verify';
                        _context11.next = 37;
                        return this.handleTelegramVerify(message);

                     case 37:
                        _context11.next = 53;
                        break;

                     case 39:
                        if (!/\/grant/.test(content.text)) {
                           _context11.next = 45;
                           break;
                        }

                        message.action = 'grant';
                        _context11.next = 43;
                        return this.handleTelegramGrant(message);

                     case 43:
                        _context11.next = 53;
                        break;

                     case 45:
                        if (!/\/signup/.test(content.text)) {
                           _context11.next = 51;
                           break;
                        }

                        message.action = 'signup';
                        _context11.next = 49;
                        return this.handleTelegramSignup(message);

                     case 49:
                        _context11.next = 53;
                        break;

                     case 51:
                        _context11.next = 53;
                        return this.sendTelegram(message.chatId, 'html', ['Commands: <code>/signup /verifyme /grantcert</code>']);

                     case 53:
                        this.logger.info('telegram message', message, telegram);

                     case 54:
                     case 'end':
                        return _context11.stop();
                  }
               }
            }, _callee11, this);
         }));

         function handleTelegram(_x25, _x26, _x27) {
            return ref.apply(this, arguments);
         }

         return handleTelegram;
      }()
   }, {
      key: 'handleTelegramSignup',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee12(request) {
            var _this3 = this;

            var now, userKey, _ref9, _ref10, sadd, verified, secret, _ref11, _ref12, hmset, account;

            return regeneratorRuntime.wrap(function _callee12$(_context12) {
               while (1) {
                  switch (_context12.prev = _context12.next) {
                     case 0:
                        now = new Date().getTime();

                        this.logger.info('handleTelegramSignup', request);
                        userKey = this.adminKey('telegram', 'user', request.username);
                        _context12.next = 5;
                        return this.redis.multiExecAsync(function (multi) {
                           multi.sadd(_this3.adminKey('telegram:verified:users'), request.username);
                           multi.hget(userKey, 'verified');
                           multi.hget(userKey, 'secret');
                        });

                     case 5:
                        _ref9 = _context12.sent;
                        _ref10 = _slicedToArray(_ref9, 3);
                        sadd = _ref10[0];
                        verified = _ref10[1];
                        secret = _ref10[2];

                        if (!secret) {
                           secret = this.generateTokenKey();
                        }

                        if (!(sadd || !verified)) {
                           _context12.next = 19;
                           break;
                        }

                        _context12.next = 14;
                        return this.redis.multiExecAsync(function (multi) {
                           multi.hsetnx(userKey, 'verified', now);
                           multi.hsetnx(userKey, 'id', request.fromId);
                           multi.hsetnx(userKey, 'secret', secret);
                        });

                     case 14:
                        _ref11 = _context12.sent;
                        _ref12 = _slicedToArray(_ref11, 1);
                        hmset = _ref12[0];
                        _context12.next = 19;
                        return this.sendTelegram(request.chatId, 'html', ['Thanks, ' + request.greetName + '.', 'Your identity as is now verified to <b>' + this.config.serviceLabel + '</b>', 'as <tt>telegram.me/' + request.username + '.</tt>']);

                     case 19:
                        account = request.username;
                        _context12.next = 22;
                        return this.sendTelegram(request.chatId, 'html', ['Thanks, ' + request.greetName + '.', 'Your ' + this.config.serviceLabel + ' account name is <b>' + account + '</b>, as per your Telegram user.', 'Use the following script create a client cert:', this.config.openHostname + '/cert-script/' + account + '.', 'We recommend you review, and read ' + this.config.openHostname + '/docs/register-cert.md.']);

                     case 22:
                     case 'end':
                        return _context12.stop();
                  }
               }
            }, _callee12, this);
         }));

         function handleTelegramSignup(_x28) {
            return ref.apply(this, arguments);
         }

         return handleTelegramSignup;
      }()
   }, {
      key: 'handleTelegramVerify',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee13(request) {
            var _this4 = this;

            var now, userKey, _ref13, _ref14, sadd, verifiedString, secret, _ref15, _ref16, hmset, verifiedTime, duration;

            return regeneratorRuntime.wrap(function _callee13$(_context13) {
               while (1) {
                  switch (_context13.prev = _context13.next) {
                     case 0:
                        now = Seconds.now();

                        this.logger.info('handleTelegramVerify', request);
                        userKey = this.adminKey('telegram', 'user', request.username);
                        _context13.next = 5;
                        return this.redis.multiExecAsync(function (multi) {
                           multi.sadd(_this4.adminKey('telegram:verified:users'), request.username);
                           multi.hget(userKey, 'verified');
                           multi.hget(userKey, 'secret');
                        });

                     case 5:
                        _ref13 = _context13.sent;
                        _ref14 = _slicedToArray(_ref13, 3);
                        sadd = _ref14[0];
                        verifiedString = _ref14[1];
                        secret = _ref14[2];

                        if (!secret) {
                           secret = this.generateTokenKey();
                        }

                        if (!(sadd || !verifiedString)) {
                           _context13.next = 21;
                           break;
                        }

                        _context13.next = 14;
                        return this.redis.multiExecAsync(function (multi) {
                           multi.hsetnx(userKey, 'verified', now);
                           multi.hsetnx(userKey, 'id', request.fromId);
                           multi.hsetnx(userKey, 'secret', secret);
                        });

                     case 14:
                        _ref15 = _context13.sent;
                        _ref16 = _slicedToArray(_ref15, 1);
                        hmset = _ref16[0];
                        _context13.next = 19;
                        return this.sendTelegram(request.chatId, 'html', ['Thanks, ' + request.greetName + '.', 'Your identity as is now verified to <b>' + this.config.serviceLabel + '</b>', 'as <code>telegram.me/' + request.username + '.</code>']);

                     case 19:
                        _context13.next = 26;
                        break;

                     case 21:
                        verifiedTime = parseInt(verifiedString);

                        if (verifiedTime > now) {
                           verifiedTime = Math.ceil(verifiedTime / 1000);
                        }
                        duration = now - verifiedTime;
                        _context13.next = 26;
                        return this.sendTelegram(request.chatId, 'html', ['Hi ' + request.greetName + '.', 'Your identity as was already verified', Millis.formatVerboseDuration(duration) + ' ago', 'as <code>@' + request.username + '</code>']);

                     case 26:
                     case 'end':
                        return _context13.stop();
                  }
               }
            }, _callee13, this);
         }));

         function handleTelegramVerify(_x29) {
            return ref.apply(this, arguments);
         }

         return handleTelegramVerify;
      }()
   }, {
      key: 'handleTelegramGrant',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee14(request) {
            var _this5 = this;

            var now, match, cert, userKey, grantKey, _ref17, _ref18, ismember, verified, secret, exists, _ref19, _ref20, setex;

            return regeneratorRuntime.wrap(function _callee14$(_context14) {
               while (1) {
                  switch (_context14.prev = _context14.next) {
                     case 0:
                        now = Millis.now();

                        this.logger.info('handleTelegramGrant', request);
                        match = request.text.match(/\/grantcert (\w+)$/);

                        if (match) {
                           _context14.next = 7;
                           break;
                        }

                        _context14.next = 6;
                        return this.sendTelegram(request.chatId, 'html', ['Try <code>/grantcert &lt;digest&gt;</code>', 'where the <code>digest</code> is returned by ' + this.config.secureHostname + '/register-cert', 'performed with the cert to be enrolled.', 'Read ' + this.config.openHostname + '/docs/register-cert.md for further info.', 'Use the following link to create a client cert:', this.config.openHostname + '/cert-script/' + request.username + '?id=' + request.username]);

                     case 6:
                        return _context14.abrupt('return');

                     case 7:
                        cert = match[1];
                        userKey = this.adminKey('telegram', 'user', request.username);
                        grantKey = this.adminKey('telegram', 'user', request.username, 'grantcert');

                        this.logger.info('handleTelegramGrant', userKey, grantKey, request, cert);
                        _context14.next = 13;
                        return this.redis.multiExecAsync(function (multi) {
                           multi.sismember(_this5.adminKey('telegram:verified:users'), request.username);
                           multi.hget(userKey, 'verified');
                           multi.hget(userKey, 'secret');
                           multi.exists(grantKey);
                        });

                     case 13:
                        _ref17 = _context14.sent;
                        _ref18 = _slicedToArray(_ref17, 4);
                        ismember = _ref18[0];
                        verified = _ref18[1];
                        secret = _ref18[2];
                        exists = _ref18[3];
                        _context14.next = 21;
                        return this.redis.multiExecAsync(function (multi) {
                           _this5.logger.info('handleTelegramGrant setex', grantKey, cert, _this5.config.enrollExpire);
                           multi.setex(grantKey, _this5.config.enrollExpire, cert);
                        });

                     case 21:
                        _ref19 = _context14.sent;
                        _ref20 = _slicedToArray(_ref19, 1);
                        setex = _ref20[0];

                        if (!setex) {
                           _context14.next = 29;
                           break;
                        }

                        _context14.next = 27;
                        return this.sendTelegramReply(request, 'html', ['You have approved enrollment of the cert <b>' + cert + '</b>.', 'That identity can now enroll via ' + this.config.secureHostname + '/register-cert.', 'This must be done in the next ' + Millis.formatVerboseDuration(1000 * this.config.enrollExpire), 'otherwise you need to repeat this request, after it expires.', 'See ' + this.config.openHostname + '/docs/register-cert.md for further info.']);

                     case 27:
                        _context14.next = 31;
                        break;

                     case 29:
                        _context14.next = 31;
                        return this.sendTelegramReply(request, 'html', ['Apologies, the \'setex\' command reply was <tt>' + setex + '</tt>']);

                     case 31:
                     case 'end':
                        return _context14.stop();
                  }
               }
            }, _callee14, this);
         }));

         function handleTelegramGrant(_x30) {
            return ref.apply(this, arguments);
         }

         return handleTelegramGrant;
      }()
   }, {
      key: 'sendTelegramReply',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee15(request, format) {
            var _len,
                content,
                _key3,
                _args15 = arguments;

            return regeneratorRuntime.wrap(function _callee15$(_context15) {
               while (1) {
                  switch (_context15.prev = _context15.next) {
                     case 0:
                        if (!(request.chatId && request.greetName)) {
                           _context15.next = 6;
                           break;
                        }

                        for (_len = _args15.length, content = Array(_len > 2 ? _len - 2 : 0), _key3 = 2; _key3 < _len; _key3++) {
                           content[_key3 - 2] = _args15[_key3];
                        }

                        _context15.next = 4;
                        return this.sendTelegram.apply(this, [request.chatId, format, 'Thanks, ' + request.greetName + '.'].concat(_toConsumableArray(content)));

                     case 4:
                        _context15.next = 7;
                        break;

                     case 6:
                        this.logger.error('sendTelegramReply', request);

                     case 7:
                     case 'end':
                        return _context15.stop();
                  }
               }
            }, _callee15, this);
         }));

         function sendTelegramReply(_x31, _x32) {
            return ref.apply(this, arguments);
         }

         return sendTelegramReply;
      }()
   }, {
      key: 'sendTelegramAlert',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee16(account, format) {
            for (var _len2 = arguments.length, context = Array(_len2 > 2 ? _len2 - 2 : 0), _key4 = 2; _key4 < _len2; _key4++) {
               context[_key4 - 2] = arguments[_key4];
            }

            return regeneratorRuntime.wrap(function _callee16$(_context16) {
               while (1) {
                  switch (_context16.prev = _context16.next) {
                     case 0:
                        _context16.next = 2;
                        return this.sendTelegram.apply(this, [account, format].concat(_toConsumableArray(context)));

                     case 2:
                     case 'end':
                        return _context16.stop();
                  }
               }
            }, _callee16, this);
         }));

         function sendTelegramAlert(_x33, _x34) {
            return ref.apply(this, arguments);
         }

         return sendTelegramAlert;
      }()
   }, {
      key: 'sendTelegram',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee17(chatId, format) {
            for (var _len3 = arguments.length, content = Array(_len3 > 2 ? _len3 - 2 : 0), _key5 = 2; _key5 < _len3; _key5++) {
               content[_key5 - 2] = arguments[_key5];
            }

            var text, uri, url, response;
            return regeneratorRuntime.wrap(function _callee17$(_context17) {
               while (1) {
                  switch (_context17.prev = _context17.next) {
                     case 0:
                        this.logger.debug('sendTelegram', chatId, format, content);
                        _context17.prev = 1;
                        text = lodash.trim(lodash.flatten(content).join(' '));

                        assert(chatId, 'chatId');
                        uri = 'sendMessage?chat_id=' + chatId;

                        uri += '&disable_notification=true';
                        if (format === 'markdown') {
                           uri += '&parse_mode=Markdown';
                        } else if (format === 'html') {
                           uri += '&parse_mode=HTML';
                        }
                        uri += '&text=' + encodeURIComponent(text);
                        url = [this.config.botUrl, uri].join('/');

                        this.logger.info('sendTelegram url', url, chatId, format, text);
                        _context17.next = 12;
                        return Requests.request({ url: url });

                     case 12:
                        response = _context17.sent;

                        if (response.statusCode !== 200) {
                           this.logger.warn('sendTelegram', chatId, url);
                        }
                        _context17.next = 19;
                        break;

                     case 16:
                        _context17.prev = 16;
                        _context17.t0 = _context17['catch'](1);

                        this.logger.error(_context17.t0);

                     case 19:
                     case 'end':
                        return _context17.stop();
                  }
               }
            }, _callee17, this, [[1, 16]]);
         }));

         function sendTelegram(_x35, _x36) {
            return ref.apply(this, arguments);
         }

         return sendTelegram;
      }()
   }, {
      key: 'addRoutes',
      value: function addRoutes() {
         var _this6 = this;

         this.addPublicCommand(require('./handlers/routes'));
         this.addPublicCommand({
            key: 'about',
            access: 'redirect'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee18(req, res) {
               return regeneratorRuntime.wrap(function _callee18$(_context18) {
                  while (1) {
                     switch (_context18.prev = _context18.next) {
                        case 0:
                           if (_this6.config.aboutUrl) {
                              res.redirect(302, _this6.config.aboutUrl);
                           }

                        case 1:
                        case 'end':
                           return _context18.stop();
                     }
                  }
               }, _callee18, _this6);
            }));
            return function (_x37, _x38) {
               return ref.apply(this, arguments);
            };
         }());
         this.expressApp.get('', function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee19(req, res) {
               return regeneratorRuntime.wrap(function _callee19$(_context19) {
                  while (1) {
                     switch (_context19.prev = _context19.next) {
                        case 0:
                           res.redirect(302, '/routes');

                        case 1:
                        case 'end':
                           return _context19.stop();
                     }
                  }
               }, _callee19, _this6);
            }));
            return function (_x39, _x40) {
               return ref.apply(this, arguments);
            };
         }());
         this.addPublicRoute('help', function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee20(req, res) {
               var _content;

               return regeneratorRuntime.wrap(function _callee20$(_context20) {
                  while (1) {
                     switch (_context20.prev = _context20.next) {
                        case 0:
                           if (!_this6.isBrowser(req)) {
                              _context20.next = 12;
                              break;
                           }

                           if (!_this6.config.helpUrl) {
                              _context20.next = 5;
                              break;
                           }

                           res.redirect(302, _this6.config.helpUrl);
                           _context20.next = 10;
                           break;

                        case 5:
                           if (!false) {
                              _context20.next = 10;
                              break;
                           }

                           _context20.next = 8;
                           return Files.readFile('README.md');

                        case 8:
                           _content = _context20.sent;

                           if (false) {
                              (0, _brucedown2.default)('README.md', function (err, htmlResult) {
                                 _this6.logger.debug('brucedown', htmlResult);
                              });
                           } else {
                              _content = (0, _Page2.default)({
                                 config: _this6.config,
                                 req: req,
                                 title: _this6.config.serviceLabel,
                                 content: (0, _marked2.default)(_content.toString())
                              });
                              res.set('Content-Type', 'text/html');
                              res.send(_content);
                           }

                        case 10:
                           _context20.next = 17;
                           break;

                        case 12:
                           if (!_this6.isCliDomain(req)) {
                              _context20.next = 16;
                              break;
                           }

                           return _context20.abrupt('return', _this6.listCommands());

                        case 16:
                           return _context20.abrupt('return', _this6.listCommands());

                        case 17:
                        case 'end':
                           return _context20.stop();
                     }
                  }
               }, _callee20, _this6);
            }));
            return function (_x41, _x42) {
               return ref.apply(this, arguments);
            };
         }());
         if (this.config.allowInfo) {
            this.addPublicRoute('info', function () {
               var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee21(req, res) {
                  return regeneratorRuntime.wrap(function _callee21$(_context21) {
                     while (1) {
                        switch (_context21.prev = _context21.next) {
                           case 0:
                              res.set('Content-Type', 'text/plain');
                              _context21.t0 = res;
                              _context21.next = 4;
                              return _this6.redis.infoAsync();

                           case 4:
                              _context21.t1 = _context21.sent;

                              _context21.t0.send.call(_context21.t0, _context21.t1);

                           case 6:
                           case 'end':
                              return _context21.stop();
                        }
                     }
                  }, _callee21, _this6);
               }));
               return function (_x43, _x44) {
                  return ref.apply(this, arguments);
               };
            }());
         }
         this.addPublicRoute('epoch', (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee22() {
            var time;
            return regeneratorRuntime.wrap(function _callee22$(_context22) {
               while (1) {
                  switch (_context22.prev = _context22.next) {
                     case 0:
                        _context22.next = 2;
                        return _this6.redis.timeAsync();

                     case 2:
                        time = _context22.sent;
                        return _context22.abrupt('return', time[0]);

                     case 4:
                     case 'end':
                        return _context22.stop();
                  }
               }
            }, _callee22, _this6);
         })));
         this.addPublicRoute('time/seconds', (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee23() {
            var time;
            return regeneratorRuntime.wrap(function _callee23$(_context23) {
               while (1) {
                  switch (_context23.prev = _context23.next) {
                     case 0:
                        _context23.next = 2;
                        return _this6.redis.timeAsync();

                     case 2:
                        time = _context23.sent;
                        return _context23.abrupt('return', time[0]);

                     case 4:
                     case 'end':
                        return _context23.stop();
                  }
               }
            }, _callee23, _this6);
         })));
         this.addPublicRoute('time/milliseconds', (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee24() {
            var time;
            return regeneratorRuntime.wrap(function _callee24$(_context24) {
               while (1) {
                  switch (_context24.prev = _context24.next) {
                     case 0:
                        _context24.next = 2;
                        return _this6.redis.timeAsync();

                     case 2:
                        time = _context24.sent;
                        return _context24.abrupt('return', Math.ceil(time[0] * 1000 + time[1] / 1000));

                     case 4:
                     case 'end':
                        return _context24.stop();
                  }
               }
            }, _callee24, _this6);
         })));
         this.addPublicRoute('time/nanoseconds', (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee25() {
            var time;
            return regeneratorRuntime.wrap(function _callee25$(_context25) {
               while (1) {
                  switch (_context25.prev = _context25.next) {
                     case 0:
                        _context25.next = 2;
                        return _this6.redis.timeAsync();

                     case 2:
                        time = _context25.sent;
                        return _context25.abrupt('return', Math.ceil(time[0] * 1000 * 1000 + parseInt(time[1])));

                     case 4:
                     case 'end':
                        return _context25.stop();
                  }
               }
            }, _callee25, _this6);
         })));
         this.addPublicRoute('time', function () {
            return _this6.redis.timeAsync();
         });
         this.addPublicCommand({
            key: 'genkey-otp',
            params: ['user', 'host'],
            format: 'json'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee26(req, res) {
               var _req$params, user, host;

               return regeneratorRuntime.wrap(function _callee26$(_context26) {
                  while (1) {
                     switch (_context26.prev = _context26.next) {
                        case 0:
                           _req$params = req.params;
                           user = _req$params.user;
                           host = _req$params.host;

                           _this6.logger.debug('genkey-otp', user, host);
                           return _context26.abrupt('return', _this6.buildQrReply({ user: user, host: host }));

                        case 5:
                        case 'end':
                           return _context26.stop();
                     }
                  }
               }, _callee26, _this6);
            }));
            return function (_x45, _x46) {
               return ref.apply(this, arguments);
            };
         }());
         this.addPublicCommand({
            key: 'genkey-ga',
            params: ['address', 'issuer'],
            format: 'json'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee27(req, res) {
               var _req$params2, address, issuer;

               return regeneratorRuntime.wrap(function _callee27$(_context27) {
                  while (1) {
                     switch (_context27.prev = _context27.next) {
                        case 0:
                           _req$params2 = req.params;
                           address = _req$params2.address;
                           issuer = _req$params2.issuer;

                           _this6.logger.debug('genkey-ga', address, issuer);
                           return _context27.abrupt('return', _this6.buildQrReply({ account: address, issuer: issuer }));

                        case 5:
                        case 'end':
                           return _context27.stop();
                     }
                  }
               }, _callee27, _this6);
            }));
            return function (_x47, _x48) {
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
               var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee28(req, res, reqx) {
                  var account, accountKey, _ref21, _ref22, _ref22$, time, registered, admined, accessed, certs, duration, _validateCert, certDigest, certRole, token;

                  return regeneratorRuntime.wrap(function _callee28$(_context28) {
                     while (1) {
                        switch (_context28.prev = _context28.next) {
                           case 0:
                              account = req.params.account;
                              accountKey = _this6.adminKey('account', account);
                              _context28.next = 4;
                              return _this6.redis.multiExecAsync(function (multi) {
                                 multi.time();
                                 multi.hget(accountKey, 'registered');
                                 multi.hget(accountKey, 'admined');
                                 multi.hget(accountKey, 'accessed');
                                 multi.smembers(_this6.adminKey('account', account, 'certs'));
                              });

                           case 4:
                              _ref21 = _context28.sent;
                              _ref22 = _slicedToArray(_ref21, 5);
                              _ref22$ = _slicedToArray(_ref22[0], 1);
                              time = _ref22$[0];
                              registered = _ref22[1];
                              admined = _ref22[2];
                              accessed = _ref22[3];
                              certs = _ref22[4];
                              duration = time - admined;

                              if (!(duration < _this6.config.adminLimit)) {
                                 _context28.next = 15;
                                 break;
                              }

                              return _context28.abrupt('return', 'Admin command interval not elapsed: ' + _this6.config.adminLimit + 's');

                           case 15:
                              _this6.logger.debug('gentoken', accountKey);
                              _validateCert = _this6.validateCert(req, reqx, certs, account, []);
                              certDigest = _validateCert.certDigest;
                              certRole = _validateCert.certRole;
                              token = _this6.generateTokenKey(6);
                              _context28.next = 22;
                              return _this6.redis.setexAsync([accountKey, token].join(':'), _this6.config.keyExpire, token);

                           case 22:
                              return _context28.abrupt('return', token);

                           case 23:
                           case 'end':
                              return _context28.stop();
                        }
                     }
                  }, _callee28, _this6);
               }));
               return function (_x49, _x50, _x51) {
                  return ref.apply(this, arguments);
               };
            }());
            this.addSecureDomain();
         }
         this.addPublicCommand({
            key: 'verify-user-telegram',
            params: ['user']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee29(req, res) {
               var user, userKey, _ref23, _ref24, _ref24$, now, sismember, verified, secret, duration;

               return regeneratorRuntime.wrap(function _callee29$(_context29) {
                  while (1) {
                     switch (_context29.prev = _context29.next) {
                        case 0:
                           user = req.params.user;
                           userKey = _this6.adminKey('telegram', 'user', user);
                           _context29.next = 4;
                           return _this6.redis.multiExecAsync(function (multi) {
                              multi.time();
                              multi.sismember(_this6.adminKey('telegram:verified:users'), user);
                              multi.hget(userKey, 'verified');
                              multi.hget(userKey, 'secret');
                           });

                        case 4:
                           _ref23 = _context29.sent;
                           _ref24 = _slicedToArray(_ref23, 4);
                           _ref24$ = _slicedToArray(_ref24[0], 1);
                           now = _ref24$[0];
                           sismember = _ref24[1];
                           verified = _ref24[2];
                           secret = _ref24[3];

                           if (!sismember) {
                              _context29.next = 20;
                              break;
                           }

                           if (!verified) {
                              _context29.next = 17;
                              break;
                           }

                           duration = parseInt(now) - parseInt(verified);
                           return _context29.abrupt('return', 'OK: ' + user + '@telegram.me, verified ' + Millis.formatVerboseDuration(duration) + ' ago');

                        case 17:
                           return _context29.abrupt('return', 'OK: ' + user + '@telegram.me');

                        case 18:
                           _context29.next = 21;
                           break;

                        case 20:
                           return _context29.abrupt('return', ['Telegram user not yet verified: ' + user + '.', 'Please Telegram \'@' + _this6.config.adminBotName + ' /verifyme\'', 'e.g. via https://web.telegram.org'].join(' '));

                        case 21:
                        case 'end':
                           return _context29.stop();
                     }
                  }
               }, _callee29, _this6);
            }));
            return function (_x52, _x53) {
               return ref.apply(this, arguments);
            };
         }());
         this.addPublicCommand({
            key: 'cert-script',
            params: ['account'],
            format: 'cli'
         }, function (req, res, reqx) {
            return (0, _certScript.handleCertScript)(req, res, reqx, { config: _this6.config });
         });
         this.addPublicCommand({
            key: 'cert-script-help',
            params: ['account'],
            format: 'cli'
         }, function (req, res, reqx) {
            return (0, _certScript.handleCertScriptHelp)(req, res, reqx, { config: _this6.config });
         });
         this.addRegisterRoutes();
         this.addAccountRoutes();
         this.addKeyspaceCommand({
            key: 'help',
            access: 'debug',
            resultObjectType: 'KeyedArrays',
            sendResult: function () {
               var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee30(req, res, reqx, result) {
                  return regeneratorRuntime.wrap(function _callee30$(_context30) {
                     while (1) {
                        switch (_context30.prev = _context30.next) {
                           case 0:
                              if (_this6.isCliDomain(req)) {
                                 _context30.next = 5;
                                 break;
                              }

                              res.set('Content-Type', 'text/html');
                              res.send((0, _Page2.default)(KeyspaceHelp.render({
                                 config: _this6.config, commandMap: _this6.commandMap,
                                 req: req, reqx: reqx, result: result
                              })));
                              _context30.next = 11;
                              break;

                           case 5:
                              if (!(false && !_this6.isMobile(req))) {
                                 _context30.next = 10;
                                 break;
                              }

                              res.set('Content-Type', 'text/html');
                              res.send(_server2.default.renderToString(_react2.default.createElement(_KeyspaceHelpPage2.default, { reqx: reqx, result: result })));
                              _context30.next = 11;
                              break;

                           case 10:
                              return _context30.abrupt('return', Object.assign(lodash.omit(result, 'description'), { commands: result.commands.map(function (command) {
                                    if (lodash.isEmpty(command.params)) {
                                       if (command.description) {
                                          return command.key;
                                       } else {
                                          return command.key;
                                       }
                                    } else {
                                       return [command.key].concat(command.params.map(function (param) {
                                          return ':' + param;
                                       })).join('/');
                                    }
                                 }) }));

                           case 11:
                           case 'end':
                              return _context30.stop();
                        }
                     }
                  }, _callee30, _this6);
               }));

               function sendResult(_x54, _x55, _x56, _x57) {
                  return ref.apply(this, arguments);
               }

               return sendResult;
            }(),
            handleReq: function () {
               var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee31(req, res, reqx) {
                  var _req$params3, account, keyspace, hostUrl, message, commandReferenceMessage, customCommandHeading, description, exampleParams, customExampleParams, exampleUrls;

                  return regeneratorRuntime.wrap(function _callee31$(_context31) {
                     while (1) {
                        switch (_context31.prev = _context31.next) {
                           case 0:
                              _req$params3 = req.params;
                              account = _req$params3.account;
                              keyspace = _req$params3.keyspace;
                              hostUrl = _this6.config.hostUrl;

                              if (_this6.config.hostDomain !== 'localhost') {
                                 hostUrl = 'https://' + req.hostname;
                              }
                              _this6.logger.ndebug('help', req.params, _this6.commands.map(function (command) {
                                 return command.key;
                              }).join('/'));
                              message = Switch.on('Welcome to this keyspace', [reqx.account === 'hub', ['Welcome to this ephemeral keyspace.'].join(' ')], [reqx.account, ['Welcome to your account keyspace'].join(' ')]);
                              commandReferenceMessage = 'Read the Redis.io docs for the following commands';
                              customCommandHeading = 'Custom commands';
                              description = ['You can set, get and add data to sets, lists, zsets, hashes etc.', 'Try click the example URLs below.', 'Also edit the URL in the location bar to try other combinations.', 'Click anywhere on the iconized header bar to navigate back.'];

                              if (false && _this6.isSecureDomain(req)) {
                                 description.push('When reading keys, you can also try changing the subdomain to \'replica.\'');
                              }
                              description.push('<i>(A client-side command completion tool will come later. This is an MVP without any such bells and whistles yet.)</i>');
                              description = description.join(' ');
                              exampleParams = [['ttls'], ['types'], ['set', 'mykey1/myvalue'], ['get', 'mykey1'], ['sadd', 'myset1/myvalue'], ['smembers', 'myset1'], ['lpush', 'mylist1/myvalue1'], ['lpushx', 'mylist1/myvalue2'], ['rpop', 'mylist1'], ['lrange', 'mylist1/0/10'], ['lrevrange', 'mylist1/0/10'], ['lrange', 'mylist1/-10/-1'], ['hset', 'myhashes1/field1/value1'], ['hsetnx', 'myhashes1/field2/value2'], ['hgetall', 'myhashes1'], ['zadd', 'myzset1/10/member10'], ['zadd', 'myzset1/20/member20'], ['zrange', 'myzset1/0/-1'], ['zrevrange', 'myzset1/0/-1']];
                              customExampleParams = [['set-json-query', 'myobject1?name=myname&id=12346'], ['get-json', 'myobject1']];
                              exampleUrls = exampleParams.map(function (params) {
                                 var key = params.shift();
                                 var url = hostUrl + '/ak/' + account + '/' + keyspace + '/' + key;
                                 if (params) {
                                    url += '/' + params;
                                 }
                                 return url;
                              });
                              return _context31.abrupt('return', { message: message, commandReferenceMessage: commandReferenceMessage, customCommandHeading: customCommandHeading, description: description, exampleUrls: exampleUrls,
                                 commands: _this6.commands,
                                 keyspaceCommands: _this6.listCommands('keyspace')
                              });

                           case 17:
                           case 'end':
                              return _context31.stop();
                        }
                     }
                  }, _callee31, _this6);
               }));

               function handleReq(_x58, _x59, _x60) {
                  return ref.apply(this, arguments);
               }

               return handleReq;
            }()
         });
         this.addKeyspaceCommand({
            key: 'create-keyspace',
            access: 'admin'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee32(req, res, reqx) {
               var command, time, account, keyspace, certDigest, certRole, role, _ref25, _ref26, sadd, accountExpire, hlen, _ref27, _ref28, keyspaceId, expire, _ref29, _ref30, hmset;

               return regeneratorRuntime.wrap(function _callee32$(_context32) {
                  while (1) {
                     switch (_context32.prev = _context32.next) {
                        case 0:
                           command = reqx.command;
                           time = reqx.time;
                           account = reqx.account;
                           keyspace = reqx.keyspace;
                           certDigest = reqx.certDigest;
                           certRole = reqx.certRole;
                           role = req.query.role || 'admin';

                           if (!(role !== certRole)) {
                              _context32.next = 9;
                              break;
                           }

                           throw new ValidationError({
                              status: 400,
                              message: 'Cert Role (OU=' + certRole + ') mismatch (' + role + ')'
                           });

                        case 9:
                           _this6.logger.debug('command', command.key, account, role);
                           _context32.next = 12;
                           return _this6.redis.multiExecAsync(function (multi) {
                              multi.sadd(_this6.accountKey(account, 'keyspaces'), keyspace);
                              multi.hget(_this6.accountKey(account), 'expire');
                              multi.hlen(_this6.accountKeyspace(account, keyspace));
                           });

                        case 12:
                           _ref25 = _context32.sent;
                           _ref26 = _slicedToArray(_ref25, 3);
                           sadd = _ref26[0];
                           accountExpire = _ref26[1];
                           hlen = _ref26[2];

                           if (sadd) {
                              _context32.next = 19;
                              break;
                           }

                           throw new ValidationError({
                              status: 400,
                              message: 'Keyspace already exists',
                              hint: _this6.hints.routes
                           });

                        case 19:
                           if (!hlen) {
                              _context32.next = 21;
                              break;
                           }

                           throw new ValidationError({
                              status: 400,
                              message: 'Keyspace already exists (hlen)',
                              hint: _this6.hints.routes
                           });

                        case 21:
                           _context32.next = 23;
                           return _this6.redis.multiExecAsync(function (multi) {
                              multi.incr(_this6.adminKey('keyspaces:seq'));
                           });

                        case 23:
                           _ref27 = _context32.sent;
                           _ref28 = _slicedToArray(_ref27, 1);
                           keyspaceId = _ref28[0];
                           expire = Seconds.parse(req.query.expire) || _this6.config.keyspaceExpire;

                           if (!(req.query && req.query.expire)) {
                              _context32.next = 35;
                              break;
                           }

                           if (!(expire < 10)) {
                              _context32.next = 30;
                              break;
                           }

                           throw new ValidationError('Keyspace expiry must be greater than 10 seconds');

                        case 30:
                           if (!(expire > _this6.config.keyspaceExpire)) {
                              _context32.next = 33;
                              break;
                           }

                           if (!(certRole !== 'admin')) {
                              _context32.next = 33;
                              break;
                           }

                           throw new ValidationError('Keyspace expiry must be less than ' + Seconds.toDays(_this6.config.keyspaceExpire) + ' days for cert role ' + certRole);

                        case 33:
                           if (!(expire > accountExpire)) {
                              _context32.next = 35;
                              break;
                           }

                           throw new ValidationError('Keyspace expiry must be less than ' + Seconds.toDays(accountExpire) + ' days for this account');

                        case 35:
                           _context32.next = 37;
                           return _this6.redis.multiExecAsync(function (multi) {
                              multi.hmset(_this6.accountKey(account, keyspace), {
                                 expire: expire, role: role, registered: time
                              });
                           });

                        case 37:
                           _ref29 = _context32.sent;
                           _ref30 = _slicedToArray(_ref29, 1);
                           hmset = _ref30[0];

                           if (!(hmset !== 'OK')) {
                              _context32.next = 42;
                              break;
                           }

                           throw ValidationError({
                              message: 'Failed to register keyspace'
                           });

                        case 42:
                           _context32.next = 44;
                           return _this6.sendTelegramAlert(account, 'html', ['Registered new keyspace <code>' + keyspace + '</code>']);

                        case 44:
                           return _context32.abrupt('return', 'OK');

                        case 45:
                        case 'end':
                           return _context32.stop();
                     }
                  }
               }, _callee32, _this6);
            }));
            return function (_x61, _x62, _x63) {
               return ref.apply(this, arguments);
            };
         }());
         this.addAccountCommand({
            key: 'keyspaces',
            params: ['account'],
            description: 'list account keyspaces',
            relatedCommands: ['create-keyspace'],
            dangerousRelatedCommands: ['destroy-keyspace'],
            renderHtmlEach: function renderHtmlEach(req, res, reqx, keyspace) {
               _this6.logger.debug('renderHtmlEach', keyspace);
               return '<a href="/ak/' + reqx.account + '/' + keyspace + '/help">' + keyspace + '</a>';
            },
            access: 'admin'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee33(req, res, reqx) {
               var _ref31, _ref32, keyspaces;

               return regeneratorRuntime.wrap(function _callee33$(_context33) {
                  while (1) {
                     switch (_context33.prev = _context33.next) {
                        case 0:
                           _this6.logger.debug('keyspaces', reqx.command.key, reqx.account, _this6.accountKey(reqx.account, 'keyspaces'));
                           _context33.next = 3;
                           return _this6.redis.multiExecAsync(function (multi) {
                              multi.smembers(_this6.accountKey(reqx.account, 'keyspaces'));
                           });

                        case 3:
                           _ref31 = _context33.sent;
                           _ref32 = _slicedToArray(_ref31, 1);
                           keyspaces = _ref32[0];

                           if (keyspaces) {
                              keyspaces.sort();
                           }
                           return _context33.abrupt('return', keyspaces);

                        case 8:
                        case 'end':
                           return _context33.stop();
                     }
                  }
               }, _callee33, _this6);
            }));
            return function (_x64, _x65, _x66) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'set-keyspace-access',
            params: ['access'],
            relatedCommands: ['ttls'],
            access: 'admin'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee34(req, res, _ref33, multi) {
               var account = _ref33.account;
               var keyspace = _ref33.keyspace;
               var accountKeyspace = _ref33.accountKeyspace;
               var publishedSetKey, virtualKeys;
               return regeneratorRuntime.wrap(function _callee34$(_context34) {
                  while (1) {
                     switch (_context34.prev = _context34.next) {
                        case 0:
                           _this6.logger.debug('access params', accountKeyspace, req.params);

                           if (lodash.includes(AccessKeys, req.params.access)) {
                              _context34.next = 3;
                              break;
                           }

                           throw new ValidationError('Invalid access key. Must be one of: ' + AccessKeys.join(', '));

                        case 3:
                           publishedSetKey = _this6.accountKeyspace(account, keyspace, 'published-keys');

                           if (!(req.params.access === 'open')) {
                              _context34.next = 12;
                              break;
                           }

                           multi.sadd(_this6.accountKey(account, 'open-keyspaces'), keyspace);
                           _context34.next = 8;
                           return _this6.scanVirtualKeys(account, keyspace, '*', 999);

                        case 8:
                           virtualKeys = _context34.sent;

                           virtualKeys.forEach(function (key) {
                              return multi.sadd(publishedSetKey, key);
                           });
                           _context34.next = 14;
                           break;

                        case 12:
                           multi.srem(_this6.accountKey(account, 'open-keyspaces'), keyspace);
                           multi.del(publishedSetKey);

                        case 14:
                           _context34.next = 16;
                           return _this6.redis.hsetAsync(accountKeyspace, 'access', req.params.access);

                        case 16:
                           return _context34.abrupt('return', _context34.sent);

                        case 17:
                        case 'end':
                           return _context34.stop();
                     }
                  }
               }, _callee34, _this6);
            }));
            return function (_x67, _x68, _x69, _x70) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'destroy-keyspace',
            access: 'admin'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee35(req, res, _ref34) {
               var account = _ref34.account;
               var keyspace = _ref34.keyspace;
               var accountKey = _ref34.accountKey;
               var keyspaceKey = _ref34.keyspaceKey;

               var _ref35, _ref36, keys, _ref37, _ref38, keyspaces, keyIndex, multiReply;

               return regeneratorRuntime.wrap(function _callee35$(_context35) {
                  while (1) {
                     switch (_context35.prev = _context35.next) {
                        case 0:
                           _context35.next = 2;
                           return _this6.redis.multiExecAsync(function (multi) {
                              multi.keys(_this6.keyspaceKey(account, keyspace, '*'));
                           });

                        case 2:
                           _ref35 = _context35.sent;
                           _ref36 = _slicedToArray(_ref35, 1);
                           keys = _ref36[0];
                           _context35.next = 7;
                           return _this6.redis.multiExecAsync(function (multi) {
                              multi.smembers(_this6.accountKey(account, 'keyspaces'));
                           });

                        case 7:
                           _ref37 = _context35.sent;
                           _ref38 = _slicedToArray(_ref37, 1);
                           keyspaces = _ref38[0];

                           _this6.logger.info('destroy-keyspace', keyspace, keys.length, keyspaces);
                           keyIndex = _this6.keyIndex(account, keyspace);
                           _context35.next = 14;
                           return _this6.redis.multiExecAsync(function (multi) {
                              keys.forEach(function (key) {
                                 return multi.del(key);
                              });
                              multi.del(_this6.accountKey(account, 'keyspaces'), keyspace);
                              //multi.del(this.accountKey(account, 'certs'));
                              //multi.del(accountKey);
                           });

                        case 14:
                           multiReply = _context35.sent;
                           return _context35.abrupt('return', keys.map(function (key) {
                              return key.substring(keyIndex);
                           }));

                        case 16:
                        case 'end':
                           return _context35.stop();
                     }
                  }
               }, _callee35, _this6);
            }));
            return function (_x71, _x72, _x73) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'flush',
            access: 'admin'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee36(req, res) {
               var _req$params4, account, keyspace, keys, keyIndex, multi, multiReply;

               return regeneratorRuntime.wrap(function _callee36$(_context36) {
                  while (1) {
                     switch (_context36.prev = _context36.next) {
                        case 0:
                           _req$params4 = req.params;
                           account = _req$params4.account;
                           keyspace = _req$params4.keyspace;
                           _context36.next = 5;
                           return _this6.redis.keysAsync(_this6.keyspaceKey(account, keyspace, '*'));

                        case 5:
                           keys = _context36.sent;
                           keyIndex = _this6.keyIndex(account, keyspace);
                           multi = _this6.redis.multi();

                           keys.forEach(function (key) {
                              return multi.del(key);
                           });
                           _context36.next = 11;
                           return multi.execAsync();

                        case 11:
                           multiReply = _context36.sent;
                           return _context36.abrupt('return', keys.map(function (key) {
                              return key.substring(keyIndex);
                           }));

                        case 13:
                        case 'end':
                           return _context36.stop();
                     }
                  }
               }, _callee36, _this6);
            }));
            return function (_x74, _x75) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'get-keyspace-info',
            access: 'debug',
            description: 'show admin info for this keyspace'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee37(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee37$(_context37) {
                  while (1) {
                     switch (_context37.prev = _context37.next) {
                        case 0:
                           _this6.logger.debug('get-keyspace-info', reqx.accountKeyspace);
                           _context37.next = 3;
                           return _this6.redis.hgetallAsync(reqx.accountKeyspace);

                        case 3:
                           return _context37.abrupt('return', _context37.sent);

                        case 4:
                        case 'end':
                           return _context37.stop();
                     }
                  }
               }, _callee37, _this6);
            }));
            return function (_x76, _x77, _x78) {
               return ref.apply(this, arguments);
            };
         }());
         this.addAccountCommand({
            key: 'get-account-info',
            access: 'debug',
            description: 'show admin info for this keyspace',
            relatedCommands: ['keyspaces']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee38(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee38$(_context38) {
                  while (1) {
                     switch (_context38.prev = _context38.next) {
                        case 0:
                           _context38.next = 2;
                           return _this6.redis.hgetallAsync(reqx.accountKey);

                        case 2:
                           return _context38.abrupt('return', _context38.sent);

                        case 3:
                        case 'end':
                           return _context38.stop();
                     }
                  }
               }, _callee38, _this6);
            }));
            return function (_x79, _x80, _x81) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'keys',
            access: 'debug',
            description: 'show keys in this keyspace',
            relatedCommands: ['ttls', 'types']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee39(req, res, reqx) {
               var account, keyspace, keys, keyIndex;
               return regeneratorRuntime.wrap(function _callee39$(_context39) {
                  while (1) {
                     switch (_context39.prev = _context39.next) {
                        case 0:
                           account = reqx.account;
                           keyspace = reqx.keyspace;
                           _context39.next = 4;
                           return _this6.redis.keysAsync(_this6.keyspaceKey(account, keyspace, '*'));

                        case 4:
                           keys = _context39.sent;
                           keyIndex = _this6.keyIndex(account, keyspace);
                           return _context39.abrupt('return', keys.map(function (key) {
                              return key.substring(keyIndex);
                           }));

                        case 7:
                        case 'end':
                           return _context39.stop();
                     }
                  }
               }, _callee39, _this6);
            }));
            return function (_x82, _x83, _x84) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'types',
            access: 'debug',
            description: 'view all key types in this keyspace',
            relatedCommands: ['ttls']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee40(req, res, reqx) {
               var account, keyspace, keys, keyIndex, multi, results, result;
               return regeneratorRuntime.wrap(function _callee40$(_context40) {
                  while (1) {
                     switch (_context40.prev = _context40.next) {
                        case 0:
                           account = reqx.account;
                           keyspace = reqx.keyspace;
                           _context40.next = 4;
                           return _this6.redis.keysAsync(_this6.keyspaceKey(account, keyspace, '*'));

                        case 4:
                           keys = _context40.sent;

                           _this6.logger.debug('ttl ak', account, keyspace, keys);
                           keyIndex = _this6.keyIndex(account, keyspace);
                           multi = _this6.redis.multi();

                           keys.forEach(function (key) {
                              return multi.type(key);
                           });
                           _context40.next = 11;
                           return multi.execAsync();

                        case 11:
                           results = _context40.sent;
                           result = {};

                           keys.forEach(function (key, index) {
                              return result[key.substring(keyIndex)] = results[index];
                           });
                           return _context40.abrupt('return', result);

                        case 15:
                        case 'end':
                           return _context40.stop();
                     }
                  }
               }, _callee40, _this6);
            }));
            return function (_x85, _x86, _x87) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'values',
            access: 'debug',
            description: 'view all key values in this keyspace',
            relatedCommands: ['ttls', 'keys']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee41(req, res, reqx) {
               var account, keyspace, keys, keyIndex, multi, types, result, multiValues, values;
               return regeneratorRuntime.wrap(function _callee41$(_context41) {
                  while (1) {
                     switch (_context41.prev = _context41.next) {
                        case 0:
                           account = reqx.account;
                           keyspace = reqx.keyspace;
                           _context41.next = 4;
                           return _this6.redis.keysAsync(_this6.keyspaceKey(account, keyspace, '*'));

                        case 4:
                           keys = _context41.sent;

                           _this6.logger.debug('ttl ak', account, keyspace, keys);
                           keyIndex = _this6.keyIndex(account, keyspace);
                           multi = _this6.redis.multi();

                           keys.forEach(function (key) {
                              return multi.type(key);
                           });
                           _context41.next = 11;
                           return multi.execAsync();

                        case 11:
                           types = _context41.sent;
                           result = {};
                           multiValues = _this6.redis.multi();

                           keys.forEach(function (key, index) {
                              var type = types[index];
                              if (type === 'string') {
                                 multiValues.get(key);
                              } else if (type === 'hash') {
                                 multiValues.hkeys(key);
                              } else if (type === 'set') {
                                 multiValues.smembers(key);
                              } else if (type === 'zset') {
                                 multiValues.type(key);
                              } else {
                                 multiValues.type(key);
                              }
                           });
                           _context41.next = 17;
                           return multiValues.execAsync();

                        case 17:
                           values = _context41.sent;

                           values = values.map(function (value, index) {
                              var type = types[index];
                              if (type !== 'string' && typeof value !== 'string' && lodash.isArray(value)) {
                                 return value.join(', ');
                              } else {
                                 return value;
                              }
                           });
                           keys.forEach(function (key, index) {
                              return result[key.substring(keyIndex)] = values[index];
                           });
                           return _context41.abrupt('return', result);

                        case 21:
                        case 'end':
                           return _context41.stop();
                     }
                  }
               }, _callee41, _this6);
            }));
            return function (_x88, _x89, _x90) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'ttls',
            access: 'debug',
            description: 'view all TTLs in this keyspace',
            relatedCommands: ['keyspaces', 'keys', 'values', 'types']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee42(req, res, reqx) {
               var account, keyspace, keys, keyIndex, multi, results, result;
               return regeneratorRuntime.wrap(function _callee42$(_context42) {
                  while (1) {
                     switch (_context42.prev = _context42.next) {
                        case 0:
                           account = reqx.account;
                           keyspace = reqx.keyspace;
                           _context42.next = 4;
                           return _this6.redis.keysAsync(_this6.keyspaceKey(account, keyspace, '*'));

                        case 4:
                           keys = _context42.sent;

                           _this6.logger.debug('ttl ak', account, keyspace, keys);
                           keyIndex = _this6.keyIndex(account, keyspace);
                           multi = _this6.redis.multi();

                           keys.forEach(function (key) {
                              return multi.ttl(key);
                           });
                           _context42.next = 11;
                           return multi.execAsync();

                        case 11:
                           results = _context42.sent;
                           result = {};

                           keys.forEach(function (key, index) {
                              return result[key.substring(keyIndex)] = results[index];
                           });
                           return _context42.abrupt('return', result);

                        case 15:
                        case 'end':
                           return _context42.stop();
                     }
                  }
               }, _callee42, _this6);
            }));
            return function (_x91, _x92, _x93) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'ttl',
            params: ['key'],
            access: 'debug',
            description: 'check the key TTL',
            relatedCommands: ['type']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee43(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee43$(_context43) {
                  while (1) {
                     switch (_context43.prev = _context43.next) {
                        case 0:
                           _context43.next = 2;
                           return _this6.redis.ttlAsync(reqx.keyspaceKey);

                        case 2:
                           return _context43.abrupt('return', _context43.sent);

                        case 3:
                        case 'end':
                           return _context43.stop();
                     }
                  }
               }, _callee43, _this6);
            }));
            return function (_x94, _x95, _x96) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'type',
            params: ['key'],
            access: 'debug',
            description: 'check the type of a key',
            relatedCommands: ['ttl']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee44(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee44$(_context44) {
                  while (1) {
                     switch (_context44.prev = _context44.next) {
                        case 0:
                           _context44.next = 2;
                           return _this6.redis.typeAsync(reqx.keyspaceKey);

                        case 2:
                           return _context44.abrupt('return', _context44.sent);

                        case 3:
                        case 'end':
                           return _context44.stop();
                     }
                  }
               }, _callee44, _this6);
            }));
            return function (_x97, _x98, _x99) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'set-encrypt',
            params: ['key', 'value'],
            access: 'set',
            description: 'set the string value of a key, encrypting using client cert'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee45(req, res, _ref39) {
               var keyspaceKey = _ref39.keyspaceKey;

               var _req$params5, key, value, cert, encrypted, reply;

               return regeneratorRuntime.wrap(function _callee45$(_context45) {
                  while (1) {
                     switch (_context45.prev = _context45.next) {
                        case 0:
                           _req$params5 = req.params;
                           key = _req$params5.key;
                           value = _req$params5.value;
                           cert = req.get('ssl_client_cert');

                           if (cert) {
                              _context45.next = 6;
                              break;
                           }

                           throw new ValidationError({
                              status: 403,
                              message: 'No client cert',
                              hint: _this6.hints.signup
                           });

                        case 6:
                           cert = cert.replace(/\t/g, '\n');
                           encrypted = _crypto2.default.publicEncrypt(cert, new Buffer(value)).toString('base64');
                           _context45.next = 10;
                           return _this6.redis.setAsync(keyspaceKey, encrypted);

                        case 10:
                           reply = _context45.sent;
                           return _context45.abrupt('return', { key: key, encrypted: encrypted, reply: reply });

                        case 12:
                        case 'end':
                           return _context45.stop();
                     }
                  }
               }, _callee45, _this6);
            }));
            return function (_x100, _x101, _x102) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'set',
            params: ['key', 'value'],
            access: 'set',
            description: 'set the string value of a key',
            relatedCommands: ['get', 'ttl', 'del']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee46(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee46$(_context46) {
                  while (1) {
                     switch (_context46.prev = _context46.next) {
                        case 0:
                           _context46.next = 2;
                           return _this6.redis.setAsync(reqx.keyspaceKey, req.params.value);

                        case 2:
                           return _context46.abrupt('return', _context46.sent);

                        case 3:
                        case 'end':
                           return _context46.stop();
                     }
                  }
               }, _callee46, _this6);
            }));
            return function (_x103, _x104, _x105) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'set-json-object',
            description: 'set JSON via URL encoded object',
            params: ['key', 'value'],
            access: 'set',
            relatedCommands: ['get-json']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee47(req, res, reqx) {
               var string;
               return regeneratorRuntime.wrap(function _callee47$(_context47) {
                  while (1) {
                     switch (_context47.prev = _context47.next) {
                        case 0:
                           string = req.params.value;

                           if (/^\w/.test(req.params.value)) {
                              string = ['{', req.params.value, '}'].join('');
                              string = string.replace(/(\W)(\w+):/g, '$1"$2":');
                           }
                           _context47.next = 4;
                           return _this6.redis.setAsync(reqx.keyspaceKey, string);

                        case 4:
                           return _context47.abrupt('return', _context47.sent);

                        case 5:
                        case 'end':
                           return _context47.stop();
                     }
                  }
               }, _callee47, _this6);
            }));
            return function (_x106, _x107, _x108) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'set-json-query',
            params: ['key'],
            access: 'set',
            description: 'set JSON via URL query',
            relatedCommands: ['get-json']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee48(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee48$(_context48) {
                  while (1) {
                     switch (_context48.prev = _context48.next) {
                        case 0:
                           _context48.next = 2;
                           return _this6.redis.setAsync(reqx.keyspaceKey, JSON.stringify(req.query));

                        case 2:
                           return _context48.abrupt('return', _context48.sent);

                        case 3:
                        case 'end':
                           return _context48.stop();
                     }
                  }
               }, _callee48, _this6);
            }));
            return function (_x109, _x110, _x111) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'setex',
            params: ['key', 'seconds', 'value'],
            access: 'set',
            description: 'set the value and expiration of a key',
            relatedCommands: ['get', 'ttl']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee49(req, res, reqx) {
               var _req$params6, seconds, value;

               return regeneratorRuntime.wrap(function _callee49$(_context49) {
                  while (1) {
                     switch (_context49.prev = _context49.next) {
                        case 0:
                           _req$params6 = req.params;
                           seconds = _req$params6.seconds;
                           value = _req$params6.value;
                           _context49.next = 5;
                           return _this6.redis.setexAsync(reqx.keyspaceKey, seconds, value);

                        case 5:
                           return _context49.abrupt('return', _context49.sent);

                        case 6:
                        case 'end':
                           return _context49.stop();
                     }
                  }
               }, _callee49, _this6);
            }));
            return function (_x112, _x113, _x114) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'setnx',
            params: ['key', 'value'],
            access: 'add',
            description: 'set the value of a key if it does not exist',
            relatedCommands: ['set', 'get', 'ttl']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee50(req, res, _ref40) {
               var keyspaceKey = _ref40.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee50$(_context50) {
                  while (1) {
                     switch (_context50.prev = _context50.next) {
                        case 0:
                           _context50.next = 2;
                           return _this6.redis.setnxAsync(keyspaceKey, req.params.value);

                        case 2:
                           return _context50.abrupt('return', _context50.sent);

                        case 3:
                        case 'end':
                           return _context50.stop();
                     }
                  }
               }, _callee50, _this6);
            }));
            return function (_x115, _x116, _x117) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'get',
            params: ['key'],
            description: 'get the value you have set',
            relatedCommands: ['ttl']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee51(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee51$(_context51) {
                  while (1) {
                     switch (_context51.prev = _context51.next) {
                        case 0:
                           _context51.next = 2;
                           return _this6.redis.getAsync(reqx.keyspaceKey);

                        case 2:
                           return _context51.abrupt('return', _context51.sent);

                        case 3:
                        case 'end':
                           return _context51.stop();
                     }
                  }
               }, _callee51, _this6);
            }));
            return function (_x118, _x119, _x120) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'get-json',
            params: ['key'],
            description: 'get the JSON value you have set',
            relatedCommands: ['ttl']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee52(req, res, reqx) {
               var key, keyspaceKey, value;
               return regeneratorRuntime.wrap(function _callee52$(_context52) {
                  while (1) {
                     switch (_context52.prev = _context52.next) {
                        case 0:
                           key = reqx.key;
                           keyspaceKey = reqx.keyspaceKey;
                           _context52.next = 4;
                           return _this6.redis.getAsync(keyspaceKey);

                        case 4:
                           value = _context52.sent;

                           _this6.logger.info('get-json', typeof value === 'undefined' ? 'undefined' : _typeof(value), value);

                           if (!value) {
                              _context52.next = 14;
                              break;
                           }

                           if (!true) {
                              _context52.next = 11;
                              break;
                           }

                           return _context52.abrupt('return', JSON.parse(value));

                        case 11:
                           res.json(JSON.parse(value));

                        case 12:
                           _context52.next = 19;
                           break;

                        case 14:
                           if (!false) {
                              _context52.next = 18;
                              break;
                           }

                           _this6.sendStatusMessage(req, res, 404, 'Not found: ' + key);
                           _context52.next = 19;
                           break;

                        case 18:
                           return _context52.abrupt('return', JSON.parse(null));

                        case 19:
                        case 'end':
                           return _context52.stop();
                     }
                  }
               }, _callee52, _this6);
            }));
            return function (_x121, _x122, _x123) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'incr',
            params: ['key'],
            access: 'add',
            description: 'increment the integer value of a key',
            relatedCommands: ['get', 'incrby']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee53(req, res, _ref41) {
               var keyspaceKey = _ref41.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee53$(_context53) {
                  while (1) {
                     switch (_context53.prev = _context53.next) {
                        case 0:
                           _context53.next = 2;
                           return _this6.redis.incrAsync(keyspaceKey);

                        case 2:
                           return _context53.abrupt('return', _context53.sent);

                        case 3:
                        case 'end':
                           return _context53.stop();
                     }
                  }
               }, _callee53, _this6);
            }));
            return function (_x124, _x125, _x126) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'incrby',
            params: ['key', 'increment'],
            access: 'add',
            description: 'increment the integer value of a key by the given amount',
            relatedCommands: ['get', 'incr']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee54(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee54$(_context54) {
                  while (1) {
                     switch (_context54.prev = _context54.next) {
                        case 0:
                           _context54.next = 2;
                           return _this6.redis.incrbyAsync(reqx.keyspaceKey, req.params.increment);

                        case 2:
                           return _context54.abrupt('return', _context54.sent);

                        case 3:
                        case 'end':
                           return _context54.stop();
                     }
                  }
               }, _callee54, _this6);
            }));
            return function (_x127, _x128, _x129) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'exists',
            params: ['key'],
            description: 'check if a key exists in the keyspace',
            relatedCommands: ['get']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee55(req, res, _ref42) {
               var keyspaceKey = _ref42.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee55$(_context55) {
                  while (1) {
                     switch (_context55.prev = _context55.next) {
                        case 0:
                           _context55.next = 2;
                           return _this6.redis.existsAsync(keyspaceKey);

                        case 2:
                           return _context55.abrupt('return', _context55.sent);

                        case 3:
                        case 'end':
                           return _context55.stop();
                     }
                  }
               }, _callee55, _this6);
            }));
            return function (_x130, _x131, _x132) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'del',
            params: ['key'],
            access: 'set',
            description: 'delete a key from the keyspace',
            relatedCommands: ['get', 'ttl']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee56(req, res, _ref43) {
               var keyspaceKey = _ref43.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee56$(_context56) {
                  while (1) {
                     switch (_context56.prev = _context56.next) {
                        case 0:
                           _context56.next = 2;
                           return _this6.redis.delAsync(keyspaceKey);

                        case 2:
                           return _context56.abrupt('return', _context56.sent);

                        case 3:
                        case 'end':
                           return _context56.stop();
                     }
                  }
               }, _callee56, _this6);
            }));
            return function (_x133, _x134, _x135) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'sadd',
            params: ['key', 'member'],
            access: 'add',
            description: 'add a member to the list',
            relatedCommands: ['sismember', 'scard', 'type', 'ttl']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee57(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee57$(_context57) {
                  while (1) {
                     switch (_context57.prev = _context57.next) {
                        case 0:
                           _context57.next = 2;
                           return _this6.redis.saddAsync(reqx.keyspaceKey, req.params.member);

                        case 2:
                           return _context57.abrupt('return', _context57.sent);

                        case 3:
                        case 'end':
                           return _context57.stop();
                     }
                  }
               }, _callee57, _this6);
            }));
            return function (_x136, _x137, _x138) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'srem',
            params: ['key', 'member'],
            access: 'set',
            description: 'remove an element from the set',
            relatedCommands: ['sadd']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee58(req, res, _ref44) {
               var keyspaceKey = _ref44.keyspaceKey;
               return regeneratorRuntime.wrap(function _callee58$(_context58) {
                  while (1) {
                     switch (_context58.prev = _context58.next) {
                        case 0:
                           _context58.next = 2;
                           return _this6.redis.sremAsync(keyspaceKey, req.params.member);

                        case 2:
                           return _context58.abrupt('return', _context58.sent);

                        case 3:
                        case 'end':
                           return _context58.stop();
                     }
                  }
               }, _callee58, _this6);
            }));
            return function (_x139, _x140, _x141) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'smove',
            params: ['key', 'dest', 'member'],
            access: 'set'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee59(req, res, _ref45, multi) {
               var account = _ref45.account;
               var keyspace = _ref45.keyspace;
               var keyspaceKey = _ref45.keyspaceKey;

               var _req$params7, dest, member, destKey, result;

               return regeneratorRuntime.wrap(function _callee59$(_context59) {
                  while (1) {
                     switch (_context59.prev = _context59.next) {
                        case 0:
                           _req$params7 = req.params;
                           dest = _req$params7.dest;
                           member = _req$params7.member;
                           destKey = _this6.keyspaceKey(account, keyspace, dest);
                           _context59.next = 6;
                           return _this6.redis.smoveAsync(keyspaceKey, destKey, member);

                        case 6:
                           result = _context59.sent;

                           multi.expire(destKey, _this6.getKeyExpire(account));
                           return _context59.abrupt('return', result);

                        case 9:
                        case 'end':
                           return _context59.stop();
                     }
                  }
               }, _callee59, _this6);
            }));
            return function (_x142, _x143, _x144, _x145) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'spop',
            params: ['key'],
            access: 'set',
            description: 'remove and return a random member of the set',
            relatedCommands: ['sadd']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee60(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee60$(_context60) {
                  while (1) {
                     switch (_context60.prev = _context60.next) {
                        case 0:
                           _context60.next = 2;
                           return _this6.redis.spopAsync(reqx.keyspaceKey);

                        case 2:
                           return _context60.abrupt('return', _context60.sent);

                        case 3:
                        case 'end':
                           return _context60.stop();
                     }
                  }
               }, _callee60, _this6);
            }));
            return function (_x146, _x147, _x148) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'smembers',
            params: ['key'],
            description: 'get the members of your set',
            relatedCommands: ['scard']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee61(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee61$(_context61) {
                  while (1) {
                     switch (_context61.prev = _context61.next) {
                        case 0:
                           _context61.next = 2;
                           return _this6.redis.smembersAsync(reqx.keyspaceKey);

                        case 2:
                           return _context61.abrupt('return', _context61.sent);

                        case 3:
                        case 'end':
                           return _context61.stop();
                     }
                  }
               }, _callee61, _this6);
            }));
            return function (_x149, _x150, _x151) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'sismember',
            params: ['key', 'member'],
            description: 'check that the value exists in your set',
            relatedCommands: ['smembers']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee62(req, res, reqx) {
               var reply;
               return regeneratorRuntime.wrap(function _callee62$(_context62) {
                  while (1) {
                     switch (_context62.prev = _context62.next) {
                        case 0:
                           _context62.next = 2;
                           return _this6.redis.sismemberAsync(reqx.keyspaceKey, req.params.member);

                        case 2:
                           reply = _context62.sent;
                           return _context62.abrupt('return', reply);

                        case 4:
                        case 'end':
                           return _context62.stop();
                     }
                  }
               }, _callee62, _this6);
            }));
            return function (_x152, _x153, _x154) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'scard',
            params: ['key'],
            description: 'to get the cardinality of the zset'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee63(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee63$(_context63) {
                  while (1) {
                     switch (_context63.prev = _context63.next) {
                        case 0:
                           _context63.next = 2;
                           return _this6.redis.scardAsync(reqx.keyspaceKey);

                        case 2:
                           return _context63.abrupt('return', _context63.sent);

                        case 3:
                        case 'end':
                           return _context63.stop();
                     }
                  }
               }, _callee63, _this6);
            }));
            return function (_x155, _x156, _x157) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'lpush',
            params: ['key', 'value'],
            access: 'add',
            description: 'prepend a value to the list',
            relatedCommands: ['lpushx', 'llen', 'lrange', 'trim', 'rpop']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee64(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee64$(_context64) {
                  while (1) {
                     switch (_context64.prev = _context64.next) {
                        case 0:
                           _context64.next = 2;
                           return _this6.redis.lpushAsync(reqx.keyspaceKey, req.params.value);

                        case 2:
                           return _context64.abrupt('return', _context64.sent);

                        case 3:
                        case 'end':
                           return _context64.stop();
                     }
                  }
               }, _callee64, _this6);
            }));
            return function (_x158, _x159, _x160) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'lpushx',
            params: ['key', 'value'],
            access: 'add',
            description: 'prepend a value to a list if it exists',
            relatedCommands: ['lpush', 'llen', 'lrange', 'trim', 'rpop']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee65(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee65$(_context65) {
                  while (1) {
                     switch (_context65.prev = _context65.next) {
                        case 0:
                           _context65.next = 2;
                           return _this6.redis.lpushxAsync(reqx.keyspaceKey, req.params.value);

                        case 2:
                           return _context65.abrupt('return', _context65.sent);

                        case 3:
                        case 'end':
                           return _context65.stop();
                     }
                  }
               }, _callee65, _this6);
            }));
            return function (_x161, _x162, _x163) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'lpush-trim',
            params: ['key', 'length', 'value'],
            access: 'set',
            relatedCommands: ['lpush', 'trim']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee66(req, res, _ref46, multi) {
               var keyspaceKey = _ref46.keyspaceKey;

               var _req$params8, value, length;

               return regeneratorRuntime.wrap(function _callee66$(_context66) {
                  while (1) {
                     switch (_context66.prev = _context66.next) {
                        case 0:
                           _req$params8 = req.params;
                           value = _req$params8.value;
                           length = _req$params8.length;

                           multi.lpush(keyspaceKey, value);
                           multi.trim(keyspaceKey, length);

                        case 5:
                        case 'end':
                           return _context66.stop();
                     }
                  }
               }, _callee66, _this6);
            }));
            return function (_x164, _x165, _x166, _x167) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'rpush',
            params: ['key', 'value'],
            rest: true,
            access: 'add',
            description: 'append a value to the list (on the right)',
            relatedCommands: ['lpush']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee67(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee67$(_context67) {
                  while (1) {
                     switch (_context67.prev = _context67.next) {
                        case 0:
                           _context67.next = 2;
                           return _this6.redis.rpushAsync(reqx.keyspaceKey, req.params.value);

                        case 2:
                           return _context67.abrupt('return', _context67.sent);

                        case 3:
                        case 'end':
                           return _context67.stop();
                     }
                  }
               }, _callee67, _this6);
            }));
            return function (_x168, _x169, _x170) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'lpop',
            params: ['key'],
            access: 'set',
            description: 'get and remove the first element in the list',
            relatedCommands: ['lpush']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee68(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee68$(_context68) {
                  while (1) {
                     switch (_context68.prev = _context68.next) {
                        case 0:
                           _context68.next = 2;
                           return _this6.redis.lpopAsync(reqx.keyspaceKey);

                        case 2:
                           return _context68.abrupt('return', _context68.sent);

                        case 3:
                        case 'end':
                           return _context68.stop();
                     }
                  }
               }, _callee68, _this6);
            }));
            return function (_x171, _x172, _x173) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'blpop',
            params: ['key', 'timeout'],
            access: 'set',
            description: 'get and remove the first element of the list (blocking)',
            relatedCommands: ['llen']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee69(req, res, reqx) {
               var reply;
               return regeneratorRuntime.wrap(function _callee69$(_context69) {
                  while (1) {
                     switch (_context69.prev = _context69.next) {
                        case 0:
                           _context69.next = 2;
                           return _this6.redis.blpopAsync(reqx.keyspaceKey, req.params.timeout);

                        case 2:
                           reply = _context69.sent;

                           if (reply) {
                              _context69.next = 7;
                              break;
                           }

                           return _context69.abrupt('return', null);

                        case 7:
                           return _context69.abrupt('return', reply[1]);

                        case 8:
                        case 'end':
                           return _context69.stop();
                     }
                  }
               }, _callee69, _this6);
            }));
            return function (_x174, _x175, _x176) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'rpop',
            params: ['key'],
            access: 'set',
            description: 'get and remove the last element of the list',
            relatedCommands: ['llen']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee70(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee70$(_context70) {
                  while (1) {
                     switch (_context70.prev = _context70.next) {
                        case 0:
                           _context70.next = 2;
                           return _this6.redis.rpopAsync(reqx.keyspaceKey);

                        case 2:
                           return _context70.abrupt('return', _context70.sent);

                        case 3:
                        case 'end':
                           return _context70.stop();
                     }
                  }
               }, _callee70, _this6);
            }));
            return function (_x177, _x178, _x179) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'brpop',
            params: ['key', 'timeout'],
            access: 'set',
            description: 'get and remove the last element of the list (blocking)',
            relatedCommands: ['llen']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee71(req, res, reqx) {
               var reply;
               return regeneratorRuntime.wrap(function _callee71$(_context71) {
                  while (1) {
                     switch (_context71.prev = _context71.next) {
                        case 0:
                           _context71.next = 2;
                           return _this6.redis.brpopAsync(reqx.keyspaceKey, req.params.timeout);

                        case 2:
                           reply = _context71.sent;

                           if (reply) {
                              _context71.next = 7;
                              break;
                           }

                           return _context71.abrupt('return', null);

                        case 7:
                           return _context71.abrupt('return', reply[1]);

                        case 8:
                        case 'end':
                           return _context71.stop();
                     }
                  }
               }, _callee71, _this6);
            }));
            return function (_x180, _x181, _x182) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'brpoplpush',
            params: ['key', 'dest', 'timeout'],
            access: 'set',
            description: 'get and remove the last element of the list and prepend to another',
            relatedCommands: ['llen']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee72(req, res, _ref47, multi) {
               var account = _ref47.account;
               var keyspace = _ref47.keyspace;
               var keyspaceKey = _ref47.keyspaceKey;

               var _req$params9, dest, timeout, destKey, result;

               return regeneratorRuntime.wrap(function _callee72$(_context72) {
                  while (1) {
                     switch (_context72.prev = _context72.next) {
                        case 0:
                           _req$params9 = req.params;
                           dest = _req$params9.dest;
                           timeout = _req$params9.timeout;
                           destKey = _this6.keyspaceKey(account, keyspace, dest);
                           _context72.next = 6;
                           return _this6.redis.brpoplpushAsync(keyspaceKey, destKey, timeout);

                        case 6:
                           result = _context72.sent;

                           multi.expire(destKey, _this6.getKeyExpire(account));
                           return _context72.abrupt('return', result);

                        case 9:
                        case 'end':
                           return _context72.stop();
                     }
                  }
               }, _callee72, _this6);
            }));
            return function (_x183, _x184, _x185, _x186) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'llen',
            params: ['key'],
            description: 'get the number of elements in a list',
            relatedCommands: ['lrange']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee73(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee73$(_context73) {
                  while (1) {
                     switch (_context73.prev = _context73.next) {
                        case 0:
                           _context73.next = 2;
                           return _this6.redis.llenAsync(reqx.keyspaceKey);

                        case 2:
                           return _context73.abrupt('return', _context73.sent);

                        case 3:
                        case 'end':
                           return _context73.stop();
                     }
                  }
               }, _callee73, _this6);
            }));
            return function (_x187, _x188, _x189) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'lindex',
            params: ['key', 'index'],
            exampleKeyParams: {
               index: 1
            },
            description: 'get an element from a list by its index',
            relatedCommands: ['lset', 'lrange']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee74(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee74$(_context74) {
                  while (1) {
                     switch (_context74.prev = _context74.next) {
                        case 0:
                           _context74.next = 2;
                           return _this6.redis.lindexAsync(reqx.keyspaceKey, req.params.index);

                        case 2:
                           return _context74.abrupt('return', _context74.sent);

                        case 3:
                        case 'end':
                           return _context74.stop();
                     }
                  }
               }, _callee74, _this6);
            }));
            return function (_x190, _x191, _x192) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'lrem',
            params: ['key', 'count', 'value'],
            access: 'set',
            description: 'remove elements from the list'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee75(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee75$(_context75) {
                  while (1) {
                     switch (_context75.prev = _context75.next) {
                        case 0:
                           _context75.next = 2;
                           return _this6.redis.lremAsync(reqx.keyspaceKey, req.params.count, req.params.value);

                        case 2:
                           return _context75.abrupt('return', _context75.sent);

                        case 3:
                        case 'end':
                           return _context75.stop();
                     }
                  }
               }, _callee75, _this6);
            }));
            return function (_x193, _x194, _x195) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'lset',
            params: ['key', 'index', 'value'],
            access: 'set',
            description: 'set the value of an element in a list by its index',
            relatedCommands: ['lindex', 'lrange']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee76(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee76$(_context76) {
                  while (1) {
                     switch (_context76.prev = _context76.next) {
                        case 0:
                           _context76.next = 2;
                           return _this6.redis.lsetAsync(reqx.keyspaceKey, req.params.index, req.params.value);

                        case 2:
                           return _context76.abrupt('return', _context76.sent);

                        case 3:
                        case 'end':
                           return _context76.stop();
                     }
                  }
               }, _callee76, _this6);
            }));
            return function (_x196, _x197, _x198) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'ltrim',
            params: ['key', 'start', 'stop'],
            access: 'set',
            description: 'trim the list to the specified range',
            relatedCommands: ['llen']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee77(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee77$(_context77) {
                  while (1) {
                     switch (_context77.prev = _context77.next) {
                        case 0:
                           _context77.next = 2;
                           return _this6.redis.ltrimAsync(reqx.keyspaceKey, req.params.start, req.params.stop);

                        case 2:
                           return _context77.abrupt('return', _context77.sent);

                        case 3:
                        case 'end':
                           return _context77.stop();
                     }
                  }
               }, _callee77, _this6);
            }));
            return function (_x199, _x200, _x201) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'lrange',
            params: ['key', 'start', 'stop'],
            exampleKeyParams: {
               start: 0,
               stop: 10
            },
            description: 'get a range of elements of a list (from the left)',
            relatedCommands: ['lrevrange', 'lindex', 'llen', 'rpop', 'brpoplpush']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee78(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee78$(_context78) {
                  while (1) {
                     switch (_context78.prev = _context78.next) {
                        case 0:
                           _context78.next = 2;
                           return _this6.redis.lrangeAsync(reqx.keyspaceKey, req.params.start, req.params.stop);

                        case 2:
                           return _context78.abrupt('return', _context78.sent);

                        case 3:
                        case 'end':
                           return _context78.stop();
                     }
                  }
               }, _callee78, _this6);
            }));
            return function (_x202, _x203, _x204) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'lrevrange',
            params: ['key', 'start', 'stop'],
            exampleKeyParams: {
               start: 0,
               stop: 10
            },
            description: 'get some elements of your list in reverse order',
            relatedCommands: ['lrange', 'llen']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee79(req, res, reqx) {
               var array;
               return regeneratorRuntime.wrap(function _callee79$(_context79) {
                  while (1) {
                     switch (_context79.prev = _context79.next) {
                        case 0:
                           _context79.next = 2;
                           return _this6.redis.lrangeAsync(reqx.keyspaceKey, req.params.start, req.params.stop);

                        case 2:
                           array = _context79.sent;
                           return _context79.abrupt('return', array.reverse());

                        case 4:
                        case 'end':
                           return _context79.stop();
                     }
                  }
               }, _callee79, _this6);
            }));
            return function (_x205, _x206, _x207) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'rrange',
            params: ['key', 'start', 'stop'],
            exampleKeyParams: {
               start: 0,
               stop: 10
            },
            description: 'get elements from the right of your list',
            relatedCommands: ['rrevrange', 'lrange', 'llen']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee80(req, res, reqx) {
               var array;
               return regeneratorRuntime.wrap(function _callee80$(_context80) {
                  while (1) {
                     switch (_context80.prev = _context80.next) {
                        case 0:
                           if (!(req.params.start < 0)) {
                              _context80.next = 2;
                              break;
                           }

                           throw { message: reqx.command.key + ' start must be zero or greater' };

                        case 2:
                           if (!(req.params.stop < 0)) {
                              _context80.next = 4;
                              break;
                           }

                           throw { message: reqx.command.key + ' stop must be zero or greater' };

                        case 4:
                           _context80.next = 6;
                           return _this6.redis.lrangeAsync(reqx.keyspaceKey, 0 - req.params.stop, 0 - req.params.start - 1);

                        case 6:
                           array = _context80.sent;
                           return _context80.abrupt('return', array.reverse());

                        case 8:
                        case 'end':
                           return _context80.stop();
                     }
                  }
               }, _callee80, _this6);
            }));
            return function (_x208, _x209, _x210) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'rrevrange',
            params: ['key', 'start', 'stop'],
            exampleKeyParams: {
               start: 0,
               stop: 10
            },
            description: 'get elements from the right of your list in reverse order',
            relatedCommands: ['lrange', 'llen']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee81(req, res, reqx) {
               var array;
               return regeneratorRuntime.wrap(function _callee81$(_context81) {
                  while (1) {
                     switch (_context81.prev = _context81.next) {
                        case 0:
                           if (!(req.params.start < 0)) {
                              _context81.next = 2;
                              break;
                           }

                           throw { message: reqx.command.key + ' start must be zero or greater' };

                        case 2:
                           if (!(req.params.stop < 0)) {
                              _context81.next = 4;
                              break;
                           }

                           throw { message: reqx.command.key + ' stop must be zero or greater' };

                        case 4:
                           _context81.next = 6;
                           return _this6.redis.lrangeAsync(reqx.keyspaceKey, 0 - req.params.stop, 0 - req.params.start - 1);

                        case 6:
                           array = _context81.sent;
                           return _context81.abrupt('return', array);

                        case 8:
                        case 'end':
                           return _context81.stop();
                     }
                  }
               }, _callee81, _this6);
            }));
            return function (_x211, _x212, _x213) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'hset',
            params: ['key', 'field', 'value'],
            access: 'set',
            description: 'set the string value of a hash field',
            relatedCommands: ['hget', 'hgetall', 'hkeys', 'hvals', 'type', 'ttl']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee82(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee82$(_context82) {
                  while (1) {
                     switch (_context82.prev = _context82.next) {
                        case 0:
                           _context82.next = 2;
                           return _this6.redis.hsetAsync(reqx.keyspaceKey, req.params.field, req.params.value);

                        case 2:
                           return _context82.abrupt('return', _context82.sent);

                        case 3:
                        case 'end':
                           return _context82.stop();
                     }
                  }
               }, _callee82, _this6);
            }));
            return function (_x214, _x215, _x216) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'hsetnx',
            params: ['key', 'field', 'value'],
            access: 'add',
            description: 'set the string value of a hash field if it does not exist',
            relatedCommands: ['hget', 'hgetall', 'hkeys', 'hvals']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee83(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee83$(_context83) {
                  while (1) {
                     switch (_context83.prev = _context83.next) {
                        case 0:
                           _context83.next = 2;
                           return _this6.redis.hsetnxAsync(reqx.keyspaceKey, req.params.field, req.params.value);

                        case 2:
                           return _context83.abrupt('return', _context83.sent);

                        case 3:
                        case 'end':
                           return _context83.stop();
                     }
                  }
               }, _callee83, _this6);
            }));
            return function (_x217, _x218, _x219) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'hget',
            params: ['key', 'field'],
            description: 'get the contents of a hash field',
            relatedCommands: ['hexists', 'hgetall', 'hkeys', 'hvals']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee84(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee84$(_context84) {
                  while (1) {
                     switch (_context84.prev = _context84.next) {
                        case 0:
                           _context84.next = 2;
                           return _this6.redis.hgetAsync(reqx.keyspaceKey, req.params.field);

                        case 2:
                           return _context84.abrupt('return', _context84.sent);

                        case 3:
                        case 'end':
                           return _context84.stop();
                     }
                  }
               }, _callee84, _this6);
            }));
            return function (_x220, _x221, _x222) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'hdel',
            params: ['key', 'field'],
            access: 'set',
            description: 'delete a hash field',
            relatedCommands: ['hexists', 'hget']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee85(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee85$(_context85) {
                  while (1) {
                     switch (_context85.prev = _context85.next) {
                        case 0:
                           _context85.next = 2;
                           return _this6.redis.hdelAsync(reqx.keyspaceKey, req.params.field);

                        case 2:
                           return _context85.abrupt('return', _context85.sent);

                        case 3:
                        case 'end':
                           return _context85.stop();
                     }
                  }
               }, _callee85, _this6);
            }));
            return function (_x223, _x224, _x225) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'hincrby',
            params: ['key', 'field', 'increment'],
            access: 'add',
            description: 'increment the integer value of a hash field',
            relatedCommands: ['hget']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee86(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee86$(_context86) {
                  while (1) {
                     switch (_context86.prev = _context86.next) {
                        case 0:
                           _context86.next = 2;
                           return _this6.redis.hincrbyAsync(reqx.keyspaceKey, req.params.field, req.params.increment);

                        case 2:
                           return _context86.abrupt('return', _context86.sent);

                        case 3:
                        case 'end':
                           return _context86.stop();
                     }
                  }
               }, _callee86, _this6);
            }));
            return function (_x226, _x227, _x228) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'hexists',
            params: ['key', 'field'],
            description: 'check if the hash field exists',
            relatedCommands: ['hkeys', 'hgetall']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee87(req, res, reqx) {
               var reply;
               return regeneratorRuntime.wrap(function _callee87$(_context87) {
                  while (1) {
                     switch (_context87.prev = _context87.next) {
                        case 0:
                           _context87.next = 2;
                           return _this6.redis.hexistsAsync(reqx.keyspaceKey, req.params.field);

                        case 2:
                           reply = _context87.sent;
                           return _context87.abrupt('return', reply);

                        case 4:
                        case 'end':
                           return _context87.stop();
                     }
                  }
               }, _callee87, _this6);
            }));
            return function (_x229, _x230, _x231) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'hlen',
            params: ['key'],
            description: 'get the number of fields in a hash',
            relatedCommands: ['hkeys', 'hvals', 'hgetall']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee88(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee88$(_context88) {
                  while (1) {
                     switch (_context88.prev = _context88.next) {
                        case 0:
                           _context88.next = 2;
                           return _this6.redis.hlenAsync(reqx.keyspaceKey);

                        case 2:
                           return _context88.abrupt('return', _context88.sent);

                        case 3:
                        case 'end':
                           return _context88.stop();
                     }
                  }
               }, _callee88, _this6);
            }));
            return function (_x232, _x233, _x234) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'hkeys',
            params: ['key'],
            description: 'get the keys of the fields in your hashes',
            relatedCommands: ['hlen', 'hvals', 'hgetall']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee89(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee89$(_context89) {
                  while (1) {
                     switch (_context89.prev = _context89.next) {
                        case 0:
                           _context89.next = 2;
                           return _this6.redis.hkeysAsync(reqx.keyspaceKey);

                        case 2:
                           return _context89.abrupt('return', _context89.sent);

                        case 3:
                        case 'end':
                           return _context89.stop();
                     }
                  }
               }, _callee89, _this6);
            }));
            return function (_x235, _x236, _x237) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'hvals',
            params: ['key'],
            description: 'get all the values in a hash',
            relatedCommands: ['hkeys', 'hgetall']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee90(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee90$(_context90) {
                  while (1) {
                     switch (_context90.prev = _context90.next) {
                        case 0:
                           _context90.next = 2;
                           return _this6.redis.hvalsAsync(reqx.keyspaceKey);

                        case 2:
                           return _context90.abrupt('return', _context90.sent);

                        case 3:
                        case 'end':
                           return _context90.stop();
                     }
                  }
               }, _callee90, _this6);
            }));
            return function (_x238, _x239, _x240) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'hgetall',
            params: ['key'],
            description: 'get all the fields in a hash',
            relatedCommands: ['hlen', 'hkeys', 'hvals']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee91(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee91$(_context91) {
                  while (1) {
                     switch (_context91.prev = _context91.next) {
                        case 0:
                           _context91.next = 2;
                           return _this6.redis.hgetallAsync(reqx.keyspaceKey);

                        case 2:
                           return _context91.abrupt('return', _context91.sent);

                        case 3:
                        case 'end':
                           return _context91.stop();
                     }
                  }
               }, _callee91, _this6);
            }));
            return function (_x241, _x242, _x243) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'zcard',
            params: ['key'],
            description: 'get the cardinality of the zset',
            relatedCommands: ['zrange', 'zrevrange']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee92(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee92$(_context92) {
                  while (1) {
                     switch (_context92.prev = _context92.next) {
                        case 0:
                           _context92.next = 2;
                           return _this6.redis.zcardAsync(reqx.keyspaceKey);

                        case 2:
                           return _context92.abrupt('return', _context92.sent);

                        case 3:
                        case 'end':
                           return _context92.stop();
                     }
                  }
               }, _callee92, _this6);
            }));
            return function (_x244, _x245, _x246) {
               return ref.apply(this, arguments);
            };
         }());
         if (this.config.redisVersion && this.config.redisVersion[0] >= 3) {
            this.addKeyspaceCommand({
               key: 'zaddnx',
               params: ['key', 'score', 'member'],
               access: 'add',
               description: 'add a member to a sorted set if it does not exist',
               relatedCommands: ['zrange', 'zcard']
            }, function () {
               var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee93(req, res, reqx) {
                  return regeneratorRuntime.wrap(function _callee93$(_context93) {
                     while (1) {
                        switch (_context93.prev = _context93.next) {
                           case 0:
                              _context93.next = 2;
                              return _this6.redis.zaddAsync(reqx.keyspaceKey, 'NX', req.params.score, req.params.member);

                           case 2:
                              return _context93.abrupt('return', _context93.sent);

                           case 3:
                           case 'end':
                              return _context93.stop();
                        }
                     }
                  }, _callee93, _this6);
               }));
               return function (_x247, _x248, _x249) {
                  return ref.apply(this, arguments);
               };
            }());
         }
         this.addKeyspaceCommand({
            key: 'zincrby',
            params: ['key', 'increment', 'member'],
            access: 'add',
            description: 'increment the score of a member of a sorted set',
            relatedCommands: ['zrange', 'zcard']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee94(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee94$(_context94) {
                  while (1) {
                     switch (_context94.prev = _context94.next) {
                        case 0:
                           _context94.next = 2;
                           return _this6.redis.zincrbyAsync(reqx.keyspaceKey, req.params.increment, req.params.member);

                        case 2:
                           return _context94.abrupt('return', _context94.sent);

                        case 3:
                        case 'end':
                           return _context94.stop();
                     }
                  }
               }, _callee94, _this6);
            }));
            return function (_x250, _x251, _x252) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'zadd',
            params: ['key', 'score', 'member'],
            access: 'add',
            description: 'add a member to a sorted set',
            relatedCommands: ['zrange', 'zcard']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee95(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee95$(_context95) {
                  while (1) {
                     switch (_context95.prev = _context95.next) {
                        case 0:
                           _context95.next = 2;
                           return _this6.redis.zaddAsync(reqx.keyspaceKey, req.params.score, req.params.member);

                        case 2:
                           return _context95.abrupt('return', _context95.sent);

                        case 3:
                        case 'end':
                           return _context95.stop();
                     }
                  }
               }, _callee95, _this6);
            }));
            return function (_x253, _x254, _x255) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'zrem',
            params: ['key', 'member'],
            access: 'set',
            description: 'remove a member from a sorted set',
            relatedCommands: ['zrange', 'zcard']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee96(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee96$(_context96) {
                  while (1) {
                     switch (_context96.prev = _context96.next) {
                        case 0:
                           _context96.next = 2;
                           return _this6.redis.zremAsync(reqx.keyspaceKey, req.params.member);

                        case 2:
                           return _context96.abrupt('return', _context96.sent);

                        case 3:
                        case 'end':
                           return _context96.stop();
                     }
                  }
               }, _callee96, _this6);
            }));
            return function (_x256, _x257, _x258) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'zrange',
            params: ['key', 'start', 'stop'],
            description: 'range items in the zset',
            exampleKeyParams: [0, 10],
            relatedCommands: ['zrevrange', 'zcard']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee97(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee97$(_context97) {
                  while (1) {
                     switch (_context97.prev = _context97.next) {
                        case 0:
                           _context97.next = 2;
                           return _this6.redis.zrangeAsync(reqx.keyspaceKey, req.params.start, req.params.stop);

                        case 2:
                           return _context97.abrupt('return', _context97.sent);

                        case 3:
                        case 'end':
                           return _context97.stop();
                     }
                  }
               }, _callee97, _this6);
            }));
            return function (_x259, _x260, _x261) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'zrevrange',
            params: ['key', 'start', 'stop'],
            description: 'reverse range items in the zset',
            relatedCommands: ['zrange', 'zcard']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee98(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee98$(_context98) {
                  while (1) {
                     switch (_context98.prev = _context98.next) {
                        case 0:
                           _context98.next = 2;
                           return _this6.redis.zrevrangeAsync(reqx.keyspaceKey, req.params.start, req.params.stop);

                        case 2:
                           return _context98.abrupt('return', _context98.sent);

                        case 3:
                        case 'end':
                           return _context98.stop();
                     }
                  }
               }, _callee98, _this6);
            }));
            return function (_x262, _x263, _x264) {
               return ref.apply(this, arguments);
            };
         }());
         this.addKeyspaceCommand({
            key: 'zrevrange',
            params: ['key', 'start', 'stop'],
            description: 'reverse range items in the zset',
            relatedCommands: ['zrange', 'zcard']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee99(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee99$(_context99) {
                  while (1) {
                     switch (_context99.prev = _context99.next) {
                        case 0:
                           _context99.next = 2;
                           return _this6.redis.zrevrangeAsync(reqx.keyspaceKey, req.params.start, req.params.stop);

                        case 2:
                           return _context99.abrupt('return', _context99.sent);

                        case 3:
                        case 'end':
                           return _context99.stop();
                     }
                  }
               }, _callee99, _this6);
            }));
            return function (_x265, _x266, _x267) {
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
      value: function addPublicCommand(command, handleReq) {
         var _this7 = this;

         handleReq = handleReq || command.handleReq;
         assert(Values.isDefined(handleReq), command.key);
         var uri = command.key;
         if (command.params) {
            uri = [command.key].concat(_toConsumableArray(command.params.map(function (param) {
               return ':' + param;
            }))).join('/');
         }
         this.expressApp.get([this.config.location, uri].join('/'), function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee100(req, res) {
               var match, result;
               return regeneratorRuntime.wrap(function _callee100$(_context100) {
                  while (1) {
                     switch (_context100.prev = _context100.next) {
                        case 0:
                           _context100.prev = 0;
                           match = req.path.match(/\/:([^\/]+)/);

                           if (!match) {
                              _context100.next = 4;
                              break;
                           }

                           throw { message: 'Invalid path: leading colon. Try substituting parameter: ' + match.pop() };

                        case 4:
                           _this7.logger.debug('command', command.key);
                           _context100.next = 7;
                           return handleReq(req, res, { command: command });

                        case 7:
                           result = _context100.sent;

                           if (!(command.access === 'redirect')) {
                              _context100.next = 11;
                              break;
                           }

                           _context100.next = 14;
                           break;

                        case 11:
                           if (!(result !== undefined)) {
                              _context100.next = 14;
                              break;
                           }

                           _context100.next = 14;
                           return Result.sendResult(command, req, res, {}, result);

                        case 14:
                           _context100.next = 19;
                           break;

                        case 16:
                           _context100.prev = 16;
                           _context100.t0 = _context100['catch'](0);

                           _this7.sendError(req, res, _context100.t0);

                        case 19:
                        case 'end':
                           return _context100.stop();
                     }
                  }
               }, _callee100, _this7, [[0, 16]]);
            }));
            return function (_x268, _x269) {
               return ref.apply(this, arguments);
            };
         }());
         this.addCommand(command);
      }
   }, {
      key: 'addPublicRoute',
      value: function addPublicRoute(uri, handleReq) {
         var _this8 = this;

         uri = [this.config.location, uri].join('/');
         this.logger.debug('addPublicRoute', uri);
         this.expressApp.get(uri, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee101(req, res) {
               var result;
               return regeneratorRuntime.wrap(function _callee101$(_context101) {
                  while (1) {
                     switch (_context101.prev = _context101.next) {
                        case 0:
                           _context101.prev = 0;
                           _context101.next = 3;
                           return handleReq(req, res);

                        case 3:
                           result = _context101.sent;

                           if (!(result !== undefined)) {
                              _context101.next = 7;
                              break;
                           }

                           _context101.next = 7;
                           return Result.sendResult({}, req, res, {}, result);

                        case 7:
                           _context101.next = 12;
                           break;

                        case 9:
                           _context101.prev = 9;
                           _context101.t0 = _context101['catch'](0);

                           _this8.sendError(req, res, _context101.t0);

                        case 12:
                        case 'end':
                           return _context101.stop();
                     }
                  }
               }, _callee101, _this8, [[0, 9]]);
            }));
            return function (_x270, _x271) {
               return ref.apply(this, arguments);
            };
         }());
      }
   }, {
      key: 'addRegisterRoutes',
      value: function addRegisterRoutes() {
         var _this9 = this;

         this.addPublicCommand({
            key: 'register-ephemeral' // TODO remove 10 june
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee102(req, res) {
               return regeneratorRuntime.wrap(function _callee102$(_context102) {
                  while (1) {
                     switch (_context102.prev = _context102.next) {
                        case 0:
                           req.params = { account: 'hub' };
                           return _context102.abrupt('return', _this9.createEphemeral(req, res));

                        case 2:
                        case 'end':
                           return _context102.stop();
                     }
                  }
               }, _callee102, _this9);
            }));
            return function (_x272, _x273) {
               return ref.apply(this, arguments);
            };
         }());
         this.addPublicCommand({
            key: 'create-ephemeral'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee103(req, res) {
               return regeneratorRuntime.wrap(function _callee103$(_context103) {
                  while (1) {
                     switch (_context103.prev = _context103.next) {
                        case 0:
                           req.params = { account: 'hub' };
                           return _context103.abrupt('return', _this9.createEphemeral(req, res));

                        case 2:
                        case 'end':
                           return _context103.stop();
                     }
                  }
               }, _callee103, _this9);
            }));
            return function (_x274, _x275) {
               return ref.apply(this, arguments);
            };
         }());
         this.addPublicCommand({
            key: 'create-ephemeral-named',
            params: ['keyspace', 'access']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee104(req, res) {
               return regeneratorRuntime.wrap(function _callee104$(_context104) {
                  while (1) {
                     switch (_context104.prev = _context104.next) {
                        case 0:
                           req.params = { account: 'hub' };
                           return _context104.abrupt('return', _this9.createEphemeral(req, res));

                        case 2:
                        case 'end':
                           return _context104.stop();
                     }
                  }
               }, _callee104, _this9);
            }));
            return function (_x276, _x277) {
               return ref.apply(this, arguments);
            };
         }());
         this.addPublicCommand({
            key: 'create-ephemeral-access',
            params: ['access']
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee105(req, res) {
               return regeneratorRuntime.wrap(function _callee105$(_context105) {
                  while (1) {
                     switch (_context105.prev = _context105.next) {
                        case 0:
                           req.params.account = 'hub';
                           return _context105.abrupt('return', _this9.createEphemeral(req, res));

                        case 2:
                        case 'end':
                           return _context105.stop();
                     }
                  }
               }, _callee105, _this9);
            }));
            return function (_x278, _x279) {
               return ref.apply(this, arguments);
            };
         }());
         this.addPublicCommand({
            key: 'create-account-telegram',
            params: ['account'],
            description: 'create a new account linked to an authoritative Telegram.org account'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee106(req, res, reqx) {
               return regeneratorRuntime.wrap(function _callee106$(_context106) {
                  while (1) {
                     switch (_context106.prev = _context106.next) {
                        case 0:
                           return _context106.abrupt('return', _this9.createAccount(req, res, reqx));

                        case 1:
                        case 'end':
                           return _context106.stop();
                     }
                  }
               }, _callee106, _this9);
            }));
            return function (_x280, _x281, _x282) {
               return ref.apply(this, arguments);
            };
         }());
         this.addPublicCommand({
            key: 'destroy-account',
            params: ['account'],
            dangerous: true, // TODO
            description: 'destroy an account'
         }, function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee107(req, res, reqx) {
               var account, accountKey, scard;
               return regeneratorRuntime.wrap(function _callee107$(_context107) {
                  while (1) {
                     switch (_context107.prev = _context107.next) {
                        case 0:
                           account = reqx.account;
                           accountKey = reqx.accountKey;
                           _context107.next = 4;
                           return _this9.redis.multiExecAsync(function (multi) {
                              multi.scard(_this9.accountKey(account, 'keyspaces'));
                           });

                        case 4:
                           scard = _context107.sent;

                           if (!(scard > 0)) {
                              _context107.next = 7;
                              break;
                           }

                           throw { message: 'All keyspaces must be destroyed individually first' };

                        case 7:
                           _this9.logger.error('not implemented', reqx);
                           throw { message: 'Not implemented. Bug @evanxsummers after 24 June' };

                        case 9:
                        case 'end':
                           return _context107.stop();
                     }
                  }
               }, _callee107, _this9);
            }));
            return function (_x283, _x284, _x285) {
               return ref.apply(this, arguments);
            };
         }());
         // TODO
         this.addPublicCommand({
            key: 'register-cert',
            relatedCommands: ['create-keyspace', 'keyspaces']
         }, require('./handlers/registerCert').default);
      }
   }, {
      key: 'getClientCert',
      value: function getClientCert(req) {
         var cert = req.get('ssl_client_cert');
         if (cert) {
            cert = cert.replace(/\t/g, '\n');
         }
         return cert;
      }
   }, {
      key: 'parseCertDn',
      value: function parseCertDn(req) {
         var dn = req.get('ssl_client_s_dn');
         if (!dn) throw new ValidationError({ message: 'No client cert DN', hint: this.hints.signup });
         return this.parseDn(dn);
      }
   }, {
      key: 'parseDn',
      value: function parseDn(dn) {
         var _this10 = this;

         var parts = {};
         dn.split('/').filter(function (part) {
            return part.length;
         }).forEach(function (part) {
            var _part$split = part.split('=');

            var _part$split2 = _slicedToArray(_part$split, 2);

            var name = _part$split2[0];
            var value = _part$split2[1];

            if (name && value) {
               parts[name.toLowerCase()] = value;
            } else {
               _this10.logger.warn('parseDn', dn, part, name, value);
            }
         });
         return parts;
      }
   }, {
      key: 'addAccountRoutes',
      value: function addAccountRoutes() {
         var _this11 = this;

         if (this.config.secureDomain) {
            this.addAccountCommand({
               key: 'grant-cert',
               params: ['account', 'role', 'certId'],
               defaultParams: {
                  group: 'admin'
               },
               access: 'admin'
            }, function () {
               var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee108(req, res, _ref48) {
                  var account = _ref48.account;
                  var accountKey = _ref48.accountKey;
                  var time = _ref48.time;
                  var certDigest = _ref48.certDigest;
                  var certRole = _ref48.certRole;

                  var _ref49, _ref50, cert;

                  return regeneratorRuntime.wrap(function _callee108$(_context108) {
                     while (1) {
                        switch (_context108.prev = _context108.next) {
                           case 0:
                              _context108.next = 2;
                              return _this11.redis.multiExecAsync(function (multi) {
                                 multi.hgetall(_this11.adminKey('cert', certId));
                              });

                           case 2:
                              _ref49 = _context108.sent;
                              _ref50 = _slicedToArray(_ref49, 1);
                              cert = _ref50[0];
                              throw new ApplicationError('Unimplemented');

                           case 6:
                           case 'end':
                              return _context108.stop();
                        }
                     }
                  }, _callee108, _this11);
               }));
               return function (_x286, _x287, _x288) {
                  return ref.apply(this, arguments);
               };
            }());
         }
      }
   }, {
      key: 'createAccount',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee110(req, res) {
            var _this12 = this;

            var _ret;

            return regeneratorRuntime.wrap(function _callee110$(_context110) {
               while (1) {
                  switch (_context110.prev = _context110.next) {
                     case 0:
                        _context110.prev = 0;
                        return _context110.delegateYield(regeneratorRuntime.mark(function _callee109() {
                           var errorMessage, account, v, dn, cert, certDigest, otpSecret, accountKey, _ref51, _ref52, hsetnx, saddAccount, _ref53, _ref54, saddCert, result;

                           return regeneratorRuntime.wrap(function _callee109$(_context109) {
                              while (1) {
                                 switch (_context109.prev = _context109.next) {
                                    case 0:
                                       errorMessage = _this12.validateRegisterTime();

                                       if (!errorMessage) {
                                          _context109.next = 4;
                                          break;
                                       }

                                       _this12.sendError(req, res, { message: errorMessage });
                                       return _context109.abrupt('return', {
                                          v: void 0
                                       });

                                    case 4:
                                       account = req.params.account;
                                       v = _this12.validateRegisterAccount(account);

                                       if (!v) {
                                          _context109.next = 8;
                                          break;
                                       }

                                       throw new ValidationError(v);

                                    case 8:
                                       dn = req.get('ssl_client_s_dn');
                                       cert = req.get('ssl_client_cert');

                                       _this12.logger.info('createAccount dn', dn);

                                       if (cert) {
                                          _context109.next = 13;
                                          break;
                                       }

                                       throw new ValidationError({ message: 'No client cert', hint: _this12.hints.signup });

                                    case 13:
                                       certDigest = _this12.digestPem(cert);
                                       otpSecret = _this12.generateTokenKey();
                                       accountKey = _this12.adminKey('account', account);
                                       _context109.next = 18;
                                       return _this12.redis.multiExecAsync(function (multi) {
                                          multi.hsetnx(accountKey, 'registered', Seconds.now());
                                          multi.sadd(_this12.adminKey('accounts'), account);
                                          multi.hsetnx(accountKey, 'expire', _this12.config.keyExpire);
                                          multi.sadd(_this12.adminKey('account', account, 'topt'), otpSecret);
                                       });

                                    case 18:
                                       _ref51 = _context109.sent;
                                       _ref52 = _slicedToArray(_ref51, 2);
                                       hsetnx = _ref52[0];
                                       saddAccount = _ref52[1];

                                       if (hsetnx) {
                                          _context109.next = 24;
                                          break;
                                       }

                                       throw { message: 'Account already exists (hashes)' };

                                    case 24:
                                       if (saddAccount) {
                                          _context109.next = 26;
                                          break;
                                       }

                                       throw { message: 'Account already exists (set)' };

                                    case 26:
                                       _context109.next = 28;
                                       return _this12.redis.multiExecAsync(function (multi) {
                                          multi.sadd(_this12.adminKey('account', account, 'certs'), certDigest);
                                       });

                                    case 28:
                                       _ref53 = _context109.sent;
                                       _ref54 = _slicedToArray(_ref53, 1);
                                       saddCert = _ref54[0];

                                       if (saddCert) {
                                          _context109.next = 33;
                                          break;
                                       }

                                       throw { message: 'Cert already exists' };

                                    case 33:
                                       result = _this12.buildQrReply({
                                          otpSecret: otpSecret,
                                          user: account,
                                          host: _this12.config.hostDomain,
                                          label: _this12.config.serviceLabel
                                       });
                                       _context109.next = 36;
                                       return Result.sendResult({}, req, res, { account: account }, result);

                                    case 36:
                                    case 'end':
                                       return _context109.stop();
                                 }
                              }
                           }, _callee109, _this12);
                        })(), 't0', 2);

                     case 2:
                        _ret = _context110.t0;

                        if (!((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object")) {
                           _context110.next = 5;
                           break;
                        }

                        return _context110.abrupt('return', _ret.v);

                     case 5:
                        _context110.next = 10;
                        break;

                     case 7:
                        _context110.prev = 7;
                        _context110.t1 = _context110['catch'](0);

                        this.sendError(req, res, _context110.t1);

                     case 10:
                     case 'end':
                        return _context110.stop();
                  }
               }
            }, _callee110, this, [[0, 7]]);
         }));

         function createAccount(_x289, _x290) {
            return ref.apply(this, arguments);
         }

         return createAccount;
      }()
   }, {
      key: 'addAccountCommand',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee113(command, handleReq) {
            var _this13 = this;

            var uri;
            return regeneratorRuntime.wrap(function _callee113$(_context113) {
               while (1) {
                  switch (_context113.prev = _context113.next) {
                     case 0:
                        handleReq = handleReq || command.handleReq;
                        uri = [command.key];

                        if (command.params) {
                           uri = [command.key].concat(_toConsumableArray(command.params.map(function (param) {
                              return ':' + param;
                           })));
                        }
                        if (command.access !== 'admin') {
                           this.logger.warn('AddAccountCommand access', command.access);
                        }
                        this.expressApp.get([this.config.location].concat(_toConsumableArray(uri)).join('/'), function () {
                           var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee112(req, res) {
                              var reqx, _ret2;

                              return regeneratorRuntime.wrap(function _callee112$(_context112) {
                                 while (1) {
                                    switch (_context112.prev = _context112.next) {
                                       case 0:
                                          reqx = { command: command };
                                          _context112.prev = 1;
                                          return _context112.delegateYield(regeneratorRuntime.mark(function _callee111() {
                                             var message, account, accountKey, _ref55, _ref56, _ref56$, time, admined, certs, duration, _validateCert2, certDigest, certRole, result;

                                             return regeneratorRuntime.wrap(function _callee111$(_context111) {
                                                while (1) {
                                                   switch (_context111.prev = _context111.next) {
                                                      case 0:
                                                         message = _this13.validatePath(req);

                                                         if (!message) {
                                                            _context111.next = 3;
                                                            break;
                                                         }

                                                         throw { message: message };

                                                      case 3:
                                                         account = req.params.account;
                                                         accountKey = _this13.adminKey('account', account);
                                                         _context111.next = 7;
                                                         return _this13.redis.multiExecAsync(function (multi) {
                                                            multi.time();
                                                            multi.hget(accountKey, 'admined');
                                                            multi.smembers(_this13.adminKey('account', account, 'certs'));
                                                         });

                                                      case 7:
                                                         _ref55 = _context111.sent;
                                                         _ref56 = _slicedToArray(_ref55, 3);
                                                         _ref56$ = _slicedToArray(_ref56[0], 1);
                                                         time = _ref56$[0];
                                                         admined = _ref56[1];
                                                         certs = _ref56[2];

                                                         _this13.logger.debug('admin command', { account: account, accountKey: accountKey, time: time, admined: admined, certs: certs });
                                                         if (!admined) {
                                                            //throw {message: 'Invalid account'};
                                                         }

                                                         if (!lodash.isEmpty(certs)) {
                                                            _context111.next = 17;
                                                            break;
                                                         }

                                                         throw { message: 'No certs' };

                                                      case 17:
                                                         duration = time - admined;

                                                         if (!(duration < _this13.config.adminLimit)) {
                                                            _context111.next = 20;
                                                            break;
                                                         }

                                                         return _context111.abrupt('return', {
                                                            v: 'Admin command interval not elapsed: ' + _this13.config.adminLimit + 's'
                                                         });

                                                      case 20:
                                                         _validateCert2 = _this13.validateCert(req, reqx, certs, account, []);
                                                         certDigest = _validateCert2.certDigest;
                                                         certRole = _validateCert2.certRole;

                                                         Object.assign(reqx, { account: account, accountKey: accountKey, time: time, admined: admined, certDigest: certDigest, certRole: certRole });
                                                         _context111.next = 26;
                                                         return handleReq(req, res, reqx);

                                                      case 26:
                                                         result = _context111.sent;

                                                         if (!(result !== undefined)) {
                                                            _context111.next = 30;
                                                            break;
                                                         }

                                                         _context111.next = 30;
                                                         return Result.sendResult(command, req, res, reqx, result);

                                                      case 30:
                                                      case 'end':
                                                         return _context111.stop();
                                                   }
                                                }
                                             }, _callee111, _this13);
                                          })(), 't0', 3);

                                       case 3:
                                          _ret2 = _context112.t0;

                                          if (!((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object")) {
                                             _context112.next = 6;
                                             break;
                                          }

                                          return _context112.abrupt('return', _ret2.v);

                                       case 6:
                                          _context112.next = 11;
                                          break;

                                       case 8:
                                          _context112.prev = 8;
                                          _context112.t1 = _context112['catch'](1);

                                          _this13.sendError(req, res, _context112.t1);

                                       case 11:
                                       case 'end':
                                          return _context112.stop();
                                    }
                                 }
                              }, _callee112, _this13, [[1, 8]]);
                           }));
                           return function (_x293, _x294) {
                              return ref.apply(this, arguments);
                           };
                        }());

                     case 5:
                     case 'end':
                        return _context113.stop();
                  }
               }
            }, _callee113, this);
         }));

         function addAccountCommand(_x291, _x292) {
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
      key: 'createEphemeral',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee115(req, res, previousError) {
            var _this14 = this;

            var _req$params10, account, keyspace, access, v, _ret3;

            return regeneratorRuntime.wrap(function _callee115$(_context115) {
               while (1) {
                  switch (_context115.prev = _context115.next) {
                     case 0:
                        _req$params10 = req.params;
                        account = _req$params10.account;
                        keyspace = _req$params10.keyspace;
                        access = _req$params10.access;

                        assert(account, 'account');

                        if (keyspace) {
                           _context115.next = 9;
                           break;
                        }

                        keyspace = this.generateTokenKey(12).toLowerCase();
                        _context115.next = 12;
                        break;

                     case 9:
                        v = this.validateRegisterKeyspace(keyspace);

                        if (!v) {
                           _context115.next = 12;
                           break;
                        }

                        throw { message: v, keyspace: keyspace };

                     case 12:
                        if (!access) {} else if (access === 'add') {
                           keyspace = '+' + keyspace;
                        } else if (access) {
                           this.sendError(req, res, { message: 'Access unimplemented: ' + access, hint: {
                                 message: 'Try access: add',
                                 description: 'Currently only "add" limited access is supported.'
                              } });
                        }
                        if (previousError) {
                           this.logger.warn('createEphemeral retry');
                        }
                        _context115.prev = 14;
                        return _context115.delegateYield(regeneratorRuntime.mark(function _callee114() {
                           var errorMessage, clientIp, replies, replyPath;
                           return regeneratorRuntime.wrap(function _callee114$(_context114) {
                              while (1) {
                                 switch (_context114.prev = _context114.next) {
                                    case 0:
                                       _this14.logger.debug('createEphemeral');
                                       errorMessage = _this14.validateRegisterTime();

                                       if (!errorMessage) {
                                          _context114.next = 5;
                                          break;
                                       }

                                       _this14.sendError(req, res, { message: errorMessage });
                                       return _context114.abrupt('return', {
                                          v: void 0
                                       });

                                    case 5:
                                       clientIp = req.get('x-forwarded-for');

                                       _this14.logger.debug('createEphemeral clientIp', clientIp, account, keyspace);
                                       _context114.next = 9;
                                       return _this14.redis.multiExecAsync(function (multi) {
                                          multi.hsetnx(_this14.accountKeyspace(account, keyspace), 'registered', Seconds.now());
                                          if (clientIp) {
                                             multi.hsetnx(_this14.accountKeyspace(account, keyspace), 'clientIp', clientIp);
                                             if (_this14.config.addClientIp) {
                                                multi.sadd(_this14.adminKey('keyspaces:ephemeral:ips'), clientIp);
                                             }
                                          }
                                          //this.count(multi, 'keyspaces:ephemeral'); // TODO del old keyspaces:expire
                                       });

                                    case 9:
                                       replies = _context114.sent;

                                       if (replies[0]) {
                                          _context114.next = 15;
                                          break;
                                       }

                                       _this14.logger.error('keyspace clash', account, keyspace);

                                       if (previousError) {
                                          _context114.next = 14;
                                          break;
                                       }

                                       return _context114.abrupt('return', {
                                          v: _this14.createEphemeral(req, res, { message: 'keyspace clash' })
                                       });

                                    case 14:
                                       throw { message: 'Keyspace already exists' };

                                    case 15:
                                       replyPath = ['ak', account, keyspace].join('/');

                                       _this14.logger.debug('createEphemeral replyPath', replyPath);

                                       if (!_this14.isBrowser(req)) {
                                          _context114.next = 21;
                                          break;
                                       }

                                       res.redirect(302, ['', replyPath, 'help'].join('/'));
                                       _context114.next = 22;
                                       break;

                                    case 21:
                                       return _context114.abrupt('return', {
                                          v: replyPath
                                       });

                                    case 22:
                                    case 'end':
                                       return _context114.stop();
                                 }
                              }
                           }, _callee114, _this14);
                        })(), 't0', 16);

                     case 16:
                        _ret3 = _context115.t0;

                        if (!((typeof _ret3 === 'undefined' ? 'undefined' : _typeof(_ret3)) === "object")) {
                           _context115.next = 19;
                           break;
                        }

                        return _context115.abrupt('return', _ret3.v);

                     case 19:
                        _context115.next = 24;
                        break;

                     case 21:
                        _context115.prev = 21;
                        _context115.t1 = _context115['catch'](14);

                        this.sendError(req, res, _context115.t1);

                     case 24:
                     case 'end':
                        return _context115.stop();
                  }
               }
            }, _callee115, this, [[14, 21]]);
         }));

         function createEphemeral(_x296, _x297, _x298) {
            return ref.apply(this, arguments);
         }

         return createEphemeral;
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
      key: 'addCommand',
      value: function addCommand(command) {
         assert(command.key);
         this.commands.push(command);
         this.commandMap.set(command.key, command);
      }
   }, {
      key: 'addKeyspaceCommand',
      value: function addKeyspaceCommand(command, handleReq) {
         if (handleReq) {
            command.handleReq = handleReq;
         }
         assert(command.key, 'command.key');
         command.context = 'keyspace';
         var uri = 'ak/:account/:keyspace';
         command.params = command.params || [];
         var key = command.key + command.params.length;
         this.logger.debug('addKeyspaceCommand', command.key, key, uri);
         this.addCommand(command);
         var handler = this.createKeyspaceHandler(command);
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
      value: function createKeyspaceHandler(command) {
         var _this15 = this;

         return function () {
            var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee117(req, res) {
               var _ret4;

               return regeneratorRuntime.wrap(function _callee117$(_context117) {
                  while (1) {
                     switch (_context117.prev = _context117.next) {
                        case 0:
                           _context117.prev = 0;
                           return _context117.delegateYield(regeneratorRuntime.mark(function _callee116() {
                              var _req$params11, account, keyspace, key, timeout, accountKey, accountKeyspace, helpPath, reqx, v, isSecureAccount, _ref57, _ref58, _ref58$, time, registered, admined, accessed, certs, hostname, hostHashes, multi, result, _expire, _ref59, _ref60, expire;

                              return regeneratorRuntime.wrap(function _callee116$(_context116) {
                                 while (1) {
                                    switch (_context116.prev = _context116.next) {
                                       case 0:
                                          _req$params11 = req.params;
                                          account = _req$params11.account;
                                          keyspace = _req$params11.keyspace;
                                          key = _req$params11.key;
                                          timeout = _req$params11.timeout;

                                          assert(account, 'account');
                                          assert(keyspace, 'keyspace');
                                          accountKey = _this15.accountKey(account);
                                          accountKeyspace = _this15.accountKeyspace(account, keyspace);
                                          helpPath = '/ak/' + account + '/' + keyspace + '/help';
                                          reqx = { account: account, keyspace: keyspace, accountKey: accountKey, accountKeyspace: accountKeyspace, key: key, helpPath: helpPath, command: command };

                                          if (key) {
                                             reqx.keyspaceKey = _this15.keyspaceKey(account, keyspace, key);
                                          }
                                          req.rquery = reqx;
                                          v = void 0;
                                          //await this.migrateKeyspace(req.params);

                                          v = _this15.validateAccount(account);

                                          if (!v) {
                                             _context116.next = 18;
                                             break;
                                          }

                                          _this15.sendStatusMessage(req, res, 400, 'Invalid account: ' + v);
                                          return _context116.abrupt('return', {
                                             v: void 0
                                          });

                                       case 18:
                                          v = _this15.validateKeyspace(keyspace);

                                          if (!v) {
                                             _context116.next = 22;
                                             break;
                                          }

                                          _this15.sendStatusMessage(req, res, 400, 'Invalid keyspace: ' + v);
                                          return _context116.abrupt('return', {
                                             v: void 0
                                          });

                                       case 22:
                                          v = _this15.validateKey(key);

                                          if (!v) {
                                             _context116.next = 26;
                                             break;
                                          }

                                          _this15.sendStatusMessage(req, res, 400, 'Invalid key: ' + v);
                                          return _context116.abrupt('return', {
                                             v: void 0
                                          });

                                       case 26:
                                          if (!timeout) {
                                             _context116.next = 30;
                                             break;
                                          }

                                          if (/^[0-9]$/.test(timeout)) {
                                             _context116.next = 30;
                                             break;
                                          }

                                          _this15.sendStatusMessage(req, res, 400, 'Invalid timeout: require range 1 to 9 seconds');
                                          return _context116.abrupt('return', {
                                             v: void 0
                                          });

                                       case 30:
                                          isSecureAccount = !/^(pub|hub)$/.test(account);
                                          _context116.next = 33;
                                          return _this15.redis.multiExecAsync(function (multi) {
                                             multi.time();
                                             multi.hget(accountKey, 'registered');
                                             multi.hget(accountKey, 'admined');
                                             multi.hget(accountKey, 'accessed');
                                             if (isSecureAccount) {
                                                multi.smembers(_this15.adminKey('account', account, 'certs'));
                                             }
                                          });

                                       case 33:
                                          _ref57 = _context116.sent;
                                          _ref58 = _slicedToArray(_ref57, 5);
                                          _ref58$ = _slicedToArray(_ref58[0], 1);
                                          time = _ref58$[0];
                                          registered = _ref58[1];
                                          admined = _ref58[2];
                                          accessed = _ref58[3];
                                          certs = _ref58[4];

                                          Objects.kvs({ time: time, registered: registered, admined: admined, accessed: accessed }).forEach(function (kv) {
                                             reqx[kv.key] = parseInt(kv.value);
                                          });
                                          _this15.validateAccess(req, reqx, { certs: certs });
                                          hostname = void 0;

                                          if (!(req.hostname === _this15.config.hostDomain)) {
                                             _context116.next = 47;
                                             break;
                                          }

                                          _context116.next = 59;
                                          break;

                                       case 47:
                                          if (!lodash.endsWith(req.hostname, _this15.config.keyspaceHostname)) {
                                             _context116.next = 59;
                                             break;
                                          }

                                          hostname = req.hostname.replace(/\..*$/, '');
                                          _context116.next = 51;
                                          return _this15.redis.hgetallAsync(_this15.adminKey('host', hostname));

                                       case 51:
                                          hostHashes = _context116.sent;

                                          if (hostHashes) {
                                             _context116.next = 54;
                                             break;
                                          }

                                          throw new ValidationError('Invalid host: ' + hostname);

                                       case 54:
                                          _this15.logger.debug('hostHashes', hostHashes);

                                          if (hostHashes.keyspaces) {
                                             _context116.next = 57;
                                             break;
                                          }

                                          throw new ValidationError('Invalid host: ' + hostname);

                                       case 57:
                                          if (lodash.includes(hostHashes.keyspaces, keyspace)) {
                                             _context116.next = 59;
                                             break;
                                          }

                                          throw new ValidationError('Invalid keyspace: ' + keyspace);

                                       case 59:
                                          if (keyspace) {
                                             _context116.next = 61;
                                             break;
                                          }

                                          throw new ValidationError('Missing keyspace: ' + req.path);

                                       case 61:
                                          if (!timeout) {
                                             _context116.next = 64;
                                             break;
                                          }

                                          if (!(timeout < 1 || timeout > 10)) {
                                             _context116.next = 64;
                                             break;
                                          }

                                          throw new ValidationError('Timeout must range from 1 to 10 seconds: ' + timeout);

                                       case 64:
                                          multi = _this15.redis.multi();

                                          multi.sadd(_this15.adminKey('keyspaces'), keyspace);
                                          multi.hset(accountKey, 'accessed', time);
                                          if (command && command.access === 'admin') {
                                             multi.hset(accountKey, 'admined', time);
                                          }
                                          _context116.next = 70;
                                          return command.handleReq(req, res, reqx, multi);

                                       case 70:
                                          result = _context116.sent;

                                          if (!(result !== undefined)) {
                                             _context116.next = 74;
                                             break;
                                          }

                                          _context116.next = 74;
                                          return Result.sendResult(command, req, res, reqx, result);

                                       case 74:
                                          if (key) {
                                             assert(reqx.keyspaceKey);
                                             _expire = _this15.getKeyExpire(account);

                                             multi.expire(reqx.keyspaceKey, _expire);
                                             _this15.logger.debug('expire', reqx.keyspaceKey, _expire);
                                          }
                                          _context116.next = 77;
                                          return multi.execAsync();

                                       case 77:
                                          _ref59 = _context116.sent;
                                          _ref60 = _toArray(_ref59);
                                          expire = _ref60;

                                          if (expire) {
                                             _context116.next = 82;
                                             break;
                                          }

                                          throw new ApplicationError('expire: ' + reqx.keyspaceKey);

                                       case 82:
                                       case 'end':
                                          return _context116.stop();
                                    }
                                 }
                              }, _callee116, _this15);
                           })(), 't0', 2);

                        case 2:
                           _ret4 = _context117.t0;

                           if (!((typeof _ret4 === 'undefined' ? 'undefined' : _typeof(_ret4)) === "object")) {
                              _context117.next = 5;
                              break;
                           }

                           return _context117.abrupt('return', _ret4.v);

                        case 5:
                           _context117.next = 10;
                           break;

                        case 7:
                           _context117.prev = 7;
                           _context117.t1 = _context117['catch'](0);

                           _this15.sendError(req, res, _context117.t1);

                        case 10:
                        case 'end':
                           return _context117.stop();
                     }
                  }
               }, _callee117, _this15, [[0, 7]]);
            }));
            return function (_x299, _x300) {
               return ref.apply(this, arguments);
            };
         }();
      }
   }, {
      key: 'getKeyExpire',
      value: function getKeyExpire(account) {
         if (account === 'hub') {
            return this.config.ephemeralKeyExpire;
         } else {
            return this.config.keyExpire;
         }
      }
   }, {
      key: 'migrateKeyspace',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee118(_ref61) {
            var account = _ref61.account;
            var keyspace = _ref61.keyspace;

            var accountKey, _ref62, _ref63, accessToken, token, _ref64, _ref65, hsetnx, hdel;

            return regeneratorRuntime.wrap(function _callee118$(_context118) {
               while (1) {
                  switch (_context118.prev = _context118.next) {
                     case 0:
                        accountKey = this.accountKeyspace(account, keyspace);
                        _context118.next = 3;
                        return this.redis.multiExecAsync(function (multi) {
                           multi.hget(accountKey, 'accessToken');
                           multi.hget(accountKey, 'token');
                        });

                     case 3:
                        _ref62 = _context118.sent;
                        _ref63 = _slicedToArray(_ref62, 2);
                        accessToken = _ref63[0];
                        token = _ref63[1];

                        if (!(!token && accessToken)) {
                           _context118.next = 20;
                           break;
                        }

                        _context118.next = 10;
                        return this.redis.multiExecAsync(function (multi) {
                           multi.hsetnx(accountKey, 'token', accessToken);
                           multi.hdel(accountKey, 'accessToken');
                        });

                     case 10:
                        _ref64 = _context118.sent;
                        _ref65 = _slicedToArray(_ref64, 2);
                        hsetnx = _ref65[0];
                        hdel = _ref65[1];

                        if (hsetnx) {
                           _context118.next = 18;
                           break;
                        }

                        throw new Error('Migrate keyspace hset failed');

                     case 18:
                        if (hdel) {
                           _context118.next = 20;
                           break;
                        }

                        throw new Error('Migrate keyspace hdel failed');

                     case 20:
                     case 'end':
                        return _context118.stop();
                  }
               }
            }, _callee118, this);
         }));

         function migrateKeyspace(_x301) {
            return ref.apply(this, arguments);
         }

         return migrateKeyspace;
      }()
   }, {
      key: 'validateRegisterAccount',
      value: function validateRegisterAccount(account) {
         if (lodash.isEmpty(account)) {
            return 'Invalid account (empty)';
         } else if (['hub', 'pub', 'public', 'ephemeral'].includes(account)) {} else if (!/^[\-_a-z0-9]+$/.test(account)) {
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
      value: function validateAccess(req, reqx, _ref66) {
         var certs = _ref66.certs;
         var command = reqx.command;
         var account = reqx.account;
         var keyspace = reqx.keyspace;
         var time = reqx.time;

         var scheme = req.get('X-Forwarded-Proto');
         this.logger.debug('validateAccess scheme', scheme, account, keyspace, command);
         if (this.isSecureDomain(req)) {
            if (scheme === 'http') {
               throw { message: 'Insecure scheme ' + scheme + ': ' + req.hostname };
            }
         }
         if (account !== 'hub' && account !== 'pub') {
            Object.assign(reqx, this.validateCert(req, reqx, certs, account, []));
         }
         if (false) {
            if (command.key === 'create-keyspace') {
               if (reqx.registered) {
                  throw new ValidationError({
                     message: 'Already registered',
                     hint: this.hints.routes
                  });
               }
            } else if (!reqx.registered) {
               if (account === 'hub' || account === 'pub') {
                  throw new ValidationError({
                     message: 'Expired (or unregistered) keyspace',
                     hint: this.hints.createEphemeral
                  });
               } else {
                  throw new ValidationError({
                     message: 'Unregistered keyspace',
                     hint: this.hints.createEphemeral
                  });
               }
            }
         }
         if (command.access) {
            if (command.access === 'admin') {
               if (!reqx.admined) {
                  this.logger.warn('validateAccess admined', keyspace, command.key, time);
               } else {
                  var duration = time - reqx.admined;
                  if (duration < this.config.adminLimit) {
                     throw new ValidationError({
                        message: 'Admin command interval not elapsed: ' + this.config.adminLimit + 's'
                     });
                  }
               }
            } else if (command.access === 'debug') {} else if (command.access === 'add') {
               if (!/^[a-z]/.test(keyspace)) {
                  return;
               }
            } else if (command.access === 'set') {
               if (/^\+/.test(keyspace)) {
                  throw { message: 'Append-only keyspace' };
               }
            } else if (command.access === 'get') {} else {}
         }
      }
   }, {
      key: 'validateCert',
      value: function validateCert(req, reqx, certs, account, roles) {
         if (this.config.disableValidateCert) {
            return {};
         }
         if (!certs) {
            throw new ValidationError({
               status: 403,
               message: 'No granted certs',
               hint: this.hints.signup
            });
         }
         var cert = req.get('ssl_client_cert');
         if (!cert) {
            throw new ValidationError({
               status: 403,
               message: 'No client cert sent',
               hint: this.hints.signup
            });
         }
         var dn = req.get('ssl_client_s_dn');
         if (!dn) throw new ValidationError({
            status: 400,
            message: 'No client cert DN',
            hint: this.hints.signup
         });
         var names = this.parseDn(dn);
         if (names.o !== account) throw new ValidationError({
            status: 403,
            message: 'Cert O name mismatches account',
            hint: this.hints.registerCert
         });
         var certRole = names.ou;
         if (!lodash.isEmpty(roles) && !roles.includes(certRole)) throw new ValidationError({
            status: 403,
            message: 'No role access',
            hint: this.hints.registerCert
         });
         var certDigest = this.digestPem(cert);
         if (!certs.includes(certDigest)) {
            this.logger.warn('validateCert', account, certRole, certDigest, certs);
            throw new ValidationError({
               status: 403,
               message: 'Invalid cert',
               hint: this.hints.registerCert
            });
         }
         return { certDigest: certDigest, certRole: certRole };
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
         for (var _len4 = arguments.length, more = Array(_len4 > 1 ? _len4 - 1 : 0), _key6 = 1; _key6 < _len4; _key6++) {
            more[_key6 - 1] = arguments[_key6];
         }

         return this.adminKey.apply(this, ['account', account].concat(more));
      }
   }, {
      key: 'accountKeyspace',
      value: function accountKeyspace(account, keyspace) {
         for (var _len5 = arguments.length, more = Array(_len5 > 2 ? _len5 - 2 : 0), _key7 = 2; _key7 < _len5; _key7++) {
            more[_key7 - 2] = arguments[_key7];
         }

         return [this.config.redisKeyspace, 'ak', account, keyspace].concat(more).join(':');
      }
   }, {
      key: 'keyspaceKey',
      value: function keyspaceKey(account, keyspace, key) {
         return [this.config.redisKeyspace, account, keyspace, key].join('~');
      }
   }, {
      key: 'adminKey',
      value: function adminKey() {
         for (var _len6 = arguments.length, parts = Array(_len6), _key8 = 0; _key8 < _len6; _key8++) {
            parts[_key8] = arguments[_key8];
         }

         return [this.config.redisKeyspace].concat(parts).join(':');
      }
   }, {
      key: 'isDevelopment',
      value: function isDevelopment(req) {
         return req.hostname === 'localhost' && process.env.NODE_ENV === 'development';
      }
   }, {
      key: 'scanVirtualKeys',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee119(account, keyspace, match, count) {
            var keys, keyIndex, virtualKeys;
            return regeneratorRuntime.wrap(function _callee119$(_context119) {
               while (1) {
                  switch (_context119.prev = _context119.next) {
                     case 0:
                        _context119.next = 2;
                        return this.redis.keysAsync(this.keyspaceKey(account, keyspace, '*'));

                     case 2:
                        keys = _context119.sent;
                        // TODO
                        if (count > 0 && keys.length > count) {
                           keys = keys.slice(0, count);
                        }
                        this.logger.error('scanVirtualKeys TODO', keys.length, account, keyspace, match, count);
                        keyIndex = this.keyIndex(account, keyspace);
                        virtualKeys = keys.map(function (key) {
                           return key.substring(keyIndex);
                        });
                        return _context119.abrupt('return', virtualKeys);

                     case 8:
                     case 'end':
                        return _context119.stop();
                  }
               }
            }, _callee119, this);
         }));

         function scanVirtualKeys(_x302, _x303, _x304, _x305) {
            return ref.apply(this, arguments);
         }

         return scanVirtualKeys;
      }()
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
         return (/(Mobile|iPhone)/.test(req.get('User-Agent'))
         );
      }
   }, {
      key: 'isBrowser',
      value: function isBrowser(req) {
         return !/^curl\//.test(req.get('User-Agent'));
      }
   }, {
      key: 'getContentType',
      value: function getContentType(req) {
         return this.isBrowser(req) ? 'html' : 'plain';
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
         return (/^cli/.test(req.hostname) || !this.isBrowser(req) || this.config.cliDomain
         );
      }
   }, {
      key: 'sendError',
      value: function sendError(req, res, err) {
         if (lodash.isError(err) && err.name !== 'ValidationError') {
            this.logger.warn(err);
         }
         if (err.context) {
            this.logger.warn(err.context);
         }
         try {
            this.sendStatusMessage(req, res, err.status || 500, err);
         } catch (error) {
            this.logger.error(error);
         }
      }
   }, {
      key: 'sendStatusMessage',
      value: function sendStatusMessage(req, res, statusCode, err) {
         var _this16 = this;

         var reqx = req.rquery || {};
         var command = reqx.command || {};
         this.logger.warn('status', req.path, statusCode, typeof err === 'undefined' ? 'undefined' : _typeof(err), err);
         var messageLines = [];
         if (!err) {
            this.logger.error('sendStatusMessage empty');
            err = 'empty error message';
         }
         var title = req.path;
         var hints = [];
         if (lodash.isString(err)) {
            title = err;
         } else if (lodash.isArray(err)) {
            messageLines = messageLines.concat(err);
         } else if ((typeof err === 'undefined' ? 'undefined' : _typeof(err)) === 'object') {
            this.logger.debug('sendStatusMessage', err, req.params);
            if (err.code === 'WRONGTYPE') {
               var _req$params12 = req.params;
               var account = _req$params12.account;
               var keyspace = _req$params12.keyspace;
               var _key9 = _req$params12.key;

               title = 'Wrong type for key';
               if (account && keyspace && _key9) {
                  hints.push({
                     message: 'Check the key type',
                     uri: ['ak', account, keyspace, 'type', _key9].join('/')
                  });
               }
            } else if (err.message) {
               title = err.message;
            }
            if (err.hint) {
               hints.push(err.hint);
            }
            if (err.hints) {
               hints = hints.concat(err.hints);
            }
            hints = hints.map(function (hint) {
               hint = Object.assign({}, hint);
               if (hint.url) {
                  if (hint.message) {
                     if (_this16.isBrowser(req)) {} else if (hint.message) {
                        hint.message = hint.message.replace(/<\/?(b|tt|i|code|pre)>/g, '');
                     }
                  }
               } else if (hint.uri) {
                  var url = void 0;
                  if (_this16.isBrowser(req)) {
                     url = '/' + hint.uri;
                  } else if (/localhost/.test(req.hostname)) {
                     url = 'http://localhost:8765/' + hint.uri;
                  } else {
                     url = 'https://' + req.hostname + '/' + hint.uri;
                  }
                  hint.url = url;
               }
               return hint;
            });
            if (err.stack) {
               if (err.name === 'ValidationError') {} else if (err.name === 'Error' && err.code) {
                  if (!['WRONGTYPE'].includes(err.code)) {
                     messageLines.push(err.code);
                  }
               } else if (err.name) {
                  messageLines.push(err.name);
               } else if (!lodash.isError(err)) {} else if (err.stack) {
                  messageLines.push(err.stack.split('\n').slice(0, 2));
               }
            }
         } else {
            this.logger.error('sendStatusMessage type', typeof err === 'undefined' ? 'undefined' : _typeof(err), err);
            err = 'unexpected error type: ' + (typeof err === 'undefined' ? 'undefined' : _typeof(err));
            messageLines.push(Object.keys(err).join(' '));
         }
         if (!hints.length) {
            hints.push(this.hints.routes);
         }
         var heading = [Hc.b('Status'), Hc.tt(statusCode)].join(' ');
         if (this.isBrowser(req)) {
            this.logger.debug('hints', hints);
            res.set('Content-Type', 'text/html');
            res.status(statusCode).send((0, _Page2.default)({
               backPath: '/routes',
               config: this.config,
               req: req, reqx: reqx, title: title, heading: heading,
               content: [
               //Hs.div(styles.error.status, `Status ${statusCode}`),
               He.div({ style: _styles2.default.error.message }, title), He.pre({
                  style: _styles2.default.error.detail,
                  meta: 'optional'
               }, lodash.flatten(messageLines).join('\n')), hints.map(function (hint) {
                  _this16.logger.debug('hint', hint);
                  var attributes = {
                     style: _styles2.default.error.hintContainer,
                     href: hint.url
                  };
                  if (hint.url[0] !== '/') {
                     attributes.target = '_blank';
                  }
                  if (hint.clipboard) {
                     attributes.onClick = 'window.prompt(\'Copy to clipboard via Ctrl-C\', \'' + hint.clipboard + '\')';
                  }
                  return He.a(attributes, lodash.flatten([Hso.div(_styles2.default.error.hintMessage, hint.message), Hso.div(_styles2.default.error.hintDescription, hint.description)]));
               })]
            }));
         } else {
            messageLines = messageLines.concat(hints.map(function (hint) {
               if (true) {
                  return lodash.compact([hint.message]);
               } else {
                  return lodash.compact([hint.message, hint.url]);
               }
            }));
            this.logger.warn('status lines', req.path, statusCode, messageLines);
            this.logger.debug('messageLines', messageLines, lodash.flatten(messageLines), hints);
            res.status(statusCode).send(lodash.flatten([title].concat(_toConsumableArray(messageLines))).join('\n') + '\n');
         }
      }
   }, {
      key: 'splitPem',
      value: function splitPem(pem) {
         var lines = pem.split(/[\n\t]/);
         if (lines.length < 8) {
            throw new ValidationError('Invalid lines');
         }
         if (!/^-+BEGIN CERTIFICATE/.test(lines[0])) {
            throw new ValidationError('Invalid first line');
         }
         var contentLines = lines.filter(function (line) {
            return line.length > 16 && !/^--/.test(line);
         });
         if (contentLines.length < 8) {
            throw new ValidationError('Invalid lines');
         }
         return contentLines;
      }
   }, {
      key: 'extractPem',
      value: function extractPem(pem) {
         var contentLines = this.splitPem(pem);
         return contentLines[4].slice(-12);
      }
   }, {
      key: 'digestPem',
      value: function digestPem(pem) {
         var contentLines = this.splitPem(pem);
         var content = contentLines.join('');
         var sha1 = _crypto2.default.createHash('sha1');
         sha1.update(new Buffer(content));
         var digest = sha1.digest('hex');
         this.logger.debug('digestPem', digest);
         if (digest.length < 32) {
            throw new ValidationError({
               status: 400,
               message: 'Invalid cert length'
            });
         }
         return digest;
      }
   }, {
      key: 'end',
      value: function () {
         var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee120() {
            return regeneratorRuntime.wrap(function _callee120$(_context120) {
               while (1) {
                  switch (_context120.prev = _context120.next) {
                     case 0:
                        this.logger.info('end');

                        if (!redis) {
                           _context120.next = 4;
                           break;
                        }

                        _context120.next = 4;
                        return this.redis.quitAsync();

                     case 4:
                        if (this.expressServer) {
                           this.expressServer.close();
                        }

                     case 5:
                     case 'end':
                        return _context120.stop();
                  }
               }
            }, _callee120, this);
         }));

         function end() {
            return ref.apply(this, arguments);
         }

         return end;
      }()
   }]);

   return rquery;
}();

exports.default = rquery;
//# sourceMappingURL=rquery.js.map