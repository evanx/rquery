
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

import {default as renderPage} from './html/Page';
import {default as renderHelp} from './html/Help';
import * as KeyspaceHelp from './html/KeyspaceHelp';

import KeyspaceHelpPage from './jsx/KeyspaceHelpPage';

import styles from './html/styles';

const unsupportedAuth = ['twitter.com', 'github.com', 'gitlab.com', 'bitbucket.org'];
const supportedAuth = ['telegram.org'];

export default class {

   async testExit() {
      return false;
   }

   async init() {
      this.commandMap = new Map();
      this.logger.info('init');
      if (await this.testExit()) process.exit(1);
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
         const [matching, account, keyspace] = req.path.match(/^\/ak\/([^\/]+)\/([^\/]+)\//) || [];
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
                  throw {message: 'Invalid telegram webhook'};
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
               content: `
               /verify - verify your Telegram identity to RedisHub
               /grant-cert <CN> - grant account access to a certificate
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
            content: [`Thanks, ${request.greetName}.`,
               `Your identity as is now verified to <b>${this.config.serviceLabel}</b>`,
               `as <code>telegram.me/${request.username}.</code>`
            ].join(' ')
         });
      } else {
         const duration = now - parseInt(verified);
         await this.sendTelegramReply(request, {
            format: 'html',
            content: [`Hi ${request.greetName}.`,
               `Your identity as was already verified to <i>${this.config.serviceLabel}</i>`,
               `${Millis.formatVerboseDuration(duration)} ago as <code>@${request.username}</code>`
            ].join(' ')
         });
      }
   }

   async handleTelegramGrant(request) {
      const now = new Date().getTime();
      this.logger.info('handleTelegramGrant', request);
      const match = request.text.match(/\/grant-cert (\w+)$/);
      if (!match) {
         await this.sendTelegramReplyText(request,
            `Sorry, invalid. Try <code>/grant-cert &lt;hash tail8&gt;</code>,`,
            `where <code>hash tail</code> is the last 12 digits of <code>cert.pem</code> hash,`,
            `e.g. see github.com/evanx/redishub/docs/cert-tail.md`
         );
         return;
      }
      const cert = match[1];
      const userKey = this.adminKey('telegram', 'user', request.username);
      const grantKey = this.adminKey('telegram', 'user', request.username, 'grant');
      this.logger.info('handleTelegramGrant', userKey, grantKey, request, cert);
      let [ismember, verified, secret, exists] = await this.redis.multiExecAsync(multi => {
         multi.sismember(this.adminKey('telegram:verified:users'), request.username);
         multi.hget(userKey, 'verified');
         multi.hget(userKey, 'secret');
         multi.exists(grantKey);
      });
      let [setex] = await this.redis.multiExecAsync(multi => {
         this.logger.info('handleTelegramGrant setex', grantKey, cert, this.config.enrollExpire);
         multi.setex(grantKey, cert, this.config.enrollExpire);
      });
      if (setex) {
         await this.sendTelegramReplyText(request,
            `You have approved enrollment of cert PEM ending with <b>${cert}</b>,`,
            `so that identity can now enroll via ${this.config.hostUrl}/register-cert.`,
            `This must be done in the next ${Millis.formatVerboseDuration(1000*this.config.enrollExpire)}`,
            `otherwise you need to repeat this request.`
         );
      } else {
         await this.sendTelegramReplyText(request,
            `Apologies, the 'setex' command reply was <tt>${setex}</tt>`,
         );
      }
   }

   async sendTelegramReplyText(request, ...text) {
      await this.sendTelegramReply(request, {
         format: 'html',
         content: [`Thanks, ${request.greetName}.`, ...text].join(' ')
      });
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
         resultObjectType: 'KeyedArrays',
         sendResult: async (req, res, reqx, result) => {
            if (this.isCliDomain(req)) {
               return result;
            } else {
               res.set('Content-Type', 'text/html');
               res.send(renderPage(renderHelp({
                  config: this.config, req, result
               })));
            }
         }
      }, async (req, res, reqx) => {
         let hostUrl = this.config.hostUrl;
         if (this.config.hostname != 'localhost') {
            hostUrl = 'https://' + req.hostname;
         }
         const routes = Express.getRoutes(this.expressApp)
         .filter(route => !['/', '/routes', '/webhook-telegram/*', '/help', '/about'].includes(route));
         const accountOnlyRoutes = routes
         .filter(route => route.includes(':account') && !route.includes(':keyspace'));
         return {
            common: routes
            .filter(route => route && !route.includes(':') && !['/epoch', '/register-cert'].includes(route))
            .map(route => `${hostUrl}${route}`)
            ,
            misc: routes
            .filter(route => route.includes(':') && !route.includes('telegram') && !/\:(account|access)/.test(route))
            .map(route => `${route}`)
            ,
            ephemeral: routes
            .filter(route => route.includes('-ephemeral') && route !== '/register-ephemeral')
            .map(route => `${route}`)
            ,
            telegram: routes
            .filter(route => route.includes('telegram'))
            .map(route => `${route}`)
            ,
            account: accountOnlyRoutes.map(route => `${route}`)
            ,
            accountKeyspace: routes
            .filter(route => route.includes(':account') && route.includes(':keyspace/'))
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
                  content = renderPage({
                     config: this.config,
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
         params: ['user', 'host'],
         format: 'json'
      }, async (req, res) => {
         const {user, host} = req.params;
         this.logger.debug('genkey-otp', user, host);
         return this.buildQrReply({user, host});
      });
      this.addPublicCommand({
         key: 'genkey-ga',
         params: ['address', 'issuer'],
         format: 'json'
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
         }, async (req, res, reqx) => {
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
            this.validateCert(req, certs, account);
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
               return `OK: ${user}@telegram.me, verified ${Millis.formatVerboseDuration(duration)} ago`;
            } else {
               return `OK: ${user}@telegram.me`;
            }
         } else {
            return `Telegram user not yet verified: ${user}. Please Telegram '@redishub_bot /verify' e.g. via https://web.telegram.org`;
         }
      });
      this.addRegisterRoutes();
      this.addAccountRoutes();
      this.addKeyspaceCommand({
         key: 'help',
         access: 'debug',
         resultObjectType: 'KeyedArrays',
         sendResult: async (req, res, reqx, result) => {
            if (true) {
               res.set('Content-Type', 'text/html');
               res.send(renderPage(KeyspaceHelp.render({
                  config: this.config, commandMap: this.commandMap,
                  req, reqx, result
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
         let hostUrl = this.config.hostUrl;
         if (this.config.hostname !== 'localhost') {
            hostUrl = `https://${req.hostname}`;
         }
         this.logger.ndebug('help', req.params, this.commands.map(command => command.key).join('/'));
         const message = `Try sample endpoints below on this keyspace.`;
         const commandReferenceMessage = `Read the Redis.io docs for the following commands`;
         const customCommandHeading = `Custom commands`;
         const description = [`You can set, add and view keys, sets, lists, zsets, hashes etc.`,
            `<i>Also edit the URL in the location bar to try other combinations.</i>`
         ];
         const exampleParams = [
            ['ttls'],
            ['types'],
            ['set', 'mykey1/myvalue'],
            ['get', 'mykey1'],
            ['sadd', 'myset1/myvalue'],
            ['smembers', 'myset1'],
            ['lpush', 'mylist1/myvalue1'],
            ['lpushx', 'mylist1/myvalue2'],
            ['rpop', 'mylist1'],
            ['lrange', 'mylist1/0/10'],
            ['lrevrange', 'mylist1/0/10'],
            ['lrange', 'mylist1/-10/-1'],
            ['hset', 'myhashes1/field1/value1'],
            ['hsetnx', 'myhashes1/field2/value2'],
            ['hgetall', 'myhashes1'],
            ['zadd', 'myzset1/10/member10'],
            ['zadd', 'myzset1/20/member20'],
            ['zrange', 'myzset1/0/-1'],
            ['zrevrange', 'myzset1/0/-1'],
         ];
         const customExampleParams = [
            ['set-json-query', 'myobject1?name=myname&id=12346'],
            ['get-json', 'myobject1'],
         ];
         const exampleUrls = exampleParams.map(params => {
            const key = params.shift();
            let url = `${hostUrl}/ak/${account}/${keyspace}/${key}`;
            if (params) {
               url += '/' + params;
            }
            return url;
         })
         return {message, commandReferenceMessage, customCommandHeading, description, exampleUrls,
            commands: this.commands,
            keyspaceCommands: this.listCommands('keyspace')
         };
      });
      this.addKeyspaceCommand({
         key: 'register-keyspace',
         access: 'admin'
      }, async (req, res, reqx) => {
         const {time, account, keyspace, accountKey} = reqx;
         this.logger.debug('command', reqx);
         this.logger.debug('hsetnx', accountKey, time);
         const replies = await this.redis.multiExecAsync(multi => {
            multi.hsetnx(accountKey, 'registered', time);
         });
         return replies;
      });
      this.addKeyspaceCommand({
         key: 'deregister-keyspace',
         access: 'admin'
      }, async (req, res, {account, keyspace, accountKey, keyspaceKey}) => {
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
         key: 'show-keyspace-config',
         access: 'debug'
      }, async (req, res, reqx) => {
         reqx.hints = [
         ];
         return await this.redis.hgetallAsync(reqx.accountKey);
      });
      this.addKeyspaceCommand({
         key: 'keys',
         access: 'debug'
      }, async (req, res, reqx) => {
         const {account, keyspace} = reqx;
         reqx.hints = [
            {
               uri: ['ttls'],
            },
            {
               uri: ['types'],
            },
         ];
         const keys = await this.redis.keysAsync(this.keyspaceKey(account, keyspace, '*'));
         const keyIndex = this.keyIndex(account, keyspace);
         return keys.map(key => key.substring(keyIndex));
      });
      this.addKeyspaceCommand({
         key: 'types',
         access: 'debug',
         description: 'view all key types in this keyspace'
      }, async (req, res, reqx) => {
         reqx.hints = [
            {
               uri: ['ttls'],
            },
         ];
         const {account, keyspace} = reqx;
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
         key: 'ttls',
         access: 'debug',
         description: 'view all TTLs in this keyspace',

      }, async (req, res, reqx) => {
         reqx.hints = [
            {
               uri: ['types'],
            },
         ];
         const {account, keyspace} = reqx;
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
         key: 'ttl',
         params: ['key'],
         access: 'debug',
         description: 'check the key TTL'
      }, async (req, res, reqx) => {
         reqx.hints = [
            {
               uri: ['type', reqx.key],
            },
         ];
         return await this.redis.ttlAsync(reqx.keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'type',
         params: ['key'],
         access: 'debug',
         description: 'check the type of a key'
      }, async (req, res, reqx) => {
         reqx.hints = [
            {
               uri: ['ttl', reqx.key],
            },
         ];
         return await this.redis.typeAsync(reqx.keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'set-encrypt',
         params: ['key', 'value'],
         access: 'set',
         description: 'set the string value of a key, encrypting using client cert'
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
         access: 'set',
         description: 'set the string value of a key',
         relatedCommands: ['get', 'ttl', 'del'],
      }, async (req, res, reqx) => {
         return await this.redis.setAsync(reqx.keyspaceKey, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'set-json-object',
         description: 'set JSON via URL encoded object',
         params: ['key', 'value'],
         access: 'set',
         relatedCommands: ['get-json'],
      }, async (req, res, reqx) => {
         let string = req.params.value;
         if (/^\w/.test(req.params.value)) {
            string = ['{', req.params.value, '}'].join('');
            string = string.replace(/(\W)(\w+):/g, '$1"$2":');
         }
         return await this.redis.setAsync(reqx.keyspaceKey, string);
      });
      this.addKeyspaceCommand({
         key: 'set-json-query',
         params: ['key'],
         access: 'set',
         description: 'set JSON via URL query',
         relatedCommands: ['get-json']
      }, async (req, res, reqx) => {
         return await this.redis.setAsync(reqx.keyspaceKey, JSON.stringify(req.query));
      });
      this.addKeyspaceCommand({
         key: 'setex',
         params: ['key', 'seconds', 'value'],
         access: 'set',
         description: 'set the value and expiration of a key',
         relatedCommands: ['get', 'ttl'],
      }, async (req, res, reqx) => {
         const {seconds, value} = req.params;
         return await this.redis.setexAsync(reqx.keyspaceKey, seconds, value);
      });
      this.addKeyspaceCommand({
         key: 'setnx',
         params: ['key', 'value'],
         access: 'add',
         description: 'set the value of a key if it does not exist',
         relatedCommands: ['set', 'get', 'ttl'],
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.setnxAsync(keyspaceKey, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'get',
         params: ['key'],
         description: 'get the value you have set',
         relatedCommands: ['ttl'],
      }, async (req, res, reqx) => {
         return await this.redis.getAsync(reqx.keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'get-json',
         params: ['key'],
         description: 'get the JSON value you have set',
         relatedCommands: ['ttl'],
      }, async (req, res, reqx) => {
         const {key, keyspaceKey} = reqx;
         const value = await this.redis.getAsync(keyspaceKey);
         this.logger.info('get-json', typeof value, value);
         if (value) {
            if (true) {
               return JSON.parse(value);
            } else {
               res.json(JSON.parse(value));
            }
         } else if (false) {
            this.sendStatusMessage(req, res, 404, 'Not found: ' + key);
         } else {
            return JSON.parse(null);
         }
      });
      this.addKeyspaceCommand({
         key: 'incr',
         params: ['key'],
         access: 'add',
         description: 'increment the integer value of a key',
         relatedCommands: ['get', 'incrby'],
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.incrAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'incrby',
         params: ['key', 'increment'],
         access: 'add',
         description: 'increment the integer value of a key by the given amount',
         relatedCommands: ['get', 'incr'],
      }, async (req, res, reqx) => {
         return await this.redis.incrbyAsync(reqx.keyspaceKey, req.params.increment);
      });
      this.addKeyspaceCommand({
         key: 'exists',
         params: ['key'],
         description: 'check if a key exists in the keyspace',
         relatedCommands: ['get'],
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.existsAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'del',
         params: ['key'],
         access: 'set',
         description: 'delete a key from the keyspace',
         relatedCommands: ['get', 'ttl'],
      }, async (req, res, {keyspaceKey}) => {
         return await this.redis.delAsync(keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'sadd',
         params: ['key', 'member'],
         access: 'add',
         description: 'add a member to the list',
         relatedCommands: ['sismember', 'scard'],
      }, async (req, res, reqx) => {
         return await this.redis.saddAsync(reqx.keyspaceKey, req.params.member);
      });
      this.addKeyspaceCommand({
         key: 'srem',
         params: ['key', 'member'],
         access: 'set',
         description: 'remove an element from the set',
         relatedCommands: ['sadd'],
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
         access: 'set',
         description: 'remove and return a random member of the set',
         relatedCommands: ['sadd'],
      }, async (req, res, reqx) => {
         return await this.redis.spopAsync(reqx.keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'smembers',
         params: ['key'],
         description: 'get the members of your set',
         relatedCommands: ['scard'],
      }, async (req, res, reqx) => {
         return await this.redis.smembersAsync(reqx.keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'sismember',
         params: ['key', 'member'],
         description: 'check that the value /exists in your set',
         relatedCommands: ['smembers'],
      }, async (req, res, reqx) => {
         const reply = await this.redis.sismemberAsync(reqx.keyspaceKey, req.params.member);
         return reply;
      });
      this.addKeyspaceCommand({
         key: 'scard',
         params: ['key'],
         description: 'to get the cardinality of the zset'
      }, async (req, res, reqx) => {
         return await this.redis.scardAsync(reqx.keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'lpush',
         params: ['key', 'value'],
         access: 'add',
         description: 'prepend a value to the list',
         relatedCommands: ['lpushx', 'llen', 'lrange', 'trim', 'rpop'],
      }, async (req, res, reqx) => {
         return await this.redis.lpushAsync(reqx.keyspaceKey, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'lpushx',
         params: ['key', 'value'],
         access: 'add',
         description: 'prepend a value to a list if it exists',
         relatedCommands: ['lpush', 'llen', 'lrange', 'trim', 'rpop'],
      }, async (req, res, reqx) => {
         return await this.redis.lpushxAsync(reqx.keyspaceKey, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'lpush-trim',
         params: ['key', 'length', 'value'],
         access: 'set',
         relatedCommands: ['lpush', 'trim'],
      }, async (req, res, {keyspaceKey}, multi) => {
         const {value, length} = req.params;
         multi.lpush(keyspaceKey, value);
         multi.trim(keyspaceKey, length);
      });
      this.addKeyspaceCommand({
         key: 'rpush',
         params: ['key', 'value'],
         rest: true,
         access: 'add',
         description: 'append a value to the list (on the right)',
         relatedCommands: ['lpush'],
      }, async (req, res, reqx) => {
         return await this.redis.rpushAsync(reqx.keyspaceKey, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'lpop',
         params: ['key'],
         access: 'set',
         description: 'get and remove the first element in the list',
         relatedCommands: ['lpush'],
      }, async (req, res, reqx) => {
         return await this.redis.lpopAsync(reqx.keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'blpop',
         params: ['key', 'timeout'],
         access: 'set',
         description: 'get and remove the first element of the list (blocking)',
         relatedCommands: ['lpush'],
      }, async (req, res, reqx) => {
         const reply = await this.redis.blpopAsync(reqx.keyspaceKey, req.params.timeout);
         if (!reply) {
            return null;
         } else {
            return reply[1];
         }
      });
      this.addKeyspaceCommand({
         key: 'rpop',
         params: ['key'],
         access: 'set',
         description: 'get and remove the last element of the list',
         relatedCommands: ['lpush'],
      }, async (req, res, reqx) => {
         return await this.redis.rpopAsync(reqx.keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'brpop',
         params: ['key', 'timeout'],
         access: 'set',
         description: 'get and remove the last element of the list (blocking)',
         relatedCommands: ['lpush'],
      }, async (req, res, reqx) => {
         const reply = await this.redis.brpopAsync(reqx.keyspaceKey, req.params.timeout);
         if (!reply) {
            return null;
         } else {
            return reply[1];
         }
      });
      this.addKeyspaceCommand({
         key: 'brpoplpush',
         params: ['key', 'dest', 'timeout'],
         access: 'set',
         description: 'get and remove the last element of the list and prepend to another',
         relatedCommands: ['lpush'],
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
         description: 'get the number of elements in a list',
         relatedCommands: ['lrange']
      }, async (req, res, reqx) => {
         return await this.redis.llenAsync(reqx.keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'lindex',
         params: ['key', 'index'],
         description: 'get an element from a list by its index',
         relatedCommands: ['lset', 'lrange']
      }, async (req, res, reqx) => {
         return await this.redis.lindexAsync(reqx.keyspaceKey, req.params.index);
      });
      this.addKeyspaceCommand({
         key: 'lrem',
         params: ['key', 'count', 'value'],
         access: 'set',
         description: 'remove elements from the list',
      }, async (req, res, reqx) => {
         return await this.redis.lremAsync(reqx.keyspaceKey, req.params.count, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'lset',
         params: ['key', 'index', 'value'],
         access: 'set',
         description: 'set the value of an element in a list by its index',
         relatedCommands: ['lindex', 'lrange']
      }, async (req, res, reqx) => {
         return await this.redis.lsetAsync(reqx.keyspaceKey, req.params.index, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'ltrim',
         params: ['key', 'start', 'stop'],
         access: 'set',
         description: 'trim the list to the specified range',
         relatedCommands: ['llen']
      }, async (req, res, reqx) => {
         return await this.redis.ltrimAsync(reqx.keyspaceKey, req.params.start, req.params.stop);
      });
      this.addKeyspaceCommand({
         key: 'lrange',
         params: ['key', 'start', 'stop'],
         exampleKeyParams: {
            start: 0,
            stop: 10,
         },
         description: 'get a range of elements of a list (from the left)',
         relatedCommands: ['lrevrange', 'lindex', 'llen', 'rpop', 'brpoplpush']
      }, async (req, res, reqx) => {
         return await this.redis.lrangeAsync(reqx.keyspaceKey, req.params.start, req.params.stop);
      });
      this.addKeyspaceCommand({
         key: 'lrevrange',
         params: ['key', 'start', 'stop'],
         exampleKeyParams: {
            start: 0,
            stop: 10,
         },
         description: 'get some elements of your list in reverse order',
         relatedCommands: ['lrange', 'llen']
      }, async (req, res, reqx) => {
         const array = await this.redis.lrangeAsync(reqx.keyspaceKey, req.params.start, req.params.stop);
         return array.reverse();
      });
      this.addKeyspaceCommand({
         key: 'rrange',
         params: ['key', 'start', 'stop'],
         exampleKeyParams: {
            start: 0,
            stop: 10,
         },
         description: 'get elements from the right of your list',
         relatedCommands: ['rrevrange', 'lrange', 'llen']
      }, async (req, res, reqx) => {
         if (req.params.start < 0) {
            throw {message: `${reqx.command.key} start must be zero or greater`};
         }
         if (req.params.stop < 0) {
            throw {message: `${reqx.command.key} stop must be zero or greater`};
         }
         const array = await this.redis.lrangeAsync(reqx.keyspaceKey, 0 - req.params.stop, 0 - req.params.start - 1);
         return array.reverse();
      });
      this.addKeyspaceCommand({
         key: 'rrevrange',
         params: ['key', 'start', 'stop'],
         exampleKeyParams: {
            start: 0,
            stop: 10,
         },
         description: 'get elements from the right of your list in reverse order',
         relatedCommands: ['lrange', 'llen']
      }, async (req, res, reqx) => {
         if (req.params.start < 0) {
            throw {message: `${reqx.command.key} start must be zero or greater`};
         }
         if (req.params.stop < 0) {
            throw {message: `${reqx.command.key} stop must be zero or greater`};
         }
         const array = await this.redis.lrangeAsync(reqx.keyspaceKey, 0 - req.params.stop, 0 - req.params.start - 1);
         return array;
      });
      this.addKeyspaceCommand({
         key: 'hset',
         params: ['key', 'field', 'value'],
         access: 'set',
         description: 'set the string value of a hash field',
         relatedCommands: ['hget', 'hgetall', 'hkeys', 'hvals']
      }, async (req, res, reqx) => {
         return await this.redis.hsetAsync(reqx.keyspaceKey, req.params.field, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'hsetnx',
         params: ['key', 'field', 'value'],
         access: 'add',
         description: 'set the string value of a hash field if it does not exist',
         relatedCommands: ['hget', 'hgetall', 'hkeys', 'hvals']
      }, async (req, res, reqx) => {
         return await this.redis.hsetnxAsync(reqx.keyspaceKey, req.params.field, req.params.value);
      });
      this.addKeyspaceCommand({
         key: 'hget',
         params: ['key', 'field'],
         description: 'get the contents of a hash field',
         relatedCommands: ['hexists', 'hgetall', 'hkeys', 'hvals']
      }, async (req, res, reqx) => {
         return await this.redis.hgetAsync(reqx.keyspaceKey, req.params.field);
      });
      this.addKeyspaceCommand({
         key: 'hdel',
         params: ['key', 'field'],
         access: 'set',
         description: 'delete a hash field',
         relatedCommands: ['hexists', 'hget']
      }, async (req, res, reqx) => {
         return await this.redis.hdelAsync(reqx.keyspaceKey, req.params.field);
      });
      this.addKeyspaceCommand({
         key: 'hincrby',
         params: ['key', 'field', 'increment'],
         access: 'add',
         description: 'increment the integer value of a hash field',
         relatedCommands: ['hget']
      }, async (req, res, reqx) => {
         return await this.redis.hincrbyAsync(reqx.keyspaceKey, req.params.field, req.params.increment);
      });
      this.addKeyspaceCommand({
         key: 'hexists',
         params: ['key', 'field'],
         description: 'check if the hash field exists',
         relatedCommands: ['hkeys', 'hgetall']
      }, async (req, res, reqx) => {
         const reply = await this.redis.hexistsAsync(reqx.keyspaceKey, req.params.field);
         return reply;
      });
      this.addKeyspaceCommand({
         key: 'hlen',
         params: ['key'],
         description: 'get the number of fields in a hash',
         relatedCommands: ['hkeys', 'hvals', 'hgetall']
      }, async (req, res, reqx) => {
         return await this.redis.hlenAsync(reqx.keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'hkeys',
         params: ['key'],
         description: 'get the keys of the fields in your hashes',
         relatedCommands: ['hlen', 'hvals', 'hgetall']
      }, async (req, res, reqx) => {
         return await this.redis.hkeysAsync(reqx.keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'hvals',
         params: ['key'],
         description: 'get all the values in a hash',
         relatedCommands: ['hkeys', 'hgetall']
      }, async (req, res, reqx) => {
         return await this.redis.hkeysAsync(reqx.keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'hgetall',
         params: ['key'],
         description: 'get all the fields in a hash',
         relatedCommands: ['hlen', 'hkeys', 'hvals']
      }, async (req, res, reqx) => {
         return await this.redis.hgetallAsync(reqx.keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'zcard',
         params: ['key'],
         description: 'get the cardinality of the zset',
         relatedCommands: ['zrange', 'zrevrange']
      }, async (req, res, reqx) => {
         return await this.redis.zcardAsync(reqx.keyspaceKey);
      });
      if (this.config.redisVersion && this.config.redisVersion[0] >= 3) {
         this.addKeyspaceCommand({
            key: 'zaddnx',
            params: ['key', 'score', 'member'],
            access: 'add',
            description: 'add a member to a sorted set if it does not exist',
            relatedCommands: ['zrange', 'zcard'],
         }, async (req, res, reqx) => {
            return await this.redis.zaddAsync(reqx.keyspaceKey, 'NX', req.params.score, req.params.member);
         });
      }
      this.addKeyspaceCommand({
         key: 'zincrby',
         params: ['key', 'increment', 'member'],
         access: 'add',
         description: 'increment the score of a member of a sorted set',
         relatedCommands: ['zrange', 'zcard']
      }, async (req, res, reqx) => {
         return await this.redis.zincrbyAsync(reqx.keyspaceKey, req.params.increment, req.params.member);
      });
      this.addKeyspaceCommand({
         key: 'zadd',
         params: ['key', 'score', 'member'],
         access: 'add',
         description: 'add a member to a sorted set',
         relatedCommands: ['zrange', 'zcard']
      }, async (req, res, reqx) => {
         return await this.redis.zaddAsync(reqx.keyspaceKey, req.params.score, req.params.member);
      });
      this.addKeyspaceCommand({
         key: 'zrem',
         params: ['key', 'member'],
         access: 'set',
         description: 'remove a member from a sorted set',
         relatedCommands: ['zrange', 'zcard']
      }, async (req, res, reqx) => {
         return await this.redis.zremAsync(reqx.keyspaceKey, req.params.member);
      });
      this.addKeyspaceCommand({
         key: 'zrange',
         params: ['key', 'start', 'stop'],
         description: 'range items in the zset',
         exampleKeyParams: [0, 10],
         relatedCommands: ['zrevrange', 'zcard']
      }, async (req, res, reqx) => {
         return await this.redis.zrangeAsync(reqx.keyspaceKey, req.params.start, req.params.stop);
      });
      this.addKeyspaceCommand({
         key: 'zrevrange',
         params: ['key', 'start', 'stop'],
         description: 'reverse range items in the zset',
         relatedCommands: ['zrange', 'zcard']
      }, async (req, res, reqx) => {
         return await this.redis.zrevrangeAsync(reqx.keyspaceKey, req.params.start, req.params.stop);
      });
      this.addKeyspaceCommand({
         key: 'zrevrange',
         params: ['key', 'start', 'stop'],
         description: 'reverse range items in the zset',
         relatedCommands: ['zrange', 'zcard']
      }, async (req, res, reqx) => {
         return await this.redis.zrevrangeAsync(reqx.keyspaceKey, req.params.start, req.params.stop);
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
            } else if (result !== undefined) {
               await this.sendResult(command, req, res, {}, result);
            }
         } catch (err) {
            this.sendError(req, res, err);
         }
      });
      this.addCommand(command);
   }

   addPublicRoute(uri, fn) {
      uri = [this.config.location, uri].join('/');
      this.logger.debug('addPublicRoute', uri);
      this.expressApp.get(uri, async (req, res) => {
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
      this.addPublicCommand({
         key: 'register-ephemeral'
      }, async (req, res) => {
         req.params = {account: 'hub'};
         return this.registerEphemeral(req, res);
      });
      this.addPublicCommand({
         key: 'register-ephemeral-named',
         params: ['keyspace', 'access']
      }, async (req, res) => {
         req.params = {account: 'hub'};
         return this.registerEphemeral(req, res);
      });
      this.addPublicCommand({
         key: 'register-ephemeral-access',
         params: ['access']
      }, async (req, res) => {
         req.params.account = 'hub';
         return this.registerEphemeral(req, res);
      });
      this.addPublicCommand({
         key: 'register-account-telegram',
         params: ['account'],
         description: 'register a new account linked to an authoritative Telegram.org account'
      }, async (req, res) => {
         return this.registerAccount(req, res);
      });
      this.addPublicCommand({
         key: 'register-cert'
      }, async (req, res) => {
         const dn = req.get('ssl_client_s_dn');
         const clientCert = req.get('ssl_client_cert');
         if (!clientCert) throw {message: 'No client cert'};
         if (!dn) throw {message: 'No client cert DN'};
         const dns = this.parseDn(dn);
         if (!dns.ou) throw {message: 'No client cert OU name'};
         const matching = dns.ou.match(/^([\-_a-z]+)+%([\-_a-z]+)@(.*)$/);
         this.logger.debug('OU', matching);
         if (!matching) {
            throw {message: 'Cert OU name not matching "role%account@domain"'};
         } else {
            const [role, account, domain] = matching.slice(1);
            if (!lodash.endsWith(req.hostname, domain)) {
               throw {message: 'O domain not matching: ' + req.hostname};
            }
            return {account, domain};
         }
      });
   }

   parseDn(dn) {
      const parts = {};
      dn.split('/').filter(part => part.length)
      .forEach(part => {
         const [name, value] = part.split('=');
         if (name && value) {
            parts[name.toLowerCase()] = value;
         } else {
            this.logger.warn('parseDn', dn, part, name, value);
         }
      });
      return parts;
   }

   addAccountRoutes() {
      if (this.config.secureDomain) {
         this.addAccountCommand({
            key: 'grant-cert',
            params: ['account', 'role', 'certId'],
            defaultParams: {
               group: 'admin'
            },
            access: 'admin'
         }, async (req, res, {account, accountKey, time, clientCertDigest}) => {
            const [cert] = await this.redis.multiExecAsync(multi => {
               multi.hgetall(this.adminKey('cert', certId));
            });
            throw {message: 'Unimplemented'};
         });
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
            throw {message: 'No client cert'};
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

   async addAccountCommand(command, fn) {
      let uri = [command.key];
      if (command.params) {
         uri = [command.key, ...command.params.map(param => ':' + param)];
      }
      this.expressApp.get([this.config.location, ...uri].join('/'), async (req, res) => {
         try {
            let message = this.validatePath(req);
            if (message) throw {message};
            const {account} = req.params;
            const accountKey = this.adminKey('account', account);
            const [[time], admined, certs] = await this.redis.multiExecAsync(multi => {
               multi.time();
               multi.hget(accountKey, 'admined');
               multi.smembers(this.adminKey('account', account, 'certs'));
            });
            if (!admined) {
               throw {message: 'Invalid account'};
            }
            if (lodash.isEmpty(certs)) {
               throw {message: 'No certs'};
            }
            const duration = time - admined;
            if (duration < this.config.adminLimit) {
               return `Admin command interval not elapsed: ${this.config.adminLimit}s`;
            }
            this.validateCert(req, certs, account);
            const dn = req.get('ssl_client_s_dn');
            const result = await fn(req, res, {account, accountKey, time, admined, clientCertDigest});
            if (result !== undefined) {
               await this.sendResult({}, req, res, {}, result);
            }
         } catch (err) {
            this.sendError(req, res, err);
         }
      });
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

   async registerEphemeral(req, res, previousError) {
      let {account, keyspace, access} = req.params;
      assert(account, 'account');
      if (!keyspace) {
         keyspace = this.generateTokenKey(12).toLowerCase();
      } else {
         const v = this.validateRegisterKeyspace(keyspace);
         if (v) {
            throw {message: v, keyspace};
         }
      }
      if (!access) {
      } else if (access === 'add') {
         keyspace = '+' + keyspace;
      } else if (access) {
         this.sendError(req, res, {message: 'Access unimplemented: ' + access, hint: {
            message: 'Try access: add',
            description: 'Currently only "add" limited access is supported.'
         }});
      }
      if (previousError) {
         this.logger.warn('registerEphemeral retry');
      }
      try {
         this.logger.debug('registerEphemeral');
         let errorMessage = this.validateRegisterTime();
         if (errorMessage) {
            this.sendError(req, res, {message: errorMessage});
            return;
         }
         let clientIp = req.get('x-forwarded-for');
         const accountKey = this.accountKeyspace(account, keyspace);
         this.logger.debug('registerEphemeral clientIp', clientIp, account, keyspace, accountKey);
         const replies = await this.redis.multiExecAsync(multi => {
            multi.hsetnx(accountKey, 'registered', new Date().getTime());
            if (clientIp) {
               multi.hsetnx(accountKey, 'clientIp', clientIp);
               if (this.config.addClientIp) {
                  multi.sadd(this.adminKey('keyspaces:ephemeral:ips'), clientIp);
               }
            }
            //this.count(multi, 'keyspaces:ephemeral'); // TODO del old keyspaces:expire
         });
         if (!replies[0]) {
            this.logger.error('keyspace clash', account, keyspace);
            if (!previousError) {
               return this.registerEphemeral(req, res, {message: 'keyspace clash'});
            }
            throw {message: 'Keyspace already exists'};
         }
         const replyPath = ['ak', account, keyspace].join('/');
         this.logger.debug('registerEphemeral replyPath', replyPath);
         if (this.isBrowser(req)) {
            res.redirect(302, ['', replyPath, 'help'].join('/'));
         } else {
            return replyPath;
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

   addCommand(command) {
      assert(command.key);
      this.commands.push(command);
      this.commandMap.set(command.key, command);
   }

   addKeyspaceCommand(command, fn) {
      assert(command.key, 'command.key');
      command.context = 'keyspace';
      let uri = 'ak/:account/:keyspace';
      command.params = command.params || [];
      const key = command.key + command.params.length;
      this.logger.debug('addKeyspaceCommand', command.key, key, uri);
      this.addCommand(command);
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
            const helpPath = `/ak/${account}/${keyspace}/help`;
            const reqx = {account, keyspace, accountKey, key, helpPath, command};
            if (key) {
               reqx.keyspaceKey = this.keyspaceKey(account, keyspace, key);
            }
            req.rquery = reqx;
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
            const isSecureAccount = !/^(pub|hub)$/.test(account);
            const [[time], registered, admined, accessed, certs] = await this.redis.multiExecAsync(multi => {
               multi.time();
               multi.hget(accountKey, 'registered');
               multi.hget(accountKey, 'admined');
               multi.hget(accountKey, 'accessed');
               if (isSecureAccount) {
                  multi.smembers(this.adminKey('account', account, 'certs'));
               }
            });
            Objects.kvs({time, registered, admined, accessed}).forEach(kv => {
               reqx[kv.key] = parseInt(kv.value);
            });
            this.validateAccess(req, reqx, {certs});
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
            multi.sadd(this.adminKey('keyspaces'), keyspace);
            multi.hset(accountKey, 'accessed', time);
            if (command && command.access === 'admin') {
               multi.hset(accountKey, 'admined', time);
            }
            const result = await fn(req, res, reqx, multi);
            if (result !== undefined) {
               await this.sendResult(command, req, res, reqx, result);
            }
            if (key) {
               assert(reqx.keyspaceKey);
               const expire = this.getKeyExpire(account);
               multi.expire(reqx.keyspaceKey, expire);
               this.logger.debug('expire', reqx.keyspaceKey, expire);
            }
            const [...expire] = await multi.execAsync();
            if (!expire) {
               throw new ApplicationError('expire: ' + reqx.keyspaceKey);
            }
         } catch (err) {
            this.sendError(req, res, err);
         }
      };
   }

   getKeyExpire(account) {
      if (account === 'hub') {
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
      } else if (['hub', 'pub', 'public'].includes(account)) {
         return 'Invalid account (reserved name)';
      } else if (!/^[\-_a-z0-9]+$/.test(account)) {
         return 'Account name is invalid. Try only lowercase/numeric with dash/underscore.';
      }
   }

   validatePath(req) {
      const match = req.path.match(/\/:([^\/]+)/);
      if (match) {
         return 'Invalid path: leading colon. Try substituting parameter: ' + match.pop();
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

   validateAccess(req, reqx, {certs}) {
      const {command, account, keyspace, time} = reqx;
      const scheme = req.get('X-Forwarded-Proto');
      this.logger.debug('validateAccess scheme', scheme, account, keyspace, command);
      if (this.isSecureDomain(req)) {
         if (scheme === 'http') {
            throw {message: `Insecure scheme ${scheme}: ${req.hostname}`};
         }
      }
      if (command.key === 'register-keyspace') {
         if (reqx.registered) {
            throw {message: 'Already registered'};
         }
      } else if (!reqx.registered) {
         if (account === 'hub' || account === 'pub') {
            throw {message: 'Expired (or unregistered) keyspace', hint: {
               uri: 'register-ephemeral',
               description: 'To register a new ephemeral keyspace'
            }};
         } else {
            throw {message: 'Unregistered keyspace', hint: {
               uri: 'register-ephemeral',
               description: 'To register a new ephemeral keyspace'
            }};
         }
      }
      if (command.access) {
         if (command.access === 'admin') {
            if (!reqx.admined) {
               this.logger.warn('validateAccess admined', keyspace, command.key, time);
            } else {
               const duration = time - reqx.admined;
               if (duration < this.config.adminLimit) {
                  throw {message: `Admin command interval not elapsed: ${this.config.adminLimit}s`};
               }
            }
         } else if (command.access === 'debug') {
         } else if (command.access === 'add') {
            if (!/^[a-z]/.test(keyspace)) {
               return;
            }
         } else if (command.access === 'set') {
            if (/^\+/.test(keyspace)) {
               throw {message: 'Append-only keyspace'};
            }
         } else if (command.access === 'get') {
         } else {
         }
      }
      if (account !== 'hub' && account !== 'pub') {
         this.validateCert(req, certs, account);
      }
   }

   validateCert(req, certs, account) {
      if (this.config.disableValidateCert) {
         return;
      }
      if (!certs) {
         throw {message: 'No enrolled certs', hint: {
            commandKey: ['register-account-telegram']
         }};
      }
      const clientCert = req.get('ssl_client_cert');
      if (!clientCert) {
         throw {message: 'No client cert sent', hint: {
            commandKey: ['register-account-telegram']
         }};
      }
      const clientCertDigest = this.digestPem(clientCert);
      this.logger.info('validateCert', clientCertDigest, account);
      if (!certs.includes(clientCertDigest)) {
         throw {message: 'Invalid cert', hint: {
            accountKey: ['register-account-telegram']
         }};
      }
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
      const uaMatch = userAgent.match(/\s([A-Z][a-z]*\/[\.0-9]+)\s/);
      this.logger.debug('sendResult ua', !uaMatch? userAgent: uaMatch[1]);
      command = command || {};
      const mobile = this.isMobile(req);
      this.logger.debug('sendResult mobile', mobile, command.key);
      if (this.isDevelopment(req)) {
         this.logger.debug('sendResult command', command.key, req.params, lodash.isArray(result));
      } else {
      }
      if (command.sendResult) {
         if (lodash.isFunction(command.sendResult)) {
            const otherResult = await command.sendResult(req, res, reqx, result);
            if (otherResult === undefined) {
               return;
            } else {
               result = otherResult;
            }
         } else {
            throw {message: 'command.sendResult type: ' + typeof command.sendResult};
         }
      }
      let resultString = '';
      if (!Values.isDefined(result)) {
         this.logger.error('sendResult none');
      } else if (Values.isDefined(req.query.json) || (command.format === 'json' && !mobile)) {
         res.json(result);
         return;
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
      } else if (this.config.defaultFormat === 'json' && !mobile) {
         res.json(result);
         return;
      } else if (this.config.defaultFormat === 'html' || Values.isDefined(req.query.html)
      || command.format === 'html' || this.isHtmlDomain(req) || mobile) {
         return this.sendHtmlResult(command, req, res, reqx, result);
      } else {
         this.sendError(req, res, {message: `Invalid default format: ${this.config.defaultFormat}`});
         return;
      }
      res.send(resultString + '\n');
   }

   sendHtmlResult(command, req, res, reqx, result) {
      let title = this.config.serviceLabel;
      let heading, icon;
      if (reqx.account && reqx.keyspace) {
         const keyspaceLabel = KeyspaceHelp.obscureKeyspaceLabel(reqx);
         title = `${reqx.account}/${keyspaceLabel}`;
         heading = [Hc.b(reqx.account), Hs.tt(styles.header.keyspace, keyspaceLabel)].join(''),
         icon = 'database';
      }
      let resultString = '';
      let resultArray = [];
      if (result === null) {
      } else if (lodash.isString(result)) {
         resultString = result;
      } else if (lodash.isArray(result)) {
         resultArray = result;
      } else if (lodash.isObject(result)) {
         resultArray = Object.keys(result).map(key => `<b>${key}</b> ${result[key]}`);
      } else if (result) {
         resultString = result.toString();
      }
      res.set('Content-Type', 'text/html');
      const content = [];
      this.logger.debug('sendResult reqx', reqx, command, resultString, resultArray.length);
      if (command.key) {
         content.push(Hso.div(styles.result.commandKey, command.key.replace(/-/g, ' ')));
      }
      if (reqx.key) {
         content.push(Hso.div(styles.result.reqKey, reqx.key));
      }
      if (command.params) {
         content.push(Hso.pre(styles.result.commandParams, command.params
            .filter(key => key !== 'key')
            .map(key => `<b>${key}</b> ${req.params[key]}`)
            .join('\n'))
         );
         this.logger.info('params', lodash.last(content));
      }
      let statusCode = 200;
      let emptyMessage;
      if (resultArray.length) {
         if (resultString) {
            this.logger.error('sendResult resultString', command, req.path);
         }
      } else if (!resultString) {
         //statusCode = 404;
         resultString = '<i>&lt;empty&gt;</i>';
      }
      if (resultString) {
         resultArray.push(resultString);
      }
      content.push(Hs.pre(styles.result.resultArray, lodash.compact(resultArray).join('\n')));
      let hints = [];
      if (command && reqx.account && reqx.keyspace) {
         if (command.relatedCommands) {
            try {
               hints = this.getRelatedCommandHints(req, reqx, command.relatedCommands);
            } catch (err) {
               this.logger.error('related', err, err.stack);
            }
         }
         hints.push({
            uri: ['help'],
            description: 'view sample keyspace commands'
         });
         const otherHints = hints.filter(hint => !hint.uri && hint.commandKey);
         hints = hints
         .filter(hint => hint.uri);
         const renderedPathHints = hints
         .map(hint => {
            const path = HtmlElements.renderPath(['ak', reqx.account, reqx.keyspace, ...hint.uri].join('/'));
            hint = Object.assign({path}, hint);
            return hint;
         })
         .map(hint => {
            const uriLabel = [Hc.b(hint.uri[0]), ...hint.uri.slice(1)].join('/');
            this.logger.debug('hint', uriLabel, hint);
            return He.div({
               style: styles.result.hint.container,
               onClick: HtmlElements.onClick(hint.path)
            }, [
               Hso.div(styles.result.hint.message, hint.message),
               Hso.div(styles.result.hint.link, `Try: ` + Hs.tt(styles.result.hint.uri, uriLabel)),
               Hso.div(styles.result.hint.description, lodash.capitalize(hint.description))
            ]);
         });
         this.logger.debug('renderedPathHints', renderedPathHints);
         content.push(renderedPathHints);
         const renderedOtherHints = otherHints.map(hint => He.div({
            style: styles.result.hint.container
         }, [
            Hso.div(styles.result.hint.message, hint.message),
            Hso.div(styles.result.hint.link, `Try: ` + Hs.tt(styles.result.hint.uri, Hc.b(hint.commandKey))),
            Hso.div(styles.result.hint.description, hint.description)
         ]));
         content.push(renderedOtherHints);
      }
      res.status(statusCode).send(renderPage({
         config: this.config, req, reqx, title, heading, icon, content
      }));
   }

   getRelatedCommandHints(req, reqx, relatedCommands) {
      return lodash.compact(relatedCommands
         .map(commandKey => this.commandMap.get(commandKey))
         .filter(command => command && command.key && command.params)
         .filter(command => !command.access || lodash.includes(['get', 'debug'], command.access))
         .map(command => {
            let uri = [command.key];
            const params = command.params
            .map(key => {
               let value = req.params[key] || [];
               if (command && command.exampleKeyParams && command.exampleKeyParams.hasOwnProperty(key)) {
                  value = command.exampleKeyParams[key]
               }
               this.logger.info('related', key, value);
               return value;
            });
            this.logger.info('related params', params);
            if (params.length !== command.params.length) {
               this.logger.warn('params length', command);
               return null;
            } else {
               uri = uri.concat(...params);
            }
            return {
               uri,
               description: command.description
            };
         })
      );
   }

   isDevelopment(req) {
      return req.hostname === 'localhost' && process.env.NODE_ENV === 'development';
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
      return /(Mobile|iPhone)/.test(req.get('User-Agent'));
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
      return /^cli/.test(req.hostname) || !this.isBrowser(req) || this.config.cliDomain;
   }

   sendError(req, res, err) {
      this.logger.warn(err);
      if (err.context) {
         this.logger.warn(err.context);
      }
      try {
         this.sendStatusMessage(req, res, 500, err);
      } catch (error) {
         this.logger.error(error);
      }
   }

   sendCommandError(command, req, res, reqx, err) {
      this.logger.warn(err);
      try {
         this.sendStatusMessage(req, res, 500, err);
      } catch (error) {
         this.logger.error(error);
      }
   }

   sendStatusMessage(req, res, statusCode, err) {
      const reqx = req.rquery || {};
      const command = reqx.command || {};
      this.logger.warn('status', req.path, statusCode, typeof err, err);
      let messageLines = [];
      if (!err) {
         this.logger.error('sendStatusMessage empty');
         err = 'empty error message';
      }
      let title = req.path;
      let hints = [];
      if (lodash.isString(err)) {
         title = err;
      } else if (lodash.isArray(err)) {
         messageLines = messageLines.concat(err);
      } else if (typeof err === 'object') {
         if (err.message) {
            title = err.message;
         }
         if (err.hint) {
            hints.push(err.hint);
         }
         if (err.hints) {
            hints = hints.concat(err.hints);
         }
         hints = hints.map(hint => {
            let url;
            if (this.isBrowser(req)) {
               url = `/${hint.uri}`;
            } else if (/localhost/.test(req.hostname)) {
               url = `http://localhost:8765/${hint.uri}`;
            } else {
               url = `https://${req.hostname}/${hint.uri}`;
            }
            if (this.isBrowser(req)) {
               url = `Try <a href="${url}"><tt>${url}</tt></a>`;
            }
            return Object.assign({url}, hint);
         });
         if (err.stack) {
            messageLines.push(err.stack.split('\n').slice(0, 5));
         }
      } else {
         this.logger.error('sendStatusMessage type', typeof err, err);
         err = 'unexpected error type: ' + typeof err;
         messageLines.push(Object.keys(err).join(' '));
      }
      const heading = [Hc.b('Status'), Hc.tt(statusCode)].join(' ');
      if (this.isBrowser(req)) {
         this.logger.debug('hints', hints);
         res.set('Content-Type', 'text/html');
         res.status(statusCode).send(renderPage({
            config: this.config,
            req, reqx, title, heading,
            content: [
               //Hs.div(styles.error.status, `Status ${statusCode}`),
               Hs.div(styles.error.message, title),
               Hs.pre(styles.error.detail, lodash.flatten(messageLines).join('\n')),
               hints.map(hint => He.div(styles.error.hint, [
                  Hso.div(styles.error.hintMessage, hint.message),
                  Hso.div(styles.error.hintUrl, hint.url),
                  Hso.div(styles.error.hintDescription, hint.description)
               ])),
            ]
         }));
      } else {
         this.logger.warn('status lines', req.path, statusCode, typeof err, Object.keys(err), messageLines.length);
         // TODO hints
         res.status(statusCode).send(lodash.flatten([title, ...messageLines]).join('\n') + '\n');
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
