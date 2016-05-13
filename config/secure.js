
module.exports = {
   rquery: {
      redisUrl: 'redis://localhost:6379/1',
      redisKeyspace: 'demo:rquery',
      hostname: 'secure.redishub.com',
      serviceName: 'redishub-secure',
      serviceLabel: 'RedisHub Secure',
      port: 4567,
      location: '/',
      indexCommand: 'getconfig',
      expire: 180,
      certLimit: 4,
      secureDomain: true,
      registerLimit: 10,
      importLimit: 5,
      adminLimit: 1,
      defaultFormat: 'json',
      addClientIp: false
   }
};
