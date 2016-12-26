
module.exports = {
   components: {
      rquery: {
         redisUrl: 'redis://localhost:6379/14',
         redisKeyspace: 'test:rquery',
         openHostname: 'test.webserva.com',
         secureHostname: 'test.webserva.com',
         hostDomain: 'test.webserva.com',
         hostUrl: 'https://test.webserva.com',
         serviceKey: 'test',
         serviceLabel: 'WS Test',
         adminBotName: 'rhtest',
         port: 4567,
         location: '',
         assetsUrl: '/assets',
         aboutUrl: 'https://github.com/evanx/webserva/blob/master/README.md',
         helpUrl: 'https://github.com/evanx/webserva/blob/master/README.md',
         indexCommand: 'get-keyspace-info',
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
