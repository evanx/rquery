
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
      assert(props.config.assetsUrl, 'assetsUrl');
      let content = '';
      if (lodash.isArray(props.content)) {
         content = props.content.join('\n');
      } else if (lodash.isString(props.content)) {
         content = props.content;
      } else {
         logger.error('props.content type', typeof props.content);
         content = props.content.toString();
      }
      content = content.replace(/\n\s*/g, '\n');
      this.reqx = props.reqx || {};
      let helpScript = '';
      if (this.reqx.helpPath) {
         helpScript = `window.location.pathname = '${this.reqx.helpPath}'`;
      }
      return `
      <html>
      <head>
      <title>${props.title}</title>
      <style>
         a {
            text-decoration: none;
         }
         pre {
            background-color: #f8f8f8;
            padding: 5px;
         }
      </style>
      <meta name='viewport' content=${viewportContentArray.join(', ')}/>
      </head>
      <body style='padding: ${this.bodyPadding(props)}; max-width: 768px'>
      <header style=''>
      <img style='opacity:.5' src='${props.config.assetsUrl}/icomoon/png20-38/home.png'/>
      </header>
      <article onClick="${helpScript}"  style='padding-top: 10px'>
      ${content}
      </article>
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
