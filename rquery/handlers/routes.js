
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
         //logger.debug('routes result', Object.keys(result));
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
      let account;
      try {
         const dn = req.get('ssl_client_s_dn');
         if (dn) {
            const names = rquery.parseDn(dn);
            if (names.o.match(/^[\-_a-z]+$/)) {
               account = names.o;
            }
            logger.debug('dn', {dn, names, account});
         }
      } catch (err) {
         logger.error('cert', err);
      }
      const {sessionId} = req.cookies;
      if (!account && sessionId) {
         const [[time], session] = await rquery.redis.multiExecAsync(multi => {
            multi.time();
            multi.hgetall(rquery.adminKey('session', sessionId));
         });
         if (!session) {
            throw new ValidationError({
               message: 'Session expired or invalid',
               hint: rquery.hints.login
            });
         }
         logger.debug('admin command', {account, time, session});
         const {id, role} = session;
         if (role !== 'admin') {
            throw new ValidationError({
               message: 'Admin role required',
               hint: rquery.hints.login
            });
         }
         account = session.account;
      }
      const $ = rquery.getContentType(req) === 'html'? He : Hp;
      const number = Math.floor(Math.random()*10);
      const messages = account? [
         $.a({href: `/keyspaces/${account}`}, `List the keyspaces on your account`),
         $.a({href: `/ak/${account}/mykeyspace/create-keyspace`}, `Create 'mykeyspace${number}'`)
      ]: [
         $.a({href: '/about'}, `About ${rquery.config.serviceLabel}`),
         $.a({href: '/create-ephemeral'}, `Create an ephemeral keyspace via /create-ephemeral`),
         $.a({
            target: '_blank',
            href: `https://telegram.me/${rquery.config.adminBotName}?start`
         }, `Try "@${rquery.config.adminBotName} /signup"`)
      ];
      return {
         messages
         ,
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
