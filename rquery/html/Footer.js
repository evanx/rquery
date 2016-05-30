
import {footer as styles} from './styles';

const logger = Loggers.create(module.filename);

export default function (props) {
   assert(Values.isDefined(props.config.assetsUrl), 'assetsUrl');
   const reqx = props.reqx || {};
   const backPath = Hx.renderPath(props.helpPath || reqx.helpPath) || '/routes';
   let clickScript = '';
   if (backPath) {
      clickScript = `window.location.pathname='${backPath}'`;
   }
   const content = []
   content.push(He.img({style: styles.icon,
      src: `${props.config.assetsUrl}/icomoon/png20-38/${props.icon || 'database'}.png`})
   );
   return Hs.footer(styles.container, '');
}
