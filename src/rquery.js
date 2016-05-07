
import expressLib from 'express';
import marked from 'marked';
import crypto from 'crypto';
import CSON from 'season';

import * as Files from '../lib/Files';
import * as Express from '../lib/Express';

const unsupportedAuth = ['twitter.com', 'github.com', 'gitlib.com', 'bitbucket.org'];
const supportedAuth = ['github.com'];

global.Strings = {
   matches(string, regex) {
      const match = string.match(regex);
      if (!match) {
         return [];
      } else {
         return match.slice(1);
      }
   }
};

export default class {

   async init() {
      logger.info('init');
   }

   async start() {
      redisClient = redisLib.createClient(config.redisUrl);
      expressApp = expressLib();
      this.addRoutes();
      expressApp.use((req, res) => this.sendErrorRoute(req, res));
      expressServer = await Express.listen(expressApp, config.port);
      logger.info('listen', config.port, Express.getRoutes(expressApp), expressServer);
   }

   sendErrorRoute(req, res) {
      try {
         const [account, keyspace] = Strings.matches(req.path, /^\/ak\/([a-z]+)\/([^\/]+)\//);
         logger.debug('sendErrorRoute', account, keyspace, this.isBrowser(req));
         if (account && keyspace) {
            if (this.isBrowser(req)) {
               const redirectPath = ['/ak', account, keyspace, 'help'].join('/');
               logger.debug('sendErrorRoute 32', account, keyspace, req.path, req.get('user-agent'), redirectPath);
               res.redirect(302, redirectPath);
            } else {
               logger.debug('sendErrorRoute 404', account, keyspace, req.path, req.get('user-agent'));
               res.status(404).send(`Route not found: ${req.path}. Try /routes or /help.\n`);
            }
         } else {
            res.status(404).send(`Route not found: ${req.path}. Try /routes or /help.\n`);
         }
      } catch (err) {
         logger.warn(err);
         throw err;
      }
   }

   addSecureDomain() {
      this.addPublicRoute(`gentoken/:host/:user/:webhookDomain`, async (req, res) => {
         const {user, host, webhook} = req.params;
         if (!/^[a-z][a-z0-9-\.]+\.[a-z]+$/.test(webhookDomain)) {
            throw {message: 'Invalid webhook host'};
         }
         const supportedDomains = ['test.redishub.com'];
         if (webhookDomain !== supportedDomains[0]) {
            throw {message: 'Webhook host not supported. Try: ' + supportedDomains[0]};
         }
         const uri = ['webhook', config.serviceName, host, user].join('/');
         const url = `https://${webhook}/${uri}`;
         logger.debug('webhook url', url, host, user);
         const response = await Requests.head({url, timeout: config.webhookTimeout});
         if (response.statusCode !== 200) {
            throw {message: `Webhook ` + response.statusCode, url};
         }
         const token = this.generateToken();
         const qr = this.buildQrUrl({token, user, host});
         return {token, qr};
      });
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
         if (this.isBrowser(req)) {
            let content = await Files.readFile('README.md');
            res.set('Content-Type', 'text/html');
            res.send(marked(content.toString()));
         } else if (this.isCliDomain(req)) {
            return this.listCommands();
         } else {
            return this.listCommands();
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
      this.addPublicRoute(`gentoken/:host/:user`, async (req, res) => {
         const {user, host} = req.params;
         logger.debug('gentoken', user, host);
         const token = this.generateToken();
         const qr = this.buildQrUrl({token, user, host});
         return {token, qr};
      });
      if (config.isSecureDomain) {
         this.addSecureDomain();
      }
      this.addPublicRoute('verify-user-telegram/:user', async (req, res) => {
         // TODO
         return 'OK';
      });
      this.addRegisterRoutes();
      this.addKeyspaceCommand({
         key: 'help',
         access: 'debug',
         format: 'plain'
      }, async (req, res, reqx) => {
         return this.renderKeyspaceHelp(req, res, reqx);
      });
      this.addKeyspaceCommand({
         key: 'register-keyspace',
         access: 'admin'
      }, async (req, res, {time, account, keyspace, accountKey}) => {
         const replies = await redisClient.multiExecAsync(multi => {
            multi.hsetnx(accountKey, 'registered', time);
         });
         return replies;
      });
      this.addKeyspaceCommand({
         key: 'deregister-keyspace',
         access: 'admin'
      }, async (req, res, {account, keyspace, accountKey, keyspaceKey}) => {
         const [keys] = await redisClient.multiExecAsync(multi => {
            multi.keys(this.keyspaceKey(account, keyspace, '*'));
         });
         const [keyspaces] = await redisClient.multiExecAsync(multi => {
            multi.smembers(this.accountKey(account, 'keyspaces'));
         });
         logger.info('deregister', keyspace, keys.length, keyspaces);
         const keyIndex = this.keyIndex(account, keyspace);
         const multiReply = await redisClient.multiExecAsync(multi => {
            keys.forEach(key => multi.del(key));
            multi.del(this.accountKey(account, 'keyspaces'), keyspace);
            multi.del(this.accountKey(account, 'certs'));
            multi.del(accountKey);
         });
         return keys.map(key => key.substring(keyIndex));
      });
      this.addKeyspaceCommand({
         key: 'flush',
         access: 'admin'
      }, async (req, res) => {
         const {account, keyspace} = req.params;
         const keys = await redisClient.keysAsync(this.keyspaceKey(account, keyspace, '*'));
         const keyIndex = this.keyIndex(account, keyspace);
         const multi = redisClient.multi();
         keys.forEach(key => multi.del(key));
         const multiReply = await multi.execAsync();
         return keys.map(key => key.substring(keyIndex));
      });
      this.addKeyspaceCommand({
         key: 'getconfig',
         access: 'debug'
      }, async (req, res, {accountKey}) => {
         return await redisClient.hgetallAsync(accountKey);
      });
      this.addKeyspaceCommand({
         key: 'keys',
         access: 'debug'
      }, async (req, res, {account, keyspace}) => {
         const keys = await redisClient.keysAsync(this.keyspaceKey(account, keyspace, '*'));
         const keyIndex = this.keyIndex(account, keyspace);
         return keys.map(key => key.substring(keyIndex));
      });
      this.addKeyspaceCommand({
         key: 'types',
         access: 'debug'
      }, async (req, res, {account, keyspace}) => {
         const keys = await redisClient.keysAsync(this.keyspaceKey(account, keyspace, '*'));
         logger.debug('ttl ak', account, keyspace, keys);
         const keyIndex = this.keyIndex(account, keyspace);
         const multi = redisClient.multi();
         keys.forEach(key => multi.type(key));
         const results = await multi.execAsync();
         const result = {};
         keys.forEach((key, index) => result[key.substring(keyIndex)] = results[index]);
         return result;
      });
      this.addKeyspaceCommand({
         key: 'ttl',
         params: ['key'],
         access: 'debug'
      }, async (req, res, {keyspaceKey}) => {
         return await redisClient.ttlAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'ttls',
         access: 'debug'
      }, async (req, res, {account, keyspace}) => {
         const keys = await redisClient.keysAsync(this.keyspaceKey(account, keyspace, '*'));
         logger.debug('ttl ak', account, keyspace, keys);
         const keyIndex = this.keyIndex(account, keyspace);
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
         const destKey = this.keyspaceKey(account, keyspace, dest);
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
      }, async (req, res, {multi, account, keyspace, keyspaceKey}) => {
         const {dest, timeout} = req.params;
         const destKey = this.keyspaceKey(account, keyspace, dest);
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
      const {account, keyspace} = req.params;
      logger.debug('help', req.params, commands);
      return this.listCommands().join('\n');
   }

   listCommands() {
      return commands.map(command => [command.key].concat(command.params).join(' '));
   }

   addPublicRoute(uri, fn) {
      expressApp.get(config.location + uri, async (req, res) => {
         try {
            const result = await fn(req, res);
            logger.debug('addPublicRoute', uri, result);
            await this.sendResult(null, req, res, result);
         } catch (err) {
            this.sendError(req, res, err);
         }
      });
   }

   addRegisterRoutes() {
      expressApp.get(config.location + 'register-expire', (req, res) => this.registerExpire(req, res));
      if (config.secureDomain) {
         expressApp.get(config.location + 'register-account/:account', (req, res) => this.registerAccount(req, res));
      }
   }

   async registerAccount(req, res) {
      try {
         let errorMessage = this.validateRegisterTime();
         if (errorMessage) {
            this.sendError(req, res, {message: errorMessage});
            return;
         }
         const {account} = req.params;
         let v = this.validateRegisterAccount(account);
         if (v) {
            throw {message: v, account};
         }
         const dn = req.get('ssl_client_s_dn');
         const clientCert = req.get('ssl_client_cert');
         logger.info('registerAccount dn', dn);
         if (!clientCert) {
            return 'No client cert';
         }
         const clientCertDigest = this.digestPem(clientCert);
         const token = this.generateToken();
         const accountKey = this.adminKey('account', account);
         const [hsetnx, saddAccount, saddCert] = await redisClient.multiExecAsync(multi => {
            multi.hsetnx(accountKey, 'registered', new Date().getTime());
            multi.sadd(this.adminKey('accounts'), account);
            multi.sadd(this.adminKey('account', account, 'certs'), clientCertDigest);
         });
         if (!hsetnx) {
            throw {message: 'Account exists (token)'};
         }
         if (!saddAccount) {
            logger.error('sadd account');
         }
         if (!saddCert) {
            logger.error('sadd cert');
         }
         const qr = this.buildQrUrl({
            token,
            user: account,
            host: config.hostname
         });
         await this.sendResult(null, req, res, {token, qr});
      } catch (err) {
         this.sendError(req, res, err);
      }
   }

   generateToken() {
      const bytes = crypto.randomBytes(10);
      const set = 'abcdefghijklmnopqrstuvwxyz234567';
      var output = '';
      for (var i = 0, l = bytes.length; i < l; i++) {
         output += set[Math.floor(bytes[i] / 255.0 * (set.length - 1))];
      }
      return output;
   }

   buildQrUrl(options) {
      assert(options.host);
      options = Object.assign({label: options.host, issuer: options.host}, options);
      const {label, user, host, token, issuer} = options;
      const googleChartUrl = 'http://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=';
      const uri = `${label}:${user}@${host}?secret=${token.toUpperCase()}&issuer=${issuer}`;
      return [uri, 'otpauth://totp/' + encodeURIComponent(uri)];
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
         const account = '@' + this.generateToken();
         const keyspace = this.generateToken();
         let clientIp = req.get('x-forwarded-for');
         const accountKey = this.accountKeyspace(account, keyspace);
         logger.debug('registerExpire clientIp', clientIp, account, keyspace, accountKey);
         const replies = await redisClient.multiExecAsync(multi => {
            multi.hsetnx(accountKey, 'registered', new Date().getTime());
            multi.expire(accountKey, 10*config.expire);
            if (clientIp) {
               multi.hsetnx(accountKey, 'clientIp', clientIp);
               if (config.addClientIp) {
                  multi.sadd(this.adminKey('keyspaces:expire:ips'), clientIp);
               }
            }
            this.count(multi, 'keyspaces:expire');
         });
         if (!replies[0]) {
            logger.error('keyspace clash', account, keyspace);
            if (!previousError) {
               return this.registerExpire(req, res, {message: 'keyspace clash'});
            }
            throw {message: 'Expire keyspace clash'};
         }
         const replyPath = ['ak', account, keyspace].join('/');
         logger.debug('registerExpire', keyspace, clientIp, replyPath);
         if (this.isBrowser(req)) {
            if (true) {
               res.redirect(302, [replyPath, 'help'].join('/'));
            } else {
               res.send(replyPath);
            }
         } else {
            await this.sendResult(null, req, res, replyPath);
         }
         logger.debug($lineNumber);
      } catch (err) {
         this.sendError(req, res, err);
      }
   }

   count(multi, key) {
      multi.incr(this.adminKey(`metrics:${key}:count`));
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
      let uri = 'ak/:account/:keyspace';
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
            const {account, keyspace, key, timeout} = req.params;
            assert(account, 'account');
            assert(keyspace, 'keyspace');
            const accountKey = this.accountKeyspace(account, keyspace);
            let v;
            //await this.migrateKeyspace(req.params);
            v = this.validateReqKeyspace(req, account, keyspace);
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
            const isSecureAccount = !/^@/.test(account);
            const [[time], registered, admined, accessed, certs] = await redisClient.multiExecAsync(multi => {
               multi.time();
               multi.hget(accountKey, 'registered');
               multi.hget(accountKey, 'admined');
               multi.hget(accountKey, 'accessed');
               if (isSecureAccount) {
                  multi.smembers(this.adminKey('account', account, 'certs'));
               }
            });
            v = this.validateAccess({command, req, account, keyspace, time, registered, admined, accessed, certs});
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
            const reqx = {multi, time, account, keyspace, accountKey};
            if (key) {
               reqx.keyspaceKey = this.keyspaceKey(account, keyspace, key);
            }
            await this.sendResult(command, req, res, await fn(req, res, reqx));
            multi.sadd(this.adminKey('keyspaces'), keyspace);
            multi.hset(accountKey, 'accessed', time);
            if (command && command.access === 'admin') {
               multi.hset(accountKey, 'admined', time);
            }
            if (key) {
               assert(reqx.keyspaceKey);
               multi.expire(reqx.keyspaceKey, config.expire);
            }
            if (!config.secureDomain && account[0] === '@') {
               multi.expire(accountKey, config.expire);
            }
            await multi.execAsync();
         } catch (err) {
            this.sendError(req, res, err);
         }
      };
   }

   async migrateKeyspace({account, keyspace}) {
      const accountKey = this.accountKeyspace(account, keyspace);
      const [accessToken, token] = await redisClient.multiExecAsync(multi => {
         multi.hget(accountKey, 'accessToken');
         multi.hget(accountKey, 'token');
      });
      if (!token && accessToken) {
         const [hsetnx, hdel] = await redisClient.multiExecAsync(multi => {
            multi.hsetnx(accountKey, 'token', accessToken);
            multi.hdel(accountKey, 'accessToken');
         });
         if (!hsetnx) {
            throw new Error('Migrate keyspace hset failed');
         } else if (!hdel) {
            throw new Error('Migrate keyspace hdel failed');
         }
      }
   }

   validateRegisterAccount(account) {
      if (!/^[\-_a-z0-9]+$/.test(account)) {
         return 'Account name is invalid. Try only lowercase/numeric with dash/underscore.';
      }
   }

   validateRegisterKeyspace(keyspace) {
      if (/~/.test(keyspace)) {
         return 'contains tilde';
      }
   }

   validateReqKeyspace(req, account, keyspace) {
      if (/^:/.test(keyspace)) {
         return 'leading colon';
      }
      if (/::/.test(keyspace)) {
         return 'double colon';
      }
      if (/:$/.test(keyspace)) {
         return 'trailing colon';
      }
      if (/^(KEYSPACE)/.test(keyspace)) {
         return 'Reserved keyspace for documentation purposes';
      }
      if (/^(test)/.test(keyspace)) {
         return 'Reserved keyspace for testing purposes';
      }
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

   validateAccess({req, command, account, keyspace, time, registered, admined, accessed, certs}) {
      const scheme = req.get('X-Forwarded-Proto');
      logger.debug('validateAccess scheme', scheme, account, keyspace, command);
      if (this.isSecureDomain(req)) {
         if (scheme === 'http') {
            return `Insecure scheme ${scheme}: ${req.hostname}`;
         }
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
      const isSecureAccount = !/^@/.test(account);
      if (this.isSecureDomain(req)) {
         const errorMessage = this.validateCert(req, certs, account);
         if (errorMessage) {
            return errorMessage;
         }
      } else if (command.key === 'register-keyspace') {
      } else if (!registered) {
         return 'Unregistered keyspace';
      } else if (isSecureAccount) {
         logger.error('validateAccess', account, keyspace);
         return 'Invalid access';
      }
   }

   validateCert(req, certs, account) {
      if (!certs) {
         return 'No encrolled certs';
      }
      const clientCert = req.get('ssl_client_cert');
      if (!clientCert) {
         return 'No client cert';
      }
      const clientCertDigest = this.digestPem(clientCert);
      logger.info('validateCert', clientCertDigest, account);
      if (!certs.includes(clientCertDigest)) {
         return 'Invalid cert';
      }
   }

   keyIndex(account, keyspace) {
      return [config.redisKeyspace, account, keyspace].reduce((previousValue, currentValue) => {
         return previousValue + currentValue.length
      }, 3);
   }

   accountKeyspace(account, keyspace) {
      return [config.redisKeyspace, 'ak', account, keyspace].join(':');
   }

   keyspaceKey(account, keyspace, key) {
      return [config.redisKeyspace, account, keyspace, key].join('~');
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
      return /^cli/.test(req.hostname) || !this.isBrowser(req);
   }

   sendError(req, res, err) {
      logger.warn(err);
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

   digestPem(pem) {
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
