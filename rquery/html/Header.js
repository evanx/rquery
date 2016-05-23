

const logger = Loggers.create(module.filename);

export default function (props) {
   assert(props.config.assetsUrl, 'assetsUrl');
   const reqx = props.reqx || {};
   let helpScript = '';
   if (reqx.helpPath) {
      helpScript = `window.location.pathname = "${reqx.helpPath}"`;
   }
   return `
   <header style="" onClick="${helpScript}">
   <a href="${reqx.helpPath}">
      <img style="opacity:.5;min-height:20px' src='${props.config.assetsUrl}/icomoon/png20-38/home.png"/>
      <span style="">${props.title}</span>
   </a>
   </header>
   `;
}
