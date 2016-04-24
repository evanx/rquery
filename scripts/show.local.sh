
set -e -u

  redis-cli -n 13 hgetall 'demo:rquery:keyspace:evanx'

