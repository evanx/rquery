
## rquery

- HTTP API for Redis queries

### Implementation

We use the component model specified in:
- https://github.com/evanx/component-validator

We use a supervisor implementation for such components via the `lib` submodule:
- https://github.com/evanx/libv


### Status

UNSTABLE, INCOMPLETE

### Live demo

Try: http://demo.ibhala.com/rquery

However be sure to have a JSON Viewer extension installed in your browser.

It should report the available "routes" defined for the ExpressJS webserver:

<img src="http://evanx.github.io/images/rquery/rquery-routes.png">

The demo has no authentication but choose a "keyspace" e.g. your username.

Note that keys are expired after an idle duration 3 minutes.

#### curl

We try `curl` too:
```shell
curl -s demo.ibhala.com/rquery/ks/$USER/set/mykey/myvalue; echo
curl -s demo.ibhala.com/rquery/ks/$USER/get/mykey; echo
curl -s demo.ibhala.com/rquery/ks/$USER/ttl/mykey; echo
curl -s demo.ibhala.com/rquery/ks/keyspaces; echo
```
where we specify a "keyspace" as our username via `$USER.` (This is prefixed to the key by rquery.)

The `/keyspaces` endpoint performs a `smembers` of the set of all used keyspaces, and so your `$USER` should appear therein.

The following subset of Redis commands is supported for this demo:
- keys: set, get, type, ttl
- sets: sadd, smembers, scard
- lists: lpush, rpop, llen, lrange
- other: info, keyspaces

Note that the `info` command is for the whole Redis instance, and so does not require a keyspace like the others.


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
