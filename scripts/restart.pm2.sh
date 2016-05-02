
set -u -e

git pull && git submodule update

. ./scripts/_name.sh

rquery_port=$port pm2 restart $name

sleep 1
ls -lh ~/.pm2/logs/${name}*
