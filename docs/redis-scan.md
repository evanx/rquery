
## redis-scan

We know we must avoid `redis-cli keys '*'` especially on production servers, since this locks up Redis for the duration.

Here is a Redis scanner intended for `~/.bashrc` aliased as `redis-scan`

It's brand new and untested, so please test on a disposable VM against a disposable local Redis instance, in case it trashes your Redis keys. As per the ISC license, the author disclaims any responsibility for any unfortunate events resulting from the disastrous use of this bash function ;)

### Examples

By default it will scan through all keys using `SCAN` (with a cursor), sleeping for `sleep` (default 250ms) before fetching the next batch, so that other clients get a chance.

Incidently, it will also sleep while the current load average is above the default limit (1) so that what we are doing doesn't further overload our machine.

However when accessing a remote Redis instance via `-h` we might be clobbering that. So the script checks the `slowlog` length between batches and if its length increases, then sleeps some more.

The default will scan all keys:
```shell
redis-scan
```

If the first parameter is a number, it is taken as the database number:
```shell
redis-scan 2
```
where this scans database number `2` via `redis-cli -n 2`

We can use `match`
```shell
redis-scan 0 match '*'
```
If a parameter contains an asterisk, then `match` is assumed:
```shell
redis-scan 0 '*'
```
We can filter the keys by type, e.g.
We can filter the keys by type, e.g.
```shell
redis-scan @set
```
or abbreviated as:
```shell
redis-scan @set
```
Other supported types are: string, list, hash, set, zset.
```shell
redis-scan @hash -- hgetall
```
where we use `--` to delimit the scan arguments with those of an `each` command. That optional command is then invoked, on the same Redis instance, for each key that is scanned.

The above is equivalent to the following command:
```shell
redis-scan -n 0 @hash | xargs -n1 redis-cli -n 0 hgetall
```
To disable the `eachLimit` and actually perform the `each` command:
```shell
commit=1 eachLimit=0 redis-scan @hash -- del
```

### Implementation

Let's grap the repo into a `tmp` directory.
```shell
( set -e
  mkdir -p ~/tmp
  cd ~/tmp
  git clone https://github.com/evanx/rquery
)
```

Import some colorful logging utils into our current bash shell to test:
```shell
. bin/bashrc.rhlogging.sh
```

The main util is the following `RedisScan` function.

```shell
. bin/bashrc.redis-scan.sh
```
where we alias `redis-scan` to the `RedisScan` function implemented therein.
```shell
alias redis-scan=RedisScan
```

https://twitter.com/@evanxsummers
