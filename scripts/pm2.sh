
set -u -e

#botSecret=`cat ~/.bot.redishub/secret`
#echo botSecret $botSecret
#botId=`cat ~/.bot.redishub/id`
#echo botId $botId
#botUrl=`cat ~/.bot.redishub/url`
#echo botUrl $botUrl

. ./scripts/_name.sh

echo name $name

c0movelogs() {
  echo "mv -f ~/.pm2/logs/${name}-* tmp/."
  mv -f ~/.pm2/logs/${name}-* tmp/.
}

c0setlogs() {
  ls -l ~/.pm2/logs/${name}-*
  outLog=`ls -t ~/.pm2/logs/${name}-out-* | head -1`
  errlog=`ls -t ~/.pm2/logs/${name}-error-* | head -1`
}

c0showlogs() {
  c0setlogs
  echo "outLog $outLog"
  echo "errLog $errLog"
}

c0show() {
  pm2 show $name
  c0showlogs
}

c0delete() {
  pm2 delete $name
  c0movelogs
}

c0stop() {
  pm2 stop $name
  c0movelogs
}

command=show
if [ $# -gt 0 ]
then 
  command=$1
  shift
fi
echo command $command
c$#$command $@
