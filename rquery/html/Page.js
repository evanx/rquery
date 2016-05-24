
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
   const reqx = props.reqx || {};
   let article;
   if (reqx.helpPath) {
      const helpScript = `window.location.pathname='${reqx.helpPath}'`;
      article = html`<article onClick=${helpScript}>${props.content}</article>`;
   } else {
      article = html`<article>${props.content}</article>`;
   }
   const ua = props.req.get('user-agent');
   const styleSheet = Styles.getCachedUserAgentStyleSheet({styles, key: 'resets', ua});
   return html`
   <html>
   <head>
   <title>${props.title}</title>
   <style>${styleSheet}</style>
   <meta name="viewport" content=${viewportContentArray.join(', ')}/>
   </head>
   <body>
   ${renderHeader(Object.assign({icon: 'home'}, props))}
   ${article}
   </body>
   </html>
   `;
}
