'use strict';

var _bluebird = require('bluebird');

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _Page = require('../html/Page');

var _Page2 = _interopRequireDefault(_Page);

var _Help = require('../html/Help');

var _Help2 = _interopRequireDefault(_Help);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = Loggers.create(module.filename);
var rquery = global.rquery;
assert(rquery.config, 'rquery.config');

module.exports = {
   key: 'routes',
   access: 'debug',
   aliases: ['/'],
   resultObjectType: 'KeyedArrays',
   sendResult: function () {
      var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee(req, res, reqx, result) {
         return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
               switch (_context.prev = _context.next) {
                  case 0:
                     if (!rquery.isCliDomain(req)) {
                        _context.next = 4;
                        break;
                     }

                     return _context.abrupt('return', result);

                  case 4:
                     res.set('Content-Type', 'text/html');
                     res.send((0, _Page2.default)((0, _Help2.default)({
                        config: rquery.config, req: req, result: result, homePath: '/'
                     })));

                  case 6:
                  case 'end':
                     return _context.stop();
               }
            }
         }, _callee, undefined);
      }));

      function sendResult(_x, _x2, _x3, _x4) {
         return ref.apply(this, arguments);
      }

      return sendResult;
   }(),
   handleReq: function () {
      var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee2(req, res, reqx) {
         var hostUrl, routes, accountOnlyRoutes, account, dn, names, sessionId, _ref, _ref2, _ref2$, time, session, id, role, $, messages;

         return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
               switch (_context2.prev = _context2.next) {
                  case 0:
                     assert(reqx.command === module.exports, 'command');
                     assert(lodash.isFunction(rquery.isSecureDomain), 'rquery');
                     hostUrl = rquery.config.hostUrl;

                     if (rquery.config.hostDomain != 'localhost') {
                        hostUrl = 'https://' + req.hostname;
                     }
                     routes = Express.getRoutes(rquery.expressApp).filter(function (route) {
                        return !['/', '/routes', '/webhook-telegram/*', '/help', '/about'].includes(route);
                     });

                     assert(lodash.isArray(routes) && routes.length, 'routes: ' + routes.length);
                     accountOnlyRoutes = routes.filter(function (route) {
                        return route.includes(':account') && !route.includes(':keyspace');
                     });

                     logger.debug('routes', routes.length);
                     account = void 0;

                     try {
                        dn = req.get('ssl_client_s_dn');

                        if (dn) {
                           names = rquery.parseDn(dn);

                           if (names.o.match(/^[\-_a-z]+$/)) {
                              account = names.o;
                           }
                           logger.debug('dn', { dn: dn, names: names, account: account });
                        }
                     } catch (err) {
                        logger.error('cert', err);
                     }
                     sessionId = req.cookies.sessionId;

                     if (!(!account && sessionId)) {
                        _context2.next = 27;
                        break;
                     }

                     _context2.next = 14;
                     return undefined.redis.multiExecAsync(function (multi) {
                        multi.time();
                        multi.hgetall(undefined.adminKey('session', sessionId));
                     });

                  case 14:
                     _ref = _context2.sent;
                     _ref2 = _slicedToArray(_ref, 2);
                     _ref2$ = _slicedToArray(_ref2[0], 1);
                     time = _ref2$[0];
                     session = _ref2[1];

                     if (session) {
                        _context2.next = 21;
                        break;
                     }

                     throw ValidationError('Session expired or invalid');

                  case 21:
                     undefined.logger.debug('admin command', { account: account, time: time, session: session });
                     id = session.id;
                     role = session.role;

                     if (!(role !== 'admin')) {
                        _context2.next = 26;
                        break;
                     }

                     throw ValidationError('Admin role required');

                  case 26:
                     account = session.account;

                  case 27:
                     $ = rquery.getContentType(req) === 'html' ? He : Hp;
                     messages = account ? [$.a({ href: '/keyspaces/' + account }, 'List the keyspaces on your account')] : [$.a({ href: '/about' }, 'About ' + rquery.config.serviceLabel), $.a({ href: '/create-ephemeral' }, 'Create an ephemeral keyspace via /create-ephemeral'), $.a({
                        target: '_blank',
                        href: 'https://telegram.me/' + rquery.config.adminBotName + '?start'
                     }, 'Try "@' + rquery.config.adminBotName + ' /signup"')];
                     return _context2.abrupt('return', {
                        messages: messages,

                        common: routes.filter(function (route) {
                           return route;
                        }).filter(function (route) {
                           return !route.includes(':');
                        }).filter(function (route) {
                           return !['/epoch', '/register-ephemeral'].includes(route);
                        }).filter(function (route) {
                           return route !== '/enroll-cert' || rquery.isSecureDomain(req);
                        }).filter(function (route) {
                           return route !== '/register-cert' || rquery.isSecureDomain(req);
                        }).map(function (route) {
                           return '' + hostUrl + route;
                        }),

                        misc: routes.filter(function (route) {
                           return route.includes(':') && !route.includes('telegram') && !/\:(account|access)/.test(route);
                        }).map(function (route) {
                           return '' + route;
                        }),

                        ephemeral: routes.filter(function (route) {
                           return route.includes('-ephemeral') && route !== '/register-ephemeral';
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
                           return route.includes(':account') && route.includes(':keyspace/');
                        }).map(function (route) {
                           return '' + route;
                        })
                     });

                  case 30:
                  case 'end':
                     return _context2.stop();
               }
            }
         }, _callee2, undefined);
      }));

      function handleReq(_x5, _x6, _x7) {
         return ref.apply(this, arguments);
      }

      return handleReq;
   }()
};
//# sourceMappingURL=routes.js.map