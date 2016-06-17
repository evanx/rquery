
import {header as styles} from './styles';

const logger = Loggers.create(module.filename);

export default function (props) {
   assert(Values.isDefined(props.config.assetsUrl), 'assetsUrl');
   const reqx = props.reqx || {};
   const helpPath = props.helpPath || reqx.helpPath || '/routes';
   const backPath = props.backPath || reqx.backPath || helpPath;
   const content = []
   content.push(He.img({style: styles.icon,
      src: `${props.config.assetsUrl}/icomoon/png20-38/database.png`}) // TODO props.icon
   );
   if (props.heading) {
      content.push(Hs.span(styles.heading, props.heading));
   } else if (props.title) {
      content.push(Hs.span(styles.title, props.title));
   }
   if (backPath[0] != '/') {
      return He.a({style: styles.container, href: backPath, target: '_blank'}, ...content);
   } else {
      return He.header({
         style: styles.container,
         onClick: HtmlElements.onClick({href: backPath, target: '_blank'})
      }, ...content);
   }
}
