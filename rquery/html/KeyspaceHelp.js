
const logger = Loggers.create(module.filename);

export default class {

   render(props) {
      this.props = props;
      logger.debug('props', props);
      return {
         title: `${props.config.serviceLabel} | ${props.reqx.account}/${props.reqx.keyspace}`,
         content: `
         <h1>/ak/${props.reqx.account}/${props.reqx.keyspace}</h1>
         <h3>${props.result.message}</h3>
         ${this.renderUrls(this.props.result.exampleUrls).join('\n')}
         ${this.renderCommands(this.props.result.keyspaceCommands).join('\n')}
         `
      };
   }

   renderUrls(urls) {
      return urls.map((url, index) => {
         const match = url.match(/^https:\/\/[a-z]+\.redishub\.com(\/\S+)$/);
         if (match) {
            return `
            <p>
            <a href=${url}>${match.pop()}</a>
            </p>
            `;
         } else {
            return `
            <p>
            <a href=${url}>${url}</a>
            </p>
            `;
         }
      });
   }

   renderCommands(commands) {
      return commands.map((command, index) => {
         return `
         <div>
         <span>${command}</span>
         </div>
         `;
      })
   }
}
