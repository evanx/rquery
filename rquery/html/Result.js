
const logger = Loggers.create(module.filename);

export default class {

   render(props) {
      this.props = props;
      logger.debug('props', Object.keys(props));
      return {
         req: props.req,
         title: title,
         content: `
         `
      };
   }
}