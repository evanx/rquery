
export default class {

   async init() {
      logger.info('init');
      redisClient = redisl.createClient(config.redisUrl);
   }

   async start() {
      logger.info('start', config);
   }

   async end() {
      if (this.ended) {
         logger.warn('already ended');
         return;
      }
      logger.info('end');
      if (redisClient) {
         await redisClient.quitAsync();
      }
   }
}
