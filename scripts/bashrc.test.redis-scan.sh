

set -u -e

[ -n "$BASH" ]

. bin/bashrc.rhlogging.sh
. bin/bashrc.redis-scan.sh

test_scan() {
  if ! commit=1 RedisScan "$@"
  then
    echo "exited with code $?. Press Enter to continue..."
    read _confirm
  fi
}

  test_scan 14 match '*'
  test_scan 13 -p 6379 @hash scan -- hgetall
  test_scan -n 13 -p 6379 -h localhost @set -- smembers

  test_scan -n 0 hscan 'article:2005823:hashes'
  test_scan -n 0 @hash scan 0 match 'article:*' -- expire 999999
  test_scan -n 0 @hash scan match 'article:*' -- hlen
  test_scan -n 0 @hash scan match 'article:*'
