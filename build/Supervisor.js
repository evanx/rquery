
export default class Supervisor {

   constructor() {
   }

   async init() {
      this.logger.info('config.components', this.config.components.length);
      for (const componentName in this.config.components) {
         const componentConfig = this.config.components[componentName];
         if (componentConfig) {
            const componentModule = this.config.availableComponents[componentName];
            assert(componentModule, 'componentModule: ' + componentName);
            await this.initComponent(componentName, componentModule, componentConfig);
         } else {
            this.logger.warn('config.component', componentName);
         }
      }
      this.logger.info('initedComponents', this.initedComponents.length);
      for (const component of [... this.initedComponents]) {
         if (component.start) {
            assert(lodash.isFunction(component.start), 'start function: ' + component.name);
            this.logger.debug('start', component.name);
            await component.start();
         }
      }
      this.logger.info('components', Object.keys(this.components));
      this.logger.info('inited');
   }

   async initComponent(componentName, componentModule, componentConfig) { // TODO support external modules
      assert(typeof componentName === 'string', 'component name');
      this.logger.info('initComponent', componentName, componentModule, componentConfig);
      const meta = CsonFiles.readFileSync(componentModule + '.cson'); // TODO support external modules
      componentConfig = Object.assign(Metas.getDefault(meta.config), componentConfig);
      const componentState = Object.assign({
         components: this.components,
         config: componentConfig,
         logger: Loggers.createLogger(componentName, componentConfig.loggerLevel || this.config.loggerLevel)
      }, meta.state);
      componentModule = ClassPreprocessor.buildSync(componentModule + '.js', Object.keys(componentState));
      const componentClass = require('.' + componentModule).default; // TODO support external modules
      const component = new componentClass();
      this.logger.info('initComponents state', componentName, Object.keys(componentState));
      Object.assign(component, {name: componentName}, componentState);
      if (component.init) {
         assert(lodash.isFunction(component.init), 'init function: ' + componentName);
         await component.init();
      }
      this.initedComponents.push(component);
      this.components[componentName] = component;
      this.logger.info('initComponents components', componentName, Object.keys(this.components));
   }

   async start() {
      this.logger.info('start components', Object.keys(this.components));
      for (const component of this.components) {
         await component.start();
      }
      this.logger.info('started');
   }

   async error(err, component) {
      if (!this.ended) {
         this.logger.error(err, component.name);
         if (err.stack) {
            this.logger.error(err.stack);
         }
         if (this.components.metrics) {
            if (this.components.metrics !== component) {
               await this.components.metrics.count('error', component.name);
            }
         }
         this.end();
      } else {
         this.logger.warn(component.name, err);
      }
   }

   async endComponents() {
      if (this.initedComponents.length) {
         this.initedComponents.reverse();
         for (const component of this.initedComponents) {
            try {
               await component.end();
               this.logger.info('end component', component.name);
            } catch (err) {
               this.logger.error('end component', component.name, err.stack);
            }
         }
      }
   }

   async end() {
      await this.endComponents();
      if (this.redisClient) {
         await this.redisClient.quitAsync();
      }
      process.exit(0);
   }
}
