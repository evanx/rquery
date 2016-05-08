
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

For convenience, we sometimes support additional variants of the standard Redis commands:
```shell
$ curl -s https://demo.redishub.com/time/seconds
1462241590

$ curl -s https://demo.redishub.com/time/milliseconds
1462241598375

$ curl -s https://demo.redishub.com/time/nanoseconds
1462241604365091
```
where we can get the Epoch time in seconds, milliseconds or nanoseconds.


##### Ephemeral keyspace

We can request an temporary keyspace that will expire after an idle period of 180s:
```shell
rdemo=`curl -s https://demo.redishub.com/register-expire | grep ^ak`
rdemo="https://demo.redishub.com/$rdemo"
echo $rdemo
```
where we set `rdemo` environment variable with the keyspace URL:
```
https://demo.redishub.com/ak/@xm3gsdixlz/gckt2srrh6
```
where an account and keyspace have been randomly generated. The account name is prefixed with a `@` symbol in this case.

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

#### Client cert

For a secure access to permanent keyspaces, let's try SSL client cert authentication on `redishub.com.`

Note that we will register an account using our Telegram.org username. (I like Telegram.org, have an Ubuntu phone, and want to build a Telegram Bot to win one of those prizes, woohoo!)

So visit `https://web.telegram.org` or install the mobile app, and message `@redishub_bot /verify.` That will verify your Telegram username to Redishub.

Then generate a client cert in bash:
```shell
(
  set -e
  cd
  [ ! -d .redishub ]
  mkdir .redishub
  cd .redishub
  pwd
  echo -n 'Enter your Telegram.org username: '
  read tuser
  if curl -s https://cli.redishub.com/verify-user-telegram/$tuser | grep -v 'OK'
  then
    echo "Invalid Telegram user '$tuser'"
  else
    echo $tuser > tuser
    subj="/CN=$tuser"
    echo subj $subj
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -subj "$subj" \
      -out cert.pem \
      -keyout privkey.pem
    cat privkey.pem cert.pem > privcert.pem
    ls -l
    openssl x509 -text -in ~/.redishub/privcert.pem | grep 'CN='    
  fi
)
```

We can register a keyspace using this privcert:
```shell
tuser=`cat ~/.redishub/tuser`
curl -E ~/.redishub/privcert.pem https://cli.redishub.com/ak/$tuser/register
```

We can create a bash function an alias for keyspace commands in `~/.bashrc:`
```shell
redishubcli() {
  local tuser=`cat ~/.redishub/tuser`
  local cmd=`echo $@ | tr ' ' '/'`
  curl -s -E ~/.redishub/privcert.pem https://cli.redishub.com/ak/$tuser/$cmd
}

alias rh=redishubcli
```

First we register a keyspace:
```shell
rh ks1 register-keyspace
```
In a given keyspace e.g. `ks1` we can invoke Redis commands:
```shell
rh ks1 sadd myset item1
rh ks1 sadd myset item2
rh ks1 smembers myset
```

<img src="https://evanx.github.io/images/rquery/rhtest.png">

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
