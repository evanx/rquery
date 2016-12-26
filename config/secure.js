
module.exports = {
   components: {
      rquery: {
         redisUrl: 'redis://localhost:6379/1',
         redisKeyspace: 'rquery',
         openHostname: 'redishub.com',
         secureHostname: 'secure.redishub.com',
         hostDomain: 'secure.redishub.com',
         hostUrl: 'https://secure.redishub.com',
         serviceKey: 'secure',
         certPrefix: 'ws',
         serviceLabel: 'RedisHub',
         adminBotName: 'redishub_bot',
         clientCertHomeDir: '~/.webserva',
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
