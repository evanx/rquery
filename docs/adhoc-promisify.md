
## Promisify

One can use `bluebird` to `promisifyAll` e.g. on the `redis` client library as follows:

```javascript
bluebird.promisifyAll(redisLib.RedisClient.prototype);
bluebird.promisifyAll(redisLib.Multi.prototype);
```

In this case, it mixes in new async functions e.g. `llenAsync` et al for all Redis commands.

However we sometimes promisify specific functions.

For this purpose we have a `Promises` module with the following function:

```javascript
export function promisify(fn) {
   return new Promise((resolve, reject) => {
      fn((err, result) => {
         if (err) {
            reject(err);
         } else {
            resolve(result);
         }
      });
   });
}
```

Then we can promisify specific functions e.g. our `Files` module:
```javascript
import fs from 'fs';
import mkdirp from 'mkdirp';
import * as Promises from './Promises';

export function mkdirp(directory) {
   return Promises.promisify(callback => mkdirp(directory, callback));
}

export function readFile(file) {
   return Promises.promisify(callback => fs.readFile(file, callback));
}
```

We can then use ES2016 `await` on these functions since they return a `Promise.`

https://twitter.com/evanxsummers
