
set -u -e

git status

waitCommitted() {
  notifyFile=$1
  ls -l $notifyFile
  cat $notifyFile
  echo "Sleeping for 8 seconds"
  sleep 8
  ls -l $notifyFile
  cat $notifyFile
  if cat $notifyFile | grep 'committing$'
  then
    count=0
    while cat ~/tmp/rquery-notify | grep 'committing'
    do
      ls -l $notifyFile
      git pull | grep '^Already' || break
      sleep .500
      count=`echo "$count + 1" | bc`
    done
    git pull && git submodule update
    git pull && git submodule update
  fi
}

if [ $# -gt 0 ]
then
  if [ "$1" != "nowait" ]
  then
    rm -f ~/tmp/rquery-notify
  fi
fi

if [ -f ~/tmp/rquery-notify ] 
then
  waitCommitted ~/tmp/rquery-notify
fi

git pull && git submodule update

. ./scripts/_name.sh

rquery_botUrl=$botUrl rquery_botSecret=$botSecret rquery_port=$port pm2 restart $name

sleep 1
ls -lh ~/.pm2/logs/${name}*
log=`ls -t ~/.pm2/logs/${name}-out-* | head -1`
tail $log

