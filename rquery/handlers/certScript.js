

export async function handleCertScriptHelp(req, res, reqx, {config}) {
   if (req.query.dir && ['', '.', '..'].includes(req.query.dir)) {
      throw new ValidationError('Empty or invalid "dir"');
   }
   const dir = req.query.dir || config.clientCertHomeDir + '/live';
   const archive = req.query.archive || config.clientCertHomeDir + '/archive';
   const isArchive = Values.isDefined(req.query.archive);
   if (isArchive && req.query.dir) {
      if (!req.query.dir.match(/^[~\/a-z0-9\.]+(live|cert)$/i)) {
         throw new ValidationError('Invalid "dir" for archive');
      }
   }
   const commandKey = reqx.command.key;
   const serviceUrl = config.hostUrl;
   const account = req.params.account;
   const curlAccount = `curl -s -E ${dir}/privcert.pem ${serviceUrl}/ak/${account}`;
   const helpResult = [
      ``,
      `  To force archiving an existing ${dir}, add '?archive' to the URL:`,
      ``,
      `    curl -s ${serviceUrl}/${commandKey}/${account}?archive | bash`,
      ``,
      `  This will first move ${dir} to ${archive}/TIMESTAMP first.`,
      ``,
      `  See your privcerts: ${dir}/privcert.pem (curl) and/or privcert.p12 (browser)`,
      ``,
      `  For example, create a keyspace called 'tmp10days' as follows:`,
      `    ${curlAccount}/tmp10days/create-keyspace`,
      ``,
      `  Then try Redis commands on this keyspace for example:`,
      `    ${curlAccount}/tmp10days/help`,
      `    ${curlAccount}/tmp10days/set/mykey/myvalue`,
      `    ${curlAccount}/tmp10days/get/mykey`,
      ``,
      `  Then in your browser, load 'privcert.p12' and try:`,
      `    ${serviceUrl}/ak/${account}/tmp10days/help`,
      ``,
      `  For CLI convenience, install rhcurl bash script, as per instructions:`,
      `    curl -s -L https://raw.githubusercontent.com/evanx/redishub/master/docs/install.rhcurl.txt`,
      ``,
   ];
   return lodash.flatten(helpResult);
}

export async function handleCertScript(req, res, reqx, {config}) {
   if (req.query.dir && ['', '.', '..'].includes(req.query.dir)) {
      throw new ValidationError('Empty or invalid "dir"');
   }
   const dir = req.query.dir || config.clientCertHomeDir + '/live';
   const archive = req.query.archive || config.clientCertHomeDir + '/archive';
   const isArchive = Values.isDefined(req.query.archive);
   if (isArchive && req.query.dir) {
      if (!req.query.dir.match(/^[~\/a-z0-9\.]+(live|cert)$/i)) {
         throw new ValidationError('Invalid "dir" for archive');
      }
   }
   const commandKey = reqx.command.key;
   const serviceUrl = config.hostUrl;
   const account = req.params.account;
   const role = req.params.role || req.query.role || 'admin';
   const id = req.params.id || req.query.id || 'admin';
   const CN = [config.certPrefix, account, role, req.params.clientId || req.query.clientId || id].join(':');
   const OU = role;
   const O = account;
   const curlAccount = `curl -s -E \${dir}/privcert.pem \${serviceUrl}/ak/\${account}`;
   let result = [
      ``,
      `Curl this script and pipe into bash as follows to create key dir ~/.redishub/live:`,
      ``,
      `curl -s '${serviceUrl}/${commandKey}/${account}' | bash`,
      ``,
   ].map(line => `# ${line}`);
   result = result.concat([
      ``,
      `  set -u -e`,
      ``,
      `  account='${account}'`,
      `  role='${role}'`,
      `  id='${id}'`,
      ``,
      `  CN='${CN}' # unique cert name (certPrefix, account, role, id)`,
      `  OU='${OU}' # role for this cert`,
      `  O='${O}' # account name`,
      ``,
      `  dir=${dir} # must not exist, or be archived`,
      `  # Note that the following files are created in this dir:`,
      `  # account privkey.pem cert.pem privcert.pem privcert.p12 x509.txt cert.extract.txt`,
      `  commandKey='${commandKey}'`,
      `  serviceUrl='${serviceUrl}'`,
      `  archive=${archive}`,
      `  certWebhook="\${serviceUrl}/create-account-telegram/\${account}"`,
      ``,
   ]);
   if (Values.isDefined(req.query.archive)) {
      result = result.concat([
         `  mkdir -p \${archive} # ensure dir exists`,
         `  mv -n \${dir} \${archive}/\`date +'%Y-%m-%dT%Hh%Mm%Ss%s'\``,
      ]);
   } else if (!lodash.isEmpty(req.query.dir) && !req.query.dir.includes(config.clientCertHomeDir)) {
      logger.debug('certScript dir', req.query.dir, config.clientCertHomeDir);
   } else {
      result = result.concat([
         `  mkdir -p ${config.clientCertHomeDir} # ensure default dir exists`,
      ]);
   }
   result = result.concat([
      `  curl -s https://raw.githubusercontent.com/evanx/redishub/master/bin/cert-script.sh -O`,
      `  cat cert-script.sh`,
      `  sha1sum cert-script.sh`,
      `  curl -s https://redishub.com/assets/cert-script.sh.sha1sum`,
      `  echo 'Press Ctrl-C in the next 8 seconds if the above hashes do not match'`,
      `  sleep 4`,
      `  source <(cat cert-script.sh)`,
      `)`,
   ]);
   result.push('');
   return lodash.flatten(result);
}
