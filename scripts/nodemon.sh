
set -e -u

  node_modules/.bin/babel lib rquery telegram -d zbuild 

  NODE_ENV=development configModule=./config/development.js \
    node_modules/.bin/nodemon --watch zbuild/ index.js |
    ./node_modules/.bin/bunyan -o short 
