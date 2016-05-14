
module.exports = {
   rquery: {
      loggerLevel: 'debug',
      redisUrl: 'redis://localhost:6379/13',
      redisKeyspace: 'demo:rquery',
      hostname: 'demo.redishub.com',
      hostUrl: 'https://demo.redishub.com',
      serviceName: 'redishub-demo',
      serviceLabel: 'RedisHub Demo',
      port: 8765,
      location: '',
      indexCommand: 'getconfig',
      keyExpire: 600,
      ephemeralKeyExpire: 600,
      ephemeralAccountExpire: 1200,
      certLimit: 4,
      secureDomain: false,
      registerLimit: 10,
      importLimit: 5,
      adminLimit: 1,
      defaultFormat: 'json',
      addClientIp: true
   }
};
