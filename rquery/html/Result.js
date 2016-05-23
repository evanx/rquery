
const logger = Loggers.create(module.filename);

export default function (props) {
   logger.debug('props', Object.keys(props));
   return Object.assign(props, {
      title: '',
      content: `
      `
   });
}
