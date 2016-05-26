
import styles from './styles';

const logger = Loggers.create(module.filename);

export default function (props) {
   logger.debug('props', Object.keys(props), Object.keys(Hx));
   return Object.assign(props, {
      title: [props.reqx.account, props.reqx.keyspace].join('/'),
      heading: [Hc.b(props.reqx.account), Hs.tt(styles.header.keyspace, props.reqx.keyspace)].join(''),
      helpPath: '/routes',
      icon: 'database',
      helpPath: ['routes'],
      content: [
         Hc.h3(props.result.message),
         He.p(Styles.meta('repeat', styles.result.description), props.result.description),
         renderUrls(props.result.exampleUrls),
         He.br(),
         renderCommands(props.result.keyspaceCommands)
      ]
   });
}

function renderUrls(urls) {
   return urls.map((url, index) => {
      const [matching, hostUrl, command, params] = url.match(/^(https?:\/\/[^\/]+)\/ak\/[^\/]+\/[^\/]+\/([^\/]+)(\/\S+)?$/) || [];
      if (matching) {
         return html`
         <div style="${styles.keyspaceHelp.linkContainer}">
         <a href=${url}><b>${command}</b>${params || ''}</a>
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

function renderCommands(commands) {
   return commands.map((command, index) => {
      return Hs.div(styles.keyspaceHelp.command, Hc.span(command));
   })
}
