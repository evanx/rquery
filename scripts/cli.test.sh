
set -e -u

rurl=${rurl-`cat ~/.redishub/cli.url`}
cert=${cert-~/.redishub/privcert.pem}
echo rurl $rurl
openssl x509 -text -in $cert | grep CN

curlx() {
  url="$rurl/$1"
  if ! curl -s -E $cert "$url"
  then
    >&2 echo "ERROR $url"
  fi
}

curlv() {
  url="$rurl/$1"
  curl -s -E $cert "$url"
}

curls() {
  url="$rurl/$1"
  curl -s -E $cert "$url"
}

curlr() {
  url="$rurl/$1"
  expected=$2
  >&2 echo "$url # expect $expected"
  reply=`curl -s -E $cert $url`
  if ! echo "$reply" | grep "$expected"
  then
    echo "$url # expected $expected, reply $reply"
    exit 1
  fi
}

curlm() {
  url="$rurl/$1"
  count=$2
  >&2 echo "$url # expect $count items (or more)"
  reply=`curl -s -E $cert "$url"`
  echo "$reply"
  echo count `echo "$reply" | wc -w`
  [ `echo "$reply" | wc -w` -ge $count ]
}

curli() {
  url="$rurl/$1"
  shift
  >&2 echo "$url # expect includes $@"
  reply=`curl -s -E $cert "$url"`
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

. scripts/_test.sh

tmp=~/tmp/`basename $0 .sh`
mkdir -p $tmp
cd $tmp
pwd

c0register() {
  curlx deregister-account/evanxsummers
  curlv register-account/evanxsummers
}

c0register
curla
