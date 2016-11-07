
  redis-cli -n 1 keys 'rquery:login:*'

  for key in `redis-cli -n 1 keys 'rquery:session:*'`
  do 
    echo; echo $key 
    redis-cli -n 1 hgetall $key 
  done
