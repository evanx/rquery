
module.exports = {
   components: {
      rquery: {
         loggerLevel: 'debug',
         redisUrl: 'redis://localhost:6379/14',
         redisKeyspace: 'demo:rquery',
         openHostname: 'webserva.com',
         secureHostname: 'secure.webserva.com',
         hostDomain: 'localhost',
         hostUrl: 'http://localhost:8765',
         serviceKey: 'development',
         serviceLabel: 'RH Dev',
         adminBotName: 'rhdev',
         certPrefix: 'wstest',
         port: 8765,
         location: '',
         assetsUrl: 'https://test.redishub.com/assets',
         aboutUrl: 'https://github.com/evanx/webserva/blob/master/README.md',
         helpUrl: 'https://github.com/evanx/webserva/blob/master/README.md',
         indexCommand: 'get-keyspace-info',
         enrollExpire: 300,
         keyspaceExpire: 2592000, // 30 days
         keyExpire: 600,
         ephemeralKeyExpire: 600,
         ephemeralAccountExpire: 1200,
         certLimit: 4,
         secureDomain: true,
         htmlDomain: true,
         cliDomain: false,
         disableValidateCert: true,
         disableTelegramHook: true,
         registerLimit: 10,
         importLimit: 5,
         adminLimit: 1,
         defaultFormat: 'html'
      }
   }
};
