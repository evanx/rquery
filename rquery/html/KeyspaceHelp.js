
const logger = Loggers.create(module.filename);

export default function (props) {
   logger.debug('props', Object.keys(props));
   return Object.assign(props, {
      title: `${props.config.serviceLabel} | ${props.reqx.account}/${props.reqx.keyspace}`,
      content: `
      <h2>/ak/${props.reqx.account}/${props.reqx.keyspace}</h2>
      <h3>${props.result.message}</h3>
      ${renderUrls(props.result.exampleUrls).join('\n')}
      <br/>
      ${renderCommands(props.result.keyspaceCommands).join('\n')}
      `
   });
}

function renderUrls(urls) {
   return urls.map((url, index) => {
      const [matching, hostUrl, command, params] = url.match(/^(https?:\/\/[^\/]+)\/ak\/[^\/]+\/[^\/]+\/([^\/]+)(\/\S+)?$/) || [];
      if (matching) {
         return `
         <div style='line-height: 1.5'>
         <a href=${url}><b>${command}</b>${params || ''}</a>
         </div>
         `;
      } else {
         return `
         <div style='line-height: 1.5'>
         <a href=${url}>${url}</a>
         </div>
         `;
      }
   });
}

function renderCommands(commands) {
   return commands.map((command, index) => {
      return `
      <div>
      <span>${command}</span>
      </div>
      `;
   })
}
