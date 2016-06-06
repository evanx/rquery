'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});
exports.sendResult = undefined;

var _bluebird = require('bluebird');

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var sendResult = exports.sendResult = function () {
   var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee(command, req, res, reqx, result) {
      var _global, rquery, userAgent, uaMatch, mobile, otherResult, resultString;

      return regeneratorRuntime.wrap(function _callee$(_context) {
         while (1) {
            switch (_context.prev = _context.next) {
               case 0:
                  _global = global;
                  rquery = _global.rquery;

                  logger.info(Loggers.keys(rquery.config, 'config'));
                  assert(rquery, 'rquery');
                  userAgent = req.get('User-Agent');
                  uaMatch = userAgent.match(/\s([A-Z][a-z]*\/[\.0-9]+)\s/);

                  rquery.logger.debug('sendResult ua', !uaMatch ? userAgent : uaMatch[1]);
                  command = command || {};
                  mobile = rquery.isMobile(req);

                  rquery.logger.debug('sendResult mobile', mobile, command.key);
                  if (rquery.isDevelopment(req)) {
                     rquery.logger.debug('sendResult command', command.key, req.params, lodash.isArray(result));
                  } else {}

                  if (!command.sendResult) {
                     _context.next = 24;
                     break;
                  }

                  if (!lodash.isFunction(command.sendResult)) {
                     _context.next = 23;
                     break;
                  }

                  _context.next = 15;
                  return command.sendResult(req, res, reqx, result);

               case 15:
                  otherResult = _context.sent;

                  if (!(otherResult === undefined)) {
                     _context.next = 20;
                     break;
                  }

                  return _context.abrupt('return');

               case 20:
                  result = otherResult;

               case 21:
                  _context.next = 24;
                  break;

               case 23:
                  throw new ValidationError('command.sendResult type: ' + _typeof(command.sendResult));

               case 24:
                  resultString = '';

                  if (Values.isDefined(result)) {
                     _context.next = 29;
                     break;
                  }

                  rquery.logger.error('sendResult none');
                  _context.next = 58;
                  break;

               case 29:
                  if (!(Values.isDefined(req.query.json) || command.format === 'json' && !mobile)) {
                     _context.next = 34;
                     break;
                  }

                  res.json(result);
                  return _context.abrupt('return');

               case 34:
                  if (!Values.isDefined(req.query.quiet)) {
                     _context.next = 37;
                     break;
                  }

                  _context.next = 58;
                  break;

               case 37:
                  if (!(rquery.config.defaultFormat === 'cli' || Values.isDefined(req.query.line) || rquery.isCliDomain(req) || command.format === 'cli')) {
                     _context.next = 42;
                     break;
                  }

                  res.set('Content-Type', 'text/plain');
                  if (lodash.isArray(result)) {
                     if (mobile) {} else {
                        resultString = result.join('\n');
                     }
                  } else if (lodash.isObject(result)) {
                     if (command.resultObjectType === 'KeyedArrays') {
                        resultString = lodash.flatten(['message: ' + result.message].concat(Object.keys(result).filter(function (key) {
                           return !['message'].includes(key);
                        }).map(function (key) {
                           var value = result[key];
                           if (lodash.isArray(value)) {
                              var array = value;
                              return ['', key + ':'].concat(array.map(function (element) {
                                 return element.toString();
                              }));
                           } else if (typeof value === 'string') {
                              if (key === 'message') {
                                 return value;
                              } else {
                                 return key + ': ' + value;
                              }
                           } else {
                              return ['', key + ': type ' + (typeof value === 'undefined' ? 'undefined' : _typeof(value))];
                           }
                        }))).join('\n');
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
                  _context.next = 58;
                  break;

               case 42:
                  if (!(rquery.config.defaultFormat === 'plain' || Values.isDefined(req.query.plain) || command.format === 'plain')) {
                     _context.next = 47;
                     break;
                  }

                  res.set('Content-Type', 'text/plain');
                  if (lodash.isArray(result)) {
                     resultString = result.join('\n');
                  } else {
                     resultString = result.toString();
                  }
                  _context.next = 58;
                  break;

               case 47:
                  if (!(rquery.config.defaultFormat === 'json' && !mobile)) {
                     _context.next = 52;
                     break;
                  }

                  res.json(result);
                  return _context.abrupt('return');

               case 52:
                  if (!(rquery.config.defaultFormat === 'html' || Values.isDefined(req.query.html) || command.format === 'html' || rquery.isHtmlDomain(req) || mobile)) {
                     _context.next = 56;
                     break;
                  }

                  return _context.abrupt('return', sendHtmlResult(command, req, res, reqx, result));

               case 56:
                  rquery.sendError(req, res, reqx, { message: 'Invalid default format: ' + rquery.config.defaultFormat });
                  return _context.abrupt('return');

               case 58:
                  res.send(resultString + '\n');

               case 59:
               case 'end':
                  return _context.stop();
            }
         }
      }, _callee, this);
   }));
   return function sendResult(_x, _x2, _x3, _x4, _x5) {
      return ref.apply(this, arguments);
   };
}();

