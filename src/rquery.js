
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
         if (this.isBrowser()) {
            let content = await Files.readFile('README.md');
            res.set('Content-Type', 'text/html');
            res.send(marked(content.toString()));
         } else if (this.isCliDomain(req)) {
            return commands.map(command => [command.key].concat(command.params).join(' '));
         } else {
            return commands.map(command => [command.key].concat(command.params).join(' '));
         }
      });
      if (config.allowInfo) {
         this.addPublicRoute('info', async (req, res) => {
            res.set('Content-Type', 'text/plain');
            res.send(await redisClient.infoAsync());
         });
      }
      if (config.allowKeyspaces) {
         this.addPublicRoute('keyspaces', () => redisClient.smembersAsync(this.adminKey('keyspaces')));
      }
      this.addPublicRoute('time/seconds', async () => {
         const time = await redisClient.timeAsync();
         return time[0];
      });
      this.addPublicRoute('time/milliseconds', async () => {
         const time = await redisClient.timeAsync();
         return Math.ceil(time[0] * 1000 + time[1]/1000);
      });
      this.addPublicRoute('time/nanoseconds', async () => {
         const time = await redisClient.timeAsync();
         return Math.ceil(time[0] * 1000 * 1000 + parseInt(time[1]));
      });
      this.addPublicRoute('time', () => redisClient.timeAsync());
      this.addPublicRoute('gentoken', async (req, res) => {
         return base32.encode(crypto.randomBytes(10));
      });
      this.addRegisterRoutes();
      this.addKeyspaceCommand({
         key: 'help',
         access: 'debug',
         format: 'plain'
      }, async (req, res) => {
         this.renderKeyspaceHelp(req, res);
      });
      this.addKeyspaceCommand({
         key: 'deregister',
         access: 'admin'
      }, async (req, res) => {
         const {keyspace} = req.params;
         const adminKey = this.adminKey('keyspace', keyspace);
         const [keys, auth, user] = await redisClient.multiExecAsync(multi => {
            multi.keys(this.adminKey(keyspace, '*'));
            multi.hget(adminKey, 'auth');
            multi.hget(adminKey, 'user');
         });
         const [keyspaces] = await redisClient.multiExecAsync(multi => {
            multi.smembers(this.adminKey('keyspaces', user));
         });
         logger.info('deregister', keyspace, keys.length, keyspaces);
         const keyIndex = config.redisKeyspace.length + keyspace.length + 2;
         const multiReply = await redisClient.multiExecAsync(multi => {
            keys.forEach(key => multi.del(key));
            multi.srem(this.adminKey('keyspaces', user), keyspace);
            multi.del(adminKey);
         });
         return keys.map(key => key.substring(keyIndex));
      });
      this.addKeyspaceCommand({
         key: 'flush',
         access: 'admin'
      }, async (req, res) => {
         const {keyspace} = req.params;
         const keys = await redisClient.keysAsync(this.adminKey(keyspace, '*'));
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
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.hsetAsync(keyspaceKey, 'readToken', req.params.readToken);
      });
      this.addKeyspaceCommand({
         key: 'revoke',
         access: 'admin'
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.hdelAsync(keyspaceKey, 'readToken');
      });
      this.addKeyspaceCommand({
         key: 'readtoken',
         access: 'debug'
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.hgetAsync(keyspaceKey, 'readToken');
      });
      this.addKeyspaceCommand({
         key: 'getconfig',
         access: 'debug'
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.hgetallAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'remcerts',
         access: 'admin'
      }, async (req, res, {keyspace}) => {
         return redisClient.sremAsync(this.adminKey('certs', keyspace));
      });
      this.addKeyspaceCommand({
         key: 'importcerts',
         access: 'admin'
      }, async (req, res, {multi, keyspace, keyspaceKey, adminKey}) => {
         const keyspaceConfig = await redisClient.hgetallAsync(adminKey);
         logger.info('zz', keyspace, adminKey, keyspaceConfig);
         if (keyspaceConfig.auth !== 'github.com') {
            throw new ValidationError('Only github.com auth currently supported: ' + keyspaceConfig.auth);
         } else {
            const ghuser = keyspaceConfig.user;
            const manifestUrl = `https://raw.githubusercontent.com/${ghuser}`
            + `/certs-concerto/master/redishub_authorized_certs.cson`;
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
                  const certUrl = `https://raw.githubusercontent.com/${ghuser}`
                  + `/certs-concerto/master/${cert}`;
                  const pem = await Requests.request({url: certUrl});
                  const digest = this.digestPem(pem, cert);
                  multi.sadd(this.adminKey('certs', keyspace), digest);
               }
            }));
            return manifest.certs;
         }
      });
      this.addKeyspaceCommand({
         key: 'keys',
         access: 'debug'
      }, async (req, res, {keyspace}) => {
         const keys = await redisClient.keysAsync(this.adminKey(keyspace, '*'));
         const index = config.redisKeyspace.length + keyspace.length + 2;
         return keys.map(key => key.substring(index));
      });
      this.addKeyspaceCommand({
         key: 'ttl',
         params: ['key'],
         access: 'debug'
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.ttlAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'ttl',
         access: 'debug'
      }, async (req, res, {keyspace}) => {
         const keys = await redisClient.keysAsync(this.adminKey(keyspace, '*'));
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
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.typeAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'set',
         params: ['key', 'value'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.setAsync(keyspaceKey, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'setex',
         params: ['key', 'seconds', 'value'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         const {seconds, value} = req.params;
         return await redisClient.setexAsync(keyspaceKey, seconds, value);
      });
      this.addKeyspaceCommand({
         key: 'setnx',
         params: ['key', 'value'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.setnxAsync(keyspaceKey, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'get',
         params: ['key']
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.getAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'incr',
         params: ['key'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.incrAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'exists',
         params: ['key']
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.existsAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'del',
         params: ['key'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.delAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'sadd',
         params: ['key', 'member'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.saddAsync(keyspaceKey, req.params.member);
      });
      this.addKeyspaceCommand({
         key: 'srem',
         params: ['key', 'member'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.sremAsync(keyspaceKey, req.params.member);
      });
      this.addKeyspaceCommand({
         key: 'smove',
         params: ['key', 'dest', 'member'],
         access: 'set'
      }, async (req, res, {multi, keyspace, keyspaceKey}) => {
         const {dest, member} = req.params;
         const destKey = this.keyspaceKey(keyspace, dest);
         let result = await redisClient.smoveAsync(keyspaceKey, destKey, member);
         multi.expire(destKey, config.expire);
         return result;
      });
      this.addKeyspaceCommand({
         key: 'spop',
         params: ['key'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.spopAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'smembers',
         params: ['key']
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.smembersAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'sismember',
         params: ['key', 'member']
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.sismemberAsync(keyspaceKey, req.params.member);
      });
      this.addKeyspaceCommand({
         key: 'scard',
         params: ['key']
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.scardAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'lpush',
         params: ['key', 'value'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.lpushAsync(keyspaceKey, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'lpushtrim',
         params: ['key', 'value', 'length'],
         access: 'set'
      }, async (req, res, {multi, keyspaceKey}) => {
         const {value, length} = req.params;
         multi.lpush(keyspaceKey, value);
         multi.trim(keyspaceKey, length);
      });
      this.addKeyspaceCommand({
         key: 'rpush',
         params: ['key', 'value'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.rpushAsync(keyspaceKey, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'lpop',
         params: ['key'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.lpopAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'blpop',
         params: ['key', 'timeout'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         const reply = await redisClient.blpopAsync(keyspaceKey, req.params.timeout);
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
      }, async (req, res, {keyspaceKey}) => {
         const reply = await redisClient.brpopAsync(keyspaceKey, req.params.timeout);
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
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.rpopAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'brpoplpush',
         params: ['key', 'dest', 'timeout'],
         access: 'set'
      }, async (req, res, {multi, keyspace, keyspaceKey}) => {
         const {dest, timeout} = req.params;
         const destKey = this.keyspaceKey(keyspace, dest);
         const result = await redisClient.brpoplpushAsync(keyspaceKey, destKey, timeout);
         multi.expire(destKey, config.expire);
         return result;
      });
      this.addKeyspaceCommand({
         key: 'llen',
         params: ['key'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.llenAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'lindex',
         params: ['key', 'index']
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.lindexAsync(keyspaceKey, req.params.index);
      });
      this.addKeyspaceCommand({
         key: 'lrem',
         params: ['key', 'count', 'value'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.lremAsync(keyspaceKey, req.params.count, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'lset',
         params: ['key', 'index', 'value'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.lsetAsync(keyspaceKey, req.params.index, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'ltrim',
         params: ['key', 'start', 'stop'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.ltrimAsync(keyspaceKey, req.params.start, req.params.stop);
      });
      this.addKeyspaceCommand({
         key: 'lrange',
         params: ['key', 'start', 'stop'],
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.lrangeAsync(keyspaceKey, req.params.start, req.params.stop);
      });
      this.addKeyspaceCommand({
         key: 'hset',
         params: ['key', 'field', 'value'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.hsetAsync(keyspaceKey, req.params.field, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'hsetnx',
         params: ['key', 'field', 'value'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.hsetnxAsync(keyspaceKey, req.params.field, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'hget',
         params: ['key', 'field']
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.hgetAsync(keyspaceKey, req.params.field);
      });
      this.addKeyspaceCommand({
         key: 'hdel',
         params: ['key', 'field'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.hdelAsync(keyspaceKey, req.params.field);
      });
      this.addKeyspaceCommand({
         key: 'hincrby',
         params: ['key', 'field', 'increment'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.hincrbyAsync(keyspaceKey, req.params.field, req.params.increment);
      });
      this.addKeyspaceCommand({
         key: 'hexists',
         params: ['key', 'field']
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.hexistsAsync(keyspaceKey, req.params.field);
      });
      this.addKeyspaceCommand({
         key: 'hlen',
         params: ['key']
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.hlenAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'hkeys',
         params: ['key']
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.hkeysAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'hgetall',
         params: ['key']
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.hgetallAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'zcard',
         params: ['key']
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.zcardAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'zadd',
         params: ['key', 'score', 'member'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.zaddAsync(keyspaceKey, req.params.score, req.params.member);
      });
      this.addKeyspaceCommand({
         key: 'zrem',
         params: ['key', 'member'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.zremAsync(keyspaceKey, req.params.member);
      });
      this.addKeyspaceCommand({
         key: 'zrange',
         params: ['key', 'start', 'stop']
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.zrangeAsync(keyspaceKey, req.params.start, req.params.stop);
      });
      this.addKeyspaceCommand({
         key: 'zrevrange',
         params: ['key', 'start', 'stop']
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.zrevrangeAsync(keyspaceKey, req.params.start, req.params.stop);
      });
   }

   renderKeyspaceHelp(req, res) {
      const {keyspace} = req.params;
      return commands.map(command => {
         return command.command;
      }).join('\n');
   }

   addPublicRoute(uri, fn) {
      expressApp.get(config.location + uri, async (req, res) => {
         let hostname = req.hostname.replace(/\..*$/, '');
         try {
            await this.sendResult(null, req, res, await fn(req, res));
         } catch (err) {
            this.sendError(err, req, res);
         }
      });
   }

   addRegisterRoutes() {
      let uri;
      if (!config.secureDomain) {
         expressApp.get(config.location + 'register-expire', (req, res) => this.registerExpire(req, res));
         uri = 'kt/:keyspace/:token';
      } else {
         uri = 'k/:keyspace';
      }
      uri += '/register/:auth/:user';
      logger.debug('register uri', uri);
      expressApp.get(config.location + uri, (req, res) => this.register(req, res));
   }

   async registerExpire(req, res, previousError) {
      if (previousError) {
         logger.warn('registerExpire retry');
      }
      try {
         logger.debug('registerExpire');
         let errorMessage = this.validateRegisterTime();
         if (errorMessage) {
            this.sendError(req, res, {message: errorMessage});
            return;
         }
         const keyspace = '~' + base32.encode(crypto.randomBytes(4));
         const token = base32.encode(crypto.randomBytes(4));
         let clientIp = req.get('x-forwarded-for');
         logger.debug('registerExpire clientIp', keyspace, clientIp);
         const adminKey = this.adminKey('keyspace', keyspace);
         const replies = await redisClient.multiExecAsync(multi => {
            //multi.sadd(this.adminKey('keyspaces:expire'), keyspace);
            multi.hsetnx(adminKey, 'token', token);
            multi.hsetnx(adminKey, 'registered', new Date().getTime());
            multi.expire(adminKey, config.expire);
            multi.incr(this.adminKey('demo:count'));
            if (config.addClientIp && clientIp) {
               multi.sadd(this.adminKey('demo:ips'), clientIp);
            }
         });
         if (!replies[0]) {
            logger.error('keyspace clash', keyspace, token);
            if (!previousError) {
               return registerExpire(req, res, {message: 'keyspace clash'});
            }
            throw {message: 'Expire keyspace clash'};
         }
         const replyPath = ['kt', keyspace, token].join('/');
         logger.debug('registerExpire', keyspace, clientIp, replyPath);
         if (this.isBrowser(req)) {
            req.redirect(301, [replyPath, 'getconfig'].join('/'));
         } else {
            await this.sendResult(null, req, res, replyPath);
         }
      } catch (err) {
         this.sendError(req, res, err);
      }
   }

   async register(req, res) {
      try {
         let errorMessage = this.validateRegisterTime();
         if (errorMessage) {
            this.sendError(req, res, {message: errorMessage});
            return;
         }
         const {token, keyspace, auth, user} = req.params;
         let v = this.validateRegisterKeyspace(keyspace);
         if (v) {
            throw {message: 'Invalid keyspace', keyspace};
         }
         if (!lodash.includes(supportedAuth, auth)) {
            throw {message: 'Invalid auth site', supportedAuth, auth};
         }
         const url = 'https://' + auth + '/' + user;
         logger.debug('url', url);
         const response = await Requests.head({url});
         if (response.statusCode !== 200) {
            throw {message: 'Invalid auth site/username', statusCode: response.statusCode, url};
         }
         const adminKey = this.adminKey('keyspace', keyspace);
         const replies = await redisClient.multiExecAsync(multi => {
            logger.info('zz', adminKey, auth, user, this.adminKey('keyspaces', auth, user), keyspace);
            multi.sadd(this.adminKey('keyspaces', auth, user), keyspace);
            if (token) {
               multi.hsetnx(adminKey, 'token', token);
            }
            multi.hsetnx(adminKey, 'auth', auth);
            multi.hsetnx(adminKey, 'user', user);
            multi.hgetall(adminKey);
         });
         if (!replies[0]) {
            throw {message: 'Invalid keyspace'};
         }
         await this.sendResult(null, req, res, replies[replies.length - 1]);
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
            const adminKey = this.adminKey('keyspace', keyspace);
            assert(keyspace, 'keyspace');
            let v;
            v = await this.validateReqKeyspaceAsync(req, keyspace);
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
               multi.hget(adminKey, 'admined');
               multi.hget(adminKey, 'accessed');
               multi.hget(adminKey, 'token');
               multi.hget(adminKey, 'readToken');
               multi.smembers(this.adminKey('certs', keyspace));
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
               let hostHashes = await redisClient.hgetallAsync(this.adminKey('host', hostname));
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
            const reqx = {multi, keyspace, adminKey};
            if (key) {
               reqx.keyspaceKey = this.keyspaceKey(keyspace, key);
            }
            await this.sendResult(command, req, res, await fn(req, res, reqx));
            multi.sadd(this.adminKey('keyspaces'), keyspace);
            multi.hset(adminKey, 'accessed', time);
            if (command && command.access === 'admin') {
               multi.hset(adminKey, 'admined', time);
            }
            if (key) {
               assert(reqx.keyspaceKey);
               multi.expire(reqx.keyspaceKey, config.expire);
            }
            if (!config.secureDomain && /^~/.test(keyspace)) {
               multi.expire(adminKey, config.expire);
            }
            await multi.execAsync();
         } catch (err) {
            this.sendError(req, res, err);
         }
      };
   }

   async migrateKeyspace({keyspace}) {
      const adminKey = this.adminKey('keyspace', keyspace);
      const [accessToken, token] = await redisClient.multiExecAsync(multi => {
         multi.hget(adminKey, 'accessToken');
         multi.hget(adminKey, 'token');
      });
      if (!token && accessToken) {
         const [hsetnx, hdel] = await redisClient.multiExecAsync(multi => {
            multi.hsetnx(adminKey, 'token', accessToken);
            multi.hdel(adminKey, 'accessToken');
         });
         if (!hsetnx) {
            throw new Error('Migrate keyspace hset failed');
         } else if (!hdel) {
            throw new Error('Migrate keyspace hdel failed');
         }
      }
   }

   validateRegisterKeyspace(keyspace) {
      if (/~/.test(keyspace)) {
         return 'contains tilde';
      }
   }

   async validateReqKeyspaceAsync(req, keyspace) {
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
      logger.debug('validateAccess scheme', scheme, keyspace, command);
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
            return 'Invalid token';
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

   keyspaceKey(keyspace, key) {
      return this.adminKey('keyspace', keyspace) + '~' + key;
   }

   adminKey(...parts) {
      return [config.redisKeyspace, ...parts].join(':');
   }

   async sendResult(command, req, res, result) {
      command = command || { command: 'none' };
      if (this.isDebugReq(req)) {
         logger.debug('sendResult', command.command, req.params, req.query, result);
      }
      let resultString = '';
      if (!Values.isDefined(result)) {
      } else if (Values.isDefined(req.query.quiet)) {
      } else if (config.defaultFormat === 'cli' || Values.isDefined(req.query.line)
      || this.isCliDomain(req) || command.format === 'cli') {
         res.set('Content-Type', 'text/plain');
         if (lodash.isArray(result)) {
            resultString = result.join('\n');
         } else if (lodash.isObject(result)) {
            resultString = Object.keys(result).map(key => [key, result[key]].join('=')).join('\n');
         } else if (result === null) {
         } else {
            resultString = result.toString();
         }
      } else if (config.defaultFormat === 'plain' || Values.isDefined(req.query.plain)
      || command.format === 'plain') {
         res.set('Content-Type', 'text/plain');
         resultString = result.toString();
      } else if (config.defaultFormat === 'html' || Values.isDefined(req.query.html)
      || command.format === 'html') {
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

   isDebugReq(req) {
      return req.hostname === 'localhost';
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

   isBrowser(req) {
      return !/^curl\//.test(req.get('User-Agent'));
   }

   isCliDomain(req) {
      return /^(cli|clisecure)\./.test(req.hostname) || !this.isBrowser(req);
   }

   sendError(req, res, err) {
      logger.debug(err.stack);
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
