
git pull
git submodule update

mkdir -p tmp
mv -f ~/.pm2/logs/rquery* tmp/. || echo 'no pm2 logs'

name=`basename $PWD`
echo $name

port=8765
if [ $name = rquery2 ]
then
  port=8766
fi

rquery_port=$port pm2 restart $name

sleep 1
ls -lh ~/.pm2/logs/rquery*
