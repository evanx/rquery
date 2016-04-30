
module.exports = {
   rquery: {
      redisUrl: 'redis://localhost:6379/13',
      redisKeyspace: 'demo:rquery',
      hostname: 'ibhala.com',
      port: 8765,
      location: '/rquery/',
      indexCommand: 'getconfig',
      expire: 180,
      certLimit: 4,
      secureDomain: false,
      registerLimit: 10,
      importLimit: 5,
      adminLimit: 1,
      defaultFormat: 'plain'
   }
};
