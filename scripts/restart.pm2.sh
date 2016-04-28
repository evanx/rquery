
git pull
git submodule update

name=`basename $PWD`
echo $name

mkdir -p tmp
mv -f ~/.pm2/logs/${name}* tmp/. || echo 'no pm2 logs'

port=8765
if [ $name = rquery2 ]
then
  port=8766
fi

rquery_port=$port pm2 restart $name

sleep 1
ls -lh ~/.pm2/logs/rquery*
