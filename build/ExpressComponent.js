
import expressLib from 'express';
import marked from 'marked';

import * as Files from '../lib/Files';
import * as Express from '../lib/Express';

export default class ExpressComponent {

   async start() {
      this.logger.info('start');
      this.redisClient = redisLib.createClient(this.config.redisUrl);
      this.expressApp = expressLib();
      if (this.config.location !== '/') {
         this.expressApp.get('/', async (req, res) => {
            res.json(Express.getRoutes(this.expressApp));
         });
      }
      this.expressApp.get(this.config.location, async (req, res) => {
         res.json(Express.getRoutes(this.expressApp));
      });
      this.expressApp.get(this.config.location + 'routes', async (req, res) => {
         res.json(Express.getRoutes(this.expressApp));
      });
      this.expressApp.get(this.config.location + 'help', async (req, res) => {
         let content = await Files.readFile('README.md');
         res.set('Content-Type', 'text/html');
         res.send(marked(content.toString()));
      });
      this.expressApp.get(this.config.location + 'query', async (req, res) => {
         try {
            await this.query(req, res);
         } catch (err) {
            res.status(500).send(err);
         }
      });
      this.expressApp.get(this.config.location + 'set/:key/:value', async (req, res) => {
         const {key, value} = req.params;
         try {
            res.json(await this.redisClient.setAsync(this.config.redisKeyspace + ':' + key, value));
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      this.expressApp.get(this.config.location + 'get/:key', async (req, res) => {
         const {key} = req.params;
         try {
            res.json(await this.redisClient.getAsync(this.config.redisKeyspace + ':' + key));
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      this.logger.info('listen', this.config.port, Express.getRoutes(this.expressApp));
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
