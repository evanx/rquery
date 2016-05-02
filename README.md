
## rquery

- HTTP API for Redis queries

### Status

UNSTABLE, INCOMPLETE

### Live demo

Try: https://demo.redishub.com/rquery

However be sure to have a JSON Viewer extension installed in your browser.

It should report the available "routes" defined for the ExpressJS webserver:

<img src="https://evanx.github.io/images/rquery/rquery-routes.png">

where the following "help" is available:
- https://demo.redishub.com/rquery/routes - shows all the "routes"
- https://demo.redishub.com/rquery/help - renders this `README.md`

Notes about this demo:
- automatically expires keys after an idle duration of 3 minutes.


#### Register

Register a chosen keyspace name, and security access token:
```shell
curl -s https://demo.redishub.com/rquery/kt/$keyspace/$token/register/github.com/$user
```
where you also provide your Github username as identification to administer the keyspace (TODO).

For example:
```shell
curl -s https://demo.redishub.com/rquery/kt/snoopyinc:test1/mysecret/register/github.com/snoopy
```
where `mysecret` should be specified, ideally generated and saved on disk as follows:
```shell
[ ! -f ~/.rquery-demo-token] && dd if=/dev/urandom bs=10 count=1 2>/dev/null |
  ./node_modules/.bin/base32 > ~/.rquery-demo-token
```
where this "strong" token cannot be easily remembered (or guessed) and so must be saved e.g. the `setup.sh` script saves it to a file `token` in a specified directory.

Alternatively, use the public `gentoken` endpoint:
```shell
curl -s https://demo.redishub.com/rquery/gentoken?plain
```

Note that SSL must be used, otherwise your keyspace could be hijacked i.e. if the token `mysecret` is transferred in cleartext.

This token-based `/kt` endpoint is provided for initial demonstration purposes, especially to be usable "as is" via your browser.


#### Client cert

