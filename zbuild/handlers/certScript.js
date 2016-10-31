'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});
exports.handleCertScript = exports.handleCertScriptHelp = undefined;

var _bluebird = require('bluebird');

var handleCertScriptHelp = exports.handleCertScriptHelp = function () {
   var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee(req, res, reqx, _ref) {
      var config = _ref.config;
      var dir, archive, isArchive, commandKey, serviceUrl, account, curlAccount, helpResult;
      return regeneratorRuntime.wrap(function _callee$(_context) {
         while (1) {
            switch (_context.prev = _context.next) {
               case 0:
                  if (!(req.query.dir && ['', '.', '..'].includes(req.query.dir))) {
                     _context.next = 2;
                     break;
                  }

                  throw new ValidationError('Empty or invalid "dir"');

               case 2:
                  dir = req.query.dir || config.clientCertHomeDir + '/live';
                  archive = req.query.archive || config.clientCertHomeDir + '/archive';
                  isArchive = Values.isDefined(req.query.archive);

                  if (!(isArchive && req.query.dir)) {
                     _context.next = 8;
                     break;
                  }

                  if (req.query.dir.match(/^[~\/a-z0-9\.]+(live|cert)$/i)) {
                     _context.next = 8;
                     break;
                  }

                  throw new ValidationError('Invalid "dir" for archive');

               case 8:
                  commandKey = reqx.command.key;
                  serviceUrl = config.hostUrl;
                  account = req.params.account;
                  curlAccount = 'curl -s -E ' + dir + '/privcert.pem ' + serviceUrl + '/ak/' + account;
                  helpResult = ['', '  Find your privcerts: ' + dir + '/privcert.pem (curl) and/or privcert.p12 (browser)', '  For example, create a keyspace called \'tmp10days\' as follows:', '    ' + curlAccount + '/tmp10days/create-keyspace', '  Then try Redis commands on this keyspace, for example:', '    ' + curlAccount + '/tmp10days/help', '    ' + curlAccount + '/tmp10days/set/mykey/myvalue', '    ' + curlAccount + '/tmp10days/get/mykey', '', '  In your browser, load \'privcert.p12\' and try:', '    ' + serviceUrl + '/ak/' + account + '/tmp10days/help', '', '  For CLI convenience, install wscurl bash script, as per instructions:', '    curl -s -L ' + config.docUrl + '/install.wscurl.txt', ''];
                  return _context.abrupt('return', lodash.flatten(helpResult));

               case 14:
               case 'end':
                  return _context.stop();
            }
         }
      }, _callee, this);
   }));
   return function handleCertScriptHelp(_x, _x2, _x3, _x4) {
      return ref.apply(this, arguments);
   };
}();

