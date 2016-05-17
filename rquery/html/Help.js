
const logger = Loggers.create(module.filename);

export default class {

   render(props) {
      this.props = props;
      logger.debug('props', props);
      return {
         title: `Help | ${props.config.serviceLabel}`,
         content: `
         <h1>${props.config.serviceLabel}</h1>
         <h3>Basic</h3>
         ${this.renderUrls(props.result.common).join('\n')}
         <h3>Telegram</h3>
         ${this.renderPaths(props.result.telegram).join('\n')}
         <h3>Account</h3>
         ${this.renderPaths(props.result.account).join('\n')}
         <h3>Account keyspace</h3>
         ${this.renderPaths(props.result.accountKeyspace).join('\n')}
         `
      };
   }

   renderUrls(urls) {
      return urls.map((url, index) => {
         const match = url.match(/^https:\/\/[^\/]+(\/\S+)$/);
         logger.debug('renderUrls', url, match);
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

   renderPaths(paths) {
      return paths.map((path, index) => {
         return `
         <div>
         <span>${path}</span>
         </div>
         `;
      })
   }
}
