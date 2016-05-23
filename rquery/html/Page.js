
import styles from './styles';

import {default as renderHeader} from './Header';

const logger = Loggers.create(module.filename);

const viewportContentArray = [
   'width=device-width',
   'maximum-scale=1.0',
   'minimum-scale=1.0',
   'initial-scale=1.0',
   'user-scalable=no'
];

export default function (props) {
   logger.debug('props', Object.keys(props));
   assert(props.config.assetsUrl, 'assetsUrl');
   const content = HtmlElements.renderContent(props.content);
   const reqx = props.reqx || {};
   let helpScript = '';
   if (reqx.helpPath) {
      helpScript = `window.location.pathname = "${reqx.helpPath}"`;
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
   <meta name="viewport" content="${viewportContentArray.join(', ')}"/>
   </head>
   <body style="padding: ${bodyPadding(props)}; max-width: 768px">
   ${renderHeader(props)}
   <article onClick="${helpScript}" style="padding-top:10px">
   ${content}
   </article>
   </body>
   </html>
   `;
}

function bodyPadding({req}) {
   if (req) {
      const ua = req.get('user-agent');
      if (ua.match(/Mobile/)) {
      } else {
         return '10px 10px 10px 100px';
      }
   }
   return '10px';
}
