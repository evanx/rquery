
set -e -u 

name=`basename $PWD`
echo $name

  file=`ls -t ~/.pm2/logs/${name}-out-*`
  tail $file 
  echo 
  tail -f $file | bunyan -o short

