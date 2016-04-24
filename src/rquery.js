
import expressLib from 'express';
import marked from 'marked';
import base32 from 'base32';
import crypto from 'crypto';

import * as Files from '../lib/Files';
import * as Express from '../lib/Express';

const supportedAuth = ['twitter.com', 'github.com', 'gitlib.com', 'bitbucket.org'];

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
      this.addPublicRoute('', async (req, res) => {
         return Express.getRoutes(expressApp);
      });
      this.addPublicRoute('routes', async (req, res) => {
         return Express.getRoutes(expressApp);
      });
      this.addPublicRoute('help', async (req, res) => {
         let content = await Files.readFile('README.md');
         res.set('Content-Type', 'text/html');
         res.send(marked(content.toString()));
      });
      if (config.allowInfo) {
         this.addPublicRoute('info', async (req, res) => {
            res.set('Content-Type', 'text/plain');
            res.send(await redisClient.infoAsync());
         });
      }
      if (config.allowKeyspaces) {
         this.addPublicRoute('keyspaces', () => redisClient.smembersAsync(this.redisKey('keyspaces')));
      }
      this.addPublicRoute('time/seconds', async () => {
         const time = await redisClient.timeAsync();
         return time[0];
      });
      this.addPublicRoute('time', () => redisClient.timeAsync());
      this.addPublicRoute('gentoken', async (req, res) => {
         return base32.encode(crypto.randomBytes(10));
      });
      this.addPublicRoute('gentoken/:keyspace', async (req, res) => {
         const token = base32.encode(crypto.randomBytes(10));
         return 'https://' + req.hostname + '/rquery/kt/' + req.params.keyspace + '/' + token;
      });
      //supportedAuth.forEach(auth => this.addRegisterRoute(auth));
      this.addRegisterRoute();
      this.addKeyspaceRoute('deregister', async (req, res) => {
         const {keyspace} = req.params;
         const keys = await redisClient.keysAsync(this.redisKey(keyspace, '*'));
         logger.info('deregister', keyspace, keys.length);
         const keyIndex = config.redisKeyspace.length + keyspace.length + 2;
         const multi = redisClient.multi();
         keys.forEach(key => multi.del(key));
         multi.del(this.redisKey('keyspace', keyspace));
         const multiReply = await multi.execAsync();
         return keys.map(key => key.substring(keyIndex));
      });
      this.addKeyspaceRoute('flush', async (req, res) => {
         const {keyspace} = req.params;
         const keys = await redisClient.keysAsync(this.redisKey(keyspace, '*'));
         const keyIndex = config.redisKeyspace.length + keyspace.length + 2;
         const multi = redisClient.multi();
         keys.forEach(key => multi.del(key));
         const multiReply = await multi.execAsync();
         return keys.map(key => key.substring(keyIndex));
      });
      this.addKeyspaceRoute('keys', async (req, res) => {
         const {keyspace} = req.params;
         const keys = await redisClient.keysAsync(this.redisKey(keyspace, '*'));
         const index = config.redisKeyspace.length + keyspace.length + 2;
         return keys.map(key => key.substring(index));
      });
      this.addKeyspaceRoute('ttl', async (req, res) => {
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
      this.addKeyspaceRoute('type/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.typeAsync(redisKey);
      });
      this.addKeyspaceRoute('ttl/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.ttlAsync(redisKey);
      });
      this.addKeyspaceRoute('set/:key/:value', async (req, res) => {
         const {keyspace, key, value} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.setAsync(redisKey, value);
      });
      this.addKeyspaceRoute('setex/:key/:seconds/:value', async (req, res) => {
         const {keyspace, key, seconds, value} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.setexAsync(redisKey, seconds, value);
      });
      this.addKeyspaceRoute('setnx/:key/:value', async (req, res) => {
         const {keyspace, key, value} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.setnxAsync(redisKey, value);
      });
      this.addKeyspaceRoute('get/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.getAsync(redisKey);
      });
      this.addKeyspaceRoute('incr/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.incrAsync(redisKey);
      });
      this.addKeyspaceRoute('exists/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.existsAsync(redisKey);
      });
      this.addKeyspaceRoute('del/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.delAsync(redisKey);
      });
      this.addKeyspaceRoute('sadd/:key/:member', async (req, res) => {
         const {keyspace, key, member} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.saddAsync(redisKey, member);
      });
      this.addKeyspaceRoute('srem/:key/:member', async (req, res) => {
         const {keyspace, key, member} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.sremAsync(redisKey, member);
      });
      this.addKeyspaceRoute('smove/:key/:dest/:member', async (req, res, multi) => {
         const {keyspace, key, dest, member} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         const destKey = this.redisKey(keyspace, dest);
         let result = await redisClient.smoveAsync(redisKey, destKey, member);
         multi.expire(destKey, config.expire);
         return result;
      });
      this.addKeyspaceRoute('spop/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.spopAsync(redisKey);
      });
      this.addKeyspaceRoute('smembers/:key', async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.smembersAsync(redisKey);
      });
      this.addKeyspaceRoute('sismember/:key/:member', async (req) => {
         return await redisClient.sismemberAsync(this.reqKey(req), req.params.member);
      });
      this.addKeyspaceRoute('scard/:key', async (req) => {
         let result = await redisClient.scardAsync(this.reqKey(req));
         return result;
      });
      this.addKeyspaceRoute('lpush/:key/:value', async (req, res) => {
         return await redisClient.lpushAsync(this.reqKey(req), req.params.value);
      });
      this.addKeyspaceRoute('lpush/:key/:value/trim/:length', async (req, res, multi) => {
         const {keyspace, key, value, length} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         multi.lpush(redisKey, value);
         multi.trim(redisKey, length);
      });
      this.addKeyspaceRoute('rpush/:key/:value', async (req, res) => {
         return await redisClient.rpushAsync(this.reqKey(req), req.params.value);
      });
      this.addKeyspaceRoute('lpop/:key', async (req, res) => {
         return await redisClient.lpopAsync(this.reqKey(req));
      });
      this.addKeyspaceRoute('blpop/:key/:timeout', async (req, res) => {
         const reply = await redisClient.blpopAsync(this.reqKey(req), req.params.timeout);
         if (!reply) {
            return null;
         } else {
            return reply[1];
         }
      });
      this.addKeyspaceRoute('brpop/:key/:timeout', async (req, res) => {
         const reply = await redisClient.brpopAsync(this.reqKey(req), req.params.timeout);
         if (!reply) {
            return null;
         } else {
            return reply[1];
         }
      });
      this.addKeyspaceRoute('rpop/:key', async (req, res) => {
         return await redisClient.rpopAsync(this.reqKey(req));
      });
      this.addKeyspaceRoute('brpoplpush/:key/:dest/:timeout', async (req, res, multi) => {
         const {keyspace, key, dest, timeout} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         const destKey = this.redisKey(keyspace, dest);
         const result = await redisClient.brpoplpushAsync(redisKey, destKey, timeout);
         multi.expire(destKey, config.expire);
         return result;
      });
      this.addKeyspaceRoute('llen/:key', async (req, res) => {
         return await redisClient.llenAsync(this.reqKey(req));
      });
      this.addKeyspaceRoute('lindex/:key/:index', async (req, res) => {
         return await redisClient.lindexAsync(this.reqKey(req), req.params.index);
      });
      this.addKeyspaceRoute('lrem/:key/:count/:value', async (req, res) => {
         return await redisClient.lremAsync(this.reqKey(req), req.params.count, req.params.value);
      });
      this.addKeyspaceRoute('lset/:key/:index/:value', async (req, res) => {
         return await redisClient.lsetAsync(this.reqKey(req), req.params.index, req.params.value);
      });
      this.addKeyspaceRoute('ltrim/:key/:start/:stop', async (req, res) => {
         return await redisClient.ltrimAsync(this.reqKey(req), req.params.start, req.params.stop);
      });
      this.addKeyspaceRoute('lrange/:key/:start/:stop', async (req, res) => {
         return await redisClient.lrangeAsync(this.reqKey(req), req.params.start, req.params.stop);
      });
      this.addKeyspaceRoute('hset/:key/:field/:value', async (req, res) => {
         return await redisClient.hsetAsync(this.reqKey(req), req.params.field, req.params.value);
      });
      this.addKeyspaceRoute('hsetnx/:key/:field/:value', async (req, res) => {
         return await redisClient.hsetnxAsync(this.reqKey(req), req.params.field, req.params.value);
      });
      this.addKeyspaceRoute('hget/:key/:field', async (req, res) => {
         return await redisClient.hgetAsync(this.reqKey(req), req.params.field);
      });
      this.addKeyspaceRoute('hdel/:key/:field', async (req, res) => {
         return await redisClient.hdelAsync(this.reqKey(req), req.params.field);
      });
      this.addKeyspaceRoute('hincrby/:key/:field/:increment', async (req, res) => {
         return await redisClient.hincrbyAsync(this.reqKey(req), req.params.field, req.params.increment);
      });
      this.addKeyspaceRoute('hexists/:key/:field', async (req, res) => {
         return await redisClient.hexistsAsync(this.reqKey(req), req.params.field);
      });
      this.addKeyspaceRoute('hlen/:key', async (req, res) => {
         return await redisClient.hlenAsync(this.reqKey(req));
      });
      this.addKeyspaceRoute('hkeys/:key', async (req, res) => {
         return await redisClient.hkeysAsync(this.reqKey(req));
      });
      this.addKeyspaceRoute('hgetall/:key', async (req, res) => {
         return await redisClient.hgetallAsync(this.reqKey(req));
      });
      this.addKeyspaceRoute('zcard/:key', async (req, res) => {
         return await redisClient.zcardAsync(this.reqKey(req));
      });
      this.addKeyspaceRoute('zadd/:key/:score/:member', async (req, res) => {
         return await redisClient.zaddAsync(this.reqKey(req), req.params.score, req.params.member);
      });
      this.addKeyspaceRoute('zrem/:key/:member', async (req, res) => {
         return await redisClient.zremAsync(this.reqKey(req), req.params.member);
      });
      this.addKeyspaceRoute('zrange/:key/:start/:stop', async (req, res) => {
         return await redisClient.zrangeAsync(this.reqKey(req), req.params.start, req.params.stop);
      });
      this.addKeyspaceRoute('zrevrange/:key/:start/:stop', async (req, res) => {
         return await redisClient.zrevrangeAsync(this.reqKey(req), req.params.start, req.params.stop);
      });
   }

   addPublicRoute(uri, fn) {
      expressApp.get(config.location + uri, async (req, res) => {
         let hostname = req.hostname.replace(/\..*$/, '');
         try {
            await this.sendResult(req, res, await fn(req, res));
         } catch (err) {
            this.handleError(err, req, res);
         }
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

   addRegisterRoute() {
      const uri = `kt/:keyspace/:token/register/:auth/:user`;
      logger.debug('url', uri);
      expressApp.get(config.location + uri, async (req, res) => {
         logger.debug('url', uri);
         try {
            const now = new Date().getTime();
            if (this.registerTime) {
               if (now - this.registerTime < config.registerLimit) {
                  await Promises.delay(config.registerLimit);
               }
            }
            this.registerTime = now;
            const {token, keyspace, auth, user} = req.params;
            if (!lodash.includes(supportedAuth, auth)) {
               throw {message: 'Invalid auth site', supportedAuth, auth};
            }
            const url = 'https://' + auth + '/' + user;
            logger.debug('url', url);
            const response = await Requests.head({url});
            if (response.statusCode !== 200) {
               throw {message: 'Invalid auth site/username for recovery', statusCode: response.statusCode, url};
            }
            const replies = await redisClient.multiExecAsync(multi => {
               multi.hsetnx(this.redisKey('keyspace', keyspace), 'token', token);
               multi.hsetnx(this.redisKey('keyspace', keyspace), 'auth', auth);
               multi.hsetnx(this.redisKey('keyspace', keyspace), 'user', user);
               multi.hgetall(this.redisKey('keyspace', keyspace));
            });
            if (lodash.includes(replies, 0)) {
               throw {message: 'Invalid keyspace/token'};
            }
            res.json(replies[3]);
         } catch (err) {
            this.handleError(err, req, res);
         }
      });
   }

   addKeyspaceRoute(uri, fn) {
      uri = 'kt/:keyspace/:token/' + uri;
      expressApp.get(config.location + uri, async (req, res) => {
         try {
            const {token, keyspace, key, timeout} = req.params;
            let v;
            v = this.validateKeyspace(keyspace);
            if (v) {
               res.status(400).send('Invalid keyspace: ' + v);
               return;
            }
            v = this.validateKey(key);
            if (v) {
               res.status(400).send('Invalid key: ' + v);
               return;
            }
            if (timeout) {
               if (!/^[0-9]$/.test(timeout)) {
                  res.status(400).send('Invalid timeout: require range 1 to 9 seconds');
                  return;
               }
            }
            const [[accessed], ktoken] = await redisClient.multiExecAsync(multi => {
               multi.time();
               multi.hget(this.redisKey('keyspace', keyspace), 'token');
            });
            if (!ktoken) {
               res.status(403).send('Unregistered keyspace: ' + keyspace);
               return;
            } else {
               logger.debug('token', ktoken);
               if (!token) {
                  res.status(403).send('Access prohibited with token for keyspace: ' + keyspace);
                  return;
               }
               if (token !== ktoken) {
                  res.status(403).send(`Invalid token for keyspace ${keyspace}`);
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
            multi.sadd(this.redisKey('keyspaces'), keyspace);
            multi.hset(this.redisKey('keyspace', keyspace), 'accessed', accessed);
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

   validateKeyspace(keyspace) {
      if (/^:/.test(keyspace)) {
         return 'leading colon';
      }
      if (keyspace === 'MYKEYSPACE') {
         return 'reserved keyspace';
      }
   }

   validateKey(key) {
      if (/^:/.test(key)) {
         return 'leading colon';
      }
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
