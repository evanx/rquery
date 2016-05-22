
const logger = Loggers.create(module.filename);

export default class {

   render(props) {
      this.props = props;
      logger.debug('props', Object.keys(props));
      return {
         req: props.req,
         title: `Help | ${props.config.serviceLabel}`,
         content: `
         <h1>${props.config.serviceLabel}</h1>
         <h3>Basic</h3>
         ${this.renderUrls(props.result.common).join('\n')}
         <h3>Ephemeral</h3>
         ${this.renderPaths(props.result.ephemeral).join('\n')}
         <h3>Miscellaneous</h3>
         ${this.renderPaths(props.result.misc).join('\n')}
         <h3>Telegram</h3>
         ${this.renderPaths(props.result.telegram).join('\n')}
         ${this.renderAccount(props.result.account)}
         <h3>Account keyspace</h3>
         ${this.renderPaths(props.result.accountKeyspace).join('\n')}
         `
      };
   }

   renderAccount(account) {
      if (!account.length) {
         return '';
      } else {
         return `<h3>Account</h3>
         ${this.renderPaths(account).join('\n')}
         `;
      }
   }

   renderUrls(urls) {
      return urls.map((url, index) => {
         const [matching, path] = url.match(/^https?:\/\/[^\/]+(\/\S+)$/) || [];
         logger.debug('renderUrls', url, matching);
         if (matching) {
            return `
            <div style='line-height: 1.5'>
            <a href=${url}>${path}</a>
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
