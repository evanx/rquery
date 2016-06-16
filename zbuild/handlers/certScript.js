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
                  helpResult = ['', '  To force archiving an existing ' + dir + ', add \'?archive\' to the URL:', '', '    curl -s ' + serviceUrl + '/' + commandKey + '/' + account + '?archive | bash', '', '  This will first move ' + dir + ' to ' + archive + '/TIMESTAMP first.', '', '  See your privcerts: ' + dir + '/privcert.pem (curl) and/or privcert.p12 (browser)', '', '  For example, create a keyspace called \'tmp10days\' as follows:', '    ' + curlAccount + '/tmp10days/create-keyspace', '', '  Then try Redis commands on this keyspace for example:', '    ' + curlAccount + '/tmp10days/help', '    ' + curlAccount + '/tmp10days/set/mykey/myvalue', '    ' + curlAccount + '/tmp10days/get/mykey', '', '  Then in your browser, load \'privcert.p12\' and try:', '    ' + serviceUrl + '/ak/' + account + '/tmp10days/help', '', '  For CLI convenience, install rhcurl bash script, as per instructions:', '    curl -s -L https://raw.githubusercontent.com/evanx/redishub/master/docs/install.rhcurl.txt', ''];
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
      var dir, archive, isArchive, commandKey, serviceUrl, account, role, id, CN, OU, O, curlAccount, result;
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
                  dir = req.query.dir || config.clientCertHomeDir + '/live';
                  archive = req.query.archive || config.clientCertHomeDir + '/archive';
                  isArchive = Values.isDefined(req.query.archive);

                  if (!(isArchive && req.query.dir)) {
                     _context2.next = 8;
                     break;
                  }

                  if (req.query.dir.match(/^[~\/a-z0-9\.]+(live|cert)$/i)) {
                     _context2.next = 8;
                     break;
                  }

                  throw new ValidationError('Invalid "dir" for archive');

               case 8:
                  commandKey = reqx.command.key;
                  serviceUrl = config.hostUrl;
                  account = req.params.account;
                  role = req.params.role || req.query.role || 'admin';
                  id = req.params.id || req.query.id || 'admin';
                  CN = [config.certPrefix, account, role, req.params.clientId || req.query.clientId || id].join(':');
                  OU = role;
                  O = account;
                  curlAccount = 'curl -s -E ${dir}/privcert.pem ${serviceUrl}/ak/${account}';
                  result = ['', 'Curl this script and pipe into bash as follows to create key dir ~/.redishub/live:', '', 'curl -s \'' + serviceUrl + '/' + commandKey + '/' + account + '\' | bash', ''].map(function (line) {
                     return '# ' + line;
                  });

                  result = result.concat(['', '  set -u -e', '', '  account=\'' + account + '\'', '  role=\'' + role + '\'', '  id=\'' + id + '\'', '', '  CN=\'' + CN + '\' # unique cert name (certPrefix, account, role, id)', '  OU=\'' + OU + '\' # role for this cert', '  O=\'' + O + '\' # account name', '', '  dir=' + dir + ' # must not exist, or be archived', '  # Note that the following files are created in this dir:', '  # account privkey.pem cert.pem privcert.pem privcert.p12 x509.txt cert.extract.txt', '  commandKey=\'' + commandKey + '\'', '  serviceUrl=\'' + serviceUrl + '\'', '  archive=' + archive, '  certWebhook="${serviceUrl}/create-account-telegram/${account}"', '']);
                  if (Values.isDefined(req.query.archive)) {
                     result = result.concat(['  mkdir -p ${archive} # ensure dir exists', '  mv -n ${dir} ${archive}/`date +\'%Y-%m-%dT%Hh%Mm%Ss%s\'`']);
                  } else if (!lodash.isEmpty(req.query.dir) && !req.query.dir.includes(this.config.clientCertHomeDir)) {
                     logger.debug('certScript dir', req.query.dir, this.config.clientCertHomeDir);
                  } else {
                     result = result.concat(['  mkdir -p ' + this.config.clientCertHomeDir + ' # ensure default dir exists']);
                  }
                  result = result.concat(['  curl -s https://raw.githubusercontent.com/evanx/redishub/master/bin/cert-script.sh -O', '  cat cert-script.sh', '  sha1sum cert-script.sh', '  curl -s https://redishub.com/assets/cert-script.sh.sha1sum', '  echo \'Press Ctrl-C in the next 8 seconds if the above hashes do not match\'', '  sleep 4', '  source <(cat cert-script.sh)', ')']);
                  result.push('');
                  return _context2.abrupt('return', lodash.flatten(result));

               case 23:
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
//# sourceMappingURL=certScript.js.map