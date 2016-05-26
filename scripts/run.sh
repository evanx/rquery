
  set -e -u

  config=${config-demo}
  configModule=${configModule-./config/${config}.js}

  NODE_ENV=development \
    configModule=$configModule \
    npm start | ./node_modules/.bin/bunyan -o short
