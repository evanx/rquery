
const logger = Loggers.create(module.filename);
const rquery = global.rquery;

export default async function registerCert(req, res, reqx) {
   const cert = rquery.getClientCert(req);
   if (!cert) throw new ValidationError({
      status: 403,
      message: 'No client cert',
      hint: rquery.hints.signup
   });
   const certFingerprint = rquery.getClientCertFingerprint(req);
   if (!certFingerprint) throw new ValidationError({
      status: 500,
      message: 'No client cert certFingerprint'
   });
   const dn = rquery.parseCertDn(req);
   if (!dn.ou) throw new ValidationError({
      status: 400,
      message: 'No client cert OU name',
      hint: rquery.hints.signup
   });
   const [type, account, role, id] = dn.cn.split(':');
   const clientId = [dn.cn, '#', certFingerprint.slice(0, 6), ':' + certFingerprint.slice(-6)].join('');
   logger.debug('CN', dn, type, {account, role, id}, {clientId});
   if (type !== 'ws' || !account || !role || !id) {
      throw new ValidationError({
         status: 400,
         message: `Invalid cert CN. Expect: 'ws:account:role:id'`,
         hint: rquery.hints.signup
      });
   }
   if (dn.ou !== role) {
      throw new ValidationError({
         status: 400,
         message: `Cert OU/role mismatch. Expect role as per CN.`,
         hint: rquery.hints.signup
      });
   }
   if (dn.o !== account) {
      throw new ValidationError({
         status: 400,
         message: `Cert O/account mismatch. Expect account as per CN.`,
         hint: rquery.hints.signup
      });
   }
   const accountKey = rquery.adminKey('account', account);
   const grantKey = rquery.adminKey('telegram', 'user', account, 'grant');
   const [granted, sismember] = await rquery.redis.multiExecAsync(multi => {
      multi.get(grantKey);
      multi.sismember(rquery.adminKey('account', account, 'certs'), clientId);
   });
   if (sismember) {
      throw new ValidationError({
         status: 200,
         message: 'Cert already granted',
         hint: rquery.hints.routes
      });
   }
   if (!granted) {
      throw new ValidationError({message: `Cert must be granted via https://telegram.me/${rquery.config.adminBotName}`,
         status: 403,
         hint: {
            message: [
               `/grant ${clientId}`
            ].join(' '),
            clipboard: `/grant ${clientId}`,
            url: `https://telegram.me/${rquery.config.adminBotName}?start`
         }
      });
   }
   if (clientId.indexOf(granted) < 0) {
      throw new ValidationError({
         status: 400,
         message: 'Granted cert not matching: ' + clientId,
         hint: {
            message: `Try @${rquery.config.adminBotName} "/grant ${clientId}"`
            + ` from the authoritative Telegram account`
            + ` e.g. via https://web.telegram.org`
            ,
            clipboard: `/grant ${clientId}`,
            url: `https://telegram.me/${rquery.config.adminBotName}?start`
         }
      });
   }
   const [del, sadd, hmset] = await rquery.redis.multiExecAsync(multi => {
      multi.del(grantKey);
      multi.sadd(rquery.adminKey('account', account, 'certs'), clientId);
      multi.hmset(rquery.adminKey('account', account, 'cert', clientId), {account, role, id});
   });
   if (!sadd) {
      logger.debug('certs sadd');
   }
   if (!del) {
      logger.warn('certs grant del');
   }
   return {account};
}
