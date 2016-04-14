
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
      this.expressApp.get(this.config.location + 'info', async (req, res) => {
         try {
            res.set('Content-Type', 'text/plain');
            res.send(await this.redisClient.infoAsync());
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      this.expressApp.get(this.config.location + ':keyspace/set/:key/:value', async (req, res) => {
         const {keyspace, key, value} = req.params;
         const redisKey = [this.config.redisKeyspace, keyspace, key].join(':');
         try {
            res.json(await this.redisClient.setAsync(redisKey, value));
            this.redisClient.expire(redisKey, this.config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      this.expressApp.get(this.config.location + ':keyspace/get/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [this.config.redisKeyspace, keyspace, key].join(':');
         try {
            res.json(await this.redisClient.getAsync(redisKey));
            this.redisClient.expire(redisKey, this.config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      this.expressApp.get(this.config.location + ':keyspace/sadd/:key/:value', async (req, res) => {
         const {keyspace, key, value} = req.params;
         const redisKey = [this.config.redisKeyspace, keyspace, key].join(':');
         try {
            res.json(await this.redisClient.saddAsync(redisKey, value));
            this.redisClient.expire(redisKey, this.config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      this.expressApp.get(this.config.location + ':keyspace/smembers/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [this.config.redisKeyspace, keyspace, key].join(':');
         try {
            res.json(await this.redisClient.smembersAsync(redisKey));
            this.redisClient.expire(redisKey, this.config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      this.expressApp.get(this.config.location + ':keyspace/scard/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [this.config.redisKeyspace, keyspace, key].join(':');
         try {
            res.json(await this.redisClient.scardAsync(redisKey));
            this.redisClient.expire(redisKey, this.config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      this.expressApp.get(this.config.location + ':keyspace/type/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [this.config.redisKeyspace, keyspace, key].join(':');
         try {
            res.json(await this.redisClient.typeAsync(redisKey));
            this.redisClient.expire(redisKey, this.config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      this.expressApp.get(this.config.location + ':keyspace/lpush/:key/:value', async (req, res) => {
         const {keyspace, key, value} = req.params;
         const redisKey = [this.config.redisKeyspace, keyspace, key].join(':');
         try {
            res.json(await this.redisClient.lpushAsync(redisKey, value));
            this.redisClient.expire(redisKey, this.config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      this.expressApp.get(this.config.location + ':keyspace/rpush/:key/:value', async (req, res) => {
         const {keyspace, key, value} = req.params;
         const redisKey = [this.config.redisKeyspace, keyspace, key].join(':');
         try {
            res.json(await this.redisClient.rpushAsync(redisKey, value));
            this.redisClient.expire(redisKey, this.config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      this.expressApp.get(this.config.location + ':keyspace/lpop/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [this.config.redisKeyspace, keyspace, key].join(':');
         try {
            res.json(await this.redisClient.lpopAsync(redisKey));
            this.redisClient.expire(redisKey, this.config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      this.expressApp.get(this.config.location + ':keyspace/brpop/:key/:timeout', async (req, res) => {
         const {keyspace, key, timeout} = req.params;
         const redisKey = [this.config.redisKeyspace, keyspace, key].join(':');
         try {
            res.json(await this.redisClient.brpopAsync(redisKey, timeout));
            this.redisClient.expire(redisKey, this.config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      this.expressApp.get(this.config.location + ':keyspace/rpop/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [this.config.redisKeyspace, keyspace, key].join(':');
         try {
            res.json(await this.redisClient.rpopAsync(redisKey));
            this.redisClient.expire(redisKey, this.config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      this.expressApp.get(this.config.location + ':keyspace/brpoplpush/:key/:dest/:timeout', async (req, res) => {
         const {keyspace, key, timeout} = req.params;
         const redisKey = [this.config.redisKeyspace, keyspace, key].join(':');
         const destKey = [this.config.redisKeyspace, keyspace, dest].join(':');
         try {
            res.json(await this.redisClient.brpoplpushAsync(redisKey, destKey, timeout));
            this.redisClient.expire(redisKey, this.config.expire);
            this.redisClient.expire(destKey, this.config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      this.expressApp.get(this.config.location + ':keyspace/llen/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [this.config.redisKeyspace, keyspace, key].join(':');
         try {
            res.json(await this.redisClient.llenAsync(redisKey));
            this.redisClient.expire(redisKey, this.config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      this.expressApp.get(this.config.location + ':keyspace/lrange/:key/:start/:stop', async (req, res) => {
         const {keyspace, key, start, stop} = req.params;
         const redisKey = [this.config.redisKeyspace, keyspace, key].join(':');
         try {
            res.json(await this.redisClient.lrangeAsync(redisKey, start, stop));
            this.redisClient.expire(redisKey, this.config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      this.expressApp.get(this.config.location + 'keyspaces', async (req, res) => {
         try {
            res.json(await this.redisClient.smembers([this.config.redisKeyspace, 'keyspaces'].join(':')));
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      this.logger.info('listen', this.config.port, Express.getRoutes(this.expressApp));
      this.expressServer = this.expressApp.listen(this.config.port);
   }

   async registerRequest(req, keyspace) {
      await this.redisClient.sadd([this.config.redisKeyspace, 'keyspaces'].join(':'), keyspace);
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
