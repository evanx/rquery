
export function pick(env, keys) {
   const result = {};
   keys.filter(key => env.hasOwnProperty(key))
   .forEach(key => result[key] = env[key]);
   return result;
}
