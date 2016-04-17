
import expressLib from 'express';
import marked from 'marked';

import * as Files from '../lib/Files';
import * as Express from '../lib/Express';

export default class {

   async start() {
      logger.info('start');
      redisClient = redisLib.createClient(config.redisUrl);
      expressApp = expressLib();
      this.addRoutes();
      expressServer = await Express.listen(expressApp, config.port);
      logger.info('listen', config.port, Express.getRoutes(expressApp), expressServer);
   }

   addRoutes() {
      if (config.location !== '/') {
         expressApp.get('/', async (req, res) => {
            res.json(Express.getRoutes(expressApp));
         });
      }
      this.addRoute('', async (req, res) => {
         res.json(Express.getRoutes(expressApp));
      });
      this.addRoute('routes', async (req, res) => {
         res.json(Express.getRoutes(expressApp));
      });
      this.addRoute('help', async (req, res) => {
         let content = await Files.readFile('README.md');
         res.set('Content-Type', 'text/html');
         res.send(marked(content.toString()));
      });
      this.addRoute('info', async (req, res) => {
         res.set('Content-Type', 'text/plain');
         res.send(await redisClient.infoAsync());
      });
      this.addRoute('time/seconds', async (req, res) => {
         const time = await redisClient.timeAsync();
         res.json(time[0]);
      });
      this.addRoute('time/seconds/plain', async (req, res) => {
         res.set('Content-Type', 'text/plain');
         const time = await redisClient.timeAsync();
         res.send(time[0]);
      });
      this.addRoute('time', async (req, res) => {
         res.json(await redisClient.timeAsync());
      });
      this.addRoute('keyspaces', async (req, res) => {
         res.json(await redisClient.smembersAsync(this.redisKey('keyspaces')));
      });
      this.addKeyspaceRoute('ks/:keyspace/keys', async (req, res) => {
         const {keyspace} = req.params;
         const keys = await redisClient.keysAsync(this.redisKey(keyspace, '*'));
         const index = config.redisKeyspace.length + keyspace.length + 2;
         res.json(keys.map(key => key.substring(index)));
      });
      this.addKeyspaceRoute('ks/:keyspace/ttl', async (req, res) => {
         const {keyspace} = req.params;
         const keys = await redisClient.keysAsync(this.redisKey(keyspace, '*'));
         const keyIndex = config.redisKeyspace.length + keyspace.length + 2;
         const multi = redisClient.multi();
         keys.forEach(key => multi.ttl(key));
         const results = await multi.execAsync();
         const result = {};
         keys.forEach((key, index) => result[key.substring(keyIndex)] = results[index]);
         res.json(result);
      });
      this.addKeyspaceRoute('ks/:keyspace/type/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.typeAsync(redisKey));
      });
      this.addKeyspaceRoute('ks/:keyspace/ttl/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.ttlAsync(redisKey));
      });
      this.addKeyspaceRoute('ks/:keyspace/set/:key/:value', async (req, res) => {
         const {keyspace, key, value} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.setAsync(redisKey, value));
      });
      this.addKeyspaceRoute('ks/:keyspace/get/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.getAsync(redisKey));
      });
      this.addKeyspaceRoute('ks/:keyspace/incr/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.incrAsync(redisKey));
      });
      this.addKeyspaceRoute('ks/:keyspace/exists/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.existsAsync(redisKey));
      });
      this.addKeyspaceRoute('ks/:keyspace/del/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.delAsync(redisKey));
      });
      this.addKeyspaceRoute('ks/:keyspace/sadd/:key/:member', async (req, res) => {
         const {keyspace, key, member} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.saddAsync(redisKey, member));
      });
      this.addKeyspaceRoute('ks/:keyspace/srem/:key/:member', async (req, res) => {
         const {keyspace, key, member} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.sremAsync(redisKey, member));
      });
      this.addKeyspaceRoute('ks/:keyspace/smove/:key/:dest/:member', async (req, res, multi) => {
         const {keyspace, key, dest, member} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         const destKey = this.redisKey(keyspace, dest);
         res.json(await redisClient.smoveAsync(redisKey, destKey, member));
         multi.expire(destKey, config.expire);
      });
      this.addKeyspaceRoute('ks/:keyspace/spop/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.spopAsync(redisKey));
      });
      this.addKeyspaceRoute('ks/:keyspace/smembers/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.smembersAsync(redisKey));
      });
      this.addKeyspaceRoute('ks/:keyspace/sismember/:key/:member', async (req, res) => {
         const {keyspace, key, member} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.sismemberAsync(redisKey, member));
      });
      this.addKeyspaceRoute('ks/:keyspace/scard/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.scardAsync(redisKey));
      });
      this.addKeyspaceRoute('ks/:keyspace/lpush/:key/:value', async (req, res) => {
         const {keyspace, key, value} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.lpushAsync(redisKey, value));
      });
      this.addKeyspaceRoute('ks/:keyspace/rpush/:key/:value', async (req, res) => {
         const {keyspace, key, value} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.rpushAsync(redisKey, value));
      });
      this.addKeyspaceRoute('ks/:keyspace/lpop/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.lpopAsync(redisKey));
      });
      this.addKeyspaceRoute('ks/:keyspace/blpop/:key/:timeout', async (req, res) => {
         const {keyspace, key, timeout} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         const reply = await redisClient.blpopAsync(redisKey, timeout);
         res.json(reply[1]);
      });
      this.addKeyspaceRoute('ks/:keyspace/brpop/:key/:timeout', async (req, res) => {
         const {keyspace, key, timeout} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         const reply = await redisClient.brpopAsync(redisKey, timeout);
         res.json(reply[1]);
      });
      this.addKeyspaceRoute('ks/:keyspace/rpop/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.rpopAsync(redisKey));
      });
      this.addKeyspaceRoute('ks/:keyspace/brpoplpush/:key/:dest/:timeout', async (req, res, multi) => {
         const {keyspace, key, dest, timeout} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         const destKey = this.redisKey(keyspace, dest);
         res.json(await redisClient.brpoplpushAsync(redisKey, destKey, timeout));
         multi.expire(destKey, config.expire);
      });
      this.addKeyspaceRoute('ks/:keyspace/llen/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.llenAsync(redisKey));
      });
      this.addKeyspaceRoute('ks/:keyspace/lindex/:key/:index', async (req, res) => {
         const {keyspace, key, index} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.lindexAsync(redisKey, index));
      });
      this.addKeyspaceRoute('ks/:keyspace/lrem/:key/:count/:value', async (req, res) => {
         const {keyspace, key, count, value} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.lremAsync(redisKey, count, value));
      });
      this.addKeyspaceRoute('ks/:keyspace/lset/:key/:index/:value', async (req, res) => {
         const {keyspace, key, index, value} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.lsetAsync(redisKey, index, value));
      });
      this.addKeyspaceRoute('ks/:keyspace/ltrim/:key/:start/:stop', async (req, res) => {
         const {keyspace, key, start, stop} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.ltrimAsync(redisKey, start, stop));
      });
      this.addKeyspaceRoute('ks/:keyspace/lrange/:key/:start/:stop', async (req, res) => {
         const {keyspace, key, start, stop} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.lrangeAsync(redisKey, start, stop));
      });
      this.addKeyspaceRoute('ks/:keyspace/hset/:key/:field/:value', async (req, res) => {
         const {keyspace, key, field, value} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.hsetAsync(redisKey, field, value));
      });
      this.addKeyspaceRoute('ks/:keyspace/hget/:key/:field', async (req, res) => {
         const {keyspace, key, field} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.hgetAsync(redisKey, field));
      });
      this.addKeyspaceRoute('ks/:keyspace/hdel/:key/:field', async (req, res) => {
         const {keyspace, key, field} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.hdelAsync(redisKey, field));
      });
      this.addKeyspaceRoute('ks/:keyspace/hincrby/:key/:field/:increment', async (req, res) => {
         const {keyspace, key, field, increment} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.hincrbyAsync(redisKey, field, increment));
      });
      this.addKeyspaceRoute('ks/:keyspace/hexists/:key/:field', async (req, res) => {
         const {keyspace, key, field} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.hexistsAsync(redisKey, field));
      });
      this.addKeyspaceRoute('ks/:keyspace/hlen/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.hlenAsync(redisKey));
      });
      this.addKeyspaceRoute('ks/:keyspace/hkeys/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.hkeysAsync(redisKey));
      });
      this.addKeyspaceRoute('ks/:keyspace/hgetall/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.hgetallAsync(redisKey));
      });
      this.addKeyspaceRoute('ks/:keyspace/zcard/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.zcardAsync(redisKey));
      });
      this.addKeyspaceRoute('ks/:keyspace/zadd/:key/:score/:member', async (req, res) => {
         const {keyspace, key, score, member} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.zaddAsync(redisKey, score, member));
      });
      this.addKeyspaceRoute('ks/:keyspace/zrem/:key/:member', async (req, res) => {
         const {keyspace, key, member} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.zremAsync(redisKey, member));
      });
      this.addKeyspaceRoute('ks/:keyspace/zrange/:key/:start/:stop', async (req, res) => {
         const {keyspace, key, start, stop} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.zrangeAsync(redisKey, start, stop));
      });
      this.addKeyspaceRoute('ks/:keyspace/zrevrange/:key/:start/:stop', async (req, res) => {
         const {keyspace, key, start, stop} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         res.json(await redisClient.zrevrangeAsync(redisKey, start, stop));
      });
   }

   async addRoute(uri, fn) {
      expressApp.get(config.location + uri, async (req, res) => {
         let hostname = req.hostname.replace(/\..*$/, '');
         logger.debug('req', uri, req.hostname, hostname);
         try {
            await fn(req, res);
         } catch (err) {
            this.handleError(err, req, res);
         }
      });
   }

   async addKeyspaceRoute(options, fn) {
      if (typeof options === 'string') {
         options = {uri: options};
      }
      assert(options.uri, 'options.uri');
      expressApp.get(config.location + options.uri, async (req, res) => {
         try {
            const {keyspace, key, timeout} = req.params;
            if (!keyspace) {
               throw new ValidationError('keyspace: ' + req.path);
            }
            if (timeout) {
               if (timeout < 1 || timeout > 10) {
                  throw new ValidationError('timeout must range from 1 to 10 seconds: ' + timeout);
               }
            }
            const multi = redisClient.multi();
            await fn(req, res, multi);
            multi.sadd([config.redisKeyspace, 'keyspaces'].join(':'), keyspace);
            if (key) {
               const redisKey = this.redisKey(keyspace, key);
               multi.expire(redisKey, config.expire);
            }
            await multi.execAsync();
         } catch (err) {
            this.handleError(err, req, res);
         }
      });
   }

   redisKey(...parts) {
      return [config.redisKeyspace, ...parts].join(':');
   }

   handleError(err, req, res) {
      res.status(500).send({
         err: err.message,
         params: req.params,
      });
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
