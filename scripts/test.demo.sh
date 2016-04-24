
set -e -u

uri=${uri:=rquery/`cat ~/demo-rquery/uri`}
echo uri $uri

c1curlv() {
  url="$1"
  >&2 echo "curl -s $url | python -mjson.tool"
  curl -s "$url" | python -mjson.tool
}

c2curl() {
  c1curlv $1/$uri/$2
}

c3curlr() {
  url="$1/$uri/$2"
  >&2 echo "curl -s $url # expect $3"
  reply=`curl -s "$url?plain"`
  if ! echo "$reply" | grep "$3"
  then
    echo "$1/$uri/$2 - expected $3, received $reply"
  fi
}

c3curle() {
  c3curlr $1 $2 "^${3}$"
}

c2curl0() {
  c3curle $1 $2 0
}

c2curl1() {
  c3curle $1 $2 1
}

c1curla() {
  c2curl $1 del/mykey
  c2curl $1 set/mykey/myvalue
  c2curl1 $1 exists/mykey
  c3curle $1 get/mykey myvalue
  c3curlr $1 ttl/mykey '^17[0-9]$'
  c2curl $1 sadd/myset/item1
  c2curl $1 sadd/myset/item2
  c3curle $1 scard/myset 2
  c2curl1 $1 sismember/myset/item1
  c2curl $1 smembers/myset
  c2curl $1 srem/myset/item1
  c3curle $1 spop/myset item2
  c3curle $1 scard/myset 0
  c2curl $1 del/mysortedset
  c2curl $1 zadd/mysortedset/10/value10
  c2curl $1 zadd/mysortedset/20/value20
  c3curle $1 zcard/mysortedset 2
  c2curl $1 zrange/mysortedset/0/-1
  c2curl $1 zrem/mysortedset/value10
  c2curl $1 zrevrange/mysortedset/0/-1
  c2curl $1 del/myhashes
  c2curl $1 hset/myhashes/myfield1/myfield1value
  c2curl $1 hget/myhashes/myfield1
  c2curl $1 hset/myhashes/myfield2/myfield2value
  c2curl $1 hget/myhashes/myfield2
  c2curl $1 hexists/myhashes/myfield1
  c3curle $1 hlen/myhashes 2
  c2curl $1 hkeys/myhashes
  c2curl $1 hgetall/myhashes
  c2curl $1 hdel/myhashes/myfield2
  c2curl $1 del/mylist
  c2curl $1 lpush/mylist/item1
  c2curl $1 lpush/mylist/item2
  c2curl $1 lpush/mylist/item3
  c2curl $1 lpush/mylist/item4
  c2curl $1 lindex/mylist/0
  c2curl $1 lrange/mylist/0/-1
  c3curle $1 llen/mylist 4
  c3curle $1 lpop/mylist item2
  c2curl $1 lrem/mylist/-1/item4
  c2curl $1 lset/mylist/0/item4
  c2curl $1 ltrim/mylist/0/2
  c2curl $1 brpop/mylist/1
  c3curle $1 brpoplpush/mylist/mypoppedlist/1 item2
  c2curl $1 llen/mylist
  c2curl $1 keys
  c2curl $1 ttl
}

c1curlg() {
  if ! c1curlv "$1/rquery/keyspaces"
  then
    echo 'keyspaces failed'
  fi
}

c1curld() {
  c1curlg $1
  c1curla $1
  c1curlg $1
}

c0curld() {
  c1curld localhost:8765
  c1curld https://demo.ibhala.com
  c1curld demo1.ibhala.com
  c1curld demo2.ibhala.com
}

c0curl0() {
  c1curld https://demo.ibhala.com
}

c0curl1() {
  c1curld https://demo1.ibhala.com
}

c0curl2() {
  c1curld https://demo2.ibhala.com
}

command=curl0
if [ $# -ge 1 ]
then
  command=$1
  shift
fi
c$#$command $@
echo "OK"
