
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

import {handleCertScript, handleCertScriptHelp} from './handlers/certScript';
import {default as renderPage} from './html/Page';
import * as KeyspaceHelp from './html/KeyspaceHelp';

import * as Result from './handlers/Result';

import KeyspaceHelpPage from './jsx/KeyspaceHelpPage';

import styles from './html/styles';

const AccessKeys = ['open', 'private', 'add'];

const logger = Loggers.create(module.filename);

export default class rquery {

   async testExit() {
      return false;
   }

   async init() {
      this.commandMap = new Map();
      this.logger.info('init', this.config.redisUrl);
      if (await this.testExit()) process.exit(1);
      this.hints = {
         signup: {
            message: `Try "@${this.config.adminBotName} /signup" on https://web.telegram.org`,
            url: `https://telegram.me/${this.config.adminBotName}?start`
         },
         grantCert: {
            message: `Try "@${this.config.adminBotName} /grantcert certId" e.g. via https://web.telegram.org`,
            url: `https://telegram.me/${this.config.adminBotName}?start`
         },
         registerCert: {
            message: `Try <tt>/register-cert</tt>`,
            url: '/register-cert'
         },
         routes: {
            message: 'Try <tt>/routes</tt>',
            url: '/routes'
         },
         createEphemeral: {
            uri: 'create-ephemeral',
            description: 'Create a new ephemeral keyspace'
         }
      };
      this.redis = redisLib.createClient(this.config.redisUrl);
      this.expressApp = expressLib();
   }

   async start() {
      assert(global.rquery.config === this.config, 'global config');
      this.expressApp.use((req, res, next) => {
         const scheme = req.get('X-Forwarded-Proto');
         if (this.config.serviceKey === 'development') {
            next();
         } else if (scheme !== 'https') {
            const redirectUrl = `https://${req.hostname}${req.url}`;
            this.logger.debug('redirect scheme', scheme, redirectUrl);
            res.redirect(302, redirectUrl);
         } else {
            next();
         }
      });
      this.expressApp.use((req, res, next) => {
         req.pipe(concatStream(content => {
            req.body = content;
            next();
         }));
      });
      this.addMonitoringRoutes();
      this.addRoutes();
      if (this.config.disableTelegramHook) {
         this.logger.warn('telegram webhook disabled');
      } else {
         this.addTelegramWebhook();
      }
      this.expressApp.use(async (req, res, next) => {
         try {
            await this.handlePublish(req, res, next);
         } catch (err) {
            this.sendError(req, res, err);
         }
      });
      this.expressApp.use((req, res) => {
         try {
            this.sendErrorRoute(req, res);
         } catch (err) {
            this.sendError(req, res, err);
         }
      });
      this.expressApp.use((req, res) => this.sendErrorRoute(req, res));
      this.expressServer = await Express.listen(this.expressApp, this.config.port);
      this.logger.info('listen', this.config.port, this.config.redisUrl);
   }

   async handlePublish(req, res, next) {
      const parts = req.url.slice(1).split('/');
      const reqx = {};
      reqx.published = true;
      if (parts.length == 4) {
         const [account, keyspace, commandKey, key] = parts;
         if (!['get', 'smembers'].includes(commandKey)) {
            return next();
         }
         Object.assign(reqx, {account, keyspace, commandKey, key});
         return this.handlePublishKeyCommand(req, res, next, reqx);
      } else if (parts.length == 3) {
         const [account, keyspace, key] = parts;
         Object.assign(reqx, {account, keyspace, key});
         return this.handlePublishKey(req, res, next, reqx);
      } else if (parts.length == 2) {
         const [account, keyspace] = parts;
         Object.assign(reqx, {account, keyspace});
         return this.handlePublishKeyspace(req, res, next, reqx);
      } else if (parts.length == 1) {
         const [account] = parts;
         Object.assign(reqx, {account});
         return this.handlePublishAccount(req, res, next, reqx);
      } else {
         return next();
      }
   }

   async handlePublishKeyCommand(req, res, next, reqx) {
      this.logger.debug('handlePublishKeyCommand', req.url, reqx);
      const accountKeyspace = this.accountKeyspace(reqx.account, reqx.keyspace);
      const keyspaceKey = this.keyspaceKey(reqx.account, reqx.keyspace, reqx.key);
      const accountKey = this.adminKey('account', reqx.account);
      const [access, type, result] = await this.redis.multiExecAsync(multi => {
         multi.hget(accountKeyspace, 'access');
         multi.type(keyspaceKey);
         if (reqx.commandKey === 'get') {
            multi.get(keyspaceKey);
         } else if (reqx.commandKey === 'smembers') {
            multi.smembers(keyspaceKey);
         } else if (reqx.commandKey === 'hashes') {
            multi.hkeys(keyspaceKey);
         } else {
            throw new ValidationError('Unsupported: ' + reqx.commandKey);
         }
      });
      if (access !== 'open') {
         throw new ValidationError({status: 403, message: 'Access Prohibited e.g. unpublished keyspace'});
      }
      let command = this.commandMap.get(reqx.commandKey);
      reqx.backPath = `/${reqx.account}/${reqx.keyspace}`;
      await Result.sendResult(command, req, res, reqx, result);
   }

