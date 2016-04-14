
export default class {

   async init() {
      this.logger.info('init');
      this.redisClient = redisLib.createClient(this.config.redisUrl);
   }

   async start() {
      this.logger.info('start', this.config);
   }

   async scheduledTimeout() {
      this.logger.info('scheduledTimeout', this.config.scheduledTimeout);
      this.supervisor.end();
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
