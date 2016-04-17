
## rquery

- HTTP API for Redis queries

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

The `/keyspaces` endpoint performs a `smembers` of the set of all used keyspaces, and so your chosen keyspace should appear therein.

Notes about this demo:
- no authentication but choose a "keyspace" e.g. your username.
- automatically expires keys after an idle duration of 3 minutes.
- beware that anyone can query and modify your test data

If you require a secured private keyspace, email evan.summers@gmail.com. I'm offering this as a free service, with the following limits:
- 20MB storage
- 20GB transfer
Otherwise I'll gladly charge triple AWS or Digital Ocean hosting rates, e.g. $15 per month for a private rquery instance on Digital Ocean, with limits of 400MB RAM and 1TB transfer, or multiples thereof, with a basic service package, to make money on premium packages later, blah blah.

The following subset of Redis commands is supported for this demo:
- keys: `keys` `exists` `set` `get` `type` `ttl` `incr`
- sets: `sadd` `srem` `sismember` `smembers` `scard` `spop`
- sorted sets: `zadd` `zrem` `zcard` `zrange` `zrevrange`
- lists: `lpush` `rpop` `brpop` `brpoplpush` `llen` `lrange` `lset` `lindex` `lrem`
- hashes: `hexists` `hset` `hincrby` `hget` `hdel` `hlen` `hkeys` `hgetall`
- other: `time` `info` `keyspaces`

See Redis commands: http://redis.io/commands

#### curl

We try `curl` too

In the examples below, we set our "keyspace" as our username via `$USER.` (This is prefixed to the key by rquery.)

##### Info

```shell
curl -s demo.ibhala.com/rquery/info | tail -1
curl -s demo.ibhala.com/rquery/time | python -mjson.tool
```
where `time` returns:
```json
[
    "1460808868",
    "712166"
]
```

We sometimes support variants:
```shell
root@joy:~# date -d @`curl -s ibhala.com/rquery/time/seconds/plain`
Sat Apr 16 12:37:28 EDT 2016
```
where the `/time/seconds/plain` endpoint returns the epoch seconds in plain text, whereas `/time/seconds` is JSON and so returns the epoch seconds with double-quotes (to be a valid JSON "document"):
```shell
root@joy:~# curl -s ibhala.com/rquery/time/seconds; echo
"1460836467"
```
Incidently, this VM is named after Bill Joy :)

##### Keys

```shell
curl -s demo.ibhala.com/rquery/ks/$USER/set/mykey/myvalue | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/exists/mykey | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/get/mykey | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/ttl/mykey | python -mjson.tool
```
where `ttl/mykey` returns the TTL decreasing from 180 seconds:
```json
179
```

##### Sets

```shell
curl -s demo.ibhala.com/rquery/ks/$USER/sadd/myset/item1 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/sadd/myset/item2 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/sadd/myset/item3 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/sadd/myset/item4 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/sismember/myset/item1 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/smembers/myset | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/srem/myset/item1 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/scard/myset | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/smove/myset/myotherset/item4 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/smembers/myotherset | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/spop/myset | python -mjson.tool
```

where `smembers/myset` returns:

```json
[
    "item1",
    "item2"
]
```

##### Sorted sets

```shell
curl -s demo.ibhala.com/rquery/ks/$USER/zadd/mysortedset/10/value10 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/zadd/mysortedset/20/value20 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/zcard/mysortedset | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/zrange/mysortedset/0/-1 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/zrem/mysortedset/value10 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/zrevrange/mysortedset/0/-1 | python -mjson.tool
```

where `zrange/mysortedset` returns:

```json
[
    "value10",
    "value20"
]
```

##### Hashes

```shell
curl -s demo.ibhala.com/rquery/ks/$USER/hset/myhashes/myfield1/myfield1value | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/hget/myhashes/myfield1 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/hset/myhashes/myfield2/myfield2value | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/hget/myhashes/myfield2 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/hexists/myhashes/myfield1 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/hexists/myhashes/myfield3 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/hlen/myhashes | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/hkeys/myhashes | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/hgetall/myhashes | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/hdel/myhashes/myfield2 | python -mjson.tool
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

##### Lists

```shell
curl -s demo.ibhala.com/rquery/ks/$USER/lpush/mylist/item1 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/lpush/mylist/item2 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/lpush/mylist/item3 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/lpush/mylist/item4 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/lrange/mylist/0/-1 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/lrem/mylist/-1/item4 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/lindex/mylist/0 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/lrange/mylist/0/-1 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/lpop/mylist | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/brpop/mylist/1 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/brpoplpush/mylist/mypoppedlist/1 | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/llen/mylist | python -mjson.tool
curl -s demo.ibhala.com/rquery/ks/$USER/ltrim/mylist/0/2 | python -mjson.tool
```

where `lrange/mylist/0/-1` returns:
```json
[
    "item3",
    "item2",
    "item1"
]
```

##### Keyspace

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
   "mysortedset",
   "mylist"
]
```
and `ttl` returns:
```json
{
   "myhashes": 174,
   "mykey": 161,
   "mylist": 179,
   "myset": 166,
   "mysortedset": 169
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

### Implementation

See: https://github.com/evanx/rquery/tree/master/src

We use the component model specified in:
- https://github.com/evanx/component-validator

We use a supervisor implementation for such components via the `lib` submodule:
- https://github.com/evanx/libv


### Further reading

Related projects and further plans: https://github.com/evanx/mpush-redis/blob/master/related.md
