
module.exports = {
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
      indexCommand: 'getconfig',
      expire: 600,
      shortExpire: 600,
      certLimit: 4,
      secureDomain: true,
      disableValidateCert: true,
      disableTelegramHook: true,
      registerLimit: 10,
      importLimit: 5,
      adminLimit: 1,
      defaultFormat: 'json'
   }
};
