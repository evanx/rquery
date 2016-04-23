
## rquery

- HTTP API for Redis queries

### Status

UNSTABLE, INCOMPLETE

### Live demo

Try: https://demo.ibhala.com/rquery

However be sure to have a JSON Viewer extension installed in your browser.

It should report the available "routes" defined for the ExpressJS webserver:

<img src="https://evanx.github.io/images/rquery/rquery-routes.png">

where the following "help" is available:
- https://demo.ibhala.com/rquery/routes - shows all the "routes"
- https://demo.ibhala.com/rquery/help - renders this `README.md`

Notes about this demo:
- automatically expires keys after an idle duration of 3 minutes.


#### Register

Register a keyspace that is associated with your identity, either Github or Twitter:
```shell
curl -s https://demo.ibhala.com/rquery/kt/KEYSPACE/TOKEN/register/github.com/USERNAME
```
where `github.com/USERNAME` is your Github.com username. Alternatively specify `twitter.com` and your Twitter username.

Note that SSL must be used, otherwise your keyspace could be hijacked i.e. if the `TOKEN` is transferred in cleartext.

Incidently, for production use, we would generate a "strong" token as follows:
```shell
rqueryToken=`dd if=/dev/urandom bs=20 count=1 2>/dev/null | sha1sum | cut -d' ' -f1`
echo "export rqueryToken='$rqueryToken'" >> ~/.bashrc
tail -1 ~/.bashrc
. ~/.bashrc
```

Having said that, this token-based `/kt` is provided for demonstration purposes, especially to be usable "as is" via your browser. However it is susceptible to replay attacks, and so is not appropriate for production use.

This service will support client-side cert authentication. Incidently that will be offered via `secure.ibhala.com,` free within limits yet to be announced for a "community service" package. Those limits should be sufficient for small, low-volume databases. Later, we'll trade-off in-memory performance for database size, where larger databases are served by a disk-based back end e.g. utilising https://ssdb.io.


#### Commands

The following subset of Redis commands is supported for this demo:
- keys: `keys` `exists` `set` `get` `type` `ttl` `incr`
- sets: `sadd` `srem` `sismember` `smembers` `scard` `spop`
- sorted sets: `zadd` `zrem` `zcard` `zrange` `zrevrange`
- lists: `lpush` `rpop` `brpop` `brpoplpush` `llen` `lrange` `lset` `lindex` `lrem`
- hashes: `hexists` `hset` `hincrby` `hget` `hdel` `hlen` `hkeys` `hgetall`
- other: `time` `info` `keyspaces`

See Redis commands: https://redis.io/commands


#### curl

We try `curl` too. In the examples below, we set our "keyspace" as our Github username. (Incidently, this is prefixed to the key by rquery.)


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
root@joy:~# curl -s https://ibhala.com/rquery/time/seconds; echo
"1460836467"
```
where the `/time/seconds` endpoint returns the epoch seconds. The default is JSON, and hence the double-quotes i.e. to be a valid JSON "document."

Incidently, this VM is named after Bill Joy, to whom I would speechlessly say, "Thanks for Unix and vi!"

More practical for some use-cases, the `?plain` query returns the epoch seconds in plain text:
```shell
$ echo `curl -s https://ibhala.com/rquery/time/seconds?plain`
1460910466

$ date -d @`curl -s https://ibhala.com/rquery/time/seconds?plain`
Sun Apr 17 18:27:51 SAST 2016
```

Incidently the `http://ibhala.com/epoch` endpoint was announced to be "eternally" available. Actually this endpoint is proxied to `/rquery/time/seconds?plain.` An HTTP expiry header of 15 seconds is added:
```shell
$ curl -I http://ibhala.com/epoch | grep '^Cache-Control'
Cache-Control: max-age=15
```
As such, it's expected to be up to about 15 seconds later than the actual epoch time i.e. allowing for CDN caching.

##### Keys

Let's first set some environment variables:
```shell
rqueryGithubUser=MY
```
and then:
```shell
rqueryDemoToken=`dd if=/dev/urandom bs=20 count=1 2>/dev/null | sha1sum | cut -d' ' -f1`
rqueryDemoUrl="https://demo.ibhala.com/rquery/kt/$rqueryGithubUser/$rqueryToken"
echo $rqueryDemoUrl
curl -s $rqueryDemoUrl/register/github.com/$rqueryGithubUser; printf '\n%d\n' $?
```

