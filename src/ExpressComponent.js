
import expressLib from 'express';
import marked from 'marked';

import * as Files from '../lib/Files';
import * as Express from '../lib/Express';

export default class ExpressComponent {

   async start() {
      logger.info('start');
      redisClient = redisLib.createClient(config.redisUrl);
      expressApp = expressLib();
      expressApp.get(config.location + 'help', async (req, res) => {
         let content = await Files.readFile('README.md');
         res.set('Content-Type', 'text/html');
         res.send(marked(content.toString()));
      });
      expressApp.get(config.location + 'routes', async (req, res) => {
         res.json(Express.getRoutes(expressApp));
      });
      expressApp.get(config.location + 'query', async (req, res) => {
         try {
            await this.query(req, res);
         } catch (err) {
            res.status(500).send(err);
         }
      });
      logger.info('listen', config.port, Express.getRoutes(expressApp));
      expressServer = expressApp.listen(config.port);
   }

   async query(req, res) {
      throw new ApplicationError('unimplemented');
   }

   async end() {
      logger.info('end');
      if (redisClient) {
         await redisClient.quitAsync();
      }
      if (expressServer) {
         expressServer.close();
      }
   }
}
