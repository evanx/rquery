
set -e -u
 
rediscli() {
  >&2 echo "redis-cli -n 13 $*"
  redis-cli -n 13 $*
}

  if [ `hostname -s` = 'eowyn' -a $USER = 'evans' -a `date +%s` -lt 1460056666 ]
  then
    for key in `rediscli keys 'demo:hmsetprops:*'`
    do
      rediscli del $key
    done
  fi
  npm run demo 
  if [ `hostname -s` = 'eowyn' -a $USER = 'evans' -a `date +%s` -lt 1460056666 ]
  then
    rediscli keys 'demo:hmsetprops:*' 
    rediscli hgetall demo:hmsetprops:1
    rediscli hgetall demo:hmsetprops:1:audit
    rediscli get demo:hmsetprops:id
    rediscli smembers demo:hmsetprops:ids
  fi

