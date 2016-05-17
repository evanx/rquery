
import React from 'react';

const logger = Loggers.create(module.filename);

const viewportContentArray = [
   'width=device-width',
   'maximum-scale=1.0',
   'minimum-scale=1.0',
   'initial-scale=1.0',
   'user-scalable=no'
];

export default class extends React.Component {

   render() {
      logger.debug('props', this.props);
      return (
         <html>
            <head>
               <title>{this.props.reqx.account}/{this.props.reqx.keyspace}</title>
               <meta name='viewport' content={viewportContentArray.join(', ')}/>
            </head>
            <body style={{padding: 10}}>
               <h1>/ak/{this.props.reqx.account}/{this.props.reqx.keyspace}</h1>
               <h3>{this.props.result.message}</h3>
               {this.renderUrls(this.props.result.exampleUrls)}
               {this.renderCommands(this.props.result.keyspaceCommands)}
            </body>
         </html>
      );
   }

   renderUrls(urls) {
      return urls.map((url, index) => {
         const match = url.match(/^https:\/\/[a-z]+\.redishub\.com(\/\S+)$/);
         if (match) {
            return (
               <p key={index}>
                  <a href={url}>{match.pop()}</a>
               </p>
            );
         } else {
            return (
               <p>
                  <a href={url}>{url}</a>
               </p>
            );
         }
      });
   }

   renderCommands(commands) {
      return commands.map((command, index) => {
         return (
            <div key={index}>
               <span>{command}</span>
            </div>
         );
      });
   }

}
