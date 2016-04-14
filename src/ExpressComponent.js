
import express from 'express';

export default class {

   async start() {
      logger.info('start');
      redisClient = redisl.createClient(config.redisUrl);
      this.app = express();
      this.app.get(config.location, async (req, res) => {
         try {
            res.json({message: 'hello'});
         } catch (err) {
            res.status(500).send(err);
         }
      });
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
