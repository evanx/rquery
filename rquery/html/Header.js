
import {header as styles} from './styles';

const logger = Loggers.create(module.filename);

logger.info('zz', styles);

export default function (props) {
   assert(props.config.assetsUrl, 'assetsUrl');
   const reqx = props.reqx || {};
   const homePath = Hx.renderPath(reqx.helpPath) || '/routes';
   let clickScript = '';
   if (homePath) {
      clickScript = `window.location.pathname='${homePath}'`;
   }
   return `
   <header style="${styles.container}" onClick="${clickScript}">
      <img style="${styles.icon}" src="${props.config.assetsUrl}/icomoon/png20-38/home.png"/>
      <span style="${styles.title}">${props.title}</span>
   </header>
   `;
}
