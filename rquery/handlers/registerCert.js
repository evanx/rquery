
const logger = Loggers.create(module.filename);
const rquery = global.rquery;

export default async function registerCert(req, res, reqx) {
   const cert = rquery.getClientCert(req);
   if (!cert) throw new ValidationError({
      status: 403,
      message: 'No client cert',
      hint: rquery.hints.signup
   });
   const dn = rquery.parseCertDn(req);
   if (!dn.ou) throw new ValidationError({
      status: 400,
      message: 'No client cert OU name',
      hint: rquery.hints.signup
   });
   const [matching, account, role, id] = dn.cn.split(':');
   logger.debug('CN', dn, matching, {account, role, id});
   if (!matching) {
      throw new ValidationError({
         status: 400,
         message: 'Cert CN mismatch',
         hint: rquery.hints.signup
      });
   }
   if (dn.ou !== role) {
      throw new ValidationError({
         status: 400,
         message: 'Cert OU/role mismatch',
         hint: rquery.hints.signup
      });
   }
   if (dn.o !== account) {
      throw new ValidationError({
         status: 400,
         message: 'Cert O/account mismatch',
         hint: rquery.hints.signup
      });
   }
   const accountKey = rquery.adminKey('account', account);
   const grantKey = rquery.adminKey('telegram', 'user', account, 'grant');
   const certDigest = rquery.digestPem(cert);
   const shortDigest = certDigest.slice(-12);
   logger.debug('cert', certDigest);
   const [granted, sismember] = await rquery.redis.multiExecAsync(multi => {
      multi.get(grantKey);
      multi.sismember(rquery.adminKey('account', account, 'certs'), certDigest);
   });
   if (sismember) {
      throw new ValidationError({
         status: 200,
         message: 'Cert already granted',
         hint: rquery.hints.routes
      });
   }
   if (!granted) {
      throw new ValidationError({message: `Cert must be granted via @${rquery.config.adminBotName}`,
         status: 403,
         hint: {
            message: [
               `Try @${rquery.config.adminBotName} "/grant ${certDigest}"`,
               `e.g. via https://web.telegram.org`,
            ].join(' '),
            clipboard: `/grant ${certDigest}`,
            url: `https://telegram.me/${rquery.config.adminBotName}?start`
         }
      });
   }
   if (granted.indexOf(shortDigest) < 0 &&
   certDigest.indexOf(granted) < 0) {
      throw new ValidationError({
         status: 400,
         message: 'Granted cert not matching: ' + certDigest,
         hint: {
            message: `Try @${rquery.config.adminBotName} "/grant ${certDigest}"`
            + ` from the authoritative Telegram account`
            + ` e.g. via https://web.telegram.org`
            ,
            clipboard: `/grant ${certDigest}`,
            url: `https://telegram.me/${rquery.config.adminBotName}?start`
         }
      });
   }
   const [del, sadd] = await rquery.redis.multiExecAsync(multi => {
      multi.del(grantKey);
      multi.sadd(rquery.adminKey('account', account, 'certs'), certDigest);
   });
   if (!sadd) {
      logger.debug('certs sadd');
   }
   if (!del) {
      logger.warn('certs grant del');
   }
   return {account};
}
