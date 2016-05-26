
set -e -u

dbn=${dbn-13}

  redis-cli -n $dbn keys '*'
  echo "redis-cli -n $dbn hgetall 'demo:rquery:ak:evanx:keyspace'"
  redis-cli -n $dbn hgetall 'demo:rquery:ak:evanx:keyspace'

