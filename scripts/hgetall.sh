
  for key in `redis-cli -n 13 keys 'demo:rquery:*'`
  do
    if redis-cli -n 13 type $key | grep -q hash
    then
      echo
      echo $key
      redis-cli -n 13 hgetall $key
    fi
  done
