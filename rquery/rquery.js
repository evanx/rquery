
import expressLib from 'express';
import brucedown from 'brucedown';
import marked from 'marked';
import crypto from 'crypto';
import CSON from 'season';
import base32 from 'thirty-two';
import speakeasy from 'speakeasy';
import otp from 'otplib/lib/totp';
import concatStream from 'concat-stream';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import * as Files from './Files';
import * as Express from './Express';

import Page from './html/Page';
import Help from './html/Help';
import KeyspaceHelp from './html/KeyspaceHelp';
import KeyspaceHelpPage from './jsx/KeyspaceHelpPage';

const unsupportedAuth = ['twitter.com', 'github.com', 'gitlab.com', 'bitbucket.org'];
const supportedAuth = ['telegram.org'];

export default class {

   async test() {
      await Files.mkdirp('tmp');
      await Files.writeFile('tmp/hello.txt', 'Hello!');
      this.logger.error('exists', await Files.existsFile('tmp/hello.txt'));
      assert(await Files.existsFile('tmp/hello.txt'), 'exists: tmp/hello.txt');
      const content = (await Files.readFile('tmp/hello.txt')).toString();
      assert.equal(content, 'Hello!', 'content: tmp/hello.txt');
      this.logger.warn('content', typeof content, content);
   }

   async init() {
      this.logger.info('init');
      await this.test();
   }

   async start() {
      this.redis = redisLib.createClient(this.config.redisUrl);
      this.expressApp = expressLib();
      this.expressApp.use((req, res, next) => {
         req.pipe(concatStream(content => {
            req.body = content;
            next();
         }));
      });
      this.addRoutes();
      if (this.config.disableTelegramHook) {
         this.logger.warn('telegram webhook disabled');
      } else {
         this.addTelegramWebhook();
      }
      this.expressApp.use((req, res) => this.sendErrorRoute(req, res));
      this.expressServer = await Express.listen(this.expressApp, this.config.port);
      this.logger.info('listen', this.config.port, Express.getRoutes(this.expressApp), this.expressServer);
   }