Now let's test:
```shell
curl -s $rqueryDemoUrl/set/mykey/myvalue | python -mjson.tool
curl -s $rqueryDemoUrl/exists/mykey | python -mjson.tool
curl -s $rqueryDemoUrl/get/mykey | python -mjson.tool
curl -s $rqueryDemoUrl/ttl/mykey | python -mjson.tool
```
where `ttl/mykey` returns the TTL decreasing from 180 seconds:
```json
179
```

##### Sets

```shell
curl -s $rqueryDemoUrl/sadd/myset/item1 | python -mjson.tool
curl -s $rqueryDemoUrl/sadd/myset/item2 | python -mjson.tool
curl -s $rqueryDemoUrl/sadd/myset/item3 | python -mjson.tool
curl -s $rqueryDemoUrl/sadd/myset/item4 | python -mjson.tool
curl -s $rqueryDemoUrl/sismember/myset/item1 | python -mjson.tool
curl -s $rqueryDemoUrl/smembers/myset | python -mjson.tool
curl -s $rqueryDemoUrl/srem/myset/item1 | python -mjson.tool
curl -s $rqueryDemoUrl/scard/myset | python -mjson.tool
curl -s $rqueryDemoUrl/smove/myset/myotherset/item4 | python -mjson.tool
curl -s $rqueryDemoUrl/smembers/myotherset | python -mjson.tool
curl -s $rqueryDemoUrl/spop/myset | python -mjson.tool
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
curl -s $rqueryDemoUrl/zadd/mysortedset/10/value10 | python -mjson.tool
curl -s $rqueryDemoUrl/zadd/mysortedset/20/value20 | python -mjson.tool
curl -s $rqueryDemoUrl/zcard/mysortedset | python -mjson.tool
curl -s $rqueryDemoUrl/zrange/mysortedset/0/-1 | python -mjson.tool
curl -s $rqueryDemoUrl/zrem/mysortedset/value10 | python -mjson.tool
curl -s $rqueryDemoUrl/zrevrange/mysortedset/0/-1 | python -mjson.tool
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
curl -s $rqueryDemoUrl/hset/myhashes/myfield1/myfield1value | python -mjson.tool
curl -s $rqueryDemoUrl/hget/myhashes/myfield1 | python -mjson.tool
curl -s $rqueryDemoUrl/hset/myhashes/myfield2/myfield2value | python -mjson.tool
curl -s $rqueryDemoUrl/hget/myhashes/myfield2 | python -mjson.tool
curl -s $rqueryDemoUrl/hexists/myhashes/myfield1 | python -mjson.tool
curl -s $rqueryDemoUrl/hexists/myhashes/myfield3 | python -mjson.tool
curl -s $rqueryDemoUrl/hlen/myhashes | python -mjson.tool
curl -s $rqueryDemoUrl/hkeys/myhashes | python -mjson.tool
curl -s $rqueryDemoUrl/hgetall/myhashes | python -mjson.tool
curl -s $rqueryDemoUrl/hdel/myhashes/myfield2 | python -mjson.tool
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
curl -s $rqueryDemoUrl/lpush/mylist/item1 | python -mjson.tool
curl -s $rqueryDemoUrl/lpush/mylist/item2 | python -mjson.tool
curl -s $rqueryDemoUrl/lpush/mylist/item3 | python -mjson.tool
curl -s $rqueryDemoUrl/lpush/mylist/item4 | python -mjson.tool
curl -s $rqueryDemoUrl/lrange/mylist/0/-1 | python -mjson.tool
curl -s $rqueryDemoUrl/lrem/mylist/-1/item4 | python -mjson.tool
curl -s $rqueryDemoUrl/lindex/mylist/0 | python -mjson.tool
curl -s $rqueryDemoUrl/lrange/mylist/0/-1 | python -mjson.tool
curl -s $rqueryDemoUrl/lpop/mylist | python -mjson.tool
curl -s $rqueryDemoUrl/brpop/mylist/1 | python -mjson.tool
curl -s $rqueryDemoUrl/brpoplpush/mylist/mypoppedlist/1 | python -mjson.tool
curl -s $rqueryDemoUrl/llen/mylist | python -mjson.tool
curl -s $rqueryDemoUrl/ltrim/mylist/0/2 | python -mjson.tool
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
curl -s $rqueryDemoUrl/keys | python -mjson.tool
curl -s $rqueryDemoUrl/ttl | python -mjson.tool
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