   async handlePublishKey(req, res, next, reqx) {
      this.logger.debug('handlePublishKey', req.url, reqx);
      const accountKeyspace = this.accountKeyspace(reqx.account, reqx.keyspace);
      const keyspaceKey = this.keyspaceKey(reqx.account, reqx.keyspace, reqx.key);
      const accountKey = this.adminKey('account', reqx.account);
      const [access, type] = await this.redis.multiExecAsync(multi => {
         multi.hget(accountKeyspace, 'access');
         multi.type(keyspaceKey);
      });
      if (access !== 'open') {
         throw new ValidationError({status: 403, message: 'Access Prohibited e.g. unpublished keyspace'});
      }
      let result;
      if (type === 'none') {
         throw new ValidationError({message: 'Unpublished', status: 404});
      } else if (type === 'set') {
         reqx.commandKey = 'smembers';
         result = await this.redis.smembersAsync(keyspaceKey);
      } else if (type === 'string') {
         reqx.commandKey = 'get';
         result = await this.redis.getAsync(keyspaceKey);
      } else if (type === 'list') {
         reqx.commandKey = 'lrange';
         req.params.start = 0;
         req.params.stop = this.config.lrangeStop;
         result = await this.redis.lrangeAsync(keyspaceKey, req.params.start, req.params.stop); // TODO
      } else if (type === 'hash') {
         reqx.commandKey = 'hgetall';
         result = await this.redis.hgetallAsync(keyspaceKey);
      } else {
         throw new ValidationError('Unsupported publish key type: ' + type);
      }
      if (!result) {
         throw new ValidationError({message: 'Not found: ' + key, status: 404});
      }
      let command = this.commandMap.get(reqx.commandKey);
      reqx.backPath = `/${reqx.account}/${reqx.keyspace}`;
      await Result.sendResult(command, req, res, reqx, result);
   }

   async handlePublishKeyspace(req, res, next, reqx) {
      this.logger.debug('publishKeyspace', req.url, reqx);
      const accountKeyspace = this.accountKeyspace(reqx.account, reqx.keyspace);
      const [access] = await this.redis.multiExecAsync(multi => {
         multi.hget(accountKeyspace, 'access');
      });
      if (access !== 'open') {
         throw new ValidationError({status: 403, message: 'Access Prohibited e.g. unpublished keyspace'});
      }
      const publishedKeys = await this.redis.smembersAsync(
         this.accountKeyspace(reqx.account, reqx.keyspace, 'published-keys')
      );
      const renderedResult = publishedKeys
      .map(key => `<a href="${req.url}/${key}">${key}</a>`);
      reqx.backPath = `/${reqx.account}`;
      await Result.sendResult({}, req, res, reqx, renderedResult);
   }

   async handlePublishAccount(req, res, next, reqx) {
      this.logger.debug('publishAccount', req.url, reqx);
      if (reqx.account === 'hub' && this.config.serviceKey !== 'development') {
         throw new ValidationError('Invalid request');
      }
      const keyspaces = (await this.redis.smembersAsync(this.accountKey(reqx.account, 'open-keyspaces')))
      .map(keyspace => `<a href="${req.url}/${keyspace}">${keyspace}</a>`);
      await Result.sendResult({}, req, res, reqx, keyspaces);
   }

   addMonitoringRoutes() { // TODO
   }

