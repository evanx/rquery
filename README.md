
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
- https://demo.redishub.com/routes - shows all the "routes"
- https://demo.redishub.com/help - renders this `README.md`

Notes about this demo:
- automatically expires keys after an idle duration of 3 minutes.


#### Commands

The following subset of Redis commands is supported for this demo:
- keys: `keys` `exists` `set` `get` `type` `ttl` `incr`
- sets: `sadd` `srem` `sismember` `smembers` `scard` `spop`
- sorted sets: `zadd` `zrem` `zcard` `zrange` `zrevrange`
- lists: `lpush` `rpop` `brpop` `brpoplpush` `llen` `lrange` `lset` `lindex` `lrem`
- hashes: `hexists` `hset` `hincrby` `hget` `hdel` `hlen` `hkeys` `hgetall`
- other: `time` `info` `keyspaces`

See Redis commands: https://redis.io/commands


##### Time

Let's try get the Redis `time.`

```shell
curl -s https://demo.redishub.com/time
```
```shell
1460808868
712166
```
where `time` returns the seconds and nanos since the Epoch.

For convenience, we sometimes support additional variants of the standard Redis commands e.g. the Epoch time in seconds, milliseconds or nanoseconds:
```shell
root@joy:~# curl -s https://demo.redishub.com/time/seconds
1460836467
```
where the `/time/seconds` endpoint returns the epoch seconds.

Also try:
- `/time/milliseconds`
- `/time/nanoseconds`

##### Keys

We can request an temporary keyspace that will expire after an idle period of 180s:
```shell
rdemo=`curl -s https://demo.redishub.com/register-expire | grep ^kt`
rdemo="https://demo.redishub.com/$rdemo"
echo $rdemo
```
```
https://demo.redishub.com/kt/~atfmbxg/g05qk2g
```

Then we can use `curl $rdemo` as follows:
```shell
curl -s $rdemo/set/mykey/myvalue
curl -s $rdemo/exists/mykey
curl -s $rdemo/get/mykey
curl -s $rdemo/ttl/mykey
```
where `ttl/mykey` returns the TTL decreasing from 180 seconds:
```json
179
```

#### Register

Register a chosen keyspace name, and security access token:
```shell
curl -s https://demo.redishub.com/kt/$keyspace/$token/register/github.com/$user
```
where you also provide your Github username as identification to administer the keyspace (TODO).

For example:
```shell
curl -s https://demo.redishub.com/kt/snoopyinc:test1/mysecret/register/github.com/snoopy
```
where `mysecret` should be specified, ideally generated and saved on disk as follows:
```shell
[ ! -f ~/.rquery-demo-token] && dd if=/dev/urandom bs=10 count=1 2>/dev/null |
  ./node_modules/.bin/base32 > ~/.rquery-demo-token
```
where this "strong" token cannot be easily remembered (or guessed) and so must be saved. Note that currently it cannot be recovered if lost (TODO).

Alternatively, use the public `gentoken` endpoint:
```shell
curl -s https://demo.redishub.com/gentoken?plain
```

Note that SSL must be used, otherwise your keyspace could be hijacked i.e. if the token `mysecret` is transferred in cleartext.

This token-based `/kt` endpoint is provided for initial demonstration purposes, especially to be usable "as is" via your browser.


#### Client cert

For a secure solution for permanent keyspaces, let's try SSL client cert authentication, as per: http://github.com/evanx/concerto

In this case, you will need create a repo named `certs-concerto` on your Github account.

Let's clone `concerto:`
```shell
git clone git@github.com:evanx/concerto.git
```
Then we use `bin/concerto gen`
```shell
cd concerto
bin/concerto gen
```
where `gen` command creates self-signed client cert using `openssl.`

We deploy this generated privcert to `~/.redishub/privcert.pem` et al as follows:
```shell
bin/concerto deploy
```

##### certs-concerto

Once you have created `certs-concerto` on your Github account, then try `ghuser:`
```shell
bin/concerto ghuser MY_GITHUB_USER
```
Create a local ~/certs-concerto repo with the generated cert:
```shell
bin/concerto ghinit
```
Try `ghcommit` to add, commit and push upstream to Github:
```
bin/concerto ghcommit 'initial'
```
```shell
curl -s https://clisecure.redishub.com/k/mykeyspace/register/github.com/GHUSER
```
where you must substitute:
- `GHUSER` for your Github user

We instruct the service to import these client certs for our keyspace:
```shell
curl -s https://clisecure.redishub.com/k/mykeyspace/importcerts
```

Using our client privcert `~/.redishub/privcert.pem` as deployed by `concerto,` we can operate on the keyspace:
```shell
curl -s -E ~/.redishub/privcert.pem https://clisecure.redishub.com/k/mykeyspace/set/message/HELLO
```

##### Sets

```shell
curl -s $rdemo/sadd/myset/item1
curl -s $rdemo/sadd/myset/item2
curl -s $rdemo/sadd/myset/item3
curl -s $rdemo/sadd/myset/item4
curl -s $rdemo/sismember/myset/item1
curl -s $rdemo/smembers/myset
curl -s $rdemo/srem/myset/item1
curl -s $rdemo/scard/myset
curl -s $rdemo/smove/myset/myotherset/item4
curl -s $rdemo/smembers/myotherset
curl -s $rdemo/spop/myset
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
curl -s $rdemo/zadd/mysortedset/10/value10
curl -s $rdemo/zadd/mysortedset/20/value20
curl -s $rdemo/zcard/mysortedset
curl -s $rdemo/zrange/mysortedset/0/-1
curl -s $rdemo/zrem/mysortedset/value10
curl -s $rdemo/zrevrange/mysortedset/0/-1
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
curl -s $rdemo/hset/myhashes/myfield1/myfield1value
curl -s $rdemo/hget/myhashes/myfield1
curl -s $rdemo/hset/myhashes/myfield2/myfield2value
curl -s $rdemo/hget/myhashes/myfield2
curl -s $rdemo/hexists/myhashes/myfield1
curl -s $rdemo/hexists/myhashes/myfield3
curl -s $rdemo/hlen/myhashes
curl -s $rdemo/hkeys/myhashes
curl -s $rdemo/hgetall/myhashes
curl -s $rdemo/hdel/myhashes/myfield2
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
curl -s $rdemo/lpush/mylist/item1
curl -s $rdemo/lpush/mylist/item2
curl -s $rdemo/lpush/mylist/item3
curl -s $rdemo/lpush/mylist/item4
curl -s $rdemo/lrange/mylist/0/-1
curl -s $rdemo/lrem/mylist/-1/item4
curl -s $rdemo/lindex/mylist/0
curl -s $rdemo/lrange/mylist/0/-1
curl -s $rdemo/lpop/mylist
curl -s $rdemo/brpop/mylist/1
curl -s $rdemo/brpoplpush/mylist/mypoppedlist/1
curl -s $rdemo/llen/mylist
curl -s $rdemo/ltrim/mylist/0/2
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
curl -s $rdemo/keys
curl -s $rdemo/ttl
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
curl -s redishub.com/keyspaces | python -mjson.tool
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
