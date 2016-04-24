
 rdemoFile=~/.rdemo dir=~/demo-rquery auth=github.com user=evanx force=true ./scripts/setup.demo.sh &&
   export rdemo=`cat ~/.rdemo` &&
   echo 'Try: curl $rdemo/keys #' $rdemo
