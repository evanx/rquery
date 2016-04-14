
export default class {

   async init() {
      this.logger.info('init');
      this.redisClient = redisl.createClient(this.config.redisUrl);
   }

   async start() {
      this.logger.info('start', this.config);
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
