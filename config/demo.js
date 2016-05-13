
module.exports = {
   rquery: {
      loggerLevel: 'debug',
      redisUrl: 'redis://localhost:6379/13',
      redisKeyspace: 'demo:rquery',
      hostname: 'demo.redishub.com',
      serviceName: 'redishub-demo',
      serviceLabel: 'RedisHub Demo',
      port: 8765,
      location: '',
      indexCommand: 'getconfig',
      expire: 180,
      certLimit: 4,
      secureDomain: false,
      registerLimit: 10,
      importLimit: 5,
      adminLimit: 1,
      defaultFormat: 'json',
      addClientIp: true
   }
};
