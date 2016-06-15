
## rquery

- HTTP API for Redis commands

It is basically a Node SSL authentication and authorisation microservice for Redis access.

Notable features (June 2016):
- Create adhoc ephemeral keyspaces
- Identity verification via Telegram.org chat bot `@redishub_bot`
- Access secured via client-authenticated SSL
- Certs granted access by admins via chat bot
- Generate tokens for Google Authenticator
- Excrypt keys using client cert via `set-encrypt`

TODO (June 2016):
- revoke cert account access
- keyspace role-based access control


### Status

UNSTABLE, INCOMPLETE


### Live demo

Try: https://demo.redishub.com

However be sure to have a JSON Viewer extension installed in your browser.

It should report the available "routes" defined for the ExpressJS webserver:

<img src="https://evanx.github.io/images/rquery/rquery030-help.png">
<hr>

where the following "help" is available:
- https://demo.redishub.com/routes - shows all the "routes"
- https://demo.redishub.com/help - currently redirects to this `README.md`

Notes about this demo:
- automatically expires keys after an idle duration of 3 minutes.


#### Commands

The following subset of Redis commands is supported for this demo:
- keys: `keys` `exists` `set` `get` `type` `ttl` `incr`
- sets: `sadd` `srem` `sismember` `smembers` `scard` `spop`
- sorted sets: `zadd` `zrem` `zcard` `zrange` `zrevrange`
- lists: `lpush` `rpop` `brpop` `brpoplpush` `llen` `lrange` `lrevrange` `lset` `lindex` `lrem`
- hashes: `hexists` `hset` `hincrby` `hget` `hdel` `hlen` `hkeys` `hvals` `hgetall`
- other: `time`

Please create an issue for any unimplemented commands you want.

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
rdemo=`curl -s https://demo.redishub.com/create-ephemeral | grep ^ak`
rdemo="https://demo.redishub.com/$rdemo"
echo $rdemo
```
where we set `rdemo` environment variable with the keyspace URL:
```
https://demo.redishub.com/ak/hub/63carsebfmrf
```
where the keyspace name has been randomly generated, and `hub` is a publically shared account.

Then we can use `curl $rdemo` as follows:
```shell
curl -s $rdemo/set/mykey/myvalue
curl -s $rdemo/exists/mykey
curl -s $rdemo/get/mykey
curl -s $rdemo/ttl/mykey
```
where `ttl/mykey` returns the TTL decreasing from 600 seconds:
```json
594
```

#### Client cert

For secure access to permanent keyspaces, let's try SSL client cert authentication on `cli.redishub.com.` Incidently, this is the same server as `secure.redishub.com` but with different a default format, in particular plain text rather than JSON.

Note that we will register an account using our Telegram.org username. (I like Telegram.org, have an Ubuntu phone, and want to build a Telegram Bot to win one of those prizes, woohoo!)

So visit https://web.telegram.org or install the mobile app, and message `@redishub_bot /verifyme.` That will verify your Telegram username to Redishub.

<hr>
<img src="https://evanx.github.io/images/rquery/rquery030-telegram.png"/>
<hr>

Then generate an admin client cert in bash:
```shell
curl -s https://open.redishub.com/ |
  bash /dev/stdin $telegramUser
```

We can register an account using this privcert as the initial `admin` authorized cert:
```shell
(
  account=`cat ~/.redishub/live/account`
  alias rhcurl="curl -s -E ~/.redishub/live/privcert.pem"
  rhcurl https://cli.redishub.com/create-account-telegram/$account
)
```

We can create a bash function and alias for keyspace commands in `~/.bashrc:`
```shell
rhdebug() {
   [ -t 1 -a "${RHLEVEL-info}" = 'debug' ] && >&2 echo -e "\e[33m${*}\e[39m"
}

_rhcurl() {
  local account=`cat ~/.redishub/live/account`
  if [ $# -eq 0 ]
  then
    rhdebug "curl -s -E ~/.redishub/live/privcert.pem https://cli.redishub.com/ak/$account/:keyspace/create-keyspace"
    return 1
  elif [ $# -eq 1 ]
  then
    rhdebug "curl -s -E ~/.redishub/live/privcert.pem https://cli.redishub.com/ak/$account/$1"
    return 1
  fi
  local cmd=''
  while [ $# -gt 0 ]
  do
    cmd="$cmd/$1"
    shift
  done
  OU=`openssl x509 -text -in ~/.redishub/live/privcert.pem |
    grep 'OU=' | sed -e 's/^.*\(OU=\S*\)$/\1/' | head -1`
  if ! echo $OU | grep -q "\W${account}@redishub.com"
  then
    echo "ERROR $OU does not match you account $account"
    return 3
  else
    rhdebug "$cn https://cli.redishub.com/ak/$account$cmd"
    curl -s -E ~/.redishub/live/privcert.pem "https://cli.redishub.com/ak/$account$cmd"
  fi
}

alias rh=_rhcurl
```

First we create a keyspace:
```shell
rh ks1 create-keyspace
```
In a given keyspace e.g. `ks1` we can invoke Redis commands:
```shell
rh ks1 sadd myset item1
rh ks1 sadd myset item2
rh ks1 smembers myset
```

<hr>
<img src="https://evanx.github.io/images/rquery/rquery030-kshelp.png"/>
<hr>

###### PKCS12 cert for browser

We prepare a `privcert.p12` using `openssl` as follows:
```shell
cd ~/.redishub
openssl pkcs12 -export -out privcert.p12 -inkey privkey.pem -in cert.pem
```

We can then import this cert into our browser.

<img src="https://evanx.github.io/images/rquery/rquery030-evanxsummers.png"/>
<hr>

Testing the same URL in another browser without our `privcert` installed:

<img src="https://evanx.github.io/images/rquery/browser-cert-none.png">
<hr>

Testing the same URL with a different `privcert` installed:

<img src="https://evanx.github.io/images/rquery/browser-cert-other.png">
<hr>


##### Browser access via Telegram.org

Alternatively, we can authorise via Telegram, via a provided token which should be sent to `@redishub_bot` e.g. via https://telegram.me/redishub_bot.

TODO

##### Sets

Let's try a few more set commands:
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
   "myhashes": 594,
   "mykey": 581,
   "mylist": 599,
   "myset": 586,
   "mysortedset": 589
}
```
which shows my keys' TTLs decreasing from 600 seconds.


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