For a more secure solution, create a self-signed cert using `openssl:`
```shell
```

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
curl -s https://demo.redishub.com/rquery/info | tail -1
curl -s https://demo.redishub.com/rquery/time | python -mjson.tool
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
root@joy:~# curl -s https://demo.redishub.com/rquery/time/seconds; echo
"1460836467"
```
where the `/time/seconds` endpoint returns the epoch seconds. The default is JSON, and hence the double-quotes i.e. to be a valid JSON "document."

More practical for some use-cases, the `?plain` query returns the epoch seconds in plain text:
```shell
$ curl -s https://demo.redishub.com/rquery/time/seconds?plain
1460910466
```
Actually we provide a domain `cli.redishub.com` intended for command-line testing, where `plain` result formatting is the default.
```shell
$ curl -s https://cli.redishub.com/rquery/time/seconds`
1460910466
```

##### Keys

Let's first setup a working directory as follows:
```shell
urlFile=~/.rdemo dir=~/demo-rquery auth=github.com user=evanx force=true ./scripts/setup.demo.sh
export rdemo=`cat ~/.rdemo`
echo rdemo $rdemo
```
where `user` must be substituted with <b>your</b> Github username.

Then we can use `curl $rdemo` as follows:
```shell
curl -s $rdemo/set/mykey/myvalue | python -mjson.tool
curl -s $rdemo/exists/mykey | python -mjson.tool
curl -s $rdemo/get/mykey | python -mjson.tool
curl -s $rdemo/ttl/mykey | python -mjson.tool
```
where `ttl/mykey` returns the TTL decreasing from 180 seconds:
```json
179
```

The above `setup.sh` script will `register` a keyspace with a chosen `token.` For the reverse operation, we `deregister` (and flush) our keyspace as follows:
```shell
curl -s $rdemo/deregister | python -mjson.tool
```
where `rdemo` provides the keyspace and authorization token.

We can now run the test script
```shell
./scripts/test.sh
```
where this will use `~/demo-rquery/uri` i.e. our keyspace/token URL as per `register` e.g. performed by `setup.sh.`

##### Sets

```shell
curl -s $rdemo/sadd/myset/item1 | python -mjson.tool
curl -s $rdemo/sadd/myset/item2 | python -mjson.tool
curl -s $rdemo/sadd/myset/item3 | python -mjson.tool
curl -s $rdemo/sadd/myset/item4 | python -mjson.tool
curl -s $rdemo/sismember/myset/item1 | python -mjson.tool
curl -s $rdemo/smembers/myset | python -mjson.tool
curl -s $rdemo/srem/myset/item1 | python -mjson.tool
curl -s $rdemo/scard/myset | python -mjson.tool
curl -s $rdemo/smove/myset/myotherset/item4 | python -mjson.tool
curl -s $rdemo/smembers/myotherset | python -mjson.tool
curl -s $rdemo/spop/myset | python -mjson.tool
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
curl -s $rdemo/zadd/mysortedset/10/value10 | python -mjson.tool
curl -s $rdemo/zadd/mysortedset/20/value20 | python -mjson.tool
curl -s $rdemo/zcard/mysortedset | python -mjson.tool
curl -s $rdemo/zrange/mysortedset/0/-1 | python -mjson.tool
curl -s $rdemo/zrem/mysortedset/value10 | python -mjson.tool
curl -s $rdemo/zrevrange/mysortedset/0/-1 | python -mjson.tool
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
curl -s $rdemo/hset/myhashes/myfield1/myfield1value | python -mjson.tool
curl -s $rdemo/hget/myhashes/myfield1 | python -mjson.tool
curl -s $rdemo/hset/myhashes/myfield2/myfield2value | python -mjson.tool
curl -s $rdemo/hget/myhashes/myfield2 | python -mjson.tool
curl -s $rdemo/hexists/myhashes/myfield1 | python -mjson.tool
curl -s $rdemo/hexists/myhashes/myfield3 | python -mjson.tool
curl -s $rdemo/hlen/myhashes | python -mjson.tool
curl -s $rdemo/hkeys/myhashes | python -mjson.tool
curl -s $rdemo/hgetall/myhashes | python -mjson.tool
curl -s $rdemo/hdel/myhashes/myfield2 | python -mjson.tool
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
curl -s $rdemo/lpush/mylist/item1 | python -mjson.tool
curl -s $rdemo/lpush/mylist/item2 | python -mjson.tool
curl -s $rdemo/lpush/mylist/item3 | python -mjson.tool
curl -s $rdemo/lpush/mylist/item4 | python -mjson.tool
curl -s $rdemo/lrange/mylist/0/-1 | python -mjson.tool
curl -s $rdemo/lrem/mylist/-1/item4 | python -mjson.tool
curl -s $rdemo/lindex/mylist/0 | python -mjson.tool
curl -s $rdemo/lrange/mylist/0/-1 | python -mjson.tool
curl -s $rdemo/lpop/mylist | python -mjson.tool
curl -s $rdemo/brpop/mylist/1 | python -mjson.tool
curl -s $rdemo/brpoplpush/mylist/mypoppedlist/1 | python -mjson.tool
curl -s $rdemo/llen/mylist | python -mjson.tool
curl -s $rdemo/ltrim/mylist/0/2 | python -mjson.tool
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
curl -s $rdemo/keys | python -mjson.tool
curl -s $rdemo/ttl | python -mjson.tool
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
curl -s redishub.com/rquery/keyspaces | python -mjson.tool
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

See the configuration module for this demo: https://github.com/evanx/rquery/blob/master/config/demo.js

### Implementation

See: https://github.com/evanx/rquery/tree/master/src

We use the component model specified in:
- https://github.com/evanx/component-validator

We use a supervisor implementation for such components via the `lib` submodule:
- https://github.com/evanx/libv


### Further reading

Related projects and further plans: https://github.com/evanx/mpush-redis/blob/master/related.md
