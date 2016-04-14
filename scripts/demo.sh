
set -e -u

rediscli() {
  >&2 echo "redis-cli -n 13 $*"
  redis-cli -n 13 $*
}

[ `hostname -s` = 'eowyn' -a $USER = 'evans' ]

  NODE_ENV=development configModule=./demo.js redisUrl='redis://localhost:6379/13' npm start | ./node_modules/.bin/bunyan -o short
  #npm run demo

  rediscli keys 'demo:hmsetprops:*'
  rediscli hgetall 'demo:hmsetprops:1'