var handleCertScript = exports.handleCertScript = function () {
   var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee2(req, res, reqx, _ref2) {
      var config = _ref2.config;
      var defaultDir, dir, archive, isArchive, commandKey, serviceUrl, telegramBot, account, role, timestamp, id, CN, OU, O, curlAccount, result;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
         while (1) {
            switch (_context2.prev = _context2.next) {
               case 0:
                  if (!(req.query.dir && ['', '.', '..'].includes(req.query.dir))) {
                     _context2.next = 2;
                     break;
                  }

                  throw new ValidationError('Empty or invalid "dir"');

               case 2:
                  defaultDir = config.clientCertHomeDir + '/live';
                  dir = req.query.dir || defaultDir;
                  archive = req.query.archive || config.clientCertHomeDir + '/archive';
                  isArchive = Values.isDefined(req.query.archive);

                  if (!(isArchive && req.query.dir)) {
                     _context2.next = 9;
                     break;
                  }

                  if (req.query.dir.match(/^[~\/a-z0-9\.]+(live|cert)$/i)) {
                     _context2.next = 9;
                     break;
                  }

                  throw new ValidationError('Invalid "dir" for archive');

               case 9:
                  commandKey = reqx.command.key;
                  serviceUrl = config.hostUrl;
                  telegramBot = config.adminBotName;
                  account = req.params.account;
                  role = req.params.role || req.query.role || 'admin';
                  timestamp = new Date().toISOString().replace(/\D/g, '').slice(0, 12) + '.' + new Date().getTime().toString().slice(-8, -3);
                  id = req.params.id || req.query.id || 'admin' + timestamp;
                  CN = [config.certPrefix, account, role, req.params.clientId || req.query.clientId || id].join(':');
                  OU = role;
                  O = account;
                  curlAccount = 'curl -s -E ${dir}/privcert.pem ${serviceUrl}/ak/${account}';
                  result = ['Curl this script and pipe it into bash for execution, as per the following line:', 'curl -s \'https://' + config.openHostname + '/' + commandKey + '/' + account + '\' | bash', ''].map(function (line) {
                     return '# ' + line;
                  });

                  result = result.concat(['( # create subshell for local vars and to enable set -u -e', '  set -u -e # error exit if any undeclared vars or unhandled errors', '  account=\'' + account + '\' # same as Telegram.org username', '  role=\'' + role + '\' # role for the cert e.g. admin', '  id=\'' + id + '\' # user/device id for the cert', '  CN=\'' + CN + '\' # unique cert name (certPrefix, account, role, id)', '  OU=\'' + OU + '\' # role for this cert', '  O=\'' + O + '\' # account name', '  dir=' + dir + ' # must not exist, or be archived', '  # Note that the following files are created in this dir:', '  # account privkey.pem cert.pem privcert.pem privcert.p12 x509.txt cert.extract.txt', '  commandKey=\'' + commandKey + '\'', '  serviceUrl=\'' + serviceUrl + '\' # for cert access control', '  telegramBot=\'' + telegramBot + '\' # bot for granting cert access', '  archive=\'' + archive + '\' # directory to archive existing live dir when ?archive', '  certWebhook=\'' + serviceUrl + '/create-account-telegram/' + account + '\'']);
                  if (Values.isDefined(req.query.archive)) {
                     result = result.concat(['  if [ -d ' + dir + ' ]', '  then', '    mkdir -p ' + archive + ' # ensure dir exists', '    mv -ni ' + dir + ' ' + archive + '/`date +\'%Y-%m-%dT%Hh%Mm%Ss%s\'`', '  fi']);
                  } else if (!lodash.isEmpty(req.query.dir) && !req.query.dir.includes(config.clientCertHomeDir)) {
                     logger.info('certScript dir', req.query.dir, config.clientCertHomeDir);
                  } else {
                     result = result.concat(['  mkdir -p ' + config.clientCertHomeDir + ' # ensure default dir exists']);
                  }
                  result = result.concat(['  if [ -d ' + dir + ' ] # directory already exists', '  then # must be archived first', '    echo "Directory ' + dir + ' already exists. Try add \'?archive\' query to the URL."', '  else # fetch, review and check SHA of static cert-script.sh for execution', '    mkdir ' + dir + ' && cd $_ # error exit if dir exists', '    curl -s https://raw.githubusercontent.com/webserva/webserva/master/bin/cert-script.sh -O', '    echo \'Please review and press Ctrl-C to abort within 8 seconds:\'', '    cat cert-script.sh # review the above fetched script, we intend to execute', '    echo \'Double checking script integrity hashes:\'', '    shasum cert-script.sh # double check its SHA against another source below', '    curl -s https://open.webserva.com/assets/cert-script.sh.shasum', '    echo \'089d94d8d07854affd6eb538dc10379885a413ae\' # hardcoded SHA of stable version', '    echo \'Press Ctrl-C in the next 8 seconds to abort, and if any of the above hashes differ\'', '    sleep 8 # give time to abort if SHAs not consistent, or script review incomplete', '    . ./cert-script.sh # execute fetched script, hence the above review and SHA', '  fi', ')']);
                  result.push('');
                  return _context2.abrupt('return', lodash.flatten(result));

               case 26:
               case 'end':
                  return _context2.stop();
            }
         }
      }, _callee2, this);
   }));
   return function handleCertScript(_x5, _x6, _x7, _x8) {
      return ref.apply(this, arguments);
   };
}();

var logger = Loggers.create(module.filename);
//# sourceMappingURL=certScript.js.map