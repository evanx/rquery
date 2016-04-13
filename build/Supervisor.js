
export default class Supervisor {

   constructor() {
   }

   async initComponent(componentName, componentModule) {
      assert(typeof componentName === 'string', 'component name');
      this.logger.info('initComponent', componentName, componentModule);
      const meta = CsonFiles.readFileSync(componentModule + '.cson');
      const componentConfig = Metas.getDefault(meta.config);
      const componentState = {
         components: this.components,
         config: componentConfig,
         logger: Loggers.createLogger(componentName, componentConfig.loggerLevel || this.config.loggerLevel)
      };
      componentModule = ClassPreprocessor.buildSync(componentModule, Object.keys(componentState));
      const componentClass = require('.' + componentModule).default;
      const component = new componentClass();
      this.logger.info('initComponents state', componentName, Object.keys(componentState));
      Object.assign(component, {name: componentName}, componentState);
      await component.init();
      this.initedComponents.push(component);
      this.components[componentName] = component;
      this.logger.info('initComponents components', componentName, Object.keys(this.components));
   }

   async init() {
      this.logger.info('requiredComponents', this.requiredComponents.length);
      for (const componentName in this.requiredComponents) {
         this.logger.info('initedComponent', componentName, this.requiredComponents[componentName]);
         await this.initComponent(componentName, this.requiredComponents[componentName]);
      }
      this.logger.info('initedComponents', this.initedComponents.length);
      this.logger.info('components', Object.keys(this.components));
      this.logger.info('inited');
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
               this.logger.error('end component', component.name, err);
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
