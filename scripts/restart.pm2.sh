
git pull
git submodule update

mkdir -p tmp
mv -f ~/.pm2/logs/rquery* tmp/.


  pm2 restart rquery

  ls -lh ~/.pm2/logs/rquery*
