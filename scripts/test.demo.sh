
set -e -u

c1curlv() {
  url="$1" 
  echo "curl $url"
  curl -s "$url" | python -mjson.tool
}

c2curl() {
  c1curlv "$1/rquery/ks/$USER/$2" 
}

c1curla() {
  c2curl $1 set/mykey/myvalue
  c2curl $1 exists/mykey
  c2curl $1 get/mykey
  c2curl $1 ttl/mykey
  c2curl $1 sadd/myset/item1
  c2curl $1 sadd/myset/item2
  c2curl $1 sismember/myset/item1
  c2curl $1 smembers/myset
  c2curl $1 srem/myset/item1
  c2curl $1 spop/myset
  c2curl $1 scard/myset
  c2curl $1 zadd/mysortedset/10/value10
  c2curl $1 zadd/mysortedset/20/value20
  c2curl $1 zcard/mysortedset
  c2curl $1 zrange/mysortedset/0/-1
  c2curl $1 zrem/mysortedset/value10
  c2curl $1 zrevrange/mysortedset/0/-1
  c2curl $1 hset/myhashes/myfield1/myfield1value
  c2curl $1 hget/myhashes/myfield1
  c2curl $1 hset/myhashes/myfield2/myfield2value
  c2curl $1 hget/myhashes/myfield2
  c2curl $1 hexists/myhashes/myfield1
  c2curl $1 hlen/myhashes
  c2curl $1 hkeys/myhashes
  c2curl $1 hgetall/myhashes
  c2curl $1 hdel/myhashes/myfield2
  c2curl $1 lpush/mylist/item1
  c2curl $1 lpush/mylist/item2
  c2curl $1 lpush/mylist/item3
  c2curl $1 lpush/mylist/item4
  c2curl $1 lindex/mylist/0
  c2curl $1 lrange/mylist/0/-1
  c2curl $1 llen/mylist
  c2curl $1 lpop/mylist
  c2curl $1 lrem/mylist/-1/item4
  c2curl $1 lset/mylist/0/item4
  c2curl $1 ltrim/mylist/0/2
  c2curl $1 brpop/mylist/1
  c2curl $1 brpoplpush/mylist/mypoppedlist/1
  c2curl $1 llen/mylist
  c2curl $1 keys
  c2curl $1 ttl
}

c1curlg() {
  c1curlv "http://$1/rquery/keyspaces" 
}

c1curld() {
  c1curlg $1
  c1curla $1
  c1curlg $1
}

c0curld() {
  c1curld localhost:8765 
  c1curld demo.ibhala.com 
  c1curld demo1.ibhala.com 
  c1curld demo2.ibhala.com 
}

c0curl1() {
  c1curld demo1.ibhala.com 
}

c0curl2() {
  c1curld demo2.ibhala.com 
}

command=curld
if [ $# -ge 1 ]
then
  command=$1
  shift
  c$#$command $@
else
  c0curld
fi
echo "OK"