   sendErrorRoute(req, res) {
      try {
         if (/^\/favicon.ico$/.test(req.path)) {
            res.status(404).send(`Invalid path: ${req.path}\n`);
            return;
         }
         const [matching, account, keyspace] = req.path.match(/^\/ak\/([^\/]+)\/([^\/]+)\//) || [];
         this.logger.debug('sendErrorRoute', req.path, account, keyspace, this.isBrowser(req));
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
               this.logger.debug('webhook auth', req.params[0].substring(0, 4));
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
      const cert = this.getClientCert(req);
      if (!cert) {
         //throw {message: 'No client cert'};
      } else {
         this.logger.debug('telegram cert', cert.split('\n')[0]);
         const dn = this.parseCertDn(req);
         this.logger.debug('telegram', telegram, dn);
      }
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
      this.logger.debug('telegram tcm', JSON.stringify({telegram, content, message}, null, 2));
      if (!content.from) {
         this.logger.warn('telegram tcm', {telegram, content, message});
      } else {
         message.fromId = content.from.id;
         if (content.from.username) {
            message.username = content.from.username;
         }
         message.greetName = content.from.username;
         if (content.from.first_name) {
            message.greetName = content.from.first_name;
         } else if (content.from.first_name && content.from.last_name) {
            message.greetName = [content.from.first_name, content.from.last_name].join(' ');
         }
         if (!message.username) {
            await this.sendTelegram(message.chatId, 'html', [
               `You must set your Telegram username under Settings via the top hamburger menu.`,
               `We use this for your ${this.config.serviceLabel} account name.`,
            ]);
         } else if (/\/verify/.test(content.text)) {
            message.action = 'verify';
            await this.handleTelegramVerify(message);
         } else if (/\/grant/.test(content.text)) {
            message.action = 'grant';
            await this.handleTelegramGrant(message);
         } else if (/\/signup/.test(content.text)) {
            message.action = 'signup';
            await this.handleTelegramSignup(message);
         } else {
            await this.sendTelegram(message.chatId, 'html', [
               `Commands: <code>/signup /verifyme /grantcert</code>`
            ]);
         }
      }
      this.logger.info('telegram message', message, telegram);
   }

   async handleTelegramSignup(request) {
      const now = new Date().getTime();
      this.logger.info('handleTelegramSignup', request);
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
         await this.sendTelegram(request.chatId, 'html', [
            `Thanks, ${request.greetName}.`,
            `Your identity as is now verified to <b>${this.config.serviceLabel}</b>`,
            `as <tt>telegram.me/${request.username}.</tt>`
         ]);
      }
      const account = request.username;
      await this.sendTelegram(request.chatId, 'html', [
         `Thanks, ${request.greetName}.`,
         `Your ${this.config.serviceLabel} account name is <b>${account}</b>, as per your Telegram user.`,
         `Use the following script create a client cert:`,
         `${this.config.openHostname}/cert-script/${account}.`,
         `We recommend you review, and read ${this.config.openHostname}/docs/register-cert.md.`,
      ]);
   }

   async handleTelegramVerify(request) {
      const now = Seconds.now();
      this.logger.info('handleTelegramVerify', request);
      const userKey = this.adminKey('telegram', 'user', request.username);
      let [sadd, verifiedString, secret] = await this.redis.multiExecAsync(multi => {
         multi.sadd(this.adminKey('telegram:verified:users'), request.username);
         multi.hget(userKey, 'verified');
         multi.hget(userKey, 'secret');
      });
      if (!secret) {
         secret = this.generateTokenKey();
      }
      if (sadd || !verifiedString) {
         const [hmset] = await this.redis.multiExecAsync(multi => {
            multi.hsetnx(userKey, 'verified', now);
            multi.hsetnx(userKey, 'id', request.fromId);
            multi.hsetnx(userKey, 'secret', secret);
         });
         await this.sendTelegram(request.chatId, 'html', [
            `Thanks, ${request.greetName}.`,
            `Your identity as is now verified to <b>${this.config.serviceLabel}</b>`,
            `as <code>telegram.me/${request.username}.</code>`
         ]);
      } else {
         let verifiedTime = parseInt(verifiedString);
         if (verifiedTime > now) {
            verifiedTime = Math.ceil(verifiedTime/1000);
         }
         const duration = now - verifiedTime;
         await this.sendTelegram(request.chatId, 'html', [
            `Hi ${request.greetName}.`,
            `Your identity as was already verified`,
            `${Millis.formatVerboseDuration(duration)} ago`,
            `as <code>@${request.username}</code>`
         ]);
      }
   }

   async handleTelegramGrant(request) {
      const now = Millis.now();
      this.logger.info('handleTelegramGrant', request);
      const match = request.text.match(/\/grantcert (\w+)$/);
      if (!match) {
         await this.sendTelegram(request.chatId, 'html', [
            `Try <code>/grantcert &lt;digest&gt;</code>`,
            `where the <code>digest</code> is returned by ${this.config.secureHostname}/register-cert`,
            `performed with the cert to be enrolled.`,
            `Read ${this.config.openHostname}/docs/register-cert.md for further info.`,
            `Use the following link to create a client cert:`,
            `${this.config.openHostname}/cert-script/${request.username}?id=${request.username}`,
         ]);
         return;
      }
      const cert = match[1];
      const userKey = this.adminKey('telegram', 'user', request.username);
      const grantKey = this.adminKey('telegram', 'user', request.username, 'grantcert');
      this.logger.info('handleTelegramGrant', userKey, grantKey, request, cert);
      let [ismember, verified, secret, exists] = await this.redis.multiExecAsync(multi => {
         multi.sismember(this.adminKey('telegram:verified:users'), request.username);
         multi.hget(userKey, 'verified');
         multi.hget(userKey, 'secret');
         multi.exists(grantKey);
      });
      let [setex] = await this.redis.multiExecAsync(multi => {
         this.logger.info('handleTelegramGrant setex', grantKey, cert, this.config.enrollExpire);
         multi.setex(grantKey, this.config.enrollExpire, cert);
      });
      if (setex) {
         await this.sendTelegramReply(request, 'html', [
            `You have approved enrollment of the cert <b>${cert}</b>.`,
            `That identity can now enroll via ${this.config.secureHostname}/register-cert.`,
            `This must be done in the next ${Millis.formatVerboseDuration(1000*this.config.enrollExpire)}`,
            `otherwise you need to repeat this request, after it expires.`,
            `See ${this.config.openHostname}/docs/register-cert.md for further info.`,
         ]);
      } else {
         await this.sendTelegramReply(request, 'html', [
            `Apologies, the 'setex' command reply was <tt>${setex}</tt>`,
         ]);
      }
   }

   async sendTelegramReply(request, format, ...content) {
      if (request.chatId && request.greetName) {
         await this.sendTelegram(request.chatId, format,
            `Thanks, ${request.greetName}.`,
            ...content
         );
      } else {
         this.logger.error('sendTelegramReply', request);
      }
   }

   async sendTelegramAlert(account, format, ...context) {
      await this.sendTelegram(account, format, ...context);
   }

   async sendTelegram(chatId, format, ...content) {
      this.logger.debug('sendTelegram', chatId, format, content);
      try {
         const text = lodash.trim(lodash.flatten(content).join(' '));
         assert(chatId, 'chatId');
         let uri = `sendMessage?chat_id=${chatId}`;
         uri += '&disable_notification=true';
         if (format === 'markdown') {
            uri += `&parse_mode=Markdown`;
         } else if (format === 'html') {
            uri += `&parse_mode=HTML`;
         }
         uri += `&text=${encodeURIComponent(text)}`;
         const url = [this.config.botUrl, uri].join('/');
         this.logger.info('sendTelegram url', url, chatId, format, text);
         const response = await Requests.request({url});
         if (response.statusCode !== 200) {
            this.logger.warn('sendTelegram', chatId, url);
         }
      } catch (err) {
         this.logger.error(err);
      }
   }

   addRoutes() {
      this.addPublicCommand(require('./handlers/routes'));
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
            const {certDigest, certRole} = this.validateCert(req, reqx, certs, account, []);
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
            return [
               `Telegram user not yet verified: ${user}.`,
               `Please Telegram '@${this.config.adminBotName} /verifyme'`,
               `e.g. via https://web.telegram.org`
            ].join(' ');
         }
      });
      this.addPublicCommand({
         key: 'cert-script',
         params: ['account'],
         format: 'cli'
      }, (req, res, reqx) => handleCertScript(req, res, reqx, {config: this.config}));
      this.addPublicCommand({
         key: 'cert-script-help',
         params: ['account'],
         format: 'cli'
      }, (req, res, reqx) => handleCertScriptHelp(req, res, reqx, {config: this.config}));
      this.addRegisterRoutes();
      this.addAccountRoutes();
      this.addKeyspaceCommand({
         key: 'help',
         access: 'debug',
         resultObjectType: 'KeyedArrays',
         sendResult: async (req, res, reqx, result) => {
            if (!this.isCliDomain(req)) {
               res.set('Content-Type', 'text/html');
               res.send(renderPage(KeyspaceHelp.render({
                  config: this.config, commandMap: this.commandMap,
                  req, reqx, result
               })));
            } else if (false && !this.isMobile(req)) {
               res.set('Content-Type', 'text/html');
               res.send(ReactDOMServer.renderToString(<KeyspaceHelpPage reqx={reqx} result={result}/>));
            } else {
               return Object.assign(lodash.omit(result, 'description'), {commands: result.commands.map(command => {
                  if (lodash.isEmpty(command.params)) {
                     if (command.description) {
                        return command.key;
                     } else {
                        return command.key;
                     }
                  } else {
                     return [command.key].concat(command.params.map(param => ':' + param)).join('/');
                  }
               })});
            }
         },
         handleReq: async (req, res, reqx) => {
            const {account, keyspace} = req.params;
            let hostUrl = this.config.hostUrl;
            if (this.config.hostDomain !== 'localhost') {
               hostUrl = `https://${req.hostname}`;
            }
            this.logger.ndebug('help', req.params, this.commands.map(command => command.key).join('/'));
            const message = Switch.on(`Welcome to this keyspace`,
               [reqx.account === 'hub', [
                  `Welcome to this ephemeral keyspace.`
               ].join(' ')],
               [reqx.account, [
                  `Welcome to your account keyspace`
               ].join(' ')],
            );
            const commandReferenceMessage = `Read the Redis.io docs for the following commands`;
            const customCommandHeading = `Custom commands`;
            let description = [
               `You can set, get and add data to sets, lists, zsets, hashes etc.`,
               `Try click the example URLs below.`,
               `Also edit the URL in the location bar to try other combinations.`,
               `Click anywhere on the iconized header bar to navigate back.`
            ];
            if (false && this.isSecureDomain(req)) {
               description.push(
                  `When reading keys, you can also try changing the subdomain to 'replica.'`
               );
            }
            description.push(
               `<i>(A client-side command completion tool will come later. This is an MVP without any such bells and whistles yet.)</i>`
            );
            description = description.join(' ');
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
         }
      });
      this.addKeyspaceCommand({
         key: 'create-keyspace',
         access: 'admin'
      }, async (req, res, reqx) => {
         const {command, time, account, keyspace, certDigest, certRole} = reqx;
         const role = req.query.role || 'admin';
         if (role !== certRole) {
            throw new ValidationError({
               status: 400,
               message: `Cert Role (OU=${certRole}) mismatch (${role})`
            });
         }
         this.logger.debug('command', command.key, account, role);
         const [sadd, accountExpire, hlen] = await this.redis.multiExecAsync(multi => {
            multi.sadd(this.accountKey(account, 'keyspaces'), keyspace);
            multi.hget(this.accountKey(account), 'expire');
            multi.hlen(this.accountKeyspace(account, keyspace));
         });
         if (!sadd) {
            throw new ValidationError({
               status: 400,
               message: 'Keyspace already exists',
               hint: this.hints.routes
            });
         }
         if (hlen) {
            throw new ValidationError({
               status: 400,
               message: 'Keyspace already exists (hlen)',
               hint: this.hints.routes
            });
         }
         const [keyspaceId] = await this.redis.multiExecAsync(multi => {
            multi.incr(this.adminKey('keyspaces:seq'));
         });
         const expire = Seconds.parse(req.query.expire) || this.config.keyspaceExpire;
         if (req.query && req.query.expire) {
            if (expire < 10)  {
               throw new ValidationError(
                  `Keyspace expiry must be greater than 10 seconds`
               );
            }
            if (expire > this.config.keyspaceExpire)  {
               if (certRole !== 'admin') {
                  throw new ValidationError(
                     `Keyspace expiry must be less than ${Seconds.toDays(this.config.keyspaceExpire)} days for cert role ${certRole}`
                  );
               }
            }
            if (expire > accountExpire)  {
               throw new ValidationError(
                  `Keyspace expiry must be less than ${Seconds.toDays(accountExpire)} days for this account`
               );
            }
         }
         const [hmset] = await this.redis.multiExecAsync(multi => {
            multi.hmset(this.accountKey(account, keyspace), {
               expire, role, registered: time
            });
         });
         if (hmset !== 'OK') {
            throw ValidationError({
               message: 'Failed to register keyspace',
            });
         }
         await this.sendTelegramAlert(account, 'html', [
            `Registered new keyspace <code>${keyspace}</code>`,
         ]);
         return 'OK';
      });
      this.addAccountCommand({
         key: 'keyspaces',
         params: ['account'],
         description: 'list account keyspaces',
         relatedCommands: ['create-keyspace'],
         dangerousRelatedCommands: ['destroy-keyspace'],
         renderHtmlEach: (req, res, reqx, keyspace) => {
            this.logger.debug('renderHtmlEach', keyspace);
            return `<a href="/ak/${reqx.account}/${keyspace}/help">${keyspace}</a>`;
         },
         access: 'admin'
      }, async (req, res, reqx) => {
         this.logger.debug('keyspaces', reqx.command.key, reqx.account, this.accountKey(reqx.account, 'keyspaces'));
         const [keyspaces] = await this.redis.multiExecAsync(multi => {
            multi.smembers(this.accountKey(reqx.account, 'keyspaces'));
         });
         if (keyspaces) {
            keyspaces.sort();
         }
         return keyspaces;
      });
      this.addKeyspaceCommand({
         key: 'set-keyspace-access',
         params: ['access'],
         relatedCommands: ['ttls'],
         access: 'admin'
      }, async (req, res, {account, keyspace, accountKeyspace}, multi) => {
         this.logger.debug('access params', accountKeyspace, req.params);
         if (!lodash.includes(AccessKeys, req.params.access)) {
            throw new ValidationError('Invalid access key. Must be one of: ' + AccessKeys.join(', '));
         }
         const publishedSetKey = this.accountKeyspace(account, keyspace, 'published-keys');
         if (req.params.access === 'open') {
            multi.sadd(this.accountKey(account, 'open-keyspaces'), keyspace);
            const virtualKeys = await this.scanVirtualKeys(account, keyspace, '*', 999);
            virtualKeys.forEach(key => multi.sadd(publishedSetKey, key));
         } else {
            multi.srem(this.accountKey(account, 'open-keyspaces'), keyspace);
            multi.del(publishedSetKey);
         }
         return await this.redis.hsetAsync(accountKeyspace, 'access', req.params.access);
      });
      this.addKeyspaceCommand({
         key: 'destroy-keyspace',
         access: 'admin'
      }, async (req, res, {account, keyspace, accountKey, keyspaceKey}) => {
         const [keys] = await this.redis.multiExecAsync(multi => {
            multi.keys(this.keyspaceKey(account, keyspace, '*'));
         });
         const [keyspaces] = await this.redis.multiExecAsync(multi => {
            multi.smembers(this.accountKey(account, 'keyspaces'));
         });
         this.logger.info('destroy-keyspace', keyspace, keys.length, keyspaces);
         const keyIndex = this.keyIndex(account, keyspace);
         const multiReply = await this.redis.multiExecAsync(multi => {
            keys.forEach(key => multi.del(key));
            multi.del(this.accountKey(account, 'keyspaces'), keyspace);
            //multi.del(this.accountKey(account, 'certs'));
            //multi.del(accountKey);
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
         key: 'get-keyspace-info',
         access: 'debug',
         description: 'show admin info for this keyspace'
      }, async (req, res, reqx) => {
         this.logger.debug('get-keyspace-info', reqx.accountKeyspace);
         return await this.redis.hgetallAsync(reqx.accountKeyspace);
      });
      this.addAccountCommand({
         key: 'get-account-info',
         access: 'debug',
         description: 'show admin info for this keyspace',
         relatedCommands: ['keyspaces']
      }, async (req, res, reqx) => {
         return await this.redis.hgetallAsync(reqx.accountKey);
      });
      this.addKeyspaceCommand({
         key: 'keys',
         access: 'debug',
         description: 'show keys in this keyspace',
         relatedCommands: ['ttls', 'types']
      }, async (req, res, reqx) => {
         const {account, keyspace} = reqx;
         const keys = await this.redis.keysAsync(this.keyspaceKey(account, keyspace, '*'));
         const keyIndex = this.keyIndex(account, keyspace);
         return keys.map(key => key.substring(keyIndex));
      });
      this.addKeyspaceCommand({
         key: 'types',
         access: 'debug',
         description: 'view all key types in this keyspace',
         relatedCommands: ['ttls']
      }, async (req, res, reqx) => {
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
         key: 'values',
         access: 'debug',
         description: 'view all key values in this keyspace',
         relatedCommands: ['ttls', 'keys']
      }, async (req, res, reqx) => {
         const {account, keyspace} = reqx;
         const keys = await this.redis.keysAsync(this.keyspaceKey(account, keyspace, '*'));
         this.logger.debug('ttl ak', account, keyspace, keys);
         const keyIndex = this.keyIndex(account, keyspace);
         const multi = this.redis.multi();
         keys.forEach(key => multi.type(key));
         const types = await multi.execAsync();
         const result = {};
         const multiValues = this.redis.multi();
         keys.forEach((key, index) => {
            const type = types[index];
            if (type === 'string') {
               multiValues.get(key);
            } else if (type === 'hash') {
               multiValues.hkeys(key);
            } else if (type === 'set') {
               multiValues.smembers(key);
            } else if (type === 'zset') {
               multiValues.type(key);
            } else {
               multiValues.type(key);
            }
         });
         let values = await multiValues.execAsync();
         values = values.map((value, index) => {
            const type = types[index];
            if (type !== 'string' && typeof value !== 'string' && lodash.isArray(value)) {
               return value.join(', ');
            } else {
               return value;
            }
         });
         keys.forEach((key, index) => result[key.substring(keyIndex)] = values[index]);
         return result;
      });
      this.addKeyspaceCommand({
         key: 'ttls',
         access: 'debug',
         description: 'view all TTLs in this keyspace',
         relatedCommands: ['keyspaces', 'keys', 'values', 'types']
      }, async (req, res, reqx) => {
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
         description: 'check the key TTL',
         relatedCommands: ['type']
      }, async (req, res, reqx) => {
         return await this.redis.ttlAsync(reqx.keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'type',
         params: ['key'],
         access: 'debug',
         description: 'check the type of a key',
         relatedCommands: ['ttl']
      }, async (req, res, reqx) => {
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
            throw new ValidationError({
               status: 403,
               message: 'No client cert',
               hint: this.hints.signup
            });
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
         relatedCommands: ['sismember', 'scard', 'type', 'ttl'],
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
         description: 'check that the value exists in your set',
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
         relatedCommands: ['llen'],
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
         relatedCommands: ['llen'],
      }, async (req, res, reqx) => {
         return await this.redis.rpopAsync(reqx.keyspaceKey);
      });
      this.addKeyspaceCommand({
         key: 'brpop',
         params: ['key', 'timeout'],
         access: 'set',
         description: 'get and remove the last element of the list (blocking)',
         relatedCommands: ['llen'],
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
         relatedCommands: ['llen'],
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
         exampleKeyParams: {
            index: 1
         },
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
         relatedCommands: ['hget', 'hgetall', 'hkeys', 'hvals', 'type', 'ttl']
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
         return await this.redis.hvalsAsync(reqx.keyspaceKey);
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

   addPublicCommand(command, handleReq) {
      handleReq = handleReq || command.handleReq;
      assert(Values.isDefined(handleReq), command.key);
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
            this.logger.debug('command', command.key);
            const result = await handleReq(req, res, {command});
            if (command.access === 'redirect') {
            } else if (result !== undefined) {
               await Result.sendResult(command, req, res, {}, result);
            }
         } catch (err) {
            this.sendError(req, res, err);
         }
      });
      this.addCommand(command);
   }

   addPublicRoute(uri, handleReq) {
      uri = [this.config.location, uri].join('/');
      this.logger.debug('addPublicRoute', uri);
      this.expressApp.get(uri, async (req, res) => {
         try {
            const result = await handleReq(req, res);
            if (result !== undefined) {
               await Result.sendResult({}, req, res, {}, result);
            }
         } catch (err) {
            this.sendError(req, res, err);
         }
      });
   }

   addRegisterRoutes() {
      this.addPublicCommand({
         key: 'register-ephemeral' // TODO remove 10 june
      }, async (req, res) => {
         req.params = {account: 'hub'};
         return this.createEphemeral(req, res);
      });
      this.addPublicCommand({
         key: 'create-ephemeral'
      }, async (req, res) => {
         req.params = {account: 'hub'};
         return this.createEphemeral(req, res);
      });
      this.addPublicCommand({
         key: 'create-ephemeral-named',
         params: ['keyspace', 'access']
      }, async (req, res) => {
         req.params = {account: 'hub'};
         return this.createEphemeral(req, res);
      });
      this.addPublicCommand({
         key: 'create-ephemeral-access',
         params: ['access']
      }, async (req, res) => {
         req.params.account = 'hub';
         return this.createEphemeral(req, res);
      });
      this.addPublicCommand({
         key: 'create-account-telegram',
         params: ['account'],
         description: 'create a new account linked to an authoritative Telegram.org account'
      }, async (req, res, reqx) => {
         return this.createAccount(req, res, reqx);
      });
      this.addPublicCommand({
         key: 'destroy-account',
         params: ['account'],
         dangerous: true, // TODO
         description: 'destroy an account'
      }, async (req, res, reqx) => {
         let {account, accountKey} = reqx;
         const scard = await this.redis.multiExecAsync(multi => {
            multi.scard(this.accountKey(account, 'keyspaces'));
         });
         if (scard > 0) {
            throw {message: 'All keyspaces must be destroyed individually first'};
         }
         this.logger.error('not implemented', reqx);
         throw {message: 'Not implemented. Bug @evanxsummers after 24 June'}; // TODO
      });
      this.addPublicCommand({
         key: 'register-cert',
         relatedCommands: ['create-keyspace', 'keyspaces']
      }, require('./handlers/registerCert').default);
   }

   getClientCert(req) {
      let cert = req.get('ssl_client_cert');
      if (cert) {
         cert = cert.replace(/\t/g, '\n');
      }
      return cert;
   }

   parseCertDn(req) {
      const dn = req.get('ssl_client_s_dn');
      if (!dn) throw new ValidationError({message: 'No client cert DN', hint: this.hints.signup});
      return this.parseDn(dn);
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
         }, async (req, res, {account, accountKey, time, certDigest, certRole}) => {
            const [cert] = await this.redis.multiExecAsync(multi => {
               multi.hgetall(this.adminKey('cert', certId));
            });
            throw new ApplicationError('Unimplemented');
         });
      }
   }

   async createAccount(req, res) {
      try {
         let errorMessage = this.validateRegisterTime();
         if (errorMessage) {
            this.sendError(req, res, {message: errorMessage});
            return;
         }
         const {account} = req.params;
         let v = this.validateRegisterAccount(account);
         if (v) {
            throw new ValidationError(v);
         }
         const dn = req.get('ssl_client_s_dn');
         const cert = req.get('ssl_client_cert');
         this.logger.info('createAccount dn', dn);
         if (!cert) {
            throw new ValidationError({message: 'No client cert', hint: this.hints.signup});
         }
         const certDigest = this.digestPem(cert);
         const otpSecret = this.generateTokenKey();
         const accountKey = this.adminKey('account', account);
         const [hsetnx, saddAccount] = await this.redis.multiExecAsync(multi => {
            multi.hsetnx(accountKey, 'registered', Seconds.now());
            multi.sadd(this.adminKey('accounts'), account);
            multi.hsetnx(accountKey, 'expire', this.config.keyExpire);
            multi.sadd(this.adminKey('account', account, 'topt'), otpSecret);
         });
         if (!hsetnx) {
            throw {message: 'Account already exists (hashes)'};
         }
         if (!saddAccount) {
            throw {message: 'Account already exists (set)'};
         }
         const [saddCert] = await this.redis.multiExecAsync(multi => {
            multi.sadd(this.adminKey('account', account, 'certs'), certDigest);
         });
         if (!saddCert) {
            throw {message: 'Cert already exists'};
         }
         const result = this.buildQrReply({
            otpSecret,
            user: account,
            host: this.config.hostDomain,
            label: this.config.serviceLabel
         });
         await Result.sendResult({}, req, res, {account}, result);
      } catch (err) {
         this.sendError(req, res, err);
      }
   }

   async addAccountCommand(command, handleReq) {
      handleReq = handleReq || command.handleReq;
      let uri = [command.key];
      if (command.params) {
         uri = [command.key, ...command.params.map(param => ':' + param)];
      }
      if (command.access !== 'admin') {
         this.logger.warn('AddAccountCommand access', command.access);
      }
      this.expressApp.get([this.config.location, ...uri].join('/'), async (req, res) => {
         const reqx = {command};
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
            this.logger.debug('admin command', {account, accountKey, time, admined, certs});
            if (!admined) {
               //throw {message: 'Invalid account'};
            }
            if (lodash.isEmpty(certs)) {
               throw {message: 'No certs'};
            }
            const duration = time - admined;
            if (duration < this.config.adminLimit) {
               return `Admin command interval not elapsed: ${this.config.adminLimit}s`;
            }
            const {certDigest, certRole} = this.validateCert(req, reqx, certs, account, []);
            Object.assign(reqx, {account, accountKey, time, admined, certDigest, certRole});
            const result = await handleReq(req, res, reqx);
            if (result !== undefined) {
               await Result.sendResult(command, req, res, reqx, result);
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

   async createEphemeral(req, res, previousError) {
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
         this.logger.warn('createEphemeral retry');
      }
      try {
         this.logger.debug('createEphemeral');
         let errorMessage = this.validateRegisterTime();
         if (errorMessage) {
            this.sendError(req, res, {message: errorMessage});
            return;
         }
         let clientIp = req.get('x-forwarded-for');
         this.logger.debug('createEphemeral clientIp', clientIp, account, keyspace);
         const replies = await this.redis.multiExecAsync(multi => {
            multi.hsetnx(this.accountKeyspace(account, keyspace), 'registered', Seconds.now());
            if (clientIp) {
               multi.hsetnx(this.accountKeyspace(account, keyspace), 'clientIp', clientIp);
               if (this.config.addClientIp) {
                  multi.sadd(this.adminKey('keyspaces:ephemeral:ips'), clientIp);
               }
            }
            //this.count(multi, 'keyspaces:ephemeral'); // TODO del old keyspaces:expire
         });
         if (!replies[0]) {
            this.logger.error('keyspace clash', account, keyspace);
            if (!previousError) {
               return this.createEphemeral(req, res, {message: 'keyspace clash'});
            }
            throw {message: 'Keyspace already exists'};
         }
         const replyPath = ['ak', account, keyspace].join('/');
         this.logger.debug('createEphemeral replyPath', replyPath);
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

   addKeyspaceCommand(command, handleReq) {
      if (handleReq) {
         command.handleReq = handleReq;
      }
      assert(command.key, 'command.key');
      command.context = 'keyspace';
      let uri = 'ak/:account/:keyspace';
      command.params = command.params || [];
      const key = command.key + command.params.length;
      this.logger.debug('addKeyspaceCommand', command.key, key, uri);
      this.addCommand(command);
      const handler = this.createKeyspaceHandler(command);
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

   createKeyspaceHandler(command) {
      return async (req, res) => {
         try {
            const {account, keyspace, key, timeout} = req.params;
            assert(account, 'account');
            assert(keyspace, 'keyspace');
            const accountKey = this.accountKey(account);
            const accountKeyspace = this.accountKeyspace(account, keyspace);
            const helpPath = `/ak/${account}/${keyspace}/help`;
            const reqx = {account, keyspace, accountKey, accountKeyspace, key, helpPath, command};
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
            if (req.hostname === this.config.hostDomain) {
            } else if (lodash.endsWith(req.hostname, this.config.keyspaceHostname)) {
               hostname = req.hostname.replace(/\..*$/, '');
               let hostHashes = await this.redis.hgetallAsync(this.adminKey('host', hostname));
               if (!hostHashes) {
                  throw new ValidationError(`Invalid host: ${hostname}`);
               }
               this.logger.debug('hostHashes', hostHashes);
               if (!hostHashes.keyspaces) {
                  throw new ValidationError(`Invalid host: ${hostname}`);
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
            const result = await command.handleReq(req, res, reqx, multi);
            if (result !== undefined) {
               await Result.sendResult(command, req, res, reqx, result);
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
      } else if (['hub', 'pub', 'public', 'ephemeral'].includes(account)) {
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
      if (account !== 'hub' && account !== 'pub') {
         Object.assign(reqx, this.validateCert(req, reqx, certs, account, []));
      }
      if (false) {
         if (command.key === 'create-keyspace') {
            if (reqx.registered) {
               throw new ValidationError({
                  message: 'Already registered',
                  hint: this.hints.routes
               });
            }
         } else if (!reqx.registered) {
            if (account === 'hub' || account === 'pub') {
               throw new ValidationError({
                  message: 'Expired (or unregistered) keyspace',
                  hint: this.hints.createEphemeral
               });
            } else {
               throw new ValidationError({
                  message: 'Unregistered keyspace',
                  hint: this.hints.createEphemeral
               });
            }
         }
      }
      if (command.access) {
         if (command.access === 'admin') {
            if (!reqx.admined) {
               this.logger.warn('validateAccess admined', keyspace, command.key, time);
            } else {
               const duration = time - reqx.admined;
               if (duration < this.config.adminLimit) {
                  throw new ValidationError({
                     message: `Admin command interval not elapsed: ${this.config.adminLimit}s`
                  });
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
   }

   validateCert(req, reqx, certs, account, roles) {
      if (this.config.disableValidateCert) {
         return {};
      }
      if (!certs) {
         throw new ValidationError({
            status: 403,
            message: 'No granted certs',
            hint: this.hints.signup
         });
      }
      const cert = req.get('ssl_client_cert');
      if (!cert) {
         throw new ValidationError({
            status: 403,
            message: 'No client cert sent',
            hint: this.hints.signup
         });
      }
      const dn = req.get('ssl_client_s_dn');
      if (!dn) throw new ValidationError({
         status: 400,
         message: 'No client cert DN',
         hint: this.hints.signup
      });
      const names = this.parseDn(dn);
      if (names.o !== account) throw new ValidationError({
         status: 403,
         message: 'Cert O name mismatches account',
         hint: this.hints.registerCert
      });
      const certRole = names.ou;
      if (!lodash.isEmpty(roles) && !roles.includes(certRole)) throw new ValidationError({
         status: 403,
         message: 'No role access',
         hint: this.hints.registerCert
      });
      const certDigest = this.digestPem(cert);
      if (!certs.includes(certDigest)) {
         this.logger.warn('validateCert', account, certRole, certDigest, certs);
         throw new ValidationError({
            status: 403,
            message: 'Invalid cert',
            hint: this.hints.registerCert
         });
      }
      return {certDigest, certRole};
   }

   keyIndex(account, keyspace) {
      return [this.config.redisKeyspace, account, keyspace].reduce((previousValue, currentValue) => {
         return previousValue + currentValue.length
      }, 3);
   }

   accountKey(account, ...more) {
      return this.adminKey('account', account, ...more);
   }

   accountKeyspace(account, keyspace, ...more) {
      return [this.config.redisKeyspace, 'ak', account, keyspace, ...more].join(':');
   }

   keyspaceKey(account, keyspace, key) {
      return [this.config.redisKeyspace, account, keyspace, key].join('~');
   }

   adminKey(...parts) {
      return [this.config.redisKeyspace, ...parts].join(':');
   }

   isDevelopment(req) {
      return req.hostname === 'localhost' && process.env.NODE_ENV === 'development';
   }

   async scanVirtualKeys(account, keyspace, match, count) {
      let keys = await this.redis.keysAsync(this.keyspaceKey(account, keyspace, '*')); // TODO
      if (count > 0 && keys.length > count) {
         keys = keys.slice(0, count);
      }
      this.logger.error('scanVirtualKeys TODO', keys.length, account, keyspace, match, count);
      const keyIndex = this.keyIndex(account, keyspace);
      const virtualKeys = keys.map(key => key.substring(keyIndex));
      return virtualKeys;
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

   getContentType(req) {
      return this.isBrowser(req)? 'html' : 'plain';
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
      if (lodash.isError(err) && err.name !== 'ValidationError') {
         this.logger.warn(err);
      }
      if (err.context) {
         this.logger.warn(err.context);
      }
      try {
         this.sendStatusMessage(req, res, err.status || 500, err);
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
         this.logger.debug('sendStatusMessage', err, req.params);
         if (err.code === 'WRONGTYPE') {
            const {account, keyspace, key} = req.params;
            title = 'Wrong type for key';
            if (account && keyspace && key) {
               hints.push({
                  message: `Check the key type`,
                  uri: ['ak', account, keyspace, 'type', key].join('/')
               });
            }
         } else if (err.message) {
            title = err.message;
         }
         if (err.hint) {
            hints.push(err.hint);
         }
         if (err.hints) {
            hints = hints.concat(err.hints);
         }
         hints = hints.map(hint => {
            hint = Object.assign({}, hint);
            if (hint.url) {
               if (hint.message) {
                  if (this.isBrowser(req)) {
                  } else if (hint.message) {
                     hint.message = hint.message.replace(/<\/?(b|tt|i|code|pre)>/g, '');
                  }
               }
            } else if (hint.uri) {
               let url;
               if (this.isBrowser(req)) {
                  url = `/${hint.uri}`;
               } else if (/localhost/.test(req.hostname)) {
                  url = `http://localhost:8765/${hint.uri}`;
               } else {
                  url = `https://${req.hostname}/${hint.uri}`;
               }
               hint.url = url;
            }
            return hint;
         });
         if (err.stack) {
            if (err.name === 'ValidationError') {
            } else if (err.name === 'Error' && err.code) {
               if (!['WRONGTYPE'].includes(err.code)) {
                  messageLines.push(err.code);
               }
            } else if (err.name) {
               messageLines.push(err.name);
            } else if (!lodash.isError(err)) {
            } else if (err.stack) {
               messageLines.push(err.stack.split('\n').slice(0, 2));
            }
         }
      } else {
         this.logger.error('sendStatusMessage type', typeof err, err);
         err = 'unexpected error type: ' + typeof err;
         messageLines.push(Object.keys(err).join(' '));
      }
      if (!hints.length) {
         hints.push(this.hints.routes);
      }
      const heading = [Hc.b('Status'), Hc.tt(statusCode)].join(' ');
      if (this.isBrowser(req)) {
         this.logger.debug('hints', hints);
         res.set('Content-Type', 'text/html');
         res.status(statusCode).send(renderPage({
            backPath: '/routes',
            config: this.config,
            req, reqx, title, heading,
            content: [
               //Hs.div(styles.error.status, `Status ${statusCode}`),
               He.div({style: styles.error.message}, title),
               He.pre({
                  style: styles.error.detail,
                  meta: 'optional'
               }, lodash.flatten(messageLines).join('\n')),
               hints.map(hint => {
                  this.logger.debug('hint', hint);
                  const attributes = {
                     style: styles.error.hintContainer,
                     href: hint.url
                  };
                  if (hint.url[0] !== '/') {
                     attributes.target = '_blank';
                  }
                  if (hint.clipboard) {
                     attributes.onClick = `window.prompt('Copy to clipboard via Ctrl-C', '${hint.clipboard}')`;
                  }
                  return He.a(attributes, lodash.flatten([
                     Hso.div(styles.error.hintMessage, hint.message),
                     Hso.div(styles.error.hintDescription, hint.description)
                  ]))
               }),
            ]
         }));
      } else {
         messageLines = messageLines.concat(hints.map(hint => {
            if (true) {
               return lodash.compact([hint.message]);
            } else {
               return lodash.compact([hint.message, hint.url]);
            }
         }));
         this.logger.warn('status lines', req.path, statusCode, messageLines);
         this.logger.debug('messageLines', messageLines, lodash.flatten(messageLines), hints);
         res.status(statusCode).send(lodash.flatten([title, ...messageLines]).join('\n') + '\n');
      }
   }

   splitPem(pem) {
      const lines = pem.split(/[\n\t]/);
      if (lines.length < 8) {
         throw new ValidationError('Invalid lines');
      }
      if (!/^-+BEGIN CERTIFICATE/.test(lines[0])) {
         throw new ValidationError('Invalid first line');
      }
      const contentLines = lines.filter(line => line.length > 16 && !/^--/.test(line));
      if (contentLines.length < 8) {
         throw new ValidationError('Invalid lines');
      }
      return contentLines;
   }

   extractPem(pem) {
      const contentLines = this.splitPem(pem);
      return contentLines[4].slice(-12);
   }

   digestPem(pem) {
      const contentLines = this.splitPem(pem);
      const content = contentLines.join('');
      const sha1 = crypto.createHash('sha1');
      sha1.update(new Buffer(content));
      const digest = sha1.digest('hex');
      this.logger.debug('digestPem', digest);
      if (digest.length < 32) {
         throw new ValidationError({
            status: 400,
            message: 'Invalid cert length'
         });
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
