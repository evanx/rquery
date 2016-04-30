
set -u -e

. ~/rquery/scripts/_name.sh

rquery_port=$port NODE_ENV=production configModule=./config/${config}.js \
  pm2 start index.js --name $name

sleep 1
ls -l ~/.pm2/logs/rquery*
