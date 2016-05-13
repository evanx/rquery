
curla() {
  curle set/mykey/myvalue OK
  curle type/mykey string
  curli get/mykey myvalue
  curlv del/mykey
  curle set/mykey/myvalue OK
  curl1 exists/mykey
  curle get/mykey myvalue
  curlr ttl/mykey '^1[78][0-9]$'
  curlv sadd/myset/item1
  curlv sadd/myset/item2
  curle type/myset set
  curle scard/myset 2
  curl1 sismember/myset/item1
  curli smembers/myset item1 item2
  curlm smembers/myset 2
  curlv srem/myset/item1
  curle spop/myset item2
  curle scard/myset 0
  curlv del/mysortedset
  curlv zadd/mysortedset/10/value10
  curlv zadd/mysortedset/20/value20
  curle zcard/mysortedset 2
  curli zrange/mysortedset/0/-1 value10 value20
  curlv zrem/mysortedset/value10
  curli zrevrange/mysortedset/0/-1 value20
  curlv hset/myhashes/myfield1/myfield1value
  curl1 del/myhashes
  curlv hset/myhashes/myfield1/myfield1value
  curle hget/myhashes/myfield1 myfield1value
  curlv hset/myhashes/myfield2/myfield2value
  curle hget/myhashes/myfield2 myfield2value
  curl1 hexists/myhashes/myfield1
  curle hlen/myhashes 2
  curli hkeys/myhashes myfield1 myfield2
  curlv hgetall/myhashes
  curl1 hdel/myhashes/myfield2
  curlv del/mylist
  curlv lpush/mylist/item1
  curlv lpush/mylist/item2
  curlv lpush/mylist/item3
  curlv lpush/mylist/item4
  curlv lindex/mylist/0
  curle llen/mylist 4
  curlm lrange/mylist/0/-1 4
  curle lpop/mylist item4
  curlv lrem/mylist/-1/item4
  curlv lset/mylist/0/item4
  curlv ltrim/mylist/0/2
  curle brpop/mylist/1 item1
  curle lpop/mylist item4
  curlm lrange/mylist/0/-1 0
  curle brpoplpush/mylist/mypoppedlist/1 item2
  curl0 llen/mylist
  curl1 llen/mypoppedlist
  curle lpop/mypoppedlist item2
  curlv ttls
}
