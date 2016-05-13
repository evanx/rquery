
set -u -e

if git pull | grep '^Already'
then
  sleep 4
  count=0
  while [ $count -lt 4 ]
  do
    git pull | grep '^Already' || break
    sleep 1
    count=`echo "$count + 1" | bc`
  done
fi

git pull && git submodule update

. ./scripts/_name.sh

botSecret=`cat ~/.bot.redishub/secret`
echo botSecret $botSecret

botUrl=`cat ~/.bot.redishub/url`
echo botUrl $botUrl

rquery_botUrl=$botUrl rquery_botSecret=$botSecret rquery_port=$port pm2 restart $name

sleep 1
ls -lh ~/.pm2/logs/${name}*
log=`ls -t ~/.pm2/logs/${name}-out-* | head -1`
tail $log

