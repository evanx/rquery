
set -e -u

rurl=${rurl-`cat ~/.redishub/demo.url`}
echo rurl $rurl

check_ruri() {
  echo $rurl/$1 `curl -s -A Mobile -I "$rurl/$1" | grep ^HTTP`
}

curls() {
  >&2 echo ignore "$*"
}

curlx() {
  check_ruri $1
  url="$rurl/$1"
  if ! curl -s "$url"
  then
    >&2 echo "ERROR $url"
  fi
}

curlv() {
  check_ruri $1
  url="$rurl/$1"
  curl -s "$url"
}

curlr() {
  check_ruri $1
  url="$rurl/$1"
  expected=$2
  >&2 echo
  >&2 echo "curl $url # expect $expected"
  reply=`curl -s $url`
  if ! echo "$reply" | grep -q "$expected"
  then
    >&2 echo "$reply"
    >&2 echo "ERROR $url # expected $expected"
    exit 1
  fi
}

curlm() {
  check_ruri $1
  url="$rurl/$1"
  count=$2
  >&2 echo
  >&2 echo "curl $url # expect $count items (or more)"
  reply=`curl -s "$url"`
  echo "$reply"
  echo count `echo "$reply" | wc -w`
  [ `echo "$reply" | wc -w` -ge $count ]
}

curli() {
  check_ruri $1
  url="$rurl/$1"
  shift
  >&2 echo
  >&2 echo "curl $url # expect includes $@"
  reply=`curl -s "$url"`
  echo "$reply"
  echo count `echo "$reply" | wc -w`
  while [ $# -gt 0 ]
  do
    expected=$1
    shift
    echo "expected $expected"
    echo "$reply" | grep -q "$expected"
  done
}

curle() {
  curlr $1 "^${2}$"
}

curl0() {
  curle $1 0
}

curl1() {
  curle $1 1
}

ruri=`curl -s $rurl/register-ephemeral`
echo ruri $ruri

. scripts/_test.sh

tmp=~/tmp/`basename $0 .sh`
mkdir -p $tmp
cd $tmp
pwd

curlu

rurl="$rurl/$ruri"
echo rurl $rurl
echo $rurl > ~/.redishub/test.url

curlak

echo "OK"
