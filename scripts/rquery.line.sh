
set -u -e 

line=$1

  cat build/rquery.js | head -n $line | tail

