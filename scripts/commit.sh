
set -u -e

c2notify() {
  echo `date +%T` $2 | ssh $1 'cat > tmp/rquery-notify'
}

c1notify() {
  c2notify dijkstra $1
}

startTimestamp=`date +%s`

npm run build 

cat zbuild/rquery.js | grep '^\s*logger\|zz\|ZZ' && exit 1

c1commit() {
  message="$1"
  c1notify committing &
  if git add -A && git commit -m "$message" && git push 
  then
    echo "committed"
  else 
    echo "no commit"
  fi
  c1notify committed &
  echo; echo "done"
  git status | sed '/^$/d'
}

if [ $# -eq 1 ]
then
  c1commit "$1"
else
  echo "usage: message"
fi 

timestamp=`date +%s`
duration=`echo "$timestamp - $startTimestamp" | bc`
echo NOTIFY $duration "$*"