   sendErrorRoute(req, res) {
      try {
         if (/^\/favicon.ico$/.test(req.path)) {
            res.status(404).send(`Invalid path: ${req.path}\n`);
            return;
         }
         const [account, keyspace] = Strings.matches(req.path, /^\/ak\/([^\/]+)\/([^\/]+)\//);
         this.logger.debug('sendErrorRoute', req.path,  account, keyspace, this.isBrowser(req));
         if (this.isBrowser(req)) {
            let redirectPath = '/routes';
            if (account && keyspace) {
               redirectPath = ['/ak', account, keyspace, 'help'].join('/');
            }
            res.redirect(302, redirectPath);
         } else {
            res.status(404).send(`Invalid: ${req.path}. Try /routes or /help.\n`);
         }
      } catch (err) {
         this.logger.warn(err);
         throw err;
      }
   }

   addSecureDomain() {
   }

   addTelegramWebhook() {
      if (!this.config.botSecret) {
         this.logger.error('addTelegramWebhook botSecret');
      } else {
         this.expressApp.post('/webhook-telegram/*', async (req, res) => {
            try {
               this.logger.debug('webhook auth', req.params[0], this.config.botSecret);
               if (req.params[0] !== this.config.botSecret) {
                  throw 'Invalid telegram webhook';
               }
               const body = req.body.toString('utf8');
               this.logger.debug('body', body);
               if (!/^["{\[]/.test(body)) {
                  throw {message: 'body not JSON', body};
               } else {
                  await this.handleTelegram(req, res, JSON.parse(body));
                  res.send('');
               }
            } catch (err) {
               this.logger.error(err);
               res.status(500).send(`Internal error: ${err.message}\n`);
            }
         });
      }
   }

   async handleTelegram(req, res, telegram) {
      this.logger.debug('telegram', telegram);
      const message = {};
      let content;
      if (telegram.message) {
         message.type = 'message';
         content = telegram.message;
         if (!content.text) {
         } else {
            message.text = content.text;
         }
      } else if (telegram.inline_query) {
         message.type = 'query';
         content = telegram.inline_query;
         if (!content.query) {
         } else {
            message.text = content.query;
         }
      } else {
         this.logger.warn('telegram', telegram);
         return;
      }
      if (!content.chat) {
      } else if (!content.chat.id) {
      } else {
         message.chatId = content.chat.id;
      }
      this.logger.debug('tcm', {telegram, content, message});
      if (!content.from) {
      } else if (!content.from.username) {
      } else if (!content.from.id) {
      } else {
         message.fromId = content.from.id;
         message.greetName = content.from.username;
         if (true && content.from.first_name) {
            message.greetName = content.from.first_name;
         } else if (content.from.first_name && content.from.last_name) {
            message.greetName = [content.from.first_name, content.from.last_name].join(' ');
         }
         message.username = content.from.username;
         if (/verify/.test(content.text)) {
            message.action = 'verify';
            await this.handleTelegramVerify(message);
         } else if (/grant/.test(content.text)) {
            message.action = 'grant';
            await this.handleTelegramGrant(message);
         } else {
            await this.sendTelegramReply(message, {
               content: `Commands:
               /verify - verify your Telegram identity to redishub.com
               `
            });
         }
      }
      this.logger.info('telegram message', message, telegram);
   }

   async handleTelegramVerify(request) {
      const now = new Date().getTime();
      this.logger.info('handleTelegramVerify', request);
      const userKey = this.adminKey('telegram', 'user', request.username);
      let [sadd, verified, secret] = await this.redis.multiExecAsync(multi => {
         multi.sadd(this.adminKey('telegram:verified:users'), request.username);
         multi.hget(userKey, 'verified');
         multi.hget(userKey, 'secret');
      });
      if (!secret) {
         secret = this.generateTokenKey();
      }
      if (sadd || !verified) {
         const [hmset] = await this.redis.multiExecAsync(multi => {
            multi.hsetnx(userKey, 'verified', now);
            multi.hsetnx(userKey, 'id', request.fromId);
            multi.hsetnx(userKey, 'secret', secret);
         });
         await this.sendTelegramReply(request, {
            format: 'html',
            content: `Thanks, ${request.greetName}.
            Your identity as is now verified to <b>${this.config.serviceLabel}</b>
            as <code>telegram.me/${request.username}.</code>
            `
         });
      } else {
         const duration = now - parseInt(verified);
         await this.sendTelegramReply(request, {
            format: 'html',
            content: `Hi ${request.greetName}.
            Your identity as was already verified to <b>${this.config.serviceLabel}</b>
            ${Millis.formatDuration(duration)} ago as <code>@${request.username}</code>
            `
         });
      }
   }

   async handleTelegramGrant(request) {
      const now = new Date().getTime();
      this.logger.info('handleTelegramGrant', request);
      const userKey = this.adminKey('telegram', 'user', request.username);
      let [ismember, verified, secret] = await this.redis.multiExecAsync(multi => {
         multi.sismember(this.adminKey('telegram:verified:users'), request.username);
         multi.hget(userKey, 'verified');
         multi.hget(userKey, 'secret');
      });
      throw {message: 'Not implemented'};
   }

   async sendTelegramReply(request, response) {
      this.logger.info('sendTelegramReply', response);
      try {
         assert(request.fromId, 'fromId');
         const content = lodash.trim(response.content.replace(/\s\s+/g, ' '));
         let uri = `sendMessage?chat_id=${request.fromId}`;
         uri += '&disable_notification=true';
         if (response.format === 'markdown') {
            uri += `&parse_mode=Markdown`;
         } else if (response.format === 'html') {
            uri += `&parse_mode=HTML`;
         }
         uri += `&text=${encodeURIComponent(content)}`;
         const url = [this.config.botUrl, uri].join('/');
         this.logger.info('sendTelegramReply url', url);
         await Requests.head({url});
      } catch (err) {
         this.logger.error(err);
      }
   }

   addRoutes() {
      this.addPublicCommand({
         key: 'routes',
         access: 'debug',
         aliases: ['/'],
         sendResult: async (req, res, reqx, result) => {
            if (this.isCliDomain(req)) {
               return result;
            } else {
               res.set('Content-Type', 'text/html');
               res.send(new Page().render(new Help().render({
                  req, result, config: this.config
               })));
            }
         }
      }, async (req, res, reqx) => {
         const routes = Express.getRoutes(this.expressApp)
         .filter(route => !['/', '/routes', '/webhook-telegram/*', '/help'].includes(route));
         const accountOnlyRoutes = routes
         .filter(route => route.includes(':account') && !route.includes(':keyspace'));
         return {
            common: routes
            .filter(route => route && !route.includes(':') && !['/epoch'].includes(route))
            .map(route => `${this.config.hostUrl}${route}`)
            ,
            misc: routes
            .filter(route => route.includes(':') && !route.includes('telegram') && !/\:(keyspace|account)/.test(route))
            .map(route => `${route}`)
            ,
            telegram: routes
            .filter(route => route.includes('telegram'))
            .map(route => `${route}`)
            ,
            account: accountOnlyRoutes.map(route => `${route}`)
            ,
            accountKeyspace: routes
            .filter(route => route.includes(':account') && route.includes(':keyspace'))
            .map(route => `${route}`)
         };
      });
      this.addPublicCommand({
         key: 'about',
         access: 'redirect',
      }, async (req, res) => {
         if (this.config.aboutUrl) {
            res.redirect(302, this.config.aboutUrl);
         }
      });
      this.expressApp.get('', async (req, res) => {
         res.redirect(302, '/routes');
      });
      this.addPublicRoute('help', async (req, res) => {
         if (this.isBrowser(req)) {
            if (this.config.helpUrl) {
               res.redirect(302, this.config.helpUrl);
            } else if (false) {
               let content = await Files.readFile('README.md');
               if (false) {
                  brucedown('README.md', (err, htmlResult) => {
                     this.logger.debug('brucedown', htmlResult);
                  });
               } else {
                  content = new Page().render({
                     req,
                     title: this.config.serviceLabel,
                     content: marked(content.toString())
                  });
                  res.set('Content-Type', 'text/html');
                  res.send(content);
               }
            }
         } else if (this.isCliDomain(req)) {
            return this.listCommands();
         } else {
            return this.listCommands();
         }
      });
      if (this.config.allowInfo) {
         this.addPublicRoute('info', async (req, res) => {
            res.set('Content-Type', 'text/plain');
            res.send(await this.redis.infoAsync());
         });
      }
      if (this.config.allowKeyspaces) {
         this.addPublicRoute('keyspaces', () => this.redis.smembersAsync(this.adminKey('keyspaces')));
      }
      this.addPublicRoute('epoch', async () => {
         const time = await this.redis.timeAsync();
         return time[0];
      });
      this.addPublicRoute('time/seconds', async () => {
         const time = await this.redis.timeAsync();
         return time[0];
      });
      this.addPublicRoute('time/milliseconds', async () => {
         const time = await this.redis.timeAsync();
         return Math.ceil(time[0] * 1000 + time[1]/1000);
      });
      this.addPublicRoute('time/nanoseconds', async () => {
         const time = await this.redis.timeAsync();
         return Math.ceil(time[0] * 1000 * 1000 + parseInt(time[1]));
      });
      this.addPublicRoute('time', () => this.redis.timeAsync());
      this.addPublicCommand({
         key: 'genkey-otp',
         params: ['user', 'host']
      }, async (req, res) => {
         const {user, host} = req.params;
         this.logger.debug('genkey-otp', user, host);
         return this.buildQrReply({user, host});
      });
      this.addPublicCommand({
         key: 'genkey-ga',
         params: ['address', 'issuer']
      }, async (req, res) => {
         const {address, issuer} = req.params;
         this.logger.debug('genkey-ga', address, issuer);
         return this.buildQrReply({account: address, issuer});
      });
      if (!this.config.secureDomain) {
         this.logger.warn('insecure mode');
      } else {
         this.addPublicCommand({
            key: 'gentoken',
            params: ['account']
         }, async (req, res) => {
            const {account} = req.params;
            const accountKey = this.adminKey('account', account);
            const [[time], registered, admined, accessed, certs] = await this.redis.multiExecAsync(multi => {
               multi.time();
               multi.hget(accountKey, 'registered');
               multi.hget(accountKey, 'admined');
               multi.hget(accountKey, 'accessed');
               multi.smembers(this.adminKey('account', account, 'certs'));
            });
            const duration = time - admined;
            if (duration < this.config.adminLimit) {
               return `Admin command interval not elapsed: ${this.config.adminLimit}s`;
            }
            this.logger.debug('gentoken', accountKey);
            const errorMessage = this.validateCert(req, certs, account);
            if (errorMessage) {
               return errorMessage;
            }
            const token = this.generateTokenKey(6);
            await this.redis.setexAsync([accountKey, token].join(':'), this.config.keyExpire, token);
            return token;
         });
         this.addSecureDomain();
      }
      this.addPublicCommand({
         key: 'verify-user-telegram',
         params: ['user']
      }, async (req, res) => {
         const {user} = req.params;
         const userKey = this.adminKey('telegram', 'user', user);
         let [[now], sismember, verified, secret] = await this.redis.multiExecAsync(multi => {
            multi.time();
            multi.sismember(this.adminKey('telegram:verified:users'), user);
            multi.hget(userKey, 'verified');
            multi.hget(userKey, 'secret');
         });
         if (sismember) {
            if (verified) {
               const duration = parseInt(now) - parseInt(verified);
               return `OK: ${user}@telegram.me, verified ${Millis.formatDuration(duration)} ago`;
            } else {
               return `OK: ${user}@telegram.me`;
            }
         } else {
            return `Telegram user not yet verified: ${user}. Please Telegram '@redishub_bot /verify' e.g. via https://web.telegram.org`;
         }
      });
      this.addRegisterRoutes();
      this.addKeyspaceCommand({
         key: 'help',
         access: 'debug',
         resultObjectType: 'KeyedArrays',
         sendResult: async (req, res, reqx, result) => {
            if (true) {
               res.set('Content-Type', 'text/html');
               res.send(new Page().render(new KeyspaceHelp().render({
                  req, reqx, result, config: this.config
               })));
            } else if (!this.isMobile(req)) {
               res.set('Content-Type', 'text/html');
               res.send(ReactDOMServer.renderToString(<KeyspaceHelpPage reqx={reqx} result={result}/>));
            } else {
               return result;
            }
         }
      }, async (req, res, reqx) => {
         const {account, keyspace} = req.params;
         this.logger.ndebug('help', req.params, this.commands.map(command => command.key).join('/'));
         const message = `Usage: e.g. sadd/myset/myvalue, smembers/myset etc as follows:`;
         const exampleUrls = [
            `${this.config.hostUrl}/ak/${account}/${keyspace}/set/mykey/myvalue`,
            `${this.config.hostUrl}/ak/${account}/${keyspace}/get/mykey`,
            `${this.config.hostUrl}/ak/${account}/${keyspace}/sadd/myset/myvalue`,
            `${this.config.hostUrl}/ak/${account}/${keyspace}/smembers/myset`,
            `${this.config.hostUrl}/ak/${account}/${keyspace}/lpush/mylist/myvalue`,
            `${this.config.hostUrl}/ak/${account}/${keyspace}/lrange/mylist/0/-1`,
            `${this.config.hostUrl}/ak/${account}/${keyspace}/ttls`,
         ];
         return {message, exampleUrls, keyspaceCommands: this.listCommands('keyspace')};
      });
      this.addKeyspaceCommand({
         key: 'register-keyspace',
         access: 'admin'
      }, async (req, res, {time, account, keyspace, accountKey}, multi) => {
         const replies = await this.redis.multiExecAsync(multi => {
            multi.hsetnx(accountKey, 'registered', time);
         });
         return replies;
      });
      this.addKeyspaceCommand({
         key: 'deregister-keyspace',
         access: 'admin'
      }, async (req, res, {account, keyspace, accountKey, keyspaceKey}, multi) => {
         const [keys] = await this.redis.multiExecAsync(multi => {
            multi.keys(this.keyspaceKey(account, keyspace, '*'));
         });
         const [keyspaces] = await this.redis.multiExecAsync(multi => {
            multi.smembers(this.accountKey(account, 'keyspaces'));
         });
         this.logger.info('deregister', keyspace, keys.length, keyspaces);
         const keyIndex = this.keyIndex(account, keyspace);
         const multiReply = await this.redis.multiExecAsync(multi => {
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
         const keys = await this.redis.keysAsync(this.keyspaceKey(account, keyspace, '*'));
         const keyIndex = this.keyIndex(account, keyspace);
         const multi = this.redis.multi();
         keys.forEach(key => multi.del(key));
         const multiReply = await multi.execAsync();
         return keys.map(key => key.substring(keyIndex));
      });
      this.addKeyspaceCommand({
         key: 'getconfig',
         access: 'debug'
      }, async (req, res, {accountKey}) => {
         return await this.redis.hgetallAsync(accountKey);
      });
      this.addKeyspaceCommand({
         key: 'keys',
         access: 'debug'
      }, async (req, res, {account, keyspace}) => {
         const keys = await this.redis.keysAsync(this.keyspaceKey(account, keyspace, '*'));
         const keyIndex = this.keyIndex(account, keyspace);
         return keys.map(key => key.substring(keyIndex));
      });
      this.addKeyspaceCommand({
         key: 'types',
         access: 'debug'
      }, async (req, res, {account, keyspace}) => {
         const keys = await this.redis.keysAsync(this.keyspaceKey(account, keyspace, '*'));
         this.logger.debug('ttl ak', account, keyspace, keys);
         const keyIndex = this.keyIndex(account, keyspace);
         const multi = this.redis.multi();
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
         return await this.redis.ttlAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'ttls',
         access: 'debug'
      }, async (req, res, {account, keyspace}) => {
         const keys = await this.redis.keysAsync(this.keyspaceKey(account, keyspace, '*'));
         this.logger.debug('ttl ak', account, keyspace, keys);
         const keyIndex = this.keyIndex(account, keyspace);
         const multi = this.redis.multi();
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
         this.logger.debug('type', keyspaceKey);
         return await this.redis.typeAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'set-encrypt',
         params: ['key', 'value'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         const {key, value} = req.params;
         let cert = req.get('ssl_client_cert');
         if (!cert) {
            throw {message: 'No client cert'};
         }
         cert = cert.replace(/\t/g, '\n');
         const encrypted = crypto.publicEncrypt(cert, new Buffer(value)).toString('base64');
         const reply = await this.redis.setAsync(keyspaceKey, encrypted);
         return {key, encrypted, reply};
      });
      this.addKeyspaceCommand({
         key: 'set',
         params: ['key', 'value'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.setAsync(keyspaceKey, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'setex',
         params: ['key', 'seconds', 'value'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         const {seconds, value} = req.params;
         return await this.redis.setexAsync(keyspaceKey, seconds, value);
      });
      this.addKeyspaceCommand({
         key: 'setnx',
         params: ['key', 'value'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.setnxAsync(keyspaceKey, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'get',
         params: ['key']
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.getAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'incr',
         params: ['key'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.incrAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'exists',
         params: ['key']
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.existsAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'del',
         params: ['key'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.delAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'sadd',
         params: ['key', 'member'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.saddAsync(keyspaceKey, req.params.member);
      });
      this.addKeyspaceCommand({
         key: 'srem',
         params: ['key', 'member'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.sremAsync(keyspaceKey, req.params.member);
      });
      this.addKeyspaceCommand({
         key: 'smove',
         params: ['key', 'dest', 'member'],
         access: 'set'
      }, async (req, res, {account, keyspace, keyspaceKey}, multi) => {
         const {dest, member} = req.params;
         const destKey = this.keyspaceKey(account, keyspace, dest);
         let result = await this.redis.smoveAsync(keyspaceKey, destKey, member);
         multi.expire(destKey, this.getKeyExpire(account));
         return result;
      });
      this.addKeyspaceCommand({
         key: 'spop',
         params: ['key'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.spopAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'smembers',
         params: ['key']
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.smembersAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'sismember',
         params: ['key', 'member']
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.sismemberAsync(keyspaceKey, req.params.member);
      });
      this.addKeyspaceCommand({
         key: 'scard',
         params: ['key']
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.scardAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'lpush',
         params: ['key', 'value'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.lpushAsync(keyspaceKey, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'lpushtrim',
         params: ['key', 'length', 'value'],
         access: 'set'
      }, async (req, res, {keyspaceKey}, multi) => {
         const {value, length} = req.params;
         multi.lpush(keyspaceKey, value);
         multi.trim(keyspaceKey, length);
      });
      this.addKeyspaceCommand({
         key: 'rpush',
         params: ['key', 'value'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.rpushAsync(keyspaceKey, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'lpop',
         params: ['key'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.lpopAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'blpop',
         params: ['key', 'timeout'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         const reply = await this.redis.blpopAsync(keyspaceKey, req.params.timeout);
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
         const reply = await this.redis.brpopAsync(keyspaceKey, req.params.timeout);
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
         return await this.redis.rpopAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'brpoplpush',
         params: ['key', 'dest', 'timeout'],
         access: 'set'
      }, async (req, res, {account, keyspace, keyspaceKey}, multi) => {
         const {dest, timeout} = req.params;
         const destKey = this.keyspaceKey(account, keyspace, dest);
         const result = await this.redis.brpoplpushAsync(keyspaceKey, destKey, timeout);
         multi.expire(destKey, this.getKeyExpire(account));
         return result;
      });
      this.addKeyspaceCommand({
         key: 'llen',
         params: ['key'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.llenAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'lindex',
         params: ['key', 'index']
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.lindexAsync(keyspaceKey, req.params.index);
      });
      this.addKeyspaceCommand({
         key: 'lrem',
         params: ['key', 'count', 'value'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.lremAsync(keyspaceKey, req.params.count, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'lset',
         params: ['key', 'index', 'value'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.lsetAsync(keyspaceKey, req.params.index, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'ltrim',
         params: ['key', 'start', 'stop'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.ltrimAsync(keyspaceKey, req.params.start, req.params.stop);
      });
      this.addKeyspaceCommand({
         key: 'lrange',
         params: ['key', 'start', 'stop'],
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.lrangeAsync(keyspaceKey, req.params.start, req.params.stop);
      });
      this.addKeyspaceCommand({
         key: 'hset',
         params: ['key', 'field', 'value'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.hsetAsync(keyspaceKey, req.params.field, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'hsetnx',
         params: ['key', 'field', 'value'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.hsetnxAsync(keyspaceKey, req.params.field, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'hget',
         params: ['key', 'field']
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.hgetAsync(keyspaceKey, req.params.field);
      });
      this.addKeyspaceCommand({
         key: 'hdel',
         params: ['key', 'field'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.hdelAsync(keyspaceKey, req.params.field);
      });
      this.addKeyspaceCommand({
         key: 'hincrby',
         params: ['key', 'field', 'increment'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.hincrbyAsync(keyspaceKey, req.params.field, req.params.increment);
      });
      this.addKeyspaceCommand({
         key: 'hexists',
         params: ['key', 'field']
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.hexistsAsync(keyspaceKey, req.params.field);
      });
      this.addKeyspaceCommand({
         key: 'hlen',
         params: ['key']
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.hlenAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'hkeys',
         params: ['key']
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.hkeysAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'hgetall',
         params: ['key']
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.hgetallAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'zcard',
         params: ['key']
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.zcardAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'zadd',
         params: ['key', 'score', 'member'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.zaddAsync(keyspaceKey, req.params.score, req.params.member);
      });
      this.addKeyspaceCommand({
         key: 'zrem',
         params: ['key', 'member'],
         access: 'set'
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.zremAsync(keyspaceKey, req.params.member);
      });
      this.addKeyspaceCommand({
         key: 'zrange',
         params: ['key', 'start', 'stop']
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.zrangeAsync(keyspaceKey, req.params.start, req.params.stop);
      });
      this.addKeyspaceCommand({
         key: 'zrevrange',
         params: ['key', 'start', 'stop']
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.zrevrangeAsync(keyspaceKey, req.params.start, req.params.stop);
      });
   }

   listCommands(context) {
      return this.commands.filter(command => command.access !== 'redirect')
      .filter(command => !context || command.context === context)
      .map(command => [command.key, ...command.params].join(' '));
   }

   formatCommandUri(command) {
      if (command.params.length) {
         return [command.key, ... command.params.map(param => ':' + param)].join('/');
      } else {
         return command.key;
      }
   }

   addPublicCommand(command, fn) {
      let uri = command.key;
      if (command.params) {
         uri = [command.key, ... command.params.map(param => ':' + param)].join('/');
      }
      this.expressApp.get([this.config.location, uri].join('/'), async (req, res) => {
         try {
            const match = req.path.match(/\/:([^\/]+)/);
            if (match) {
               throw {message: 'Invalid path: leading colon. Try substituting parameter: ' + match.pop()};
            }
            const result = await fn(req, res);
            if (command.access === 'redirect') {
            } else {
               await this.sendResult(command, req, res, {}, result);
            }
         } catch (err) {
            this.sendError(req, res, err);
         }
      });
      this.commands.push(command);
   }

   addPublicRoute(uri, fn) {
      this.expressApp.get([this.config.location, uri].join('/'), async (req, res) => {
         try {
            const result = await fn(req, res);
            if (result !== undefined) {
               await this.sendResult({}, req, res, {}, result);
            }
         } catch (err) {
            this.sendError(req, res, err);
         }
      });
   }

   addRegisterRoutes() {
      this.expressApp.get(this.config.location + '/register-expire', (req, res) => this.registerExpire(req, res));
      if (this.config.secureDomain) {
         this.expressApp.get(this.config.location + '/register-account-telegram/:account', (req, res) => this.registerAccount(req, res));
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
         this.logger.info('registerAccount dn', dn);
         if (!clientCert) {
            return 'No client cert';
         }
         const clientCertDigest = this.digestPem(clientCert);
         const otpSecret = this.generateTokenKey();
         const accountKey = this.adminKey('account', account);
         const [hsetnx, saddAccount, saddCert] = await this.redis.multiExecAsync(multi => {
            multi.hsetnx(accountKey, 'registered', new Date().getTime());
            multi.sadd(this.adminKey('accounts'), account);
            multi.sadd(this.adminKey('account', account, 'topt'), otpSecret);
            multi.sadd(this.adminKey('account', account, 'certs'), clientCertDigest);
         });
         if (!hsetnx) {
            throw {message: 'Account exists'};
         }
         if (!saddAccount) {
            this.logger.error('sadd account');
         }
         if (!saddCert) {
            this.logger.error('sadd cert');
         }
         const result = this.buildQrReply({
            otpSecret,
            user: account,
            host: this.config.hostname,
            label: this.config.serviceLabel
         });
         await this.sendResult({}, req, res, {}, result);
      } catch (err) {
         this.sendError(req, res, err);
      }
   }

   generateTokenKey(length = 16) {
      const Base32Symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
      return lodash.reduce(crypto.randomBytes(length), (result, value) => {
         return result + Base32Symbols[Math.floor(value * Base32Symbols.length / 256)];
      }, '');
   }

   formatTokenKey(tokenKey) {
      return tokenKey.match(/.{1,4}/g).join(' ');
   }

   generateTokenCode(otpSecret, time) { // TODO test generating a TOTP token from secret
      try {
         time = Math.floor((time || (new Date().getTime())/1000)/30);
         this.logger.info('base32', Object.keys(base32));
         this.logger.info('speakeasy', Object.keys(speakeasy.totp));
         this.logger.debug('otplib generateSecret', otp.utils.generateSecret());
         this.logger.debug('otplib', otp.topt.generate(base32.decode(otpSecret), time));
      } catch (err) {
         this.logger.error('generateTokenCode', err);
      }
   }

   buildQrReply(options) {
      let {label, account, user, host, otpSecret, issuer} = options;
      if (!otpSecret) {
         otpSecret = this.generateTokenKey();
      }
      //this.logger.debug('code', this.generateTokenCode(otpSecret));
      if (!issuer) {
         issuer = label || host;
      }
      if (!account && user && host) {
         account = `${user}@${host}`;
      }
      if (!account || !issuer) {
         throw {message: 'Invalid'};
      }
      const uri = `${account}?secret=${otpSecret}&issuer=${issuer}`;
      const otpauth = 'otpauth://totp/' + encodeURIComponent(uri);
      const googleChartUrl = 'http://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=' + otpauth;
      return {otpSecret, uri, otpauth, googleChartUrl};
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
         if (this.registerCount > this.config.registerLimit) {
            this.logger.error('registerCount');
            return `Global register rate exceeed: ${this.config.registerLimit} per second`;
         }
      }
      this.registerTime = time;
   }

   async registerExpire(req, res, previousError) {
      if (previousError) {
         this.logger.warn('registerExpire retry');
      }
      try {
         this.logger.debug('registerExpire');
         let errorMessage = this.validateRegisterTime();
         if (errorMessage) {
            this.sendError(req, res, {message: errorMessage});
            return;
         }
         const account = '@' + this.generateTokenKey().substring(0, 6).toLowerCase();
         const keyspace = this.generateTokenKey().substring(0, 6).toLowerCase();
         let clientIp = req.get('x-forwarded-for');
         const accountKey = this.accountKeyspace(account, keyspace);
         this.logger.debug('registerExpire clientIp', clientIp, account, keyspace, accountKey);
         const replies = await this.redis.multiExecAsync(multi => {
            multi.hsetnx(accountKey, 'registered', new Date().getTime());
            multi.expire(accountKey, this.config.ephemeralAccountExpire);
            if (clientIp) {
               multi.hsetnx(accountKey, 'clientIp', clientIp);
               if (this.config.addClientIp) {
                  multi.sadd(this.adminKey('keyspaces:expire:ips'), clientIp);
               }
            }
            this.count(multi, 'keyspaces:expire');
         });
         if (!replies[0]) {
            this.logger.error('keyspace clash', account, keyspace);
            if (!previousError) {
               return this.registerExpire(req, res, {message: 'keyspace clash'});
            }
            throw {message: 'Expire keyspace clash'};
         }
         const replyPath = ['ak', account, keyspace].join('/');
         this.logger.debug('registerExpire', keyspace, clientIp, replyPath);
         if (this.isBrowser(req)) {
            if (true) {
               res.redirect(302, [replyPath, 'help'].join('/'));
            } else {
               res.send(replyPath);
            }
         } else {
            await this.sendResult({}, req, res, {}, replyPath);
         }
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
         if (this.importCount > this.config.importLimit) {
            this.logger.error('importCount');
            return `Global import rate exceeed: ${this.config.importLimit} per second`;
         }
      }
      this.importTime = time;
   }

   addKeyspaceCommand(command, fn) {
      assert(command.key, 'command.key');
      command.context = 'keyspace';
      let uri = 'ak/:account/:keyspace';
      command.params = command.params || [];
      const key = command.key + command.params.length;
      this.logger.debug('addKeyspaceCommand', command.key, key, uri);
      this.commands.push(command);
      const handler = this.createKeyspaceHandler(command, fn);
      if (command.key === this.config.indexCommand) {
         this.expressApp.get([this.config.location, uri].join('/'), handler);
      }
      uri += '/' + command.key;
      if (command.params.length) {
         assert(command.key !== this.config.indexCommand, 'indexCommand');
         uri += '/' + command.params.map(param => ':' + param).join('/');
      }
      this.expressApp.get([this.config.location, uri].join('/'), handler);
      this.logger.debug('add', command.key, uri);
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
            v = this.validateAccount(account);
            if (v) {
               this.sendStatusMessage(req, res, 400, 'Invalid account: ' + v);
               return;
            }
            v = this.validateKeyspace(keyspace);
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
            const [[time], registered, admined, accessed, certs] = await this.redis.multiExecAsync(multi => {
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
            if (req.hostname === this.config.hostname) {
            } else if (lodash.endsWith(req.hostname, this.config.keyspaceHostname)) {
               hostname = req.hostname.replace(/\..*$/, '');
               let hostHashes = await this.redis.hgetallAsync(this.adminKey('host', hostname));
               if (!hostHashes) {
                  throw new ValidationError(`Invalid hostname: ${hostname}`);
               }
               this.logger.debug('hostHashes', hostHashes);
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
            const multi = this.redis.multi();
            const reqx = {time, account, keyspace, accountKey};
            if (key) {
               reqx.keyspaceKey = this.keyspaceKey(account, keyspace, key);
            }
            await this.sendResult(command, req, res, reqx, await fn(req, res, reqx, multi));
            multi.sadd(this.adminKey('keyspaces'), keyspace);
            multi.hset(accountKey, 'accessed', time);
            if (command && command.access === 'admin') {
               multi.hset(accountKey, 'admined', time);
            }
            if (key) {
               assert(reqx.keyspaceKey);
               multi.expire(reqx.keyspaceKey, this.getKeyExpire(account));
            }
            if (account[0] === '@') {
               multi.expire(accountKey, this.config.ephemeralAccountExpire);
            }
            await multi.execAsync();
         } catch (err) {
            this.sendError(req, res, err);
         }
      };
   }

   getKeyExpire(account) {
      if (account[0] === '@') {
         return this.config.ephemeralKeyExpire;
      } else {
         return this.config.keyExpire;
      }
   }

   async migrateKeyspace({account, keyspace}) {
      const accountKey = this.accountKeyspace(account, keyspace);
      const [accessToken, token] = await this.redis.multiExecAsync(multi => {
         multi.hget(accountKey, 'accessToken');
         multi.hget(accountKey, 'token');
      });
      if (!token && accessToken) {
         const [hsetnx, hdel] = await this.redis.multiExecAsync(multi => {
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
      if (lodash.isEmpty(account)) {
         return 'Invalid account (empty)';
      } else if (account[0] === '@') {
         return 'Invalid account (leading @ symbol reserved for ephemeral keyspaces)';
      } else if (!/^[\-_a-z0-9]+$/.test(account)) {
         return 'Account name is invalid. Try only lowercase/numeric with dash/underscore.';
      }
   }

   validateRegisterKeyspace(keyspace) {
      if (/~/.test(keyspace)) {
         return 'contains tilde';
      }
   }

   validateAccount(account) {
      if (/^:/.test(account)) {
         return 'leading colon';
      }
   }

   validateKeyspace(keyspace) {
      if (/^:/.test(keyspace)) {
         return 'leading colon';
      }
      if (/::/.test(keyspace)) {
         return 'double colon';
      }
      if (/:$/.test(keyspace)) {
         return 'trailing colon';
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
      this.logger.debug('validateAccess scheme', scheme, account, keyspace, command);
      if (this.isSecureDomain(req)) {
         if (scheme === 'http') {
            return `Insecure scheme ${scheme}: ${req.hostname}`;
         }
      }
      if (command.access) {
         if (command.access === 'admin') {
            if (!admined) {
               this.logger.warn('validateAccess admined', keyspace, command.key, time);
            } else {
               const duration = time - admined;
               if (duration < this.config.adminLimit) {
                  return `Admin command interval not elapsed: ${this.config.adminLimit}s`;
               }
            }
         } else if (command.access === 'debug') {
         } else if (command.access === 'set') {
         } else if (command.access === 'get') {
         } else {
         }
      }
      const isSecureAccount = !/^@/.test(account);
      if (this.isSecureDomain(req) && account[0] !== '@') {
         const errorMessage = this.validateCert(req, certs, account);
         if (errorMessage) {
            return errorMessage;
         }
      } else if (command.key === 'register-keyspace') {
      } else if (!registered) {
         if (account[0] === '@') {
            return {message: 'Expired (or unregistered) keyspace', hintUri: 'register-expire'};
         } else {
            return {message: 'Unregistered keyspace', hintUri: 'register-expire'};
         }
      } else if (isSecureAccount) {
         this.logger.error('validateAccess', account, keyspace);
         return 'Invalid access';
      }
   }

   validateCert(req, certs, account) {
      if (this.config.disableValidateCert) {
         return null;
      }
      if (!certs) {
         return 'No enrolled certs';
      }
      const clientCert = req.get('ssl_client_cert');
      if (!clientCert) {
         return 'No client cert';
      }
      const clientCertDigest = this.digestPem(clientCert);
      this.logger.info('validateCert', clientCertDigest, account);
      if (!certs.includes(clientCertDigest)) {
         return 'Invalid cert';
      }
      return null;
   }

   keyIndex(account, keyspace) {
      return [this.config.redisKeyspace, account, keyspace].reduce((previousValue, currentValue) => {
         return previousValue + currentValue.length
      }, 3);
   }

   accountKey(account) {
      return this.adminKey('account', account);
   }

   accountKeyspace(account, keyspace) {
      return [this.config.redisKeyspace, 'ak', account, keyspace].join(':');
   }

   keyspaceKey(account, keyspace, key) {
      return [this.config.redisKeyspace, account, keyspace, key].join('~');
   }

   adminKey(...parts) {
      return [this.config.redisKeyspace, ...parts].join(':');
   }

   async sendResult(command, req, res, reqx, result) {
      const userAgent = req.get('User-Agent');
      this.logger.debug('sendResult ua', userAgent);
      command = command || {};
      if (this.isDebugReq(req)) {
         this.logger.ndebug('sendResult', command.command, req.params, req.query, result);
      }
      const mobile = this.isMobile(req);
      if (command.sendResult) {
         if (lodash.isFunction(command.sendResult)) {
            const otherResult = await command.sendResult(req, res, reqx, result);
            if (otherResult === undefined) {
               return;
            } else {
               result = otherResult;
            }
         } else {
            throw 'command.sendResult type: ' + typeof command.sendResult;
         }
      }
      let resultString = '';
      if (!Values.isDefined(result)) {
      } else if (Values.isDefined(req.query.quiet)) {
      } else if (this.config.defaultFormat === 'cli' || Values.isDefined(req.query.line)
      || this.isCliDomain(req) || command.format === 'cli') {
         res.set('Content-Type', 'text/plain');
         if (lodash.isArray(result)) {
            if (mobile) {
            } else {
               resultString = result.join('\n');
            }
         } else if (lodash.isObject(result)) {
            if (command.resultObjectType === 'KeyedArrays') {
               resultString = lodash.flatten(Object.keys(result).map(key => {
                  let value = result[key];
                  if (lodash.isArray(value)) {
                     return ['', key + ':', ...value];
                  } else if (typeof value === 'string') {
                     if (key === 'message') {
                        return value;
                     } else {
                        return key + ': ' + value;
                     }
                  } else {
                     return ['', key + ':', 'type:' + typeof value];
                  }
               })).join('\n');
            } else {
               resultString = Object.keys(result).map(key => {
                  let value = result[key];
                  if (parseInt(value) === value) {
                     value = parseInt(value);
                  } else {
                     value = `'${value}'`;
                  }
                  return [key, value].join('=');
               }).join('\n');
            }
         } else if (result === null) {
         } else {
            resultString = result.toString();
         }
      } else if (this.config.defaultFormat === 'plain' || Values.isDefined(req.query.plain)
      || command.format === 'plain') {
         res.set('Content-Type', 'text/plain');
         resultString = result.toString();
      } else if (this.config.defaultFormat === 'html' || Values.isDefined(req.query.html)
      || command.format === 'html' || this.isHtmlDomain(req)) {
         res.set('Content-Type', 'text/html');
         resultString = result.toString();
      } else if (this.config.defaultFormat !== 'json') {
         this.sendError(req, res, {message: `Invalid default format: ${this.config.defaultFormat}`});
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
      if (this.config.secureDomain) {
         return true;
      }
      if (/^(secure|cli)\./.test(req.hostname)) {
         this.logger.warn('isSecureDomain', req.hostname);
         return true;
      }
      return false;
   }

   isMobile(req) {
      return /Mobile/.test(req.get('User-Agent'));
   }

   isBrowser(req) {
      return !/^curl\//.test(req.get('User-Agent'));
   }

   isHtmlDomain(req) {
      return /^web/.test(req.hostname);
   }

   isJsonDomain(req) {
      return /^json/.test(req.hostname);
   }

   isCliDomain(req) {
      return /^cli/.test(req.hostname) || !this.isBrowser(req);
   }

   sendError(req, res, err) {
      this.logger.warn(err);
      this.sendStatusMessage(req, res, 500, err);
   }

   sendStatusMessage(req, res, statusCode, err) {
      let messageLines = [];
      if (!err) {
         this.logger.error('sendStatusMessage empty');
         err = 'empty error message';
      }
      let title = req.path;
      if (lodash.isString(err)) {
         title = err;
      } else if (lodash.isArray(err)) {
         messageLines = messageLines.concat(err);
      } else if (err.message) {
         if (err.message) {
            title = err.message;
         }
         if (err.hintUri) {
            let url;
            if (this.isBrowser(req)) {
               url = `/${err.hintUri}`;
            } else if (/localhost/.test(req.hostname)) {
               url = `http://localhost:8765/${err.hintUri}`;
            } else {
               url = `https://${req.hostname}/${err.hintUri}`;
            }
            if (this.isBrowser(req)) {
               url = `Try <a href="${url}">${url}</a>`;
            }
            messageLines.push(url);
         }
         if (err.stack) {
            messageLines = messageLines.concat(err.stack.split('\n').slice(0, 5));
         }
      } else {
         this.logger.error('sendStatusMessage type', typeof err, err);
         err = 'unexpected error type: ' + typeof err;
         messageLines.push(err);
      }
      if (this.isBrowser(req)) {
         res.set('Content-Type', 'text/html');
         res.status(statusCode).send(new Page().render({
            req,
            title,
            content: `
            <h2>Status ${statusCode}: ${title}</h2>
            <pre>
            ${messageLines.join('\n')}
            </pre>
            `
         }));
      } else {
         res.status(statusCode).send(messageLines.join('\n') + '\n');
      }
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
      this.logger.info('end');
      if (redis) {
         await this.redis.quitAsync();
      }
      if (this.expressServer) {
         this.expressServer.close();
      }
   }
}
