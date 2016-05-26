
set -u -e

c2notify() {
  date
  echo `date +%T` $2 | ssh $1 'cat > tmp/rquery-notify'
  date
}

c2notify joy building & 

npm run build 

cat zbuild/rquery.js | grep '^\s*logger\|zz\|ZZ' && exit 1

c1commit() {
  message="$1"
  c2notify joy committing & 
  git add -A
  git commit -m "$message" 
  git push
  c2notify joy committed &
  echo; echo "done"
  git status
}

if [ $# -eq 1 ]
then
  c1commit "$1"
else
  echo "usage: message"
fi 

