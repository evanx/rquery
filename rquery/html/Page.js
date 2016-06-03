
import styles from './styles';

import {default as renderHeader} from './Header';
import {default as renderFooter} from './Footer';

const logger = Loggers.create(module.filename);

const viewportContentArray = [
   'width=device-width',
   'initial-scale=1',
   //'maximum-scale=1.0',
   //'minimum-scale=1.0',
   //'user-scalable=no'
];

export default function (props) {
   logger.debug(Loggers.keys(props, 'props'));
   assert(Values.isDefined(props.config.assetsUrl), 'assetsUrl');
   const reqx = props.reqx || {};
   let article;
   if (reqx.helpPath) {
      const helpScript = `window.location.pathname='${reqx.helpPath}'`;
      article = html`<article>${props.content}</article>`;
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
   <link href='https://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css'>
   <link href='https://fonts.googleapis.com/css?family=Ubuntu' rel='stylesheet' type='text/css'>
   </head>
   <body>
   ${renderHeader(Object.assign({icon: 'home'}, props))}
   ${article}
   ${renderFooter(props)}
   </body>
   </html>
   `;
}
