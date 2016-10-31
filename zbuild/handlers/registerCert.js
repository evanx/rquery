'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _bluebird = require('bluebird');

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var logger = Loggers.create(module.filename);
var rquery = global.rquery;

exports.default = function () {
   var ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee(req, res, reqx) {
      var cert, dn, _dn$cn$split, _dn$cn$split2, type, account, role, id, accountKey, grantKey, certDigest, shortDigest, _ref, _ref2, granted, sismember, _ref3, _ref4, del, sadd, hmset;

      return regeneratorRuntime.wrap(function _callee$(_context) {
         while (1) {
            switch (_context.prev = _context.next) {
               case 0:
                  cert = rquery.getClientCert(req);

                  if (cert) {
                     _context.next = 3;
                     break;
                  }

                  throw new ValidationError({
                     status: 403,
                     message: 'No client cert',
                     hint: rquery.hints.signup
                  });

               case 3:
                  dn = rquery.parseCertDn(req);

                  if (dn.ou) {
                     _context.next = 6;
                     break;
                  }

                  throw new ValidationError({
                     status: 400,
                     message: 'No client cert OU name',
                     hint: rquery.hints.signup
                  });

               case 6:
                  _dn$cn$split = dn.cn.split(':');
                  _dn$cn$split2 = _slicedToArray(_dn$cn$split, 4);
                  type = _dn$cn$split2[0];
                  account = _dn$cn$split2[1];
                  role = _dn$cn$split2[2];
                  id = _dn$cn$split2[3];

                  logger.debug('CN', dn, type, { account: account, role: role, id: id });

                  if (!(type !== 'ws' || !account || !role || !id)) {
                     _context.next = 15;
                     break;
                  }

                  throw new ValidationError({
                     status: 400,
                     message: 'Invalid cert CN. Expect: \'ws:account:role:id\'',
                     hint: rquery.hints.signup
                  });

               case 15:
                  if (!(dn.ou !== role)) {
                     _context.next = 17;
                     break;
                  }

                  throw new ValidationError({
                     status: 400,
                     message: 'Cert OU/role mismatch. Expect role as per CN.',
                     hint: rquery.hints.signup
                  });

               case 17:
                  if (!(dn.o !== account)) {
                     _context.next = 19;
                     break;
                  }

                  throw new ValidationError({
                     status: 400,
                     message: 'Cert O/account mismatch. Expect account as per CN.',
                     hint: rquery.hints.signup
                  });

               case 19:
                  accountKey = rquery.adminKey('account', account);
                  grantKey = rquery.adminKey('telegram', 'user', account, 'grant');
                  certDigest = rquery.digestPem(cert);
                  shortDigest = certDigest.slice(-12);

                  logger.debug('cert', certDigest);
                  _context.next = 26;
                  return rquery.redis.multiExecAsync(function (multi) {
                     multi.get(grantKey);
                     multi.sismember(rquery.adminKey('account', account, 'certs'), certDigest);
                  });

               case 26:
                  _ref = _context.sent;
                  _ref2 = _slicedToArray(_ref, 2);
                  granted = _ref2[0];
                  sismember = _ref2[1];

                  if (!sismember) {
                     _context.next = 32;
                     break;
                  }

                  throw new ValidationError({
                     status: 200,
                     message: 'Cert already granted',
                     hint: rquery.hints.routes
                  });

               case 32:
                  if (granted) {
                     _context.next = 34;
                     break;
                  }

                  throw new ValidationError({ message: 'Cert must be granted via https://telegram.me/' + rquery.config.adminBotName,
                     status: 403,
                     hint: {
                        message: ['/grant ' + certDigest].join(' '),
                        clipboard: '/grant ' + certDigest,
                        url: 'https://telegram.me/' + rquery.config.adminBotName + '?start'
                     }
                  });

               case 34:
                  if (!(granted.indexOf(shortDigest) < 0 && certDigest.indexOf(granted) < 0)) {
                     _context.next = 36;
                     break;
                  }

                  throw new ValidationError({
                     status: 400,
                     message: 'Granted cert not matching: ' + certDigest,
                     hint: {
                        message: 'Try @' + rquery.config.adminBotName + ' "/grant ' + certDigest + '"' + ' from the authoritative Telegram account' + ' e.g. via https://web.telegram.org',

                        clipboard: '/grant ' + certDigest,
                        url: 'https://telegram.me/' + rquery.config.adminBotName + '?start'
                     }
                  });

               case 36:
                  _context.next = 38;
                  return rquery.redis.multiExecAsync(function (multi) {
                     multi.del(grantKey);
                     multi.sadd(rquery.adminKey('account', account, 'certs'), certDigest);
                     multi.hmset(rquery.adminKey('account', account, 'cert', certDigest), { account: account, role: role, id: id });
                  });

               case 38:
                  _ref3 = _context.sent;
                  _ref4 = _slicedToArray(_ref3, 3);
                  del = _ref4[0];
                  sadd = _ref4[1];
                  hmset = _ref4[2];

                  if (!sadd) {
                     logger.debug('certs sadd');
                  }
                  if (!del) {
                     logger.warn('certs grant del');
                  }
                  return _context.abrupt('return', { account: account });

               case 46:
               case 'end':
                  return _context.stop();
            }
         }
      }, _callee, this);
   }));

   function registerCert(_x, _x2, _x3) {
      return ref.apply(this, arguments);
   }

   return registerCert;
}();
//# sourceMappingURL=registerCert.js.map