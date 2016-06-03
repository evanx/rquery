

export default async function (req, res, reqx, config) {
   if (req.query.dir && ['', '.', '..'].includes(req.query.dir)) {
      throw new ValidationError('Empty or invalid "dir"');
   }
   const dir = req.query.dir || '~/.redishub/live';
   const archive = req.query.archive || '~/.redishub/archive';
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
   const CN = ['rh', account, role, req.params.clientId || req.query.clientId || 'original'].join(':');
   const OU = role;
   const O = account;
   const help = [
      `To force archiving an existing \${dir}, add '?archive' to the URL:`,
      `   curl -s \${serviceUrl}/\${commandKey}/\${account}?archive | bash`,
      `This will first move \${dir} to \${archive}/TIMESTAMP`,
      ``,
      `Use: \${dir}/privcert.pem (curl) and/or privcert.p12 (browser)`,
      ``,
      `For example, Create a keyspace called 'tmp10days' as follows:`,
      `   curl -s -E ~/.redishub/live/privcert.pem \${serviceUrl}/ak/\${account}/tmp10days/create-keyspace`,
      ``,
      `See help for keyspace 'tmp10days' in your browser as follows:`,
      `   \${serviceUrl}/ak/\${account}/tmp10days/help`,
      ``,
      `For CLI convenience, install rhcurl bash script, as per instructions:`,
      `  curl -s -L https://raw.githubusercontent.com/evanx/redishub/master/docs/install.rhcurl.txt`,
      ``,
   ];
   let result = [
      ``,
      `Curl this script and pipe into bash as follows:`,
      ``,
      `  curl -s ${serviceUrl}/${commandKey}/${account} | bash`,
   ].map(line => `# ${line}`);
   result.push('');
   result.push('(');
   result = result.concat([
      `  dir=${dir} # must not exist, or be archived`,
      `  # Note that the following files are created in this dir:`,
      `  #   account privkey.pem cert.pem privcert.pem privcert.p12 x509.txt`,
      `  commandKey='${commandKey}'`,
      `  serviceUrl='${serviceUrl}'`,
      `  account='${account}'`,
      `  archive=${archive}`,
      `  CN='${CN}' # unique client ID (service, account, role, id)`,
      `  OU='${OU}' # role for this cert`,
      `  O='${O}' # account name`,
      `  certWebhook="\${serviceUrl}/create-account-telegram/\${account}"`,
      ``,
   ]);
   if (Values.isDefined(req.query.archive)) {
      result = result.concat([
         `  mkdir -p \${archive} # ensure dir exists`,
         `  mv -n \${dir} \${archive}/\`date +'%Y-%M-%dT%Hh%Mm%Ss%s'\``,
      ]);
   } else if (!lodash.isEmpty(req.query.dir)) {
   } else {
      result = result.concat([
         `  mkdir -p ~/.redishub # ensure dir exists`,
      ]);
   }
   result = result.concat([
      ``,
      `  if mkdir \${dir} && cd $_`,
      `  then # mkdir ok so directory did not exist`,
      `    echo "\${account}" > account`,
      `    if openssl req -x509 -nodes -days 365 -newkey rsa:2048 \\`,
      `      -subj "/CN=\${CN}/OU=\${OU}/O=\${O}" \\`,
      `      -keyout privkey.pem -out cert.pem`,
      `    then`,
      `      openssl x509 -text -in cert.pem > x509.txt`,
      `      grep 'CN=' x509.txt`,
      `      cat privkey.pem cert.pem > privcert.pem`,
      `      openssl x509 -text -in privcert.pem | grep 'CN='`,
      `      curl -s -E privcert.pem "$certWebhook" ||`,
      `        echo "Registered account \${account} ERROR $?"`,
      `      if ! openssl pkcs12 -export -out privcert.p12 -inkey privkey.pem -in cert.pem`,
      `      then`,
      `        echo; pwd; ls -l`,
      `        echo "ERROR $?: openssl pkcs12 ($PWD)"`,
      `        false # error code 1`,
      `      else`,
      `        echo; pwd; ls -l`,
      `        echo "Exported $PWD/privcert.p12 OK"`,
      `      fi`,
   ]);
   result = result.concat(help.map(line => `      echo "${line}"`));
   result = result.concat([
      `      curl -s https://raw.githubusercontent.com/evanx/redishub/master/docs/install.rhcurl.txt`,
      `    fi`,
      `  fi`,
      ')',
   ]);
   result.push('');
   return lodash.flatten(result);
}
