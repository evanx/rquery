
export default class {

   constructor() {
   }

   async init() {
      logger.info('start');
   }

   async start() {
      logger.info('start');
   }

   async end() {
      if (this.ended) {
         logger.warn('end: ended');
         return;
      }
      if (this.redisClient) {
         await this.redisClient.quitAsync();
      }
      this.logger.info('ended');
   }
}
