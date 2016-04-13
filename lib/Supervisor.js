
export default class Supervisor {

   constructor() {
   }

   async initComponent(componentName, componentModule) {
      assert(typeof componentName === 'string', 'component name');
      logger.info('initComponent', componentName, componentModule);
      const meta = CsonFiles.readFileSync(componentModule + '.cson');
      const componentConfig = Metas.getDefault(meta.config);
      const componentState = {
         components: components,
         config: componentConfig,
         logger: Loggers.createLogger(componentName, componentConfig.loggerLevel || config.loggerLevel)
      };
      componentModule = ClassPreprocessor.buildSync(componentModule, Object.keys(componentState));
      const componentClass = require('.' + componentModule).default;
      const component = new componentClass();
      logger.info('initComponents state', componentName, Object.keys(componentState));
      Object.assign(component, {name: componentName}, componentState);
      await component.init();
      initedComponents.push(component);
      components[componentName] = component;
      logger.info('initComponents components', componentName, Object.keys(components));
   }

   async init() {
      logger.info('requiredComponents', requiredComponents.length);
      for (const componentName in requiredComponents) {
         logger.info('initedComponent', componentName, requiredComponents[componentName]);
         await this.initComponent(componentName, requiredComponents[componentName]);
      }
      logger.info('initedComponents', initedComponents.length);
      logger.info('components', Object.keys(components));
      logger.info('inited');
   }

   async start() {
      logger.info('start components', Object.keys(components));
      for (const component of components) {
         await component.start();
      }
      logger.info('started');
   }

   async error(err, component) {
      if (!ended) {
         logger.error(err, component.name);
         if (err.stack) {
            logger.error(err.stack);
         }
         if (components.metrics) {
            if (components.metrics !== component) {
               await components.metrics.count('error', component.name);
            }
         }
         this.end();
      } else {
         logger.warn(component.name, err);
      }
   }

   async endComponents() {
      if (initedComponents.length) {
         initedComponents.reverse();
         for (const component of initedComponents) {
            try {
               await component.end();
               logger.info('end component', component.name);
            } catch (err) {
               logger.error('end component', component.name, err);
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
