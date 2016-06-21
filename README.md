
## rquery

Node server for Redis multi-tenancy and access control, used for https://webserva.com.

For more info, see: https://github.com/webserva/webserva/blob/master/README.md.

Notable features (June 2016):
- Create adhoc ephemeral keyspaces
- Identity verification via Telegram.org chat bot
- Access secured via client-authenticated SSL
- Certs granted access by admins via chat bot
- Generate tokens for Google Authenticator
- Excrypt keys using client cert via `set-encrypt`

![WebServaBot](http://evanx.github.io/images/rquery/ws040-webservabot.png)
<hr>

TODO (June 2016):
- revoke cert account access
- keyspace role-based access control

### Status

UNSTABLE, INCOMPLETE


### Live demo

Try: https://demo.webserva.com

However be sure to have a JSON Viewer extension installed in your browser.

It should report the available "routes" defined for the ExpressJS webserver:

![WebServa.com routes](https://evanx.github.io/images/rquery/ws040-routes.png)

where besides this README, the following "help" is available:
- https://demo.webserva.com/routes - shows all the routes/endpoints

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
curl -s https://demo.webserva.com/time
```
```shell
1460808868
712166
```
where `time` returns the seconds and nanos since the Epoch.

For convenience, we sometimes support additional variants of the standard Redis commands:
```shell
$ curl -s https://demo.webserva.com/time/seconds
1462241590

$ curl -s https://demo.webserva.com/time/milliseconds
1462241598375

$ curl -s https://demo.webserva.com/time/nanoseconds
1462241604365091
```
where we can get the Epoch time in seconds, milliseconds or nanoseconds.


##### Ephemeral keyspace

We can request an temporary keyspace that will expire after an idle period of 180s:
```shell
wsdemo=`curl -s https://demo.webserva.com/create-ephemeral | grep ^ak`
wsdemo="https://demo.webserva.com/$wsdemo"
echo $wsdemo
```
where we set `wsdemo` environment variable with the keyspace URL:
```
https://demo.webserva.com/ak/hub/63carsebfmrf
```
where the keyspace name has been randomly generated, and `hub` is a publically shared account.

Then we can use `curl $wsdemo` as follows:
```shell
curl -s $wsdemo/set/mykey/myvalue
curl -s $wsdemo/exists/mykey
curl -s $wsdemo/get/mykey
curl -s $wsdemo/ttl/mykey
```
where `ttl/mykey` returns the TTL decreasing from 600 seconds:
```json
594
```

#### Client cert

For secure access to permanent keyspaces, let's try SSL client cert authentication on `cli.webserva.com.` Incidently, this is the same server as `secure.webserva.com` but with different a default format, in particular plain text rather than JSON.

Note that we will register an account using our Telegram.org username. (I like Telegram.org, have an Ubuntu phone, and want to build a Telegram Bot to win one of those prizes, woohoo!)

So visit https://web.telegram.org or install the mobile app, and message `@WebServaBot /verifyme.` That will verify your Telegram username to Redishub.

![WebServaBot /verifyme](http://evanx.github.io/images/rquery/ws040-verifyme.png)
<hr>

See the following instructions for creating a client cert:

https://github.com/webserva/webserva/blob/master/docs/register-cert.md

This utilitises a script generator endpoint for your account e.g. see: https://open.webserva.com/cert-script/ACCOUNT

![Cert script piped to bash](https://evanx.github.io/images/rquery/ws040-cert-script-ee895ce.png)

This curls a versioned script: https://raw.githubusercontent.com/webserva/webserva/master/bin/cert-script.sh

It's SHA is compared to an alternative source, to give confidence in its integrity, i.e. multiple sites would have been hacked to ensure that a tampered version of this script is not detectable.

```shell
curl -s https://raw.githubusercontent.com/webserva/webserva/master/bin/cert-script.sh | sha1sum
curl -s https://open.webserva.com/assets/cert-script.sh.sha1sum
```
where the script currently has the following hash:
```
f6edc446466e228965e51bee120425b497605949
```

It curls the following help endpoint: https://open.webserva.com/cert-script-help/ACCOUNT

Finally it curls the following static help:
```
curl -s https://raw.githubusercontent.com/webserva/webserva/master/docs/install.wscurl.txt
```
```
Try the following:
  cd
  git clone https://github.com/webserva/webserva.git
  alias ws='~/webserva/bin/wscurl.sh' # try add this line to ~/.bashrc
  ws help
```  

#### Using wscurl

We install `wscurl` via the following Github `webserva` repo:
```
git clone https://github.com/webserva/webserva.git
alias ws='~/webserva/bin/wscurl.sh
ws help
```
where we create a bash alias for convenience, perhaps even in `~/.bashrc` for all sessions. In this case you should first ensure your system does not have a binary or alias `ws`
```
which ws
alias ws
```

![wscurl](https://evanx.github.io/images/rquery/ws040-wscurl.png)

First we create a keyspace:
```shell
ws ks1 create-keyspace
```
In a given keyspace e.g. `ks1` we can invoke Redis commands:
```shell
ws ks1 sadd myset item1
ws ks1 sadd myset item2
ws ks1 smembers myset
```

<img src="https://evanx.github.io/images/rquery/ws040-ephemeral.png"/>

###### PKCS12 cert for browser

The cert generation script creates `~/.webserva/live/privcert.p12.` We should import this cert into our browser.

<img src="https://evanx.github.io/images/rquery/rquery030-evanxsummers.png"/>
<hr>

Testing the same URL in another browser without our `privcert` installed:

<img src="https://evanx.github.io/images/rquery/browser-cert-none.png">
<hr>

Testing the same URL with a different `privcert` installed:

<img src="https://evanx.github.io/images/rquery/browser-cert-other.png">
<hr>


##### Browser access via Telegram.org

Alternatively, we can authorise via Telegram, via a provided token which should be sent to `@WebServaBot` e.g. via https://telegram.me/WebServaBot.

TODO

##### Sets

Let's try a few more set commands:
```shell
curl -s $wsdemo/sadd/myset/item1
curl -s $wsdemo/sadd/myset/item2
curl -s $wsdemo/sadd/myset/item3
curl -s $wsdemo/sadd/myset/item4
curl -s $wsdemo/sismember/myset/item1
curl -s $wsdemo/smembers/myset
curl -s $wsdemo/srem/myset/item1
curl -s $wsdemo/scard/myset
curl -s $wsdemo/smove/myset/myotherset/item4
curl -s $wsdemo/smembers/myotherset
curl -s $wsdemo/spop/myset
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
curl -s $wsdemo/zadd/mysortedset/10/value10
curl -s $wsdemo/zadd/mysortedset/20/value20
curl -s $wsdemo/zcard/mysortedset
curl -s $wsdemo/zrange/mysortedset/0/-1
curl -s $wsdemo/zrem/mysortedset/value10
curl -s $wsdemo/zrevrange/mysortedset/0/-1
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
curl -s $wsdemo/hset/myhashes/myfield1/myfield1value
curl -s $wsdemo/hget/myhashes/myfield1
curl -s $wsdemo/hset/myhashes/myfield2/myfield2value
curl -s $wsdemo/hget/myhashes/myfield2
curl -s $wsdemo/hexists/myhashes/myfield1
curl -s $wsdemo/hexists/myhashes/myfield3
curl -s $wsdemo/hlen/myhashes
curl -s $wsdemo/hkeys/myhashes
curl -s $wsdemo/hgetall/myhashes
curl -s $wsdemo/hdel/myhashes/myfield2
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
curl -s $wsdemo/lpush/mylist/item1
curl -s $wsdemo/lpush/mylist/item2
curl -s $wsdemo/lpush/mylist/item3
curl -s $wsdemo/lpush/mylist/item4
curl -s $wsdemo/lrange/mylist/0/-1
curl -s $wsdemo/lrem/mylist/-1/item4
curl -s $wsdemo/lindex/mylist/0
curl -s $wsdemo/lrange/mylist/0/-1
curl -s $wsdemo/lpop/mylist
curl -s $wsdemo/brpop/mylist/1
curl -s $wsdemo/brpoplpush/mylist/mypoppedlist/1
curl -s $wsdemo/llen/mylist
curl -s $wsdemo/ltrim/mylist/0/2
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
curl -s $wsdemo/keys
curl -s $wsdemo/ttl
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

Webserva deployment: https://github.com/webserva/webserva

https://twitter.com/evanxsummers
