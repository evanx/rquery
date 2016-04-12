
const CSON = require('season');

export function readFileSync(file) {
   return CSON.readFileSync(file);
}
