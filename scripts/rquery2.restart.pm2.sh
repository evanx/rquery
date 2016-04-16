
git pull
git submodule update

mkdir -p tmp
mv -f ~/.pm2/logs/rquery* tmp/.


  rquery_port=8766 pm2 restart rquery2

  ls -lh ~/.pm2/logs/rquery*