var _styles = require('../html/styles');

var _styles2 = _interopRequireDefault(_styles);

var _KeyspaceHelp = require('../html/KeyspaceHelp');

var KeyspaceHelp = _interopRequireWildcard(_KeyspaceHelp);

var _Page = require('../html/Page');

var _Page2 = _interopRequireDefault(_Page);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var logger = Loggers.create(module.filename);

function sendHtmlResult(command, req, res, reqx, result) {
   var _global2 = global;
   var rquery = _global2.rquery;

   var title = rquery.config.serviceLabel;
   var heading = void 0,
       icon = void 0;
   if (reqx.account && reqx.keyspace) {
      var keyspaceLabel = KeyspaceHelp.obscureKeyspaceLabel(reqx);
      title = reqx.account + '/' + keyspaceLabel;
      heading = [Hc.b(reqx.account), Hs.tt(_styles2.default.header.keyspace, keyspaceLabel)].join('');
      icon = 'database';
   }
   var resultString = '';
   var resultArray = [];
   if (!Values.isDefined(result)) {} else if (result === null) {} else if (Values.isInteger(result)) {
      resultString = result.toString();
   } else if (lodash.isString(result)) {
      resultString = result;
   } else if (lodash.isArray(result)) {
      if (lodash.isFunction(command.renderHtmlEach)) {
         resultArray = result.map(function (element) {
            return command.renderHtmlEach(req, res, reqx, element);
         });
      } else {
         resultArray = lodash.flatten(result.map(function (element) {
            if (lodash.isObject(element)) {
               if (element.url && element.content) {
                  if (rquery.isBrowser(req)) {
                     return He.a({ href: element.url }, element.content);
                  } else {
                     return [element.content, element.url];
                  }
               }
            }
            return element;
         }));
      }
   } else if (lodash.isObject(result)) {
      resultArray = Object.keys(result).map(function (key) {
         return '<b>' + key + '</b> ' + result[key];
      });
   } else if (result) {
      resultString = result.toString();
   }
   res.set('Content-Type', 'text/html');
   var content = [];
   rquery.logger.debug('sendResult reqx', reqx, command, resultString, resultArray.length);
   if (command.key) {
      content.push(Hso.div(_styles2.default.result.commandKey, command.key.replace(/-/g, ' ')));
   }
   if (reqx.key) {
      content.push(Hso.div(_styles2.default.result.reqKey, reqx.key));
   }
   if (command.params) {
      content.push(Hso.pre(_styles2.default.result.commandParams, command.params.filter(function (key) {
         return key !== 'key';
      }).map(function (key) {
         return '<b>' + key + '</b> ' + req.params[key];
      }).join('\n')));
      rquery.logger.info('params', lodash.last(content));
   }
   var statusCode = 200;
   var emptyMessage = void 0;
   if (resultArray.length) {
      if (resultString) {
         rquery.logger.error('sendResult resultString', command, req.path);
      }
   } else if (!resultString) {
      //statusCode = 404;
      resultString = '<i>&lt;empty&gt;</i>';
   }
   if (resultString) {
      resultArray.push(resultString);
   }
   content.push(Hs.pre(_styles2.default.result.resultArray, lodash.compact(resultArray).join('\n')));
   var hints = [];
   if (command && reqx.account && reqx.keyspace) {
      if (command.relatedCommands) {
         try {
            hints = getRelatedCommandHints(req, reqx, command.relatedCommands);
         } catch (err) {
            rquery.logger.error('related', err, err.stack);
         }
      }
      if (reqx.account !== 'hub') {
         hints.push({
            url: '/account-keyspaces/' + reqx.account,
            description: 'view sample keyspace commands'
         });
      }
      hints.push({
         url: 'https://web.telegram.org/#/im?p=@redishub_bot',
         description: 'See @redishub_bot on Telegram.org'
      });
      hints.push({
         uri: ['help'],
         description: 'view sample keyspace commands'
      });
      var renderedPathHints = hints.filter(function (hint) {
         return !hint.url;
      }).map(function (hint) {
         var path = HtmlElements.renderPath(['ak', reqx.account, reqx.keyspace].concat(_toConsumableArray(hint.uri)).join('/'));
         hint = Object.assign({ path: path }, hint);
         return hint;
      }).map(function (hint) {
         var uriLabel = [Hc.b(hint.uri[0])].concat(_toConsumableArray(hint.uri.slice(1))).join('/');
         rquery.logger.debug('hint', uriLabel, hint);
         return He.div({
            style: _styles2.default.result.hint.container,
            onClick: HtmlElements.onClick({ href: hint.path })
         }, [Hso.div(_styles2.default.result.hint.message, hint.message), Hso.div(_styles2.default.result.hint.link, 'Try: ' + Hs.tt(_styles2.default.result.hint.uri, uriLabel)), Hso.div(_styles2.default.result.hint.description, lodash.capitalize(hint.description))]);
      });
      renderedPathHints = renderedPathHints.concat(hints.filter(function (hint) {
         return hint.url && !hint.uri;
      }).map(function (hint) {
         return hint;
      }).map(function (hint) {
         return He.div({
            style: _styles2.default.result.hint.container,
            onClick: HtmlElements.onClick({ href: hint.url })
         }, [Hso.div(_styles2.default.result.hint.message, hint.message), Hso.div(_styles2.default.result.hint.description, lodash.capitalize(hint.description))]);
      }));
      rquery.logger.debug('renderedPathHints', renderedPathHints);
      content.push(renderedPathHints);
      var otherHints = hints.filter(function (hint) {
         return !hint.uri && hint.commandKey;
      });
      var renderedOtherHints = otherHints.map(function (hint) {
         return He.div({
            style: _styles2.default.result.hint.container
         }, [Hso.div(_styles2.default.result.hint.message, hint.message), Hso.div(_styles2.default.result.hint.link, 'Try: ' + Hs.tt(_styles2.default.result.hint.uri, Hc.b(hint.commandKey))), Hso.div(_styles2.default.result.hint.description, hint.description)]);
      });
      content.push(renderedOtherHints);
   }
   res.status(statusCode).send((0, _Page2.default)({
      config: rquery.config, req: req, reqx: reqx, title: title, heading: heading, icon: icon, content: content
   }));
}

function getRelatedCommandHints(req, reqx, relatedCommands) {
   var _global3 = global;
   var rquery = _global3.rquery;

   return lodash.compact(relatedCommands.map(function (commandKey) {
      return rquery.commandMap.get(commandKey);
   }).filter(function (command) {
      return command && command.key && command.params;
   }).filter(function (command) {
      return !rquery.isSecureDomain(req) || !command.access || lodash.includes(['get', 'debug'], command.access);
   }).map(function (command) {
      var uri = [command.key];
      var params = command.params.map(function (key) {
         var value = req.params[key] || [];
         if (command && command.exampleKeyParams && command.exampleKeyParams.hasOwnProperty(key)) {
            value = command.exampleKeyParams[key];
         }
         rquery.logger.info('related', key, value);
         return value;
      });
      rquery.logger.info('related params', params);
      if (params.length !== command.params.length) {
         rquery.logger.warn('params length', command);
         return null;
      } else {
         var _uri;

         uri = (_uri = uri).concat.apply(_uri, _toConsumableArray(params));
      }
      return {
         uri: uri,
         description: command.description
      };
   }));
}
//# sourceMappingURL=Result.js.map