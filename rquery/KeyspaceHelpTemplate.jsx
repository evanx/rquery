
const logger = Loggers.create(module.filename);

const viewportContentArray = [
   'width=device-width',
   'maximum-scale=1.0',
   'minimum-scale=1.0',
   'initial-scale=1.0',
   'user-scalable=no'
];

export default class {

   render(props) {
      this.props = props;
      logger.debug('props', props);
      return `
      <html>
         <head>
            <title>${props.reqx.account}/${props.reqx.keyspace}</title>
            <meta name='viewport' content={viewportContentArray.join(', ')}/>
         </head>
         <body style='padding: 10pt'>
            <h1>/ak/${props.reqx.account}/${props.reqx.keyspace}</h1>
            <h3>${props.result.message}</h3>
            ${this.renderUrls(this.props.result.exampleUrls).join('\n')}
            ${this.renderCommands(this.props.result.keyspaceCommands).join('\n')}
         </body>
      </html>
      `;
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
