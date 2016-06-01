
import {header as styles} from './styles';

const logger = Loggers.create(module.filename);

export default function (props) {
   assert(Values.isDefined(props.config.assetsUrl), 'assetsUrl');
   const reqx = props.reqx || {};
   let backUrl = Hx.renderPath(props.backUrl || reqx.backUrl) || '/routes';
   const helpPath = Hx.renderPath(props.helpPath || reqx.helpPath) || '/routes';
   if (helpPath) {
      backUrl = helpPath;
   }
   let clickScript = '';
   if (backUrl) {
      clickScript = `window.location.pathname='${backUrl}'`;
   }
   const content = []
   content.push(He.img({style: styles.icon,
      src: `${props.config.assetsUrl}/icomoon/png20-38/${props.icon || 'database'}.png`})
   );
   if (props.heading) {
      content.push(Hs.span(styles.heading, props.heading));
   } else if (props.title) {
      content.push(Hs.span(styles.title, props.title));
   }
   return He.header({style: styles.container, onClick: clickScript}, ...content);
}
