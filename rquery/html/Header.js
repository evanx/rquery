
import {header as styles} from './styles';

const logger = Loggers.create(module.filename);

export default function (props) {
   assert(Values.isDefined(props.config.assetsUrl), 'assetsUrl');
   const reqx = props.reqx || {};
   const helpPath = props.helpPath || reqx.helpPath || '/routes';
   const backPath = props.backPath || reqx.backPath || helpPath;
   const clickScript = If.elseFn(backPath, '', HtmlElements.onClick);
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
