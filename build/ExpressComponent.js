
import express from 'express';

export default class {

   async start() {
      this.logger.info('start');
      this.redisClient = redisl.createClient(this.config.redisUrl);
      this.app = express();
      this.app.get(this.config.location, async (req, res) => {
         try {
            res.json(await getReport());
         } catch (err) {
            res.status(500).send(err);
         }
      });
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
