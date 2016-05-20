
## Promisify

One can use `bluebird` to `promisifyAll` e.g. on the `redis` client library as follows:

```javascript
bluebird.promisifyAll(redisLib.RedisClient.prototype);
bluebird.promisifyAll(redisLib.Multi.prototype);
```

In this case, it mixes in new async functions e.g. `llenAsync` et al for all Redis commands.

However we sometimes want to promisify specific functions.

For this purpose we have a `Promises` module with the following trivial `promisify` function:

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
where we invoke the passed `fn` with the prepared callback i.e. with arguments `(err, result)` and it will `resolve` or `reject` the returned `Promise.`

Then we can promisify specific functions e.g. our `Files` module:
```javascript
import fs from 'fs';
import mkdirp from 'mkdirp';
import * as Promises from './Promises';

export function mkdirp(directory) {
   return Promises.promisify(callback => mkdirp(directory, callback));
}

export function stat(file) {
   return Promises.promisify(callback => fs.stat(file, callback));
}

export function existsFile(file) {
   return stat(file).then(stats => stats.isFile()).catch(err => {
      return false;
   });
}

export function readFile(file) {
   return Promises.promisify(callback => fs.readFile(file, callback));
}

export function writeFile(file, content) {
   return Promises.promisify(callback => fs.writeFile(file, content, callback));
}
```
where we promisify specific functions individually.

Since they return a `Promise` they are compatible with ES2016 "async" functions, even though they are not declared with the `async` keyword per se.

We can then use ES2016 `await` on these functions:
```javascript
async function testFiles() {
   await Files.mkdirp('tmp');
   await Files.writeFile('tmp/hello.txt', 'Hello!');
   assert(await Files.existsFile('tmp/hello.txt'), 'exists: tmp/hello.txt');
   const content = (await Files.readFile('tmp/hello.txt')).toString();
   assert.equal(content, 'Hello!', 'content: tmp/hello.txt');
}
```

https://twitter.com/evanxsummers
