
set -u -e

waitCommitted() {
  ls -l ~/tmp/rquery-notify
  cat ~/tmp/rquery-notify
  echo "Sleeping for 8 seconds"
  sleep 8
  if [ -f ~/tmp/rquery-notify ]
  then
    ls -l ~/tmp/rquery-notify 
    if cat ~/tmp/rquery-notify | grep 'committing$'
    then
      count=0
      while [ $count -lt 10 -a -f `cat ~/tmp/rquery-notify` = 'committing' ]
      do
        git pull | grep '^Already' || break
        sleep .500
        count=`echo "$count + 1" | bc`
      done
    fi
  fi
  rm -f ~/tmp/rquery-notify
}

waitCommitted

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

