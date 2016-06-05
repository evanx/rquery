
set -u -e 

line=$1

  cat zbuild/rquery.js | head -n $line | tail

