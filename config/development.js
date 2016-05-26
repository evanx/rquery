
module.exports = {
   components: {
      rquery: {
         loggerLevel: 'debug',
         redisUrl: 'redis://localhost:6379/14',
         redisKeyspace: 'demo:rquery',
         hostname: 'localhost',
         hostUrl: 'http://localhost:8765',
         serviceName: 'redishub-development',
         serviceLabel: 'RH Dev',
         port: 8765,
         location: '',
         assetsUrl: 'https://test.redishub.com/assets',
         aboutUrl: 'https://github.com/evanx/redishub/blob/master/README.md',
         helpUrl: 'https://github.com/evanx/redishub/blob/master/README.md',
         indexCommand: 'show-keyspace-config',
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
