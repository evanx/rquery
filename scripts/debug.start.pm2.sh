
set -u -e 

name=`basename $PWD`
echo $name

mkdir -p tmp
mv -f ~/.pm2/logs/${name}* tmp/. || echo 'no pm2 logs'

port=8765
if [ $name = rquery2 ]
then
  port=8766
fi

git pull
git submodule update

pm2 delete $name

rquery_port=$port NODE_ENV=production loggerLevel=debug configModule=./demo.js redisUrl='redis://localhost:6379/13' pm2 start index.js --name $name

sleep 1
ls -l ~/.pm2/logs/rquery*


