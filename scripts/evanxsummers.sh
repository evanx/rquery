

echo "
  redis-cli -n 13 srem demo:rquery:telegram:verified:users evanxsummers

  redis-cli -n 13 hgetall demo:rquery:telegram:user:evanxsummers

"

