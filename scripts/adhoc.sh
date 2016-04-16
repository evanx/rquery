
set -e -u

c1curl() {
  curl -s localhost:8765/rquery/ks/$USER/$1 | python -mjson.tool
  #curl -s demo2.ibhala.com/rquery/ks/$USER/$1 | python -mjson.tool
  curl -s demo.ibhala.com/rquery/ks/$USER/$1 | python -mjson.tool
}

c1curl set/mykey/myvalue
c1curl exists/mykey
c1curl get/mykey
c1curl ttl/mykey
c1curl sadd/myset/item1
c1curl sadd/myset/item2
c1curl sismember/myset/item1
c1curl smembers/myset
c1curl srem/myset/item1
c1curl scard/myset
c1curl zadd/mysortedset/10/value10
c1curl zadd/mysortedset/20/value20
c1curl zcard/mysortedset
c1curl zrange/mysortedset/0/-1
c1curl zrem/mysortedset/value10
c1curl zrevrange/mysortedset/0/-1
c1curl hset/myhashes/myfield1/myfield1value
c1curl hget/myhashes/myfield1
c1curl hset/myhashes/myfield2/myfield2value
c1curl hget/myhashes/myfield2
c1curl hexists/myhashes/myfield1
c1curl hexists/myhashes/myfield3
c1curl hlen/myhashes
c1curl hkeys/myhashes
c1curl hgetall/myhashes
c1curl lpush/mylist/item1
c1curl lpush/mylist/item2
c1curl lpush/mylist/item3
c1curl lrange/mylist/0/-1
c1curl llen/mylist
c1curl lpop/mylist
c1curl brpop/mylist/1
c1curl llen/mylist
c1curl keys
c1curl ttl
