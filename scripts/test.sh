
set -e -u

ls -l ~/demo-rquery/uri
cat ~/demo-rquery/uri

uri=${uri:=rquery/`cat ~/demo-rquery/uri`}
echo uri $uri

c1curlv() {
  url="$1"
  >&2 echo "curl -s $url | python -mjson.tool"
  curl -s "$url" | python -mjson.tool
}

curlu() {
  c1curlv $1/$uri/$2
}

curlr() {
  url="$1/$uri/$2"
  >&2 echo "curl -s $url # expect $3"
  reply=`curl -s "$url?plain"`
  if ! echo "$reply" | grep "$3"
  then
    echo "$1/$uri/$2 - expected $3, received $reply"
    exit 1
  fi
}

curlm() {
  url="$1/$uri/$2"
  count=$3
  >&2 echo "curl -s $url # expect $count items (or more)"
  reply=`curl -s "$url" | python -mjson.tool`
  echo "$reply"
  echo count `echo "$reply" | grep '^\s' | wc -l`
  [ `echo "$reply" | grep '^\s' | wc -l` -ge $count ]
}

curli() {
  url="$1/$uri/$2"
  shift; shift
  >&2 echo "curl -s $url # expect includes $@"
  reply=`curl -s "$url" | python -mjson.tool`
  echo "$reply"
  echo count `echo "$reply" | grep '^\s' | wc -l`
  while [ $# -gt 0 ]
  do
    expected=$1
    shift
    echo "$reply" | grep -q "$expected"
  done
}

curle() {
  curlr $1 $2 "^${3}$"
}

curl0() {
  curle $1 $2 0
}

curl1() {
  curle $1 $2 1
}

c1curla() {
  curlu $1 deregister
  curlu $1 register/github.com/evanx
  curle $1 set/mykey/myvalue OK
  curlu $1 del/mykey
  curle $1 set/mykey/myvalue OK
  curl1 $1 exists/mykey
  curle $1 get/mykey myvalue
  curlr $1 ttl/mykey '^1[78][0-9]$'
  curlu $1 sadd/myset/item1
  curlu $1 sadd/myset/item2
  curle $1 scard/myset 2
  curl1 $1 sismember/myset/item1
  curli $1 smembers/myset item1 item2
  curlm $1 smembers/myset 2
  curlu $1 srem/myset/item1
  curle $1 spop/myset item2
  curle $1 scard/myset 0
  curlu $1 del/mysortedset
  curlu $1 zadd/mysortedset/10/value10
  curlu $1 zadd/mysortedset/20/value20
  curle $1 zcard/mysortedset 2
  curli $1 zrange/mysortedset/0/-1 value10 value20
  curlu $1 zrem/mysortedset/value10
  curli $1 zrevrange/mysortedset/0/-1 value20
  curlu $1 hset/myhashes/myfield1/myfield1value
  curl1 $1 del/myhashes
  curlu $1 hset/myhashes/myfield1/myfield1value
  curle $1 hget/myhashes/myfield1 myfield1value
  curlu $1 hset/myhashes/myfield2/myfield2value
  curle $1 hget/myhashes/myfield2 myfield2value
  curl1 $1 hexists/myhashes/myfield1
  curle $1 hlen/myhashes 2
  curli $1 hkeys/myhashes myfield1 myfield2
  curlu $1 hgetall/myhashes
  curl1 $1 hdel/myhashes/myfield2
  curlu $1 del/mylist
  curlu $1 lpush/mylist/item1
  curlu $1 lpush/mylist/item2
  curlu $1 lpush/mylist/item3
  curlu $1 lpush/mylist/item4
  curlu $1 lindex/mylist/0
  curlm $1 lrange/mylist/0/-1 4
  curle $1 llen/mylist 4
  curle $1 lpop/mylist item2
  curlu $1 lrem/mylist/-1/item4
  curlu $1 lset/mylist/0/item4
  curlu $1 ltrim/mylist/0/2
  curle $1 brpop/mylist/1 item1
  curle $1 brpoplpush/mylist/mypoppedlist/1 item2
  curl0 $1 llen/mylist
  curli $1 keys mypoppedlist
  curli $1 ttl mysortedset
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

c0localhost() {
  c1curld localhost:8765
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
