
module.exports = {
   components: {
      rquery: {
         redisUrl: 'redis://localhost:6379/1',
         redisKeyspace: 'rquery',
         hostDomain: 'mydomain.com',
         hostUrl: 'https://mydomain.com',
         serviceKey: 'secure',
         serviceLabel: 'My WebServa',
         port: 4567,
         location: '',
         assetsUrl: '/assets',
         aboutUrl: 'https://github.com/webserva/about/blob/master/README.md',
         helpUrl: 'https://github.com/webserva/about/blob/master/README.md',
         indexCommand: 'show-keyspace-config',
         //keyExpire: 2764800, // 31 days
         keyspaceExpire: 2592000, // 30 days
         enrollExpire: 300,
         keyExpire: 604800, // 7 days
         ephemeralKeyExpire: 600,
         ephemeralAccountExpire: 1200,
         certLimit: 4,
         secureDomain: true,
         cliDomain: false,
         htmlDomain: true,
         registerLimit: 10,
         importLimit: 5,
         adminLimit: 1,
         defaultFormat: 'html',
         addClientIp: false
      }
   }
};
