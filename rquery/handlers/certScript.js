
const certScriptSha = 'aee902de05dc8e85a7592c85fb074c65fb77043c';

const logger = Loggers.create(module.filename);

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
      `  Find your privcerts: ${dir}/privcert.pem (curl) and/or privcert.p12 (browser)`,
      `  For example, create a keyspace called 'tmp10days' as follows:`,
      `    ${curlAccount}/tmp10days/create-keyspace`,
      `  Then try Redis commands on this keyspace, for example:`,
      `    ${curlAccount}/tmp10days/help`,
      `    ${curlAccount}/tmp10days/set/mykey/myvalue`,
      `    ${curlAccount}/tmp10days/get/mykey`,
      ``,
      `  In your browser, load 'privcert.p12' and try:`,
      `    ${serviceUrl}/ak/${account}/tmp10days/help`,
      ``,
      `  For CLI convenience, install wscurl bash script, as per instructions:`,
      `    curl -s -L ${config.docUrl}/install.wscurl.txt`,
      ``,
   ];
   return lodash.flatten(helpResult);
}

export async function handleCertScript(req, res, reqx, {config}) {
   if (req.query.dir && ['', '.', '..'].includes(req.query.dir)) {
      throw new ValidationError('Empty or invalid "dir"');
   }
   const defaultDir = config.clientCertHomeDir + '/live';
   const dir = req.query.dir || defaultDir;
   const archive = req.query.archive || config.clientCertHomeDir + '/archive';
   const isArchive = Values.isDefined(req.query.archive);
   if (isArchive && req.query.dir) {
      if (!req.query.dir.match(/^[~\/a-z0-9\.]+(live|cert)$/i)) {
         throw new ValidationError('Invalid "dir" for archive');
      }
   }
   const commandKey = reqx.command.key;
   const serviceUrl = config.hostUrl;
   const telegramBot = config.adminBotName;
   const account = req.params.account;
   const role = req.params.role || req.query.role || 'admin';
   const dateIso = new Date().toISOString();
   const timestampId = ['admin', dateIso.slice(0, 10).replace(/-/g, ''), dateIso.slice(11, 16).replace(/:/, 'h'), new Date().getTime().toString().slice(-8, -3)].join('-');
   const id = req.params.id || req.query.id || timestampId;
   const CN = [config.certPrefix, account, role, req.params.clientId || req.query.clientId || id].join(':');
   const OU = role;
   const O = account;
   const curlAccount = `curl -s -E \${dir}/privcert.pem \${serviceUrl}/ak/\${account}`;
   let result = [
      `Please read and review: https://webserva.com/docs/register-cert.md`,
      `Curl this script and pipe it into bash for execution, as per the following line:`,
      `curl -s 'https://${config.openHostname}/${commandKey}/${account}' | bash`,
      ``,
   ].map(line => `# ${line}`);
   result = result.concat([
      `( # create subshell for local vars and to enable set -u -e`,
      `  set -u -e # error exit if any undeclared vars or unhandled errors`,
      `  account='${account}' # same as Telegram.org username`,
      `  role='${role}' # role for the cert e.g. admin`,
      `  id='${id}' # user/device id for the cert`,
      `  CN='${CN}' # unique cert name (certPrefix, account, role, id)`,
      `  OU='${OU}' # role for this cert`,
      `  O='${O}' # account name`,
      `  dir=${dir} # must not exist, or be archived`,
      `  # Note that the following files are created in this dir:`,
      `  # account privkey.pem cert.pem privcert.pem privcert.p12 x509.txt cert.extract.txt`,
      `  commandKey='${commandKey}'`,
      `  serviceUrl='${serviceUrl}' # for cert access control`,
      `  telegramBot='${telegramBot}' # bot for granting cert access`,
      `  archive='${archive}' # directory to archive existing live dir when ?archive`,
      `  certWebhook='${serviceUrl}/create-account-telegram/${account}'`,
   ]);
   if (Values.isDefined(req.query.archive)) {
      result = result.concat([
         `  if [ -d ${dir} ]`,
         `  then`,
         `    mkdir -p ${archive} # ensure dir exists`,
         `    mv -ni ${dir} ${archive}/\`date +'%Y-%m-%dT%Hh%Mm%Ss%s'\``,
         `  fi`,
      ]);
   } else if (!lodash.isEmpty(req.query.dir) && !req.query.dir.includes(config.clientCertHomeDir)) {
      logger.info('certScript dir', req.query.dir, config.clientCertHomeDir);
   } else {
      result = result.concat([
         `  mkdir -p ${config.clientCertHomeDir} # ensure default dir exists`,
      ]);
   }
   result = result.concat([
      `  if [ -d ${dir} ] # directory already exists`,
      `  then # must be archived first`,
      `    echo "Directory ${dir} already exists. Try add '?archive' query to the URL."`,
      `  else # fetch, review and check SHA of static cert-script.sh for execution`,
      `    mkdir ${dir} && cd $_ # error exit if dir exists`,
      `    curl -s https://raw.githubusercontent.com/webserva/webserva/master/bin/cert-script.sh -O`,
      `    echo 'Please review and press Ctrl-C to abort within 8 seconds:'`,
      `    cat cert-script.sh # review the above fetched script, we intend to execute`,
      `    echo 'Double checking script integrity hashes:'`,
      `    shasum cert-script.sh # double check its SHA against another source below`,
      `    curl -s https://open.webserva.com/assets/cert-script.sh.shasum`,
      `    echo '${certScriptSha}' # hardcoded SHA of stable version`,
      `    echo 'Press Ctrl-C in the next 8 seconds to abort, and if any of the above hashes differ'`,
      `    sleep 8 # give time to abort if SHAs not consistent, or script review incomplete`,
      `    . ./cert-script.sh # execute fetched script, hence the above review and SHA`,
      `  fi`,
      `)`
   ]);
   result.push('');
   return lodash.flatten(result);
}
