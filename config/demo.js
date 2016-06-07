
module.exports = {
   components: {
      rquery: {
         loggerLevel: 'debug',
         redisUrl: 'redis://localhost:6379/13',
         redisKeyspace: 'demo:rquery',
         openHostname: 'demo.redishub.com',
         hostDomain: 'demo.redishub.com',
         hostUrl: 'https://demo.redishub.com',
         serviceKey: 'demo',
         serviceLabel: 'RedisHub Demo',
         adminBotName: 'redishub',
         port: 8765,
         location: '',
         assetsUrl: '/assets',
         aboutUrl: 'https://github.com/evanx/redishub/blob/master/README.md',
         helpUrl: 'https://github.com/evanx/redishub/blob/master/README.md',
         indexCommand: 'show-keyspace-config',
         enrollExpire: 300,
         ttlLimit: 604800, // 7 days
         keyExpire: 600,
         ephemeralKeyExpire: 600,
         ephemeralAccountExpire: 1200,
         certLimit: 4,
         secureDomain: false,
         cliDomain: false,
         htmlDomain: true,
         registerLimit: 10,
         importLimit: 5,
         adminLimit: 1,
         defaultFormat: 'html',
         addClientIp: true
      }
   }
};
