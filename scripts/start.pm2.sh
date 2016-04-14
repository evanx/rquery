

mkdir -p tmp
mv -f ~/.pm2/logs/rquery* tmp/.


  NODE_ENV=production configModule=./demo.js redisUrl='redis://localhost:6379/13' pm2 start index.js --name rquery

  ls -l ~/.pm2/logs/rquery*


