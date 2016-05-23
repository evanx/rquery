
module.exports = {
   components: {
      rquery: {
         redisUrl: 'redis://localhost:6379/14',
         redisKeyspace: 'test:rquery',
         hostname: 'test.redishub.com',
         hostUrl: 'https://test.redishub.com',
         serviceName: 'redishub-test',
         serviceLabel: 'RedisHub Test',
         port: 4567,
         location: '',
         assetsUrl: '',
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
         defaultFormat: 'html',
         addClientIp: false
      }
   }
};
