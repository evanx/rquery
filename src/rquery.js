
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
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/type/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.typeAsync(redisKey));
            redisClient.expire(redisKey, config.expire);
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/ttl/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.ttlAsync(redisKey));
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/set/:key/:value', async (req, res) => {
         const {keyspace, key, value} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.setAsync(redisKey, value));
            redisClient.expire(redisKey, config.expire);
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/get/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.getAsync(redisKey));
            redisClient.expire(redisKey, config.expire);
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/incr/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.incrAsync(redisKey));
            redisClient.expire(redisKey, config.expire);
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/exists/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.existsAsync(redisKey));
            redisClient.expire(redisKey, config.expire);
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/del/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.delAsync(redisKey));
            redisClient.expire(redisKey, config.expire);
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/sadd/:key/:member', async (req, res) => {
         const {keyspace, key, member} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.saddAsync(redisKey, member));
            redisClient.expire(redisKey, config.expire);
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/smembers/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.smembersAsync(redisKey));
            redisClient.expire(redisKey, config.expire);
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/sismember/:key/:member', async (req, res) => {
         const {keyspace, key, member} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.sismemberAsync(redisKey, member));
            redisClient.expire(redisKey, config.expire);
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/scard/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.scardAsync(redisKey));
            redisClient.expire(redisKey, config.expire);
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/lpush/:key/:value', async (req, res) => {
         const {keyspace, key, value} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.lpushAsync(redisKey, value));
            redisClient.expire(redisKey, config.expire);
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/rpush/:key/:value', async (req, res) => {
         const {keyspace, key, value} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.rpushAsync(redisKey, value));
            redisClient.expire(redisKey, config.expire);
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/lpop/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.lpopAsync(redisKey));
            redisClient.expire(redisKey, config.expire);
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/blpop/:key/:timeout', async (req, res) => {
         const {keyspace, key, timeout} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.blpopAsync(redisKey, timeout));
            redisClient.expire(redisKey, config.expire);
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/brpop/:key/:timeout', async (req, res) => {
         const {keyspace, key, timeout} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.brpopAsync(redisKey, timeout));
            redisClient.expire(redisKey, config.expire);
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/rpop/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.rpopAsync(redisKey));
            redisClient.expire(redisKey, config.expire);
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/brpoplpush/:key/:dest/:timeout', async (req, res) => {
         const {keyspace, key, dest, timeout} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         const destKey = [config.redisKeyspace, keyspace, dest].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.brpoplpushAsync(redisKey, destKey, timeout));
            redisClient.expire(redisKey, config.expire);
            redisClient.expire(destKey, config.expire);
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/llen/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.llenAsync(redisKey));
            redisClient.expire(redisKey, config.expire);
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/lrange/:key/:start/:stop', async (req, res) => {
         const {keyspace, key, start, stop} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.lrangeAsync(redisKey, start, stop));
            redisClient.expire(redisKey, config.expire);
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/hset/:key/:field/:value', async (req, res) => {
         const {keyspace, key, field, value} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.hsetAsync(redisKey, field, value));
            redisClient.expire(redisKey, config.expire);
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/hget/:key/:field', async (req, res) => {
         const {keyspace, key, field} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.hgetAsync(redisKey, field));
            redisClient.expire(redisKey, config.expire);
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/hincrby/:key/:increment', async (req, res) => {
         const {keyspace, key, increment} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.hincrbyAsync(redisKey, increment));
            redisClient.expire(redisKey, config.expire);
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/hexists/:key/:field', async (req, res) => {
         const {keyspace, key, field} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.hexistsAsync(redisKey, field));
            redisClient.expire(redisKey, config.expire);
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/hlen/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.hlenAsync(redisKey));
            redisClient.expire(redisKey, config.expire);
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/hkeys/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.hkeysAsync(redisKey));
            redisClient.expire(redisKey, config.expire);
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'ks/:keyspace/hgetall/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = [config.redisKeyspace, keyspace, key].join(':');
         try {
            await this.validateKeyspaceRequest(req);
            res.json(await redisClient.hgetallAsync(redisKey));
            redisClient.expire(redisKey, config.expire);
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      expressApp.get(config.location + 'keyspaces', async (req, res) => {
         try {
            res.json(await redisClient.smembersAsync([config.redisKeyspace, 'keyspaces'].join(':')));
         } catch (err) {
            res.status(500).send({err: err.message, params: req.params});
         }
      });
      logger.info('listen', config.port, Express.getRoutes(expressApp));
      expressServer = expressApp.listen(config.port);
   }

   async validateKeyspaceRequest(req) {
      const {keyspace, timeout} = req.params;
      if (!keyspace) {
         throw new ValidationError('keyspace: ' + req.path);
      }
      await redisClient.saddAsync([config.redisKeyspace, 'keyspaces'].join(':'), keyspace);
      if (timeout) {
         if (timeout < 1 || timeout > 10) {
            throw new ValidationError('timeout range 1 to 10 seconds: ' + timeout);
         }
      }
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
