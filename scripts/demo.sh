
set -e -u
 
rediscli() {
  >&2 echo "redis-cli -n 13 $*"
  redis-cli -n 13 $*
}

[ `hostname -s` = 'eowyn' -a $USER = 'evans' ]

  npm run demo 

  rediscli keys 'demo:hmsetprops:*' 
  rediscli hgetall 'demo:hmsetprops:1'

