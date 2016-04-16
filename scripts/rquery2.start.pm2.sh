

mkdir -p tmp
mv -f ~/.pm2/logs/rquery* tmp/.


  rquery_port=8766 NODE_ENV=production configModule=./demo.js redisUrl='redis://localhost:6379/13' pm2 start index.js --name rquery2

  ls -l ~/.pm2/logs/rquery*


