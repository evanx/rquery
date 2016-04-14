
const redisUrl = 'redis://localhost:6379/0';

const Seconds = {
  toMillis: seconds => seconds*1000
};

module.exports = {
   rquery: {
      redisUrl,
      redisKeyspace: 'demo:rquery:server',
      scheduledTimeout: 2000
   },
   express: {
      redisUrl,
      redisKeyspace: 'demo:rquery:express',
      port: 8765,
      location: '/',
      timeout: Seconds.toMillis(8)
   }
};
