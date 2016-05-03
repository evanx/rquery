
set -e -u

dbn=${dbn:=13}

  redis-cli -n $dbn keys '*'
  echo "redis-cli -n $dbn hgetall 'demo:rquery:keyspace:evanx'"
  redis-cli -n $dbn hgetall 'demo:rquery:keyspace:evanx'

