
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
               <title>{this.props.account}/{this.props.keyspace}</title>
               <meta name='viewport' content={viewportContentArray.join(', ')}/>
            </head>
            <body style={{padding: 10}}>
               <h1>/ak/{this.props.account}/{this.props.keyspace}</h1>
               <h3>{this.props.message}</h3>
               {this.props.exampleUrls.map((url, index) => {
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
               })}
               {this.props.keyspaceCommands.map((command, index) => {
                  return (
                     <div key={index}>
                        <span>{command}</span>
                     </div>
                  );
               })}
            </body>
         </html>
      );
   }
}
