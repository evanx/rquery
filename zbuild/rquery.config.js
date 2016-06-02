'use strict';

var _config;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

module.exports = {
   spec: 'component-validator#0.1.2',
   instance: {
      id: 5,
      repo: 'https://github.com/evanx/rquery',
      host: 2
   },
   env: {
      development: {
         version: 'HEAD',
         serviceKey: 'development' }
   },
   // use for deploy branch and config
   config: (_config = {
      serviceKey: {
         type: 'string'
      },
      redisUrl: {
         type: 'string'
      },
      redisKeyspace: {
         type: 'string'
      },
      hostname: {
         type: 'string'
      },
      hostUrl: {
         type: 'string'
      },
      location: {
         defaultValue: '/'
      },
      assetsUrl: {
         defaultValue: ''
      },
      keyspaceHostname: {
         optional: true,
         type: 'string'
      },
      openHostname: {
         optional: true,
         type: 'string'
      },
      port: {
         defaultValue: 8080
      },
      helpUrl: {
         type: 'url'
      },
      aboutUrl: {
         type: 'url'
      },
      enrollExpire: {
         defaultValue: 180,
         type: 'duration',
         unit: 'seconds',
         max: 999
      },
      keyExpire: {
         type: 'duration',
         unit: 'seconds',
         max: 999
      },
      ephemeralKeyExpire: {
         type: 'duration',
         unit: 'seconds',
         max: 999
      },
      ephemeralAccountExpire: {
         type: 'duration',
         unit: 'seconds',
         max: 999
      },
      registerLimit: {
         defaultValue: 2000,
         type: 'duration',
         unit: 'millis',
         max: 9000
      },
      defaultFormat: {
         defaultValue: 'plain',
         allowedValues: ['html', 'plain', 'line']
      },
      indexCommand: {
         defaultValue: 'show-keyspace-config'
      },
      secureDomain: {
         type: 'boolean',
         defaultValue: false
      },
      cliDomain: {
         type: 'boolean',
         defaultValue: false
      },
      htmlDomain: {
         type: 'boolean',
         defaultValue: false
      },
      certLimit: {
         defaultValue: 4,
         max: 99
      }
   }, _defineProperty(_config, 'registerLimit', {
      defaultValue: 2,
      unit: 'per second'
   }), _defineProperty(_config, 'importLimit', {
      defaultValue: 2,
      unit: 'per second'
   }), _defineProperty(_config, 'adminLimit', {
      defaultValue: 1,
      unit: 'seconds'
   }), _defineProperty(_config, 'addClientIp', {
      defaultValue: false
   }), _defineProperty(_config, 'serviceKey', {
      type: 'string'
   }), _defineProperty(_config, 'serviceLabel', {
      type: 'string'
   }), _defineProperty(_config, 'botSecret', {
      type: 'string',
      optional: true
   }), _defineProperty(_config, 'botUrl', {
      type: 'string',
      optional: true
   }), _defineProperty(_config, 'webhookTimeout', {
      defaultValue: 8000
   }), _defineProperty(_config, 'disableValidateCert', {
      defaultValue: false
   }), _defineProperty(_config, 'disableTelegramHook', {
      defaultValue: false
   }), _config),
   state: {
      redis: {},
      expressApp: {},
      expressServer: {},
      commands: []
   }
};
//# sourceMappingURL=rquery.config.js.map