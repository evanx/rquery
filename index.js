
// global dependencies

global.assert = require('assert');
global.bluebird = require('bluebird');
global.bunyan = require('bunyan');
global.lodash = require('lodash');
global.redisl = require('redis');

global.ServiceError = function() {
  this.constructor.prototype.__proto__ = Error.prototype;
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  var args = [].slice.call(arguments);
  this.message = JSON.stringify(args);
}

global.ValidationError = function() {
  this.constructor.prototype.__proto__ = Error.prototype;
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  var args = [].slice.call(arguments);
  this.message = JSON.stringify(args);
}

// logging

global.loggerLevel = 'info';
if (process.env.loggerLevel) {
   global.loggerLevel = process.env.loggerLevel;
} else if (process.env.NODE_ENV === 'development') {
   global.loggerLevel = 'debug';
}

var logger = global.bunyan.createLogger({name: 'service', level: global.loggerLevel});

// promisify redis

bluebird.promisifyAll(redisl.RedisClient.prototype);
bluebird.promisifyAll(redisl.Multi.prototype);
redisl.RedisClient.prototype.multiExecAsync = function(fn) {
   var multi = this.multi();
   fn(multi);
   return multi.execAsync();
};

// load default service props

require('babel-polyfill');
require('babel-core/register');
logger.debug('babel registered');

// lib

global.Asserts = require('./lib/Asserts');
global.Loggers = require('./lib/Loggers');
global.Metas = require('./lib/Metas');

// service props

var CsonFiles = require('./lib/CsonFiles');
var serviceMeta = CsonFiles.readFileSync('./src/Service.cson');
logger.debug('serviceMeta', serviceMeta);
var servicePropsEnv = Metas.pickEnv(serviceMeta, process.env);
if (!Object.keys(servicePropsEnv).length) {
   console.error('Insufficient params');
   console.info('Declared props:', serviceMeta.props);
   console.info('Try: npm run demo');
   process.exit(1);
}
logger.debug('serviceProps env', servicePropsEnv);
serviceProps = Object.assign(Metas.getDefault(serviceMeta.props), servicePropsEnv);
var errorProps = Metas.getErrorKeys(serviceMeta, serviceProps);
if (errorProps.length) {
   errorProps.forEach(function(key) {
      console.error('Prop error', {key: key, value: serviceProps[key]});
   });
   process.exit(1);
}
logger.debug('serviceProps ready', serviceProps);

// optional require hook

if (serviceProps.requireHook) {
   require(serviceProps.requireHook);
}

// service context

var os = require('os');

if (!process.env.memo) {
   console.error('Missing: memo', servicePropsEnv);
   process.exit(1);
}

var context = {
   sourceModule: require(serviceProps.sourceModule),
   audit: {
      memo: process.env.memo,
      clientDate: new Date().toISOString(),
      hostname: os.hostname(),
      pid: process.pid,
   }
};

// create service instance

var Service = require('./src/Service').default;

global.service = new Service();

global.service.start({props: serviceProps, logger: logger, context: context}).then(function() {
   if (true) {
      return global.service.end();
   } else {
      logger.info('started pid', process.pid);
      process.on('SIGTERM', function() {
         logger.info('SIGTERM')
         global.service.end();
      });
   }
}).catch(function(err) {
   logger.error(err);
   setTimeout(function() {
      global.service.end();
   }, 2000);
});
