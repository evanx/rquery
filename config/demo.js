
module.exports = {
   components: {
      rquery: {
         loggerLevel: 'debug',
         redisUrl: 'redis://localhost:6379/13',
         redisKeyspace: 'demo:rquery',
         openHostname: 'demo.webserva.com',
         hostDomain: 'demo.webserva.com',
         hostUrl: 'https://demo.webserva.com',
         serviceKey: 'demo',
         serviceLabel: 'WebServa Demo',
         adminBotName: 'wsdemo_bot',
         port: 8765,
         location: '',
         assetsUrl: '/assets',
         aboutUrl: 'https://github.com/webserva/webserva/blob/master/README.md',
         helpUrl: 'https://github.com/webserva/webserva/blob/master/README.md',
         indexCommand: 'get-keyspace-info',
         enrollExpire: 300,
         keyspaceExpire: 604800, // 7 days
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
