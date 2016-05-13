
set -e -u 

name=`basename $PWD`
echo $name

  logFile=`ls -t ~/.pm2/logs/${name}-out-*`
  errorFile=`ls -t ~/.pm2/logs/${name}-error-*`
  echo; ls -l $errorFile
  tail $errorFile
  echo; ls -l $logFile
  tail $logFile | bunyan -o short


