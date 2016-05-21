
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
      logger.debug('props', Object.keys(props));
      const content = props.content.replace(/\n\s*/g, '\n');
      return `
      <html>
      <head>
      <title>${props.title}</title>
      <style>
         pre {
            background-color: #f2f2f2;
            padding: 5px;
         }
      </style>
      <meta name='viewport' content=${viewportContentArray.join(', ')}/>
      </head>
      <body style='padding: ${this.bodyPadding(props)}; max-width: 768px'>
      ${content}
      </body>
      </html>
      `;
   }

   bodyPadding({req}) {
      if (req) {
         const ua = req.get('user-agent');
         if (ua.match(/Mobile/)) {
         } else {
            return '10px 10px 10px 100px';
         }
      }
      return '10px';
   }
}
