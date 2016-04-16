
## rquery

- HTTP API for Redis queries

### Implementation

See: https://github.com/evanx/rquery/tree/master/src

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

Note that keys are expired after an idle duration of 3 minutes.

The `/keyspaces` endpoint performs a `smembers` of the set of all used keyspaces, and so your `$USER` should appear therein.

The following subset of Redis commands is supported for this demo:
- keys: `keys` `exists` `set` `get` `type` `ttl` `incr`
- sets: `sadd` `sismember` `smembers` `scard`
- lists: `lpush` `rpop` `brpop` `brpoplpush` `llen` `lrange`
- hashes: `hexists` `hset` `hincrby` `hget` `hlen` `hkeys` `hgetall`
- other: `info` `keyspaces`

Note that the `keyspaces` and `info` command is for the whole Redis instance, and so does not require a keyspace like the others.


#### curl

We try `curl` too

In the examples below, we set our "keyspace" as our username via `$USER.` (This is prefixed to the key by rquery.)

##### keys

```shell
curl -s demo.ibhala.com/rquery/ks/$USER/set/mykey/myvalue; echo
curl -s demo.ibhala.com/rquery/ks/$USER/exists/mykey; echo
curl -s demo.ibhala.com/rquery/ks/$USER/get/mykey; echo
curl -s demo.ibhala.com/rquery/ks/$USER/ttl/mykey; echo
```

##### sets

```shell
curl -s demo.ibhala.com/rquery/ks/$USER/sadd/myset/item1; echo
curl -s demo.ibhala.com/rquery/ks/$USER/sadd/myset/item2; echo
curl -s demo.ibhala.com/rquery/ks/$USER/sismember/myset/item1; echo
curl -s demo.ibhala.com/rquery/ks/$USER/scard/myset; echo
curl -s demo.ibhala.com/rquery/ks/$USER/smembers/myset; echo
```

##### hashes

```shell
curl -s demo.ibhala.com/rquery/ks/$USER/hset/myhashes/myfield/myfieldvalue; echo
curl -s demo.ibhala.com/rquery/ks/$USER/hget/myhashes/myfield; echo
curl -s demo.ibhala.com/rquery/ks/$USER/hexists/myhashes/myfield; echo
curl -s demo.ibhala.com/rquery/ks/$USER/hlen/myhashes; echo
curl -s demo.ibhala.com/rquery/ks/$USER/hkeys/myhashes; echo
curl -s demo.ibhala.com/rquery/ks/$USER/hgetall/myhashes; echo
```

##### lists

```shell
curl -s demo.ibhala.com/rquery/ks/$USER/lpush/mylist/item1; echo
curl -s demo.ibhala.com/rquery/ks/$USER/lpush/mylist/item2; echo
curl -s demo.ibhala.com/rquery/ks/$USER/lrange/mylist/0/-1; echo
curl -s demo.ibhala.com/rquery/ks/$USER/rpop/mylist; echo
curl -s demo.ibhala.com/rquery/ks/$USER/llen/mylist; echo
```

##### keys

```shell
curl -s demo.ibhala.com/rquery/ks/$USER/keys; echo
curl -s demo.ibhala.com/rquery/ks/$USER/ttl; echo
curl -s demo.ibhala.com/rquery/keyspaces; echo
```

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
