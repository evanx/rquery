
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
            <title>${props.title}</title>
            <meta name='viewport' content=${viewportContentArray.join(', ')}/>
         </head>
         <body style='padding: 10pt'>
         ${props.content}
         </body>
      </html>
      `;
   }
}
