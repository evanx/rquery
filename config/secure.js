
module.exports = {
   rquery: {
      redisUrl: 'redis://localhost:6379/1',
      redisKeyspace: 'demo:rquery',
      hostname: 'secure.redishub.com',
      hostUrl: 'https://secure.redishub.com',
      serviceName: 'redishub-secure',
      serviceLabel: 'RedisHub Secure',
      port: 4567,
      location: '',
      indexCommand: 'getconfig',
      keyExpire: 2764800,
      ephemeralKeyExpire: 600,
      ephemeralAccountExpire: 1200,
      certLimit: 4,
      secureDomain: true,
      registerLimit: 10,
      importLimit: 5,
      adminLimit: 1,
      defaultFormat: 'json',
      addClientIp: false
   }
};
