
import expressLib from 'express';
import marked from 'marked';
import base32 from 'base32';
import crypto from 'crypto';
import CSON from 'season';

import * as Files from '../lib/Files';
import * as Express from '../lib/Express';

const unsupportedAuth = ['twitter.com', 'github.com', 'gitlib.com', 'bitbucket.org'];
const supportedAuth = ['github.com'];

export default class {

   async init() {
      logger.info('init');
   }

   async start() {
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
         if (this.isCliDomain(req)) {
            return commands.map(command => [command.key].concat(command.params).join(' '));
         } else {
            let content = await Files.readFile('README.md');
            res.set('Content-Type', 'text/html');
            res.send(marked(content.toString()));
         }
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
      this.addPublicRoute('time/milliseconds', async () => {
         const time = await redisClient.timeAsync();
         return time[0] * 1000 + time[1]/1000;
      });
      this.addPublicRoute('time/nanoseconds', async () => {
         const time = await redisClient.timeAsync();
         return time[0] * 1000 * 1000 + parseInt(time[1]);
      });
      this.addPublicRoute('time', () => redisClient.timeAsync());
      this.addPublicRoute('gentoken', async (req, res) => {
         return base32.encode(crypto.randomBytes(10));
      });
      this.addRegisterRoute();
      this.addKeyspaceCommand({
         key: 'deregister',
         access: 'admin'
      }, async (req, res) => {
         const {keyspace} = req.params;
         const [keys, auth, user] = await redisClient.multiExecAsync(multi => {
            multi.keys(this.redisKey(keyspace, '*'));
            multi.hget(this.redisKey('keyspace', keyspace), 'auth');
            multi.hget(this.redisKey('keyspace', keyspace), 'user');
         });
         const [keyspaces] = await redisClient.multiExecAsync(multi => {
            multi.smembers(this.redisKey('keyspaces', user));
         });
         logger.info('deregister', keyspace, keys.length, keyspaces);
         const keyIndex = config.redisKeyspace.length + keyspace.length + 2;
         const multiReply = await redisClient.multiExecAsync(multi => {
            keys.forEach(key => multi.del(key));
            multi.srem(this.redisKey('keyspaces', user), keyspace);
            multi.del(this.redisKey('keyspace', keyspace));
         });
         return keys.map(key => key.substring(keyIndex));
      });
      this.addKeyspaceCommand({
         key: 'flush',
         access: 'admin'
      }, async (req, res) => {
         const {keyspace} = req.params;
         const keys = await redisClient.keysAsync(this.redisKey(keyspace, '*'));
         const keyIndex = config.redisKeyspace.length + keyspace.length + 2;
         const multi = redisClient.multi();
         keys.forEach(key => multi.del(key));
         const multiReply = await multi.execAsync();
         return keys.map(key => key.substring(keyIndex));
      });
      this.addKeyspaceCommand({
         key: 'grant',
         params: ['readToken'],
         access: 'admin'
      }, async (req, res) => {
         const {keyspace, readToken} = req.params;
         return await redisClient.hsetAsync(this.redisKey('keyspace', keyspace), 'readToken', readToken);
      });
      this.addKeyspaceCommand({
         key: 'revoke',
         access: 'admin'
      }, async (req, res) => {
         const {keyspace} = req.params;
         return await redisClient.hdelAsync(this.redisKey('keyspace', keyspace), 'readToken');
      });
      this.addKeyspaceCommand({
         key: 'readtoken',
         access: 'debug'
      }, async (req, res) => {
         const {keyspace} = req.params;
         return await redisClient.hgetAsync(this.redisKey('keyspace', keyspace), 'readToken');
      });
      this.addKeyspaceCommand({
         key: 'getconfig',
         access: 'debug'
      }, async (req, res) => {
         const {keyspace} = req.params;
         return await redisClient.hgetallAsync(this.redisKey('keyspace', keyspace));
      });
      this.addKeyspaceCommand({
         key: 'remcerts',
         access: 'admin'
      }, async (req, res) => {
         const {keyspace} = req.params;
         return redisClient.sremAsync(this.redisKey('certs', keyspace));
      });
      this.addKeyspaceCommand({
         key: 'importcerts',
         access: 'admin'
      }, async (req, res, multi) => {
         const {keyspace} = req.params;
         const keyspaceConfig = await redisClient.hgetallAsync(this.redisKey('keyspace', keyspace));
         if (keyspaceConfig.auth !== 'github.com') {
            throw new ValidationError('Only github.com auth currently supported: ' + keyspaceConfig.auth);
         } else {
            const ghuser = keyspaceConfig.user;
            const manifestUrl = `https://raw.githubusercontent.com/${ghuser}/config-redishub/master/authorized_certs.cson`;
            const manifest = CSON.parse(await Requests.request({url: manifestUrl}));
            if (!manifest.spec) {
               throw new ValidationError('No spec: ' + manifest);
            }
            if (!lodash.isArray(manifest.certs)) {
               throw new ValidationError('No certs array: ' + manifest);
            }
            if (manifest.certs.length > config.certLimit) {
               throw new ValidationError('Too many certs: ' + manifest);
            }
            const digests = await Promise.all(manifest.certs.map(async cert => {
               if (!/\.pem/.test(cert)) {
                  throw new ValidationError('Not .pem: ' + cert);
               } else {
                  const certUrl = `https://raw.githubusercontent.com/${ghuser}/config-redishub/master/${cert}`;
                  const pem = await Requests.request({url: certUrl});
                  const digest = this.digestPem(pem, cert);
                  multi.sadd(this.redisKey('certs', keyspace), digest);
               }
            }));
            return manifest.certs;
         }
      });
      this.addKeyspaceCommand({
         key: 'keys',
         access: 'debug'
      }, async (req, res) => {
         const {keyspace} = req.params;
         const keys = await redisClient.keysAsync(this.redisKey(keyspace, '*'));
         const index = config.redisKeyspace.length + keyspace.length + 2;
         return keys.map(key => key.substring(index));
      });
      this.addKeyspaceCommand({
         key: 'ttl',
         params: ['key'],
         access: 'debug'
      }, async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.ttlAsync(redisKey);
      });
      this.addKeyspaceCommand({
         key: 'ttl',
         access: 'debug'
      }, async (req, res) => {
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
      this.addKeyspaceCommand({
         key: 'type',
         params: ['key'],
         access: 'debug'
      }, async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.typeAsync(redisKey);
      });
      this.addKeyspaceCommand({
         key: 'set',
         params: ['key', 'value'],
         access: 'set'
      }, async (req, res) => {
         const {keyspace, key, value} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.setAsync(redisKey, value);
      });
      this.addKeyspaceCommand({
         key: 'setex',
         params: ['key', 'seconds', 'value'],
         access: 'set'
      }, async (req, res) => {
         const {keyspace, key, seconds, value} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.setexAsync(redisKey, seconds, value);
      });
      this.addKeyspaceCommand({
         key: 'setnx',
         params: ['key', 'value'],
         access: 'set'
      }, async (req, res) => {
         const {keyspace, key, value} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.setnxAsync(redisKey, value);
      });
      this.addKeyspaceCommand({
         key: 'get',
         params: ['key']
      }, async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.getAsync(redisKey);
      });
      this.addKeyspaceCommand({
         key: 'incr',
         params: ['key'],
         access: 'set'
      }, async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.incrAsync(redisKey);
      });
      this.addKeyspaceCommand({
         key: 'exists',
         params: ['key']
      }, async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.existsAsync(redisKey);
      });
      this.addKeyspaceCommand({
         key: 'del',
         params: ['key'],
         access: 'set'
      }, async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.delAsync(redisKey);
      });
      this.addKeyspaceCommand({
         key: 'sadd',
         params: ['key', 'member'],
         access: 'set'
      }, async (req, res) => {
         const {keyspace, key, member} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.saddAsync(redisKey, member);
      });
      this.addKeyspaceCommand({
         key: 'srem',
         params: ['key', 'member'],
         access: 'set'
      }, async (req, res) => {
         const {keyspace, key, member} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.sremAsync(redisKey, member);
      });
      this.addKeyspaceCommand({
         key: 'smove',
         params: ['key', 'dest', 'member'],
         access: 'set'
      }, async (req, res, multi) => {
         const {keyspace, key, dest, member} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         const destKey = this.redisKey(keyspace, dest);
         let result = await redisClient.smoveAsync(redisKey, destKey, member);
         multi.expire(destKey, config.expire);
         return result;
      });
      this.addKeyspaceCommand({
         key: 'spop',
         params: ['key'],
         access: 'set'
      }, async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.spopAsync(redisKey);
      });
      this.addKeyspaceCommand({
         key: 'smembers',
         params: ['key']
      }, async (req, res) => {
         const {keyspace, key} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         return await redisClient.smembersAsync(redisKey);
      });
      this.addKeyspaceCommand({
         key: 'sismember',
         params: ['key', 'member']
      }, async (req) => {
         return await redisClient.sismemberAsync(this.reqKey(req), req.params.member);
      });
      this.addKeyspaceCommand({
         key: 'scard',
         params: ['key']
      }, async (req) => {
         let result = await redisClient.scardAsync(this.reqKey(req));
         return result;
      });
      this.addKeyspaceCommand({
         key: 'lpush',
         params: ['key', 'value'],
         access: 'set'
      }, async (req, res) => {
         return await redisClient.lpushAsync(this.reqKey(req), req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'lpushtrim',
         params: ['key', 'value', 'length'],
         access: 'set'
      }, async (req, res, multi) => {
         const {keyspace, key, value, length} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         multi.lpush(redisKey, value);
         multi.trim(redisKey, length);
      });
      this.addKeyspaceCommand({
         key: 'rpush',
         params: ['key', 'value'],
         access: 'set'
      }, async (req, res) => {
         return await redisClient.rpushAsync(this.reqKey(req), req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'lpop',
         params: ['key'],
         access: 'set'
      }, async (req, res) => {
         return await redisClient.lpopAsync(this.reqKey(req));
      });
      this.addKeyspaceCommand({
         key: 'blpop',
         params: ['key', 'timeout'],
         access: 'set'
      }, async (req, res) => {
         const reply = await redisClient.blpopAsync(this.reqKey(req), req.params.timeout);
         if (!reply) {
            return null;
         } else {
            return reply[1];
         }
      });
      this.addKeyspaceCommand({
         key: 'brpop',
         params: ['key', 'timeout'],
         access: 'set'
      }, async (req, res) => {
         const reply = await redisClient.brpopAsync(this.reqKey(req), req.params.timeout);
         if (!reply) {
            return null;
         } else {
            return reply[1];
         }
      });
      this.addKeyspaceCommand({
         key: 'rpop',
         params: ['key'],
         access: 'set'
      }, async (req, res) => {
         return await redisClient.rpopAsync(this.reqKey(req));
      });
      this.addKeyspaceCommand({
         key: 'brpoplpush',
         params: ['key', 'dest', 'timeout'],
         access: 'set'
      }, async (req, res, multi) => {
         const {keyspace, key, dest, timeout} = req.params;
         const redisKey = this.redisKey(keyspace, key);
         const destKey = this.redisKey(keyspace, dest);
         const result = await redisClient.brpoplpushAsync(redisKey, destKey, timeout);
         multi.expire(destKey, config.expire);
         return result;
      });
      this.addKeyspaceCommand({
         key: 'llen',
         params: ['key'],
         access: 'set'
      }, async (req, res) => {
         return await redisClient.llenAsync(this.reqKey(req));
      });
      this.addKeyspaceCommand({
         key: 'lindex',
         params: ['key', 'index']
      }, async (req, res) => {
         return await redisClient.lindexAsync(this.reqKey(req), req.params.index);
      });
      this.addKeyspaceCommand({
         key: 'lrem',
         params: ['key', 'count', 'value'],
         access: 'set'
      }, async (req, res) => {
         return await redisClient.lremAsync(this.reqKey(req), req.params.count, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'lset',
         params: ['key', 'index', 'value'],
         access: 'set'
      }, async (req, res) => {
         return await redisClient.lsetAsync(this.reqKey(req), req.params.index, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'ltrim',
         params: ['key', 'start', 'stop'],
         access: 'set'
      }, async (req, res) => {
         return await redisClient.ltrimAsync(this.reqKey(req), req.params.start, req.params.stop);
      });
      this.addKeyspaceCommand({
         key: 'lrange',
         params: ['key', 'start', 'stop'],
      }, async (req, res) => {
         return await redisClient.lrangeAsync(this.reqKey(req), req.params.start, req.params.stop);
      });
      this.addKeyspaceCommand({
         key: 'hset',
         params: ['key', 'field', 'value'],
         access: 'set'
      }, async (req, res) => {
         return await redisClient.hsetAsync(this.reqKey(req), req.params.field, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'hsetnx',
         params: ['key', 'field', 'value'],
         access: 'set'
      }, async (req, res) => {
         return await redisClient.hsetnxAsync(this.reqKey(req), req.params.field, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'hget',
         params: ['key', 'field']
      }, async (req, res) => {
         return await redisClient.hgetAsync(this.reqKey(req), req.params.field);
      });
      this.addKeyspaceCommand({
         key: 'hdel',
         params: ['key', 'field'],
         access: 'set'
      }, async (req, res) => {
         return await redisClient.hdelAsync(this.reqKey(req), req.params.field);
      });
      this.addKeyspaceCommand({
         key: 'hincrby',
         params: ['key', 'field', 'increment'],
         access: 'set'
      }, async (req, res) => {
         return await redisClient.hincrbyAsync(this.reqKey(req), req.params.field, req.params.increment);
      });
      this.addKeyspaceCommand({
         key: 'hexists',
         params: ['key', 'field']
      }, async (req, res) => {
         return await redisClient.hexistsAsync(this.reqKey(req), req.params.field);
      });
      this.addKeyspaceCommand({
         key: 'hlen',
         params: ['key']
      }, async (req, res) => {
         return await redisClient.hlenAsync(this.reqKey(req));
      });
      this.addKeyspaceCommand({
         key: 'hkeys',
         params: ['key']
      }, async (req, res) => {
         return await redisClient.hkeysAsync(this.reqKey(req));
      });
      this.addKeyspaceCommand({
         key: 'hgetall',
         params: ['key']
      }, async (req, res) => {
         return await redisClient.hgetallAsync(this.reqKey(req));
      });
      this.addKeyspaceCommand({
         key: 'zcard',
         params: ['key']
      }, async (req, res) => {
         return await redisClient.zcardAsync(this.reqKey(req));
      });
      this.addKeyspaceCommand({
         key: 'zadd',
         params: ['key', 'score', 'member'],
         access: 'set'
      }, async (req, res) => {
         return await redisClient.zaddAsync(this.reqKey(req), req.params.score, req.params.member);
      });
      this.addKeyspaceCommand({
         key: 'zrem',
         params: ['key', 'member'],
         access: 'set'
      }, async (req, res) => {
         return await redisClient.zremAsync(this.reqKey(req), req.params.member);
      });
      this.addKeyspaceCommand({
         key: 'zrange',
         params: ['key', 'start', 'stop']
      }, async (req, res) => {
         return await redisClient.zrangeAsync(this.reqKey(req), req.params.start, req.params.stop);
      });
      this.addKeyspaceCommand({
         key: 'zrevrange',
         params: ['key', 'start', 'stop']
      }, async (req, res) => {
         return await redisClient.zrevrangeAsync(this.reqKey(req), req.params.start, req.params.stop);
      });
   }

   addPublicRoute(uri, fn) {
      expressApp.get(config.location + uri, async (req, res) => {
         let hostname = req.hostname.replace(/\..*$/, '');
         try {
            await this.sendResult(req, res, await fn(req, res));
         } catch (err) {
            this.sendError(err, req, res);
         }
      });
   }

   addRegisterRoute() {
      const uri = (config.secureDomain? 'k/:keyspace': 'kt/:keyspace/:token')
      + '/register/:auth/:user';
      logger.debug('register uri', uri);
      expressApp.get(config.location + uri, (req, res) => this.register(req, res));
   }

   async register(req, res) {
      try {
         let errorMessage = this.validateRegisterTime();
         if (errorMessage) {
            this.sendError(req, res, {message: errorMessage});
            return;
         }
         const {token, keyspace, auth, user} = req.params;
         if (!lodash.includes(supportedAuth, auth)) {
            throw {message: 'Invalid auth site', supportedAuth, auth};
         }
         const url = 'https://' + auth + '/' + user;
         logger.debug('url', url);
         const response = await Requests.head({url});
         if (response.statusCode !== 200) {
            throw {message: 'Invalid auth site/username', statusCode: response.statusCode, url};
         }
         const replies = await redisClient.multiExecAsync(multi => {
            multi.sadd(this.redisKey('keyspaces', auth, user), keyspace);
            if (token) {
               multi.hsetnx(this.redisKey('keyspace', keyspace), 'accessToken', token);
            }
            multi.hsetnx(this.redisKey('keyspace', keyspace), 'auth', auth);
            multi.hsetnx(this.redisKey('keyspace', keyspace), 'user', user);
            multi.hgetall(this.redisKey('keyspace', keyspace));
         });
         if (!replies[0]) {
            throw {message: 'Invalid keyspace'};
         }
         await this.sendResult(req, res, replies[replies.length - 1]);
      } catch (err) {
         this.sendError(req, res, err);
      }
   }

   validateRegisterTime() {
      const time = new Date().getTime();
      if (!this.registerTime) {
         this.registerTime = time;
      } else {
         const duration = time - this.registerTime;
         if (duration > 1000) {
            this.registerTime = time;
            this.registerCount = 0;
         } else {
            this.registerCount++;
         }
         if (this.registerCount > config.registerLimit) {
            logger.error('registerCount');
            return `Global register rate exceeed: ${config.registerLimit} per second`;
         }
      }
      this.registerTime = time;
   }

   validateImportTime() {
      const time = new Date().getTime();
      if (!this.importTime) {
         this.importTime = time;
      } else {
         const duration = time - this.importTime;
         if (duration > 1000) {
            this.importTime = time;
            this.importCount = 0;
         } else {
            this.importCount++;
         }
         if (this.importCount > config.importLimit) {
            logger.error('importCount');
            return `Global import rate exceeed: ${config.importLimit} per second`;
         }
      }
      this.importTime = time;
   }

   addKeyspaceCommand(command, fn) {
      assert(command.key, 'command.key');
      let uri = config.secureDomain? 'k/:keyspace': 'kt/:keyspace/:token';
      command.params = command.params || [];
      const key = command.key + command.params.length;
      logger.debug('addKeyspaceCommand', command.key, key, uri);
      commands.push(command);
      const handler = this.createKeyspaceHandler(command, fn);
      if (command.key === config.indexCommand) {
         expressApp.get(config.location + uri, handler);
      }
      uri += '/' + command.key;
      if (command.params.length) {
         assert(command.key !== config.indexCommand, 'indexCommand');
         uri += '/' + command.params.map(param => ':' + param).join('/');
      }
      expressApp.get(config.location + uri, handler);
      logger.debug('add', command.key, uri);
   }

   createKeyspaceHandler(command, fn) {
      return async (req, res) => {
         try {
            const {token, keyspace, key, timeout} = req.params;
            assert(keyspace, 'keyspace');
            let v;
            v = await this.validateKeyspace(req, keyspace);
            if (v) {
               this.sendStatusMessage(req, res, 400, 'Invalid keyspace: ' + v);
               return;
            }
            v = this.validateKey(key);
            if (v) {
               this.sendStatusMessage(req, res, 400, 'Invalid key: ' + v);
               return;
            }
            if (timeout) {
               if (!/^[0-9]$/.test(timeout)) {
                  this.sendStatusMessage(req, res, 400, 'Invalid timeout: require range 1 to 9 seconds');
                  return;
               }
            }
            const [[time], admined, accessed, accessToken, readToken, certs] = await redisClient.multiExecAsync(multi => {
               multi.time();
               multi.hget(this.redisKey('keyspace', keyspace), 'admined');
               multi.hget(this.redisKey('keyspace', keyspace), 'accessed');
               multi.hget(this.redisKey('keyspace', keyspace), 'accessToken');
               multi.hget(this.redisKey('keyspace', keyspace), 'readToken');
               multi.smembers(this.redisKey('certs', keyspace));
            });
            v = this.validateAccess({command, req, keyspace, token, time,
               admined, accessed, accessToken, readToken, certs
            });
            if (v) {
               this.sendStatusMessage(req, res, 403, v);
               return;
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
            multi.hset(this.redisKey('keyspace', keyspace), 'accessed', time);
            if (command && command.access === 'admin') {
               multi.hset(this.redisKey('keyspace', keyspace), 'admined', time);
            }
            if (key) {
               const redisKey = this.redisKey(keyspace, key);
               multi.expire(redisKey, config.expire);
            }
            await multi.execAsync();
         } catch (err) {
            this.sendError(req, res, err);
         }
      };
   }

   async migrateKeyspace({keyspace}) {
      const [accessToken, token] = await redisClient.multiExecAsync(multi => {
         multi.hget(this.redisKey('keyspace', keyspace), 'accessToken');
         multi.hget(this.redisKey('keyspace', keyspace), 'token');
      });
      if (token && !accessToken) {
         const [hset, hdel] = await redisClient.multiExecAsync(multi => {
            multi.hsetnx(this.redisKey('keyspace', keyspace), 'accessToken', token);
            multi.hdel(this.redisKey('keyspace', keyspace), 'token');
         });
         if (!hset) {
            throw new Error('Migrate keyspace hset failed');
         } else if (!hdel) {
            throw new Error('Migrate keyspace hdel failed');
         }
      }
   }

   async validateKeyspace(req, keyspace) {
      if (/^:/.test(keyspace)) {
         return 'leading colon';
      }
      if (/::/.test(keyspace)) {
         return 'double colon';
      }
      if (/:$/.test(keyspace)) {
         return 'trailing colon';
      }
      if (/^(MYKEYSPACE)/.test(keyspace)) {
         return 'Reserved keyspace for documentation purposes';
      }
      if (/^(test)/.test(keyspace)) {
         return 'Reserved keyspace for testing purposes';
      }
      await this.migrateKeyspace(req.params);
   }

   validateKey(key) {
      if (/^:/.test(key)) {
         return 'leading colon';
      }
   }

   isReadCommand(command) {
      if (!command) {
         return false;
      } else if (!command.access) {
         return true;
      } else if (command.access === 'debug') {
         return true;
      }
      return false;
   }

   validateAccess({req, command, keyspace, token, time, admined, accessed, accessToken, readToken, certs}) {
      const scheme = req.get('X-Forwarded-Proto');
      logger.debug('validateAccess', scheme, keyspace, command);
      if (this.isSecureDomain(req) && scheme === 'http') {
         return `Insecure scheme ${scheme}: ${req.hostname}`;
      }
      if (command.access) {
         if (command.access === 'admin') {
            if (!admined) {
               logger.warn('validateAccess admined', keyspace, command.key, time);
            } else {
               const duration = time - admined;
               if (duration < config.adminLimit) {
                  return `Admin command interval not elapsed: ${config.adminLimit}s`;
               }
            }
         } else if (command.access === 'debug') {
         } else if (command.access === 'set') {
         } else if (command.access === 'get') {
         } else {
         }
      }
      if (command.key === 'importcerts') {
         const errorMessage = this.validateImportTime();
         if (errorMessage) {
            return errorMessage;
         }
      } else if (this.isSecureDomain(req)) {
         const errorMessage = this.validateCert(req, certs, keyspace);
         if (errorMessage) {
            return errorMessage;
         }
      } else if (config.secureDomain) {
         return 'Invalid domain';
      } else if (!token) {
         return 'Unregistered keyspace';
      } else if (token === accessToken) {
      } else if (this.isReadCommand(command)) {
         if (token !== readToken) {
            return 'Invalid token for command';
         }
      } else if (token !== accessToken) {
         return 'Invalid access token';
      }
   }

   validateCert(req, certs, name) {
      if (!certs) {
         return 'No encrolled certs';
      }
      const clientCert = req.get('ssl_client_cert');
      if (!clientCert) {
         return 'No client cert';
      }
      const clientCertDigest = this.digestPem(clientCert, name);
      logger.info('validateAccess', clientCertDigest, name);
      if (!certs.includes(clientCertDigest)) {
         return 'Invalid cert';
      }
   }

   reqKey(req, ...parts) {
      const {keyspace, key} = req.params;
      return this.redisKey(keyspace, key);
   }

   redisKey(...parts) {
      return [config.redisKeyspace, ...parts].join(':');
   }

   async sendResult(req, res, result) {
      logger.ndebug('sendResult', req.params, req.query, result);
      let resultString = '';
      if (!Values.isDefined(result)) {
      } else if (Values.isDefined(req.query.quiet)) {
      } else if (config.defaultFormat === 'cli' || Values.isDefined(req.query.line) || this.isCliDomain(req)) {
         res.set('Content-Type', 'text/plain');
         if (lodash.isArray(result)) {
            resultString = result.join('\n');
         } else if (lodash.isObject(result)) {
            resultString = Object.keys(result).map(key => [key, result[key]].join('=')).join('\n');
         } else if (result === null) {
         } else {
            resultString = result.toString();
         }
      } else if (config.defaultFormat === 'plain' || Values.isDefined(req.query.plain)) {
         res.set('Content-Type', 'text/plain');
         resultString = result.toString();
      } else if (config.defaultFormat === 'html' || Values.isDefined(req.query.html)) {
         res.set('Content-Type', 'text/html');
         resultString = result.toString();
      } else if (config.defaultFormat !== 'json') {
         this.sendError(req, res, {message: `Invalid default format: ${config.defaultFormat}`});
      } else {
         res.json(result);
         return;
      }
      res.send(resultString + '\n');
   }

   isSecureDomain(req) {
      if (config.secureDomain) {
         return true;
      }
      if (/^(secure|clisecure)\./.test(req.hostname)) {
         logger.warn('isSecureDomain', req.hostname);
         return true;
      }
      return false;
   }

   isCliDomain(req) {
      return /^(cli|clisecure)\./.test(req.hostname);
   }

   sendError(req, res, err) {
      if (req.hostname === 'localhost') {
         logger.warn('sendError', err);
      }
      this.sendStatusMessage(req, res, 500, err.message, err);
   }

   sendStatusMessage(req, res, statusCode, errorMessage, err) {
      if (this.isCliDomain(req)) {
         if (err) {
            if (err.stack) {
               errorMessage = err.stack.toString();
            }
         }
      }
      res.status(statusCode).send(errorMessage + '\n');
   }

   digestPem(pem, name) {
      const lines = pem.split(/[\n\t]/);
      if (lines.length < 8) {
         throw new ValidationError('Invalid lines');
      }
      if (!/^-+BEGIN CERTIFICATE/.test(lines[0])) {
         throw new ValidationError('Invalid first line');
      }
      const contentLines = lines.filter(line => {
         return line.length > 16 && /^[\w\/\+]+$/.test(line);
      });
      if (contentLines.length < 8) {
         throw new ValidationError('Invalid lines');
      }
      const sha1 = crypto.createHash('sha1');
      contentLines.forEach(line => sha1.update(new Buffer(line)));
      const digest = sha1.digest('hex');
      if (digest.length < 32) {
         throw new ValidationError('Invalid cert length');
      }
      return digest;
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
