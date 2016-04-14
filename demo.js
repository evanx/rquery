
const redisUrl = 'redis://localhost:6379/13';

const Seconds = {
  toMillis: seconds => seconds*1000
};

module.exports = {
   rquery: {
      redisUrl,
      redisKeyspace: 'demo:rquery:server',
      //scheduledTimeout: 8000
   },
   express: {
      redisUrl,
      redisKeyspace: 'demo:rquery:express',
      port: 8765,
      location: '/rquery/',
      timeout: Seconds.toMillis(8)
   }
};
