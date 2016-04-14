
import expressLib from 'express';
import marked from 'marked';

import * as Files from '../lib/Files';
import * as Express from '../lib/Express';

export default class ExpressComponent {

   async start() {
      logger.info('start');
      redisClient = redisLib.createClient(config.redisUrl);
      expressApp = expressLib();
      if (config.location !== '/') {
         expressApp.get('/', async (req, res) => {
            res.json(Express.getRoutes(expressApp));
         });
      }
      expressApp.get(config.location, async (req, res) => {
         res.json(Express.getRoutes(expressApp));
      });
      expressApp.get(config.location + 'routes', async (req, res) => {
         res.json(Express.getRoutes(expressApp));
      });
      expressApp.get(config.location + 'help', async (req, res) => {
         let content = await Files.readFile('README.md');
         res.set('Content-Type', 'text/html');
         res.send(marked(content.toString()));
      });
      expressApp.get(config.location + 'query', async (req, res) => {
         try {
            await this.query(req, res);
         } catch (err) {
            res.status(500).send(err);
         }
      });
      expressApp.get(config.location + 'info', async (req, res) => {
         try {
            res.set('Content-Type', 'text/plain');
            res.send(await redisClient.infoAsync());
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      expressApp.get(config.location + ':keyspace/set/:key/:value', async (req, res) => {
         const {keyspace, key, value} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            res.json(await redisClient.setAsync(redisKey, value));
            redisClient.expire(redisKey, config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      expressApp.get(config.location + ':keyspace/get/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            res.json(await redisClient.getAsync(redisKey));
            redisClient.expire(redisKey, config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      expressApp.get(config.location + ':keyspace/sadd/:key/:value', async (req, res) => {
         const {keyspace, key, value} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            res.json(await redisClient.saddAsync(redisKey, value));
            redisClient.expire(redisKey, config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      expressApp.get(config.location + ':keyspace/smembers/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            res.json(await redisClient.smembersAsync(redisKey));
            redisClient.expire(redisKey, config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      expressApp.get(config.location + ':keyspace/scard/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            res.json(await redisClient.scardAsync(redisKey));
            redisClient.expire(redisKey, config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      expressApp.get(config.location + ':keyspace/type/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            res.json(await redisClient.typeAsync(redisKey));
            redisClient.expire(redisKey, config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      expressApp.get(config.location + ':keyspace/lpush/:key/:value', async (req, res) => {
         const {keyspace, key, value} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            res.json(await redisClient.lpushAsync(redisKey, value));
            redisClient.expire(redisKey, config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      expressApp.get(config.location + ':keyspace/rpush/:key/:value', async (req, res) => {
         const {keyspace, key, value} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            res.json(await redisClient.rpushAsync(redisKey, value));
            redisClient.expire(redisKey, config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      expressApp.get(config.location + ':keyspace/lpop/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            res.json(await redisClient.lpopAsync(redisKey));
            redisClient.expire(redisKey, config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      expressApp.get(config.location + ':keyspace/brpop/:key/:timeout', async (req, res) => {
         const {keyspace, key, timeout} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            res.json(await redisClient.brpopAsync(redisKey, timeout));
            redisClient.expire(redisKey, config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      expressApp.get(config.location + ':keyspace/rpop/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            res.json(await redisClient.rpopAsync(redisKey));
            redisClient.expire(redisKey, config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      expressApp.get(config.location + ':keyspace/brpoplpush/:key/:dest/:timeout', async (req, res) => {
         const {keyspace, key, timeout} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         const destKey = [config.redisKeyspace, keyspace, dest].join(':');
         try {
            res.json(await redisClient.brpoplpushAsync(redisKey, destKey, timeout));
            redisClient.expire(redisKey, config.expire);
            redisClient.expire(destKey, config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      expressApp.get(config.location + ':keyspace/llen/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            res.json(await redisClient.llenAsync(redisKey));
            redisClient.expire(redisKey, config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      expressApp.get(config.location + ':keyspace/lrange/:key/:start/:stop', async (req, res) => {
         const {keyspace, key, start, stop} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            res.json(await redisClient.lrangeAsync(redisKey, start, stop));
            redisClient.expire(redisKey, config.expire);
            this.registerRequest(req, keyspace);
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      expressApp.get(config.location + 'keyspaces', async (req, res) => {
         try {
            res.json(await redisClient.smembers([config.redisKeyspace, 'keyspaces'].join(':')));
         } catch (err) {
            res.status(500).send({err, params: req.params});
         }
      });
      logger.info('listen', config.port, Express.getRoutes(expressApp));
      expressServer = expressApp.listen(config.port);
   }

   async registerRequest(req, keyspace) {
      await redisClient.sadd([config.redisKeyspace, 'keyspaces'].join(':'), keyspace);
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
