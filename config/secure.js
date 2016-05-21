
module.exports = {
   components: {
      rquery: {
         redisUrl: 'redis://localhost:6379/1',
         redisKeyspace: 'demo:rquery',
         hostname: 'secure.redishub.com',
         hostUrl: 'https://secure.redishub.com',
         serviceName: 'redishub-prod',
         serviceLabel: 'RedisHub Prod',
         port: 4567,
         location: '',
         aboutUrl: 'https://github.com/evanx/redishub/blob/master/README.md',
         helpUrl: 'https://github.com/evanx/redishub/blob/master/README.md',
         indexCommand: 'getconfig',
         //keyExpire: 2764800, // 31 days
         keyExpire: 604800, // 7 days
         ephemeralKeyExpire: 600,
         ephemeralAccountExpire: 1200,
         certLimit: 4,
         secureDomain: true,
         htmlDomain: true,
         registerLimit: 10,
         importLimit: 5,
         adminLimit: 1,
         defaultFormat: 'json',
         addClientIp: false
      }
   }
};
