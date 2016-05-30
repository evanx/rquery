
module.exports = {
   spec: 'component-validator#0.1.2',
   instance: {
      id: 5,
      repo: 'https://github.com/evanx/rquery',
      host: 2,
   },
   env: {
      development: {
         version: 'HEAD',
         serviceKey: 'development', // use for deploy branch and config
      }
   },
   config: {
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
         max: 999,
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
      },
      registerLimit: {
         defaultValue: 2,
         unit: 'per second'
      },
      importLimit: {
         defaultValue: 2,
         unit: 'per second'
      },
      adminLimit: {
         defaultValue: 1,
         unit: 'seconds'
      },
      addClientIp: {
         defaultValue: false
      },
      serviceName: {
         type: 'string'
      },
      serviceLabel: {
         type: 'string'
      },
      botSecret: {
         type: 'string',
         optional: true,
      },
      botUrl: {
         type: 'string',
         optional: true,
      },
      webhookTimeout: {
         defaultValue: 8000,
      },
      disableValidateCert: {
         defaultValue: false,
      },
      disableTelegramHook: {
         defaultValue: false,
      }
   },
   state: {
      redis: {},
      expressApp: {},
      expressServer: {},
      commands: []
   }
};