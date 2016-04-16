
set -u -e 

mkdir -p tmp
mv -f ~/.pm2/logs/rquery* tmp/. || echo 'no pm2 logs'

name=`basename $PWD`
echo $name

port=8765
if [ $name = rquery2 ]
then
  port=8766
fi

rquery_port=$port NODE_ENV=production configModule=./demo.js redisUrl='redis://localhost:6379/13' pm2 start index.js --name $name

sleep 1
ls -l ~/.pm2/logs/rquery*


