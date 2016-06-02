
set -u -e

c2notify() {
  echo `date +%T` $2 | ssh $1 'cat > tmp/rquery-notify'
}

startTimestamp=`date +%s`
timestamp=`date +%s`
duration=`echo "$timestamp - $startTimestamp" | bc`
echo NOTIFY $duration "$*"

npm run build 

cat zbuild/rquery.js | grep '^\s*logger\|zz\|ZZ' && exit 1

c1commit() {
  message="$1"
  c2notify joy committing &
  c2notify stallman committing
  git add -A
  git commit -m "$message" 
  git push
  c2notify joy committed &
  c2notify stallman committed &
  echo; echo "done"
  git status | sed '/^$/d'
}

if [ $# -eq 1 ]
then
  c1commit "$1"
else
  echo "usage: message"
fi 

