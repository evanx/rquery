
import expressLib from 'express';
import marked from 'marked';
import crypto from 'crypto';
import CSON from 'season';
import base32 from 'thirty-two';
import speakeasy from 'speakeasy';
import otp from 'otplib/lib/totp';
import concatStream from 'concat-stream';

import * as Files from './Files';
import * as Express from './Express';

const unsupportedAuth = ['twitter.com', 'github.com', 'gitlab.com', 'bitbucket.org'];
const supportedAuth = ['telegram.org'];

export default class {

   async init() {
      this.logger.info('init');
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
         const [account, keyspace] = Strings.matches(req.path, /^\/ak\/([a-z]+)\/([^\/]+)\//);
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
      this.addPublicCommand({
         key: 'genkey-otp-webhook',
         params: ['host', 'user', 'webhookDomain']
      }, async (req, res) => {
         const {user, host, webhook} = req.params;
         if (!/^[a-z][a-z0-9-\.]+\.[a-z]+$/.test(webhookDomain)) {
            throw {message: 'Invalid webhook host'};
         }
         const supportedDomains = ['test.redishub.com'];
         if (webhookDomain !== supportedDomains[0]) {
            throw {message: 'Webhook host not supported. Try: ' + supportedDomains[0]};
         }
         const uri = ['webhook', this.config.serviceName, host, user].join('/');
         const url = `https://${webhook}/${uri}`;
         this.logger.debug('webhook url', url, host, user);
         const response = await Requests.head({url, timeout: this.config.webhookTimeout});
         if (response.statusCode !== 200) {
            throw {message: `Webhook ` + response.statusCode, url};
         }
         return this.buildQrReply({user, host});
      });
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
