'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _templateObject = _taggedTemplateLiteral(['\n         <div style=', '>\n            <a href=', '>\n               <div style=', '>\n                  <b>', '</b> ', '\n               </div>\n               <div style=', '>', '</div>\n            </a>\n         </div>\n         '], ['\n         <div style=', '>\n            <a href=', '>\n               <div style=', '>\n                  <b>', '</b> ', '\n               </div>\n               <div style=', '>', '</div>\n            </a>\n         </div>\n         ']),
    _templateObject2 = _taggedTemplateLiteral(['\n         <div style="', '">\n            <a href=', '>', '</a>\n         </div>\n         '], ['\n         <div style="', '">\n            <a href=', '>', '</a>\n         </div>\n         ']);

exports.obscureKeyspaceLabel = obscureKeyspaceLabel;
exports.render = render;

var _styles = require('./styles');

var _styles2 = _interopRequireDefault(_styles);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var CustomCommandKeys = ['ttls'];

var logger = Loggers.create(module.filename, 'debug');

function obscureKeyspaceLabel(reqx) {
   if (reqx.account === 'hub' && reqx.keyspace.length > 6) {
      return reqx.keyspace.substring(0, 6);
   } else {
      return reqx.keyspace;
   }
}

function render(props) {
   var keyspaceLabel = obscureKeyspaceLabel(props.reqx);
   logger.debug('props', keyspaceLabel, Object.keys(props), Object.keys(Hx));
   var commands = props.result.commands.filter(function (command) {
      return !['help', 'routes', 'about'].includes(command.key);
   }).filter(function (command) {
      return !command.key.startsWith('verify');
   }).filter(function (command) {
      return !command.key.startsWith('gen');
   }).filter(function (command) {
      return !command.key.includes('keyspace');
   }).filter(function (command) {
      return !command.key.includes('register');
   });
   var customCommands = commands.filter(function (command) {
      return isCustomCommand(command);
   });
   logger.debug('customCommands', customCommands.map(function (command) {
      return command.key;
   }).join(' '));
   var standardCommands = commands.filter(function (command) {
      return !isCustomCommand(command);
   });
   logger.debug('standardCommands', standardCommands.map(function (command) {
      return command.key;
   }).join(' '));
   return Object.assign(props, {
      title: [props.reqx.account, keyspaceLabel].join('/'),
      heading: [Hc.b(props.reqx.account), Hs.tt(_styles2.default.header.keyspace, keyspaceLabel)].join(''),
      backPath: '/routes',
      icon: 'database',
      helpPath: ['routes'],
      content: [Hs.div(_styles2.default.result.message, props.result.message), Hso.p(_styles2.default.result.description, props.result.description), renderUrls(props.result.exampleUrls, props.commandMap), He.br(), Hs.h4(_styles2.default.result.message, props.result.commandReferenceMessage), renderStandardCommands(standardCommands), Hs.h4(_styles2.default.result.message, props.result.customCommandHeading), renderCustomCommands(customCommands)]
   });
}

function renderUrls(urls, commandMap) {
   return urls.map(function (url, index) {
      var urip = url.split('://')[1].split('/').slice(2);

      var _urip = _toArray(urip);

      var account = _urip[0];
      var keyspace = _urip[1];
      var commandKey = _urip[2];

      var params = _urip.slice(3);

      logger.debug('render url', url, commandKey, params, commandMap.get(commandKey));
      if (commandKey) {
         var description = '';
         var command = commandMap.get(commandKey);
         if (command) {
            if (command.description) {
               description = lodash.capitalize(command.description);
            }
         }
         return html(_templateObject, _styles2.default.keyspaceHelp.linkContainer, url, _styles2.default.keyspaceHelp.command, commandKey, params || '', _styles2.default.keyspaceHelp.commandDescription, description);
      } else {
         return html(_templateObject2, _styles2.default.keyspaceHelp.linkContainer, url, url);
      }
   });
}

function isCustomCommand(command) {
   return command.key.indexOf('-') > 0 || ['ttls', 'types', 'rrange', 'rrevrange'].includes(command.key);
}

function getCommandLink(command) {
   return 'http://redis.io/commands/' + command.key.toUpperCase();
}

function renderUpperCaseCommandString(command) {
   if (!command.params) {
      return Hc.b(command.key.toUpperCase());
   } else {
      return [Hc.b(command.key.toUpperCase())].concat(_toConsumableArray(command.params)).join(' ');
   }
}

function renderCommandString(command) {
   if (!command.params) {
      return Hc.b(command.key);
   } else {
      return [Hc.b(command.key)].concat(_toConsumableArray(command.params)).join(' ');
   }
}

function renderCustomCommands(commands) {
   return commands.map(function (command) {
      var commandString = renderCommandString(command);
      return [Hs.div(_styles2.default.keyspaceHelp.command, Hc.span(commandString))];
   });
}

function renderStandardCommands(commands) {
   return commands.map(function (command) {
      var commandString = renderUpperCaseCommandString(command);
      var href = getCommandLink(command);
      return [Hs.div(_styles2.default.keyspaceHelp.command, He.a({ href: href }, commandString))];
   });
}
//# sourceMappingURL=KeyspaceHelp.js.map