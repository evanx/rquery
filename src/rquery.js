
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
         return Express.getRoutes(expressApp);
      });
      this.addRoute('routes', async (req, res) => {
         return Express.getRoutes(expressApp);
      });
      this.addRoute('help', async (req, res) => {
         let content = await Files.readFile('README.md');
         res.set('Content-Type', 'text/html');
         res.send(marked(content.toString()));
      });
      if (config.allowInfo) {
         this.addRoute('info', async (req, res) => {
            res.set('Content-Type', 'text/plain');
            res.send(await redisClient.infoAsync());
         });
      }
      if (config.allowKeyspaces) {
         this.addRoute('keyspaces', () => redisClient.smembersAsync(this.redisKey('keyspaces')));
      }
      this.addRoute('time/seconds', async () => {
         const time = await redisClient.timeAsync();
         return time[0];
      });
      this.addRoute('time', () => redisClient.timeAsync());
      this.addKeyspaceRoute('ks/:keyspace/keys', async (req, res) => {
         const {keyspace} = req.params;
         const keys = await redisClient.keysAsync(this.redisKey(keyspace, '*'));
         const index = config.redisKeyspace.length + keyspace.length + 2;
         return keys.map(key => key.substring(index));
      });
      this.addRoute('ks/:keyspace/register/:token', async (req, res) => {
         const {keyspace, token} = req.params;
         return await redisClient.hsetnxAsync(this.redisKey('keyspace', keyspace), 'token', token);
      });
      this.addKeyspaceRoute('ks/:keyspace/flush', async (req, res) => {
         const {keyspace} = req.params;
         const keys = await redisClient.keysAsync(this.redisKey(keyspace, '*'));
         const keyIndex = config.redisKeyspace.length + keyspace.length + 2;
         const multi = redisClient.multi();
         keys.forEach(key => multi.del(key));
         const multiReply = await multi.execAsync();
         return keys.map(key => key.substring(keyIndex));
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
         return result;
      });
      this.addKeyspaceRoute('ks/:keyspace/type/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.typeAsync(redisKey);
      });
      this.addKeyspaceRoute('ks/:keyspace/ttl/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.ttlAsync(redisKey);
      });
      this.addKeyspaceRoute('ks/:keyspace/set/:key/:value', async (req, res) => {
         const {keyspace, key, value} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.setAsync(redisKey, value);
      });
      this.addKeyspaceRoute('ks/:keyspace/get/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.getAsync(redisKey);
      });
      this.addKeyspaceRoute('ks/:keyspace/incr/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.incrAsync(redisKey);
      });
      this.addKeyspaceRoute('ks/:keyspace/exists/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.existsAsync(redisKey);
      });
      this.addKeyspaceRoute('ks/:keyspace/del/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.delAsync(redisKey);
      });
      this.addKeyspaceRoute('ks/:keyspace/sadd/:key/:member', async (req, res) => {
         const {keyspace, key, member} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.saddAsync(redisKey, member);
      });
      this.addKeyspaceRoute('ks/:keyspace/srem/:key/:member', async (req, res) => {
         const {keyspace, key, member} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.sremAsync(redisKey, member);
      });
      this.addKeyspaceRoute('ks/:keyspace/smove/:key/:dest/:member', async (req, res, multi) => {
         const {keyspace, key, dest, member} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         const destKey = this.redisKey(keyspace, dest);
         let result = await redisClient.smoveAsync(redisKey, destKey, member);
         multi.expire(destKey, config.expire);
         return result;
      });
      this.addKeyspaceRoute('ks/:keyspace/spop/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.spopAsync(redisKey);
      });
      this.addKeyspaceRoute('ks/:keyspace/smembers/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.smembersAsync(redisKey);
      });
      this.addKeyspaceRoute('ks/:keyspace/sismember/:key/:member', async (req) => {
         return await redisClient.sismemberAsync(this.reqKey(req), req.params.member);
      });
      this.addKeyspaceRoute('ks/:keyspace/scard/:key', async (req) => {
         let result = await redisClient.scardAsync(this.reqKey(req));
         logger.info('zz', req.params, this.reqKey(req), result);
         return result;
      });
      this.addKeyspaceRoute('ks/:keyspace/lpush/:key/:value', async (req, res) => {
         return await redisClient.lpushAsync(this.reqKey(req), req.params.value);
      });
      this.addKeyspaceRoute('ks/:keyspace/rpush/:key/:value', async (req, res) => {
         return await redisClient.rpushAsync(this.reqKey(req), req.params.value);
      });
      this.addKeyspaceRoute('ks/:keyspace/lpop/:key', async (req, res) => {
         return await redisClient.lpopAsync(this.reqKey(req));
      });
      this.addKeyspaceRoute('ks/:keyspace/blpop/:key/:timeout', async (req, res) => {
         const reply = await redisClient.blpopAsync(this.reqKey(req), req.params.timeout);
         return reply[1];
      });
      this.addKeyspaceRoute('ks/:keyspace/brpop/:key/:timeout', async (req, res) => {
         const reply = await redisClient.brpopAsync(this.reqKey(req), req.params.timeout);
         return reply[1];
      });
      this.addKeyspaceRoute('ks/:keyspace/rpop/:key', async (req, res) => {
         return await redisClient.rpopAsync(this.reqKey(req));
      });
      this.addKeyspaceRoute('ks/:keyspace/brpoplpush/:key/:dest/:timeout', async (req, res, multi) => {
         const {keyspace, key, dest, timeout} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         const destKey = this.redisKey(keyspace, dest);
         const result = await redisClient.brpoplpushAsync(redisKey, destKey, timeout);
         multi.expire(destKey, config.expire);
         return result;
      });
      this.addKeyspaceRoute('ks/:keyspace/llen/:key', async (req, res) => {
         return await redisClient.llenAsync(this.reqKey(req));
      });
      this.addKeyspaceRoute('ks/:keyspace/lindex/:key/:index', async (req, res) => {
         return await redisClient.lindexAsync(this.reqKey(req), req.params.index);
      });
      this.addKeyspaceRoute('ks/:keyspace/lrem/:key/:count/:value', async (req, res) => {
         return await redisClient.lremAsync(this.reqKey(req), req.params.count, req.params.value);
      });
      this.addKeyspaceRoute('ks/:keyspace/lset/:key/:index/:value', async (req, res) => {
         return await redisClient.lsetAsync(this.reqKey(req), req.params.index, req.params.value);
      });
      this.addKeyspaceRoute('ks/:keyspace/ltrim/:key/:start/:stop', async (req, res) => {
         return await redisClient.ltrimAsync(this.reqKey(req), req.params.start, req.params.stop);
      });
      this.addKeyspaceRoute('ks/:keyspace/lrange/:key/:start/:stop', async (req, res) => {
         return await redisClient.lrangeAsync(this.reqKey(req), req.params.start, req.params.stop);
      });
      this.addKeyspaceRoute('ks/:keyspace/hset/:key/:field/:value', async (req, res) => {
         return await redisClient.hsetAsync(this.reqKey(req), req.params.field, req.params.value);
      });
      this.addKeyspaceRoute('ks/:keyspace/hget/:key/:field', async (req, res) => {
         return await redisClient.hgetAsync(this.reqKey(req), req.params.field);
      });
      this.addKeyspaceRoute('ks/:keyspace/hdel/:key/:field', async (req, res) => {
         return await redisClient.hdelAsync(this.reqKey(req), req.params.field);
      });
      this.addKeyspaceRoute('ks/:keyspace/hincrby/:key/:field/:increment', async (req, res) => {
         return await redisClient.hincrbyAsync(this.reqKey(req), req.params.field, req.params.increment);
      });
      this.addKeyspaceRoute('ks/:keyspace/hexists/:key/:field', async (req, res) => {
         return await redisClient.hexistsAsync(this.reqKey(req), req.params.field);
      });
      this.addKeyspaceRoute('ks/:keyspace/hlen/:key', async (req, res) => {
         return await redisClient.hlenAsync(this.reqKey(req));
      });
      this.addKeyspaceRoute('ks/:keyspace/hkeys/:key', async (req, res) => {
         return await redisClient.hkeysAsync(this.reqKey(req));
      });
      this.addKeyspaceRoute('ks/:keyspace/hgetall/:key', async (req, res) => {
         return await redisClient.hgetallAsync(this.reqKey(req));
      });
      this.addKeyspaceRoute('ks/:keyspace/zcard/:key', async (req, res) => {
         return await redisClient.zcardAsync(this.reqKey(req));
      });
      this.addKeyspaceRoute('ks/:keyspace/zadd/:key/:score/:member', async (req, res) => {
         return await redisClient.zaddAsync(this.reqKey(req), req.params.score, req.params.member);
      });
      this.addKeyspaceRoute('ks/:keyspace/zrem/:key/:member', async (req, res) => {
         return await redisClient.zremAsync(this.reqKey(req), req.params.member);
      });
      this.addKeyspaceRoute('ks/:keyspace/zrange/:key/:start/:stop', async (req, res) => {
         return await redisClient.zrangeAsync(this.reqKey(req), req.params.start, req.params.stop);
      });
      this.addKeyspaceRoute('ks/:keyspace/zrevrange/:key/:start/:stop', async (req, res) => {
         return await redisClient.zrevrangeAsync(this.reqKey(req), req.params.start, req.params.stop);
      });
   }

   async sendResult(req, res, result) {
      logger.debug('sendResult', req.params, req.query, result);
      if (result !== undefined) {
         if (req.query.quiet !== undefined) {
            res.send('');
         } else if (req.query.nplain !== undefined) {
            res.set('Content-Type', 'text/plain');
            res.send(result.toString() + '\n');
         } else if (req.query.plain !== undefined) {
            res.set('Content-Type', 'text/plain');
            res.send(result.toString());
         } else if (req.query.html !== undefined) {
            res.set('Content-Type', 'text/html');
            res.send(result.toString() + '\n');
         } else {
            res.json(result);
         }
      }
   }

   async addRoute(uri, fn) {
      expressApp.get(config.location + uri, async (req, res) => {
         let hostname = req.hostname.replace(/\..*$/, '');
         try {
            await this.sendResult(req, res, await fn(req, res));
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
            if (/^:/.test(keyspace)) {
               res.status(400).send('Invalid keyspace: leading colon');
               return;
            }
            if (keyspace === 'MYKEYSPACE') {
               res.status(400).send('Reserved keyspace: ' + keyspace);
               return;
            }
            if (/^:/.test(key)) {
               res.status(400).send('Invalid key: leading colon');
               return;
            }
            if (timeout) {
               if (/^[0-9]$/.test(timeout)) {
                  res.status(400).send('Invalid timeout: require range 1 to 9 seconds');
                  return;
               }
            }
            const token = await redisClient.hgetAsync(this.redisKey('keyspace', keyspace), 'token');
            if (token) {
               logger.debug('token', token);
               const requestToken = req.headers['token'] || req.query.token;
               if (!requestToken) {
                  res.status(403).send('Access prohibited with token for keyspace: ' + keyspace);
                  return;
               }
               if (token !== requestToken) {
                  res.status(403).send(`Invalid token for keyspace ${keyspace}: ${requestToken}`);
                  return;
               }
            }
            let hostname;
            if (req.hostname === config.hostname) {
            } else if (lodash.endsWith(req.hostname, config.keyspaceHostname)) {
               hostname = req.hostname.replace(/\..*$/, '');
               let hostHashes = await redisClient.hgetallAsync(this.redisKey('host', hostname));
               if (!hostHashes) {
                  throw new ValidationError(`Invalid hostname: ${hostname}`);
               }
               logger.debug('hostHashes', hostHashes);
               if (!hostHashes.keyspaces) {
                  throw new ValidationError(`Invalid hostname: ${hostname}`);
               }
               if (!lodash.includes(hostHashes.keyspaces, keyspace)) {
                  throw new ValidationError(`Invalid keyspace: ${keyspace}`);
               }
            }
            if (!keyspace) {
               throw new ValidationError('Missing keyspace: ' + req.path);
            }
            if (timeout) {
               if (timeout < 1 || timeout > 10) {
                  throw new ValidationError('Timeout must range from 1 to 10 seconds: ' + timeout);
               }
            }
            const multi = redisClient.multi();
            await this.sendResult(req, res, await fn(req, res, multi));
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

   reqKey(req, ...parts) {
      const {keyspace, key} = req.params;
      return this.redisKey(keyspace, key);
   }

   redisKey(...parts) {
      return [config.redisKeyspace, ...parts].join(':');
   }

   handleError(err, req, res) {
      res.status(500).send({
         err: err.message,
         hostname: req.hostname,
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
