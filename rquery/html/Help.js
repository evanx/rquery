
import styles from './styles';

const logger = Loggers.create(module.filename);

export default function (props) {
   logger.debug('props', Object.keys(props));
   return Object.assign(props, {
      title: props.config.serviceLabel,
      content: `
      <h3>Basic</h3>
      ${renderUrls(props.result.common).join('\n')}
      <h3>Ephemeral</h3>
      ${renderPaths(props.result.ephemeral).join('\n')}
      <h3>Miscellaneous</h3>
      ${renderPaths(props.result.misc).join('\n')}
      <h3>Telegram</h3>
      ${renderPaths(props.result.telegram).join('\n')}
      ${renderAccount(props.result.account)}
      <h3>Account keyspace</h3>
      ${renderPaths(props.result.accountKeyspace).join('\n')}
      `
   });
}

function renderAccount(account) {
   if (!account.length) {
      return '';
   } else {
      return `<h3>Account</h3>
      ${renderPaths(account).join('\n')}
      `;
   }
}

function renderUrls(urls) {
   return urls.map((url, index) => {
      const [matching, path] = url.match(/^https?:\/\/[^\/]+(\/\S+)$/) || [];
      logger.debug('renderUrls', url, matching);
      if (matching) {
         return `
         <div style="line-height:1.5">
         <a href=${url}>${path}</a>
         </div>
         `;
      } else {
         return `
         <div style="line-height:1.5">
         <a href=${url}>${url}</a>
         </div>
         `;
      }
   });
}

function renderPaths(paths) {
   return paths.map((path, index) => {
      return Hs.span(styles.routes.path, path);
   })
}
