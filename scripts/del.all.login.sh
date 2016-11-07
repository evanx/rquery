
  for key in `redis-cli -n 1 keys 'rquery:login:*'`
  do 
    echo $key 
    redis-cli -n 1 del $key 
  done

  for key in `redis-cli -n 1 keys 'rquery:session:*'`
  do 
    echo $key 
    redis-cli -n 1 del $key 
  done
