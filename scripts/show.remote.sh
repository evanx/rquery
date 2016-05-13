
set -e -u

  ssh joy redis-cli -n 13 hgetall 'demo:rquery:keyspace:evanx'

