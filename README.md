
## rquery

- HTTP API for Redis queries

### Implementation

We use the component model specified in:
- https://github.com/evanx/component-validator

We use a supervisor implementation for such components via the `lib` submodule:
- https://github.com/evanx/libv


### Status

WORK IN PROGRESS

### Demo

The demo has no authentication, and expires keys in 2 minutes.

```shell
curl -s demo.ibhala.com/rquery/$USER/set/name/evanx
curl -s demo.ibhala.com/rquery/$USER/get/name
```
where we specify a "keyspace" as own username via `$USER.` This is prefixed to `key.`

The following subset of Redis commands is supported for this demo:
- keys: set, get, type
- sets: sadd, smembers, scard
- lists: lpush, rpop, llen, lrange
- other: info

Note that the `info` command is for the whole Redis instance, and so does not require a keyspace like the others.

You can try `http://demo.ibhala.com/rquery` in your browser. It should report the available "routes" defined for the ExpressJS webserver.

### Installation

```shell
git clone https://github.com/evanx/rquery.git --recursive && cd rquery && npm install
```

Let's run the demo
```shell
cd rquery
npm run demo
```
where this is configured with the following Redis URL and "keyspace:"
```yaml
redisUrl: 'redis://localhost:6379/13'
redisKeyspace: 'demo:rquery'
```

See the configuration module for this demo: https://github.com/evanx/rquery/blob/master/demo.js

### Further reading

Related projects and further plans: https://github.com/evanx/mpush-redis/blob/master/related.md
