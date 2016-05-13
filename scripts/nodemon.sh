
set -e -u

  node_modules/.bin/babel lib rquery telegram -d build 

  NODE_ENV=development configModule=./config/development.js \
    node_modules/.bin/nodemon --watch build/ index.js |
    ./node_modules/.bin/bunyan -o short 
