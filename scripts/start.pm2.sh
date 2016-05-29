
set -u -e

. ./scripts/_name.sh

rquery_botUrl=$botUrl rquery_botSecret=$botSecret rquery_port=$port \
  NODE_ENV=production loggerLevel=debug configModule=./config/${config}.js \
  pm2 start index.js --name $name

(
  sleep 1
  ls -l ~/.pm2/logs/${name}*
  log=`ls -t ~/.pm2/logs/${name}-out-* | head -1`
  echo log $log
  tail $log | bunyan --color -o short
)


