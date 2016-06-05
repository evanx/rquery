'use strict';

var _bluebird = require('bluebird');

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
         var hostUrl, routes, accountOnlyRoutes;
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
                     return _context2.abrupt('return', {
                        message: [If.thenElse(req.params.account, 'Try to create a new keyspace', ContentArray.render(rquery.getContentType(req), [{
                           url: 'https://web.telegram.org/#/im?p=@redishub_bot',
                           content: 'Try "@' + rquery.config.adminBotName + '_bot /signup"'
                        }]))],
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

                  case 9:
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