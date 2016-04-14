
export default class {

   async start() {
      this.logger.info('start');
      this.redisClient = redisl.createClient(this.config.redisUrl);
   }

   async end() {
      if (this.ended) {
         this.logger.warn('already ended');
         return;
      }
      this.logger.info('end');
      if (this.redisClient) {
         await this.redisClient.quitAsync();
      }
   }
}
