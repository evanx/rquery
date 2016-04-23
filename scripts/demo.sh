
set -e -u

rediscli() {
  >&2 echo "redis-cli -n 13 $*"
  redis-cli -n 13 $*
}

  #curl -s https://ibhala.com/rquery/kt/demo/qwerty/register/github.com/evanx

  NODE_ENV=development loggingUrlX='https://ibhala.com/rquery/kt/demo/qwerty' \
    configModule=./demo.js redisUrl='redis://localhost:6379/13' \
    npm start | ./node_modules/.bin/bunyan -o short
