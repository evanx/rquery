

c1curl() {
  #curl -s localhost:8765/rquery/ks/$USER/$1 | python -mjson.tool
  #curl -s demo2.ibhala.com/rquery/ks/$USER/$1 | python -mjson.tool
  curl -s demo.ibhala.com/rquery/ks/$USER/$1 | python -mjson.tool
}

c1curl zadd/mysortedset/10/value10 
c1curl zadd/mysortedset/20/value20
c1curl zcard/mysortedset
c1curl zrange/mysortedset/0/-1 
c1curl zrem/mysortedset/value10 
c1curl zrevrange/mysortedset/0/-1 

