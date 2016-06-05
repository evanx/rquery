
set -u -e 

npm run build

cd lib 
pwd

c1commit() {
  message="$1"
  git remote set-url origin git@github.com:evanx/rhlibv.git
  git add -A
  git commit -m "$message" || echo "commit exit code $?"
  git remote -v 
  git push
  git remote set-url origin https://github.com/evanx/rhlibv.git
  echo; echo "done lib"
  git status | sed '/^$/d'
  echo; echo "sync"
  cd ..
  pwd 
  git status | sed '/^$/d'
  git add -A
  git commit -m "$message" 
  git remote -v 
  #git remote set-url origin git@github.com:evanx/rquery.git
  git push
  echo; echo "done"
  git status | sed '/^$/d'
}

if [ $# -eq 1 ]
then
  c1commit "$1"
else
  echo "usage: message"
fi 
