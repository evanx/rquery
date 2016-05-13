
set -e -u

rediscli() {
  >&2 echo "redis-cli -n 13 $*"
  redis-cli -n 13 $*
}

  NODE_ENV=development loggingHost='https://secure.redishub.com' \
    configModule=./config/development.js redisUrl='redis://localhost:6379/13' \
    npm start | ./node_modules/.bin/bunyan -o short
