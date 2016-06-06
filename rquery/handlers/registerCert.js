
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
      status: 422,
      message: 'No client cert OU name',
      hint: rquery.hints.signup
   });
   const [matching, account, role, id] = dn.cn.split(':');
   logger.debug('CN', matching);
   if (!matching) {
      throw new ValidationError({
         status: 422,
         message: 'Cert CN mismatch',
         hint: rquery.hints.signup
      });
   }
   if (dn.ou !== role) {
      throw new ValidationError({
         status: 422,
         message: 'Cert OU/role mismatch',
         hint: rquery.hints.signup
      });
   }
   if (dn.o !== account) {
      throw new ValidationError({
         status: 422,
         message: 'Cert O/account mismatch',
         hint: rquery.hints.signup
      });
   }
   const accountKey = rquery.adminKey('account', account);
   const grantKey = rquery.adminKey('telegram', 'user', account, 'grantcert');
   const certDigest = rquery.digestPem(cert);
   const shortDigest = certDigest.slice(-12);
   const pemExtract = rquery.extractPem(cert);
   const [granted, sismember] = await rquery.redis.multiExecAsync(multi => {
      multi.get(grantKey);
      multi.sismember(rquery.adminKey('account', account, 'certs'), certDigest);
   });
   if (sismember) {
      throw new ValidationError({message: 'Cert granted', hint: rquery.hints.routes});
   }
   if (!granted) {
      throw new ValidationError({message: 'Cert must be granted via @redishub_bot',
         hint: {
            message: [
               `Try @redishub_bot "/grantcert ${shortDigest}"`,
               `e.g. via https://web.telegram.org,`,
            ].join(' '),
            clipboard: `@redishub_bot /grantcert ${shortDigest}`,
            url: `https://web.telegram.org/#/im?p=@redishub_bot#grantcert-${shortDigest}`
         }
      });
   }
   if (granted.indexOf(shortDigest) < 0 &&
   certDigest.indexOf(granted) < 0 &&
   pemExtract != granted) {
      throw new ValidationError({message: 'Granted cert not matching: ' + shortDigest,
         hint: {
            message: `Try @redishub_bot "/grantcert ${shortDigest}`
            + ` from the authoritative Telegram account`
            + ` e.g. via https://web.telegram.org`
            ,
            clipboard: `@redishub_bot /grantcert ${shortDigest}`,
            url: `https://web.telegram.org/#/im?p=@redishub_bot#grantcert-${shortDigest}`
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
