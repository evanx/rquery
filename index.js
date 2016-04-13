
global.assert = require('assert');
global.bluebird = require('bluebird');
global.bunyan = require('bunyan');
global.crypto = require('crypto');
global.fs = require('fs');
global.http = require('http');
global.lodash = require('lodash');
global.os = require('os');
global.redisl = require('redis');

global.ApplicationError = function() {
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

var config = {
   loggerLevel: 'info'
};
if (process.env.loggerLevel) {
   config.loggerLevel = process.env.loggerLevel;
} else if (process.env.NODE_ENV === 'development') {
   config.loggerLevel = 'debug';
}

global.loggerLevel = config.loggerLevel;

var logger = global.bunyan.createLogger({name: 'hbridge', level: global.loggerLevel})

// redis

bluebird.promisifyAll(redisl.RedisClient.prototype);
bluebird.promisifyAll(redisl.Multi.prototype);
redisl.RedisClient.prototype.multiExecAsync = function(fn) {
   var multi = this.multi();
   fn(multi);
   return multi.execAsync();
};

// babel

require('babel-polyfill');
require('babel-core/register');
logger.debug('babel registered');

// dependencies

global.Loggers = require('./lib/Loggers');
global.Asserts = require('./lib/Asserts');
global.CsonFiles = require('./lib/CsonFiles');
global.Metas = require('./lib/Metas')
global.ClassPreprocessor = require('./lib/ClassPreprocessor');

// supervisor

// TODO babel class transform, rather than fragile regex transformation
var supervisorMeta = CsonFiles.readFileSync('./lib/Supervisor.cson');
ClassPreprocessor.buildSync('./lib/Supervisor.js', ['logger', 'context', 'config'].concat(Object.keys(supervisorMeta.state)));

var Supervisor = require('./build/Supervisor').default;
var supervisor = new Supervisor();
Object.assign(supervisor, Object.assign({logger: logger, config: config}, supervisorMeta.state));
supervisor.init().then(function() {
   logger.info('started pid', process.pid);
   process.on('SIGTERM', function() {
      logger.info('SIGTERM')
      supervisor.end();
   });
}).catch(function(err) {
   logger.error(err);
   setTimeout(function() {
      supervisor.end();
   }, 4000);
});
