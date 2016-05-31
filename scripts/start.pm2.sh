
set -u -e

. ./scripts/_name.sh

serviceId=`basename $PWD`
if [ $serviceId -gt 0 ]
then
  name=$serviceId-$config
fi

# bot 

botName=redishub
if [ $config = test ]
then
  botName=rhtest
elif [ $config = demo ]
then
  botName=rhdemo
fi
echo botName $botName
botSecret=`cat ~/.bot.$botName/secret`
botUrl=`cat ~/.bot.$botName/url`

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


