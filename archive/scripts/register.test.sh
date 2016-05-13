
set -u -e 

 urlFile=~/.rdemo dir=~/demo-rquery auth=github.com user=evanx force=true ./scripts/setup.demo.sh &&
   echo 'Try: curl -s' `cat ~/.rdemo`'/set/mykey/myvalue | python -mjson.tool'
