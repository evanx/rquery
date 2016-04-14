
export default class {

   async start() {
      logger.info('start');
      redisClient = redisl.createClient(config.redisUrl);
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
