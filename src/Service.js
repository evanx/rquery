
export default class Service {

   assertProps() {
      Asserts.assertString(config.redis, 'redis');
      Asserts.assertString(config.in, 'in');
      Asserts.assertString(config.pending, 'pending');
      Asserts.assertIntegerMin(config.popTimeout, 'popTimeout', 5);
      Asserts.assertStringArray(config.out, 'out');
   }

   async start() {
      this.logger = Loggers.createLogger(module.filename);
      this.startedComponents = [];
      this.logger.info('defaultProps', Invariants.defaultProps);
      config = await this.loadProps();
      if (!config) {
         throw 'Use the propsFile environment variable, as per README';
      }
      config = Object.assign({}, Invariants.defaultProps, config);
      this.logger.info('start', config);
      this.assertProps();
      Invariants.validateProps(config);
      this.requiredComponents = [];
      await this.initRequiredComponents('mpush');
      this.requiredComponents.push(new MessagePush('messagePush'));
      if (this.readyComponent) {
         this.requiredComponents.push(this.readyComponent);
      }
      this.components = {};
      logger.info('requiredComponents', this.requiredComponents.length);
      for (const component of this.requiredComponents) {
         await this.delay(100);
         await this.startComponent(component);
      }
      logger.info('started components', Object.keys(this.components));
      if (this.components.metrics) {
         this.components.metrics.count('start');
      }
      this.logger.info('started', this.startTimestamp);
   }

   async initRequiredComponents(name) {
      if (name === 'mpush') {
         if (config.serviceNamespace) {
            await this.startService();
            this.requiredComponents.push(new Metrics('metrics'));
            this.requiredComponents.push(new MessageRegister('messageRegister'));
            this.requiredComponents.push(new MessagePending('messagePending'));
            this.requiredComponents.push(new MessageDone('messageDone'));
            this.requiredComponents.push(new ServiceRenew('serviceRenew'));
         } else {
            const redisClient = this.createRedisClient(config.redis);
            const redisTime = await redisClient.timeAsync();
            this.startTimestamp = parseInt(redisTime[0]);
         }
      } else {
         assert(false, 'service name: ' + name);
      }
      this.name = name;
   }

   async startComponent(component) {
      assert(component.name, 'component name');
      const name = component.name;
      logger.info('startComponent', component.name);
      await component.start({name,
         logger: this.createLogger(name),
         props: config,
         components: this.components,
         service: this
      });
      this.startedComponents.push(component);
      this.components[component.name] = component;
   }

   async error(component, err) {
      if (!this.ended) {
         logger.error(component.name, err);
         if (err.stack) {
            console.error(err.stack);
         }
         if (this.components.metrics) {
            if (this.components.metrics !== component) {
               await this.components.metrics.count('error', component.name);
            }
         }
         this.end();
      } else {
         logger.warn(component.name, err);
      }
   }

   async startService() {
      assert(config.serviceRedis, 'serviceRedis');
      this.redisClient = this.createRedisClient(config.serviceRedis);
      const redisTime = await this.redisClient.timeAsync();
      this.startTimestamp = parseInt(redisTime[0]);
      Asserts.assertString(config.serviceNamespace, 'serviceNamespace');
      Asserts.assertIntegerMin(config.serviceExpire, 'serviceExpire');
      this.id = parseInt(await this.redisClient.incrAsync(this.redisKey('id')));
      this.key = this.redisKey(this.id);
      this.meta = {
         host: os.hostname(),
         pid: process.pid,
         started: this.startTimestamp
      };
      assert.equal(await this.redisClient.existsAsync(this.key), 0, 'key: ' + this.key);
      const [hmset, expire, ids] = await this.redisClient.multiExecAsync(multi => {
         multi.hmset(this.key, this.meta);
         multi.expire(this.key, config.serviceExpire);
         multi.lrange(this.redisKey('ids'), -10, -1);
         multi.lpush(this.redisKey('ids'), this.id);
         multi.ltrim(this.redisKey('ids'), 0, config.serviceCapacity - 1);
      });
      if (ids.length) {
         await this.checkServices(ids);
      }
      assert.equal(expire, 1, {expire: this.key});
      this.logger.info('registered', this.key, this.meta);
   }

   async checkServices(ids) {
      this.logger.info('checkServices', ids);
      const removeIds = this.filterRemove(ids);
      if (removeIds.length) {
         const multi = this.redisClient.multi();
         removeIds.forEach(id => multi.lrem(this.redisKey('ids'), -1, id));
         const removeReplies = await multi.execAsync();
         this.logger.warn('checkServices remove', removeIds, removeReplies);
      }
   }

   async filterRemove(ids) {
      const multi = this.redisClient.multi();
      ids.forEach(id => multi.exists(id));
      const existsReply = await multi.execAsync();
      return ids.filter((id, index) => existsReply[index]);
   }

   async end() {
      if (this.ended) {
         logger.warn('end: ended');
         return;
      }
      this.ended = true;
      setTimeout(async => {
         this.logger.error('force exit');
         this.delay(1000);
         process.exit(1);
      }, Invariants.props.popTimeout.max*1000);
      if (this.startedComponents.length) {
         this.startedComponents.reverse();
         for (const component of this.startedComponents) {
            try {
               await component.end();
               this.logger.info('end component', component.name);
            } catch (err) {
               this.logger.error('end component', component.name, err);
            }
         }
      }
      await this.delay(1000);
      if (this.redisClient) {
         const listKey = this.redisKey('service:ids');
         const [del, lrem] = await this.redisClient.multiExecAsync(multi => {
            logger.debug('remove', this.key, listKey, this.id);
            multi.del(this.key);
            multi.lrem(listKey, -1, this.id);
         });
         await this.redisClient.quitAsync();
         this.logger.info('ended', this.key, {del, lrem});
      } else {
         this.logger.info('ended');
      }
      process.exit(0);
   }

   redisKey(...values) {
      Asserts.assertString(config.serviceNamespace, 'serviceNamespace');
      return [config.serviceNamespace, 'service', ...values].join(':');
   }

   async validate() {
      if (this.redisClient) {
         assert(this.key);
         const [exists] = await this.redisClient.multiExecAsync(multi => {
            multi.exists(this.key);
         });
         if (!exists) {
            throw 'expired: ' + this.key;
         }
      }
   }
}
