
set -e -u

  ssh $1 "redis-cli -n 13 keys 'demo:*' | xargs redis-cli -n 13 del" 

