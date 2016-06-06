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
      var cert, dn, _dn$cn$split, _dn$cn$split2, matching, account, role, id, accountKey, grantKey, certDigest, shortDigest, pemExtract, _ref, _ref2, granted, sismember, _ref3, _ref4, del, sadd;

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
                     status: 422,
                     message: 'No client cert OU name',
                     hint: rquery.hints.signup
                  });

               case 6:
                  _dn$cn$split = dn.cn.split(':');
                  _dn$cn$split2 = _slicedToArray(_dn$cn$split, 4);
                  matching = _dn$cn$split2[0];
                  account = _dn$cn$split2[1];
                  role = _dn$cn$split2[2];
                  id = _dn$cn$split2[3];

                  logger.debug('CN', matching);

                  if (matching) {
                     _context.next = 15;
                     break;
                  }

                  throw new ValidationError({
                     status: 422,
                     message: 'Cert CN mismatch',
                     hint: rquery.hints.signup
                  });

               case 15:
                  if (!(dn.ou !== role)) {
                     _context.next = 17;
                     break;
                  }

                  throw new ValidationError({
                     status: 422,
                     message: 'Cert OU/role mismatch',
                     hint: rquery.hints.signup
                  });

               case 17:
                  if (!(dn.o !== account)) {
                     _context.next = 19;
                     break;
                  }

                  throw new ValidationError({
                     status: 422,
                     message: 'Cert O/account mismatch',
                     hint: rquery.hints.signup
                  });

               case 19:
                  accountKey = rquery.adminKey('account', account);
                  grantKey = rquery.adminKey('telegram', 'user', account, 'grantcert');
                  certDigest = rquery.digestPem(cert);
                  shortDigest = certDigest.slice(-12);
                  pemExtract = rquery.extractPem(cert);
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
                     message: 'Cert granted',
                     hint: rquery.hints.routes
                  });

               case 32:
                  if (granted) {
                     _context.next = 34;
                     break;
                  }

                  throw new ValidationError({ message: 'Cert must be granted via @redishub_bot',
                     status: 403,
                     hint: {
                        message: ['Try @redishub_bot "/grantcert ' + shortDigest + '"', 'e.g. via https://web.telegram.org,'].join(' '),
                        clipboard: '@redishub_bot /grantcert ' + shortDigest,
                        url: 'https://web.telegram.org/#/im?p=@redishub_bot#grantcert-' + shortDigest
                     }
                  });

               case 34:
                  if (!(granted.indexOf(shortDigest) < 0 && certDigest.indexOf(granted) < 0 && pemExtract != granted)) {
                     _context.next = 36;
                     break;
                  }

                  throw new ValidationError({
                     status: 422,
                     message: 'Granted cert not matching: ' + shortDigest,
                     hint: {
                        message: 'Try @redishub_bot "/grantcert ' + shortDigest + ' from the authoritative Telegram account' + ' e.g. via https://web.telegram.org',

                        clipboard: '@redishub_bot /grantcert ' + shortDigest,
                        url: 'https://web.telegram.org/#/im?p=@redishub_bot#grantcert-' + shortDigest
                     }
                  });

               case 36:
                  _context.next = 38;
                  return rquery.redis.multiExecAsync(function (multi) {
                     multi.del(grantKey);
                     multi.sadd(rquery.adminKey('account', account, 'certs'), certDigest);
                  });

               case 38:
                  _ref3 = _context.sent;
                  _ref4 = _slicedToArray(_ref3, 2);
                  del = _ref4[0];
                  sadd = _ref4[1];

                  if (!sadd) {
                     logger.debug('certs sadd');
                  }
                  if (!del) {
                     logger.warn('certs grant del');
                  }
                  return _context.abrupt('return', { account: account });

               case 45:
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