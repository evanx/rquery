
import styles from './styles';

const CustomCommandKeys = ['ttls'];

const logger = Loggers.create(module.filename, 'debug');

export function obscureKeyspaceLabel(reqx) {
   if (reqx.account === 'hub' && reqx.keyspace.length > 6) {
      return reqx.keyspace.substring(0, 6);
   } else {
      return reqx.keyspace;
   }
}

export function render(props) {
   let keyspaceLabel = obscureKeyspaceLabel(props.reqx);
   logger.debug('props', keyspaceLabel, Object.keys(props), Object.keys(Hx));
   const commands = props.result.commands
   .filter(command => !['help', 'routes', 'about'].includes(command.key))
   .filter(command => !command.key.startsWith('verify'))
   .filter(command => !command.key.startsWith('gen'))
   .filter(command => !command.key.includes('keyspace'))
   .filter(command => !command.key.includes('register'));
   const customCommands = commands
   .filter(command => isCustomCommand(command));
   logger.debug('customCommands', customCommands.map(command => command.key).join(' '));
   const standardCommands = commands
   .filter(command => !isCustomCommand(command));
   logger.debug('standardCommands', standardCommands.map(command => command.key).join(' '));
   logger.debug('zz', Loggers.keys(props.result));
   return Object.assign(props, {
      title: [props.reqx.account, keyspaceLabel].join('/'),
      heading: [Hc.b(props.reqx.account), Hs.tt(styles.header.keyspace, keyspaceLabel)].join(''),
      backPath: '/routes',
      icon: 'database',
      helpPath: ['routes'],
      content: [
         Hs.div(styles.result.message, props.result.message),
         Hso.p(styles.result.description, props.result.description),
         renderUrls(props.result.exampleUrls, props.commandMap),
         He.br(),
         Hs.h4(styles.result.message, props.result.commandReferenceMessage),
         renderStandardCommands(standardCommands),
         Hs.h4(styles.result.message, props.result.customCommandHeading),
         renderCustomCommands(customCommands),
      ]
   });
}

function renderUrls(urls, commandMap) {
   return urls.map((url, index) => {
      const urip = url.split('://')[1].split('/').slice(2);
      const [account, keyspace, commandKey, ...params] = urip;
      logger.debug('render url', url, commandKey, params, commandMap.get(commandKey));
      if (commandKey) {
         let description = '';
         const command = commandMap.get(commandKey);
         if (command) {
            if (command.description) {
               description = lodash.capitalize(command.description);
            }
         }
         return html`
         <div style=${styles.keyspaceHelp.linkContainer}>
            <a href=${url}>
               <div style=${styles.keyspaceHelp.command}>
                  <b>${commandKey}</b> ${params || ''}
               </div>
               <div style=${styles.keyspaceHelp.commandDescription}>${description}</div>
            </a>
         </div>
         `;
      } else {
         return html`
         <div style="${styles.keyspaceHelp.linkContainer}">
            <a href=${url}>${url}</a>
         </div>
         `;
      }
   });
}

function isCustomCommand(command) {
   return (command.key.indexOf('-') > 0) || ['ttls', 'types', 'rrange', 'rrevrange'].includes(command.key);
}

function getCommandLink(command) {
   return 'http://redis.io/commands/' + command.key.toUpperCase();
}

function renderUpperCaseCommandString(command) {
   if (!command.params) {
      return command.key;
   }
   return [Hc.b(command.key.toUpperCase()), ...command.params].join(' ');
}

function renderCommandString(command) {
   if (!command.params) {
      return command.key;
   }
   return [Hc.b(command.key), ...command.params].join(' ');
}

function renderCustomCommands(commands) {
   return commands.map(command => {
      const commandString = renderCommandString(command);
      return [
         Hs.div(styles.keyspaceHelp.command, Hc.span(commandString)),
      ];
   });
}

function renderStandardCommands(commands) {
   return commands.map(command => {
      const commandString = renderUpperCaseCommandString(command);
      const href = getCommandLink(command);
      return [
         Hs.div(styles.keyspaceHelp.command, He.a({href}, commandString))
      ];
   });
}
