
import expressl from 'express';
import marked from 'marked';

import * as Files from '../lib/Files';
import * as Express from '../lib/Express';

export default class ExpressComponent {

   async start() {
      this.logger.info('start');
      this.redisClient = redisl.createClient(this.config.redisUrl);
      this.expressApp = expressl();
      this.expressApp.get(this.config.location + 'help', async (req, res) => {
         let content = await Files.readFile('README.md');
         res.set('Content-Type', 'text/html');
         res.send(marked(content.toString()));
      });
      this.expressApp.get(this.config.location + 'routes', async (req, res) => {
         res.json(Express.mapRoutes(this.expressApp));
      });
      this.expressApp.get(this.config.location + 'query', async (req, res) => {
         try {
            await this.query(req, res);
         } catch (err) {
            res.status(500).send(err);
         }
      });
      this.logger.info('listen', this.config.port, Express.mapRoutes(this.expressApp));
      this.expressServer = this.expressApp.listen(this.config.port);
   }

   async query(req, res) {
      throw new ApplicationError('unimplemented');
   }

   async end() {
      this.logger.info('end');
      if (this.redisClient) {
         await this.redisClient.quitAsync();
      }
      if (this.expressServer) {
         this.expressServer.close();
      }
   }
}
