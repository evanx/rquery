
module.exports = {
   components: {
      rquery: {
         loggerLevel: 'debug',
         redisUrl: 'redis://localhost:6379/14',
         redisKeyspace: 'demo:rquery',
         hostname: 'localhost',
         hostUrl: 'http://localhost:8765',
         serviceName: 'redishub-development',
         serviceLabel: 'RedisHub Dev',
         port: 8765,
         location: '',
         aboutUrl: 'https://github.com/evanx/redishub/blob/master/README.md',
         helpUrl: 'https://github.com/evanx/redishub/blob/master/README.md',
         indexCommand: 'getconfig',
         keyExpire: 600,
         ephemeralKeyExpire: 600,
         ephemeralAccountExpire: 1200,
         certLimit: 4,
         secureDomain: true,
         htmlDomain: true,
         disableValidateCert: true,
         disableTelegramHook: true,
         registerLimit: 10,
         importLimit: 5,
         adminLimit: 1,
         defaultFormat: 'json'
      }
   }
};
