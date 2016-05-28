
import {footer as styles} from './styles';

const logger = Loggers.create(module.filename);

export default function (props) {
   assert(Values.isDefined(props.config.assetsUrl), 'assetsUrl');
   const reqx = props.reqx || {};
   const homePath = Hx.renderPath(props.helpPath || reqx.helpPath) || '/routes';
   let clickScript = '';
   if (homePath) {
      clickScript = `window.location.pathname='${homePath}'`;
   }
   const content = []
   content.push(He.img({style: styles.icon,
      src: `${props.config.assetsUrl}/icomoon/png20-38/${props.icon || 'database'}.png`})
   );
   return Hs.footer(styles.container, '');
}
