

set -u -e

[ -n "$BASH" ]

. scripts/_redis-scan.sh

 RedisScan -n 0 hscan 'article:2005823:hashes'
 echo $?
 RedisScan -n 0 --type hash scan 0 match 'article:*' -- expire 999999
 echo $?
 RedisScan -n 0 --type hash --each hlen scan match 'article:*'
 echo $?
 RedisScan -n 0 --type hash scan match 'article:*' -- hlen
 echo $?
 RedisScan -n 0 --type hash scan match 'article:*'
 echo $?
