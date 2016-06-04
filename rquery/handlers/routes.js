
import {default as renderPage} from '../html/Page';
import {default as renderHelp} from '../html/Help';

const logger = Loggers.create(module.filename);
const rquery = global.rquery;
assert(rquery.config, 'rquery.config');

module.exports = {
   key: 'routes',
   access: 'debug',
   aliases: ['/'],
   resultObjectType: 'KeyedArrays',
   sendResult: async (req, res, reqx, result) => {
      if (rquery.isCliDomain(req)) {
         return result;
      } else {
         res.set('Content-Type', 'text/html');
         res.send(renderPage(renderHelp({
            config: rquery.config, req, result, homePath: '/'
         })));
      }
   },
   handleReq: async (req, res, reqx) => {
      assert(reqx.command === module.exports, 'command');
      assert(lodash.isFunction(rquery.isSecureDomain), 'rquery');
      let hostUrl = rquery.config.hostUrl;
      if (rquery.config.hostDomain != 'localhost') {
         hostUrl = 'https://' + req.hostname;
      }
      const routes = Express.getRoutes(rquery.expressApp)
      .filter(route => !['/', '/routes', '/webhook-telegram/*', '/help', '/about'].includes(route));
      assert(lodash.isArray(routes) && routes.length, 'routes: ' + routes.length);
      const accountOnlyRoutes = routes
      .filter(route => route.includes(':account') && !route.includes(':keyspace'));
      logger.debug('routes', routes.length);
      return {
         message: [
            If.thenElse(req.params.account,
               `Try to create a new keyspace`,
               {
                  url: 'https://web.telegram.org/#/im?p=@redishub_bot',
                  content: `Try "@${rquery.config.adminBotName}_bot /signup"`
               }
            )
         ],
         common: routes
         .filter(route => route)
         .filter(route => !route.includes(':'))
         .filter(route => ![
            '/epoch', '/register-ephemeral'
         ].includes(route))
         .filter(route => route !== '/enroll-cert' || rquery.isSecureDomain(req))
         .filter(route => route !== '/register-cert' || rquery.isSecureDomain(req))
         .map(route => `${hostUrl}${route}`)
         ,
         misc: routes
         .filter(route => route.includes(':') && !route.includes('telegram') && !/\:(account|access)/.test(route))
         .map(route => `${route}`)
         ,
         ephemeral: routes
         .filter(route => route.includes('-ephemeral') && route !== '/register-ephemeral')
         .map(route => `${route}`)
         ,
         telegram: routes
         .filter(route => route.includes('telegram'))
         .map(route => `${route}`)
         ,
         account: accountOnlyRoutes.map(route => `${route}`)
         ,
         accountKeyspace: routes
         .filter(route => route.includes(':account') && route.includes(':keyspace/'))
         .map(route => `${route}`)
      };
   }
};
