
. scripts/restart.pm2.sh 

tail -f $log | bunyan -o short

