
set -e -u 

name=`basename $PWD`
echo $name

  file=`ls -t ~/.pm2/logs/${name}-out-*`
  tail $file | node_modules/.bin/bunyan -o short
  echo 
  tail -f $file | node_modules/.bin/bunyan -o short

