
set -u -e 

cd lib 

c1commit() {
  message="$1"
  git remote set-url origin git@github.com:evanx/libv.git
  git add -A
  git commit -m "$message" 
  git push
  echo; echo "done"
  git remote set-url origin https://github.com/evanx/libv.git
  git status
}

if [ $# -eq 1 ]
then
  c1commit "$1"
else
  echo "usage: message"
fi 
