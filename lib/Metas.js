
export function pickEnv(meta, env) {
   const result = {};
   Object.keys(meta.props).filter(key => env.hasOwnProperty(key))
   .forEach(key => result[key] = env[key]);
   return result;
}


export function getErrorKeys(meta, props) {
   return Object.keys(meta.props).filter(key => !isValid(meta.props[key], props[key]));
}

function isValid(meta, value) {
   if (value === undefined) {
      return meta.optional;
   } else if (meta.type === 'string') {
      return typeof value === 'string';
   } else if (meta.type === 'integer') {
      return parseInt(value) === value;
   } else if (meta.type === 'boolean') {
      return lodash.isBoolean(value);
   } else if (meta.type === 'object') {
      return Object.keys(value).length;
   } else {
      return false;
   }
}

export function getDefault(meta) {
   const result = {};
   Object.keys(meta).filter(key => meta[key].defaultValue !== undefined)
   .forEach(key => result[key] = meta[key].defaultValue);
   return result;
}

export function filterKeys(object, other, fn) {
   return Object.keys(object).filter(key => {
      return fn(key, object[key], other[key]);
   });
}
