
set -u -e 

[ -d ~/tmp ]

rm -rf ~/tmp/rquery || echo "not found"

cd ~/tmp

  git clone https://github.com/evanx/rquery.git --recursive 
  cd rquery 
  npm install
