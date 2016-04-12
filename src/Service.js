
export default class Service {

   async start(state) {
      Object.assign(this, state);
      assert(this.context.audit, 'audit');
      this.logger.debug('props', this.props);
      this.redisClient = redisl.createClient(this.props.redisUrl);
      const [redisTime] = await this.redisClient.timeAsync();
      this.logger.debug('redis time', redisTime);
      const id = await this.redisClient.incrAsync(this.props.redisKeyspace + ':id');
      this.redisKey = this.props.redisKeyspace + ':' + id;
      this.auditKey = this.props.redisKeyspace + ':' + id + ':audit';
      this.logger.info('hmset', this.redisKey, this.context);
      const multi = this.redisClient.multi();
      multi.sadd(this.props.redisKeyspace + ':ids', id);
      multi.hmset(this.auditKey, Object.assign(this.context.audit, {
         redisTime: redisTime
      }));
      multi.hmset(this.redisKey, this.context.sourceModule);
      await multi.execAsync();
      const props = await this.redisClient.hgetallAsync(this.redisKey);
      const unequalsKeys = Metas.filterKeys(props, this.context.sourceModule, (key, value, expected) => {
         return value !== expected && parseInt(value) !== expected;
      });
      if (unequalsKeys.length) {
         throw 'Failed keys: ' + unequalsKeys.join(', ');
      }
      this.logger.debug('hgetall', this.redisKey, props);
   }

   async end() {
      if (this.redisClient) {
         await this.redisClient.quitAsync();
      }
      this.logger.debug('ended');
   }
}
