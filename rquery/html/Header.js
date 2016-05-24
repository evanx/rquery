
import {header as styles} from './styles';

const logger = Loggers.create(module.filename);

export default function (props) {
   assert(props.config.assetsUrl, 'assetsUrl');
   const reqx = props.reqx || {};
   const homePath = Hx.renderPath(reqx.helpPath) || '/routes';
   let clickScript = '';
   if (homePath) {
      clickScript = `window.location.pathname='${homePath}'`;
   }
   const content = [
      He.img({style: styles.icon, src: `${props.config.assetsUrl}/icomoon/png20-38/${props.icon}.png`}),
      He.span({style: styles.title}, props.heading || props.title)
   ];
   return He.header({style: styles.container, onClick: clickScript}, ...content);
}
