
set -e -u

  redis-cli -n 13 keys 'demo:*' | xargs -n1 redis-cli -n 13 del

