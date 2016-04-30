
set -u -e

git pull && git submodule update

. ~/rquery/scripts/_name.sh

rquery_port=$port pm2 restart $name

sleep 1
ls -lh ~/.pm2/logs/rquery*
