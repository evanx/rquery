
set -e -u

  ssh joy redis-cli -n 13 del 'demo:rquery:keyspace:evanx'

