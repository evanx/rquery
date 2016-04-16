
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

where the following "help" is available:
- http://demo.ibhala.com/rquery/routes - shows all the "routes"
- http://demo.ibhala.com/rquery/help - renders this `README.md`

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
curl -s demo.ibhala.com/rquery/ks/$USER/set/mykey/myvalue | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/exists/mykey | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/get/mykey | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/ttl/mykey | python -mjson.tool
```
where `ttl/mykey` returns the TTL decreasing from 180 seconds:
```
179
```

##### sets

```shell
curl -s demo.ibhala.com/rquery/ks/$USER/sadd/myset/item1 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/sadd/myset/item2 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/sismember/myset/item1 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/scard/myset | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/smembers/myset | python -mjson.tool
```

where `smembers/myset` returns:

```json
[
    "item1",
    "item2"
]
```

##### hashes

```shell
curl -s demo.ibhala.com/rquery/ks/$USER/hset/myhashes/myfield1/myfield1value | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/hget/myhashes/myfield1 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/hset/myhashes/myfield2/myfield2value | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/hget/myhashes/myfield2 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/hexists/myhashes/myfield1 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/hexists/myhashes/myfield2 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/hlen/myhashes | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/hkeys/myhashes | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/hgetall/myhashes | python -mjson.tool
```

where `hkeys/myhashes` returns:
```json
[
    "myfield1",
    "myfield2"
]
```

and `hgetall/myhashes` returns:
```json
{
    "myfield1": "myfield1value",
    "myfield2": "myfield2value"
}
```

##### lists

```shell
curl -s demo.ibhala.com/rquery/ks/$USER/lpush/mylist/item1 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/lpush/mylist/item2 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/lpush/mylist/item3 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/lrange/mylist/0/-1 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/llen/mylist | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/lpop/mylist | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/brpop/mylist/1 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/llen/mylist | python -mjson.tool
```

where `lrange/mylist/0/-1` returns:
```json
[
    "item3",
    "item2",
    "item1"
]
```

##### keyspace

We can check the keys and their TTL in the specified `keyspace` as follows:
```shell
curl -s demo.ibhala.com/rquery/ks/$USER/keys | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/ttl | python -mjson.tool
```

where `keys` returns:
```json
[
   "myhashes",
   "myset",
   "mykey",
   "mylist"
]
```
and `ttl` returns:
```json
{
   "myhashes": 174,
   "mykey": 165,
   "mylist": 179,
   "myset": 169
}
```
which shows my keys' TTLs decreasing from 180 seconds.

We can check the keys and their TTL in the specified `keyspace` as follows:
```shell
curl -s demo.ibhala.com/rquery/keyspaces | python -mjson.tool
```

where `keyspaces` returns:
```json
[
    "evanx"
]
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
