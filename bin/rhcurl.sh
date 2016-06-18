#!/bin/bash

echo 'Replaced by: ~/webserva/bin/wscurl.sh'
echo 'Try:'
echo 'cd && git clone https://github.com/webserva/webserva.git'
echo 'alias ws=~/webserva/bin/wscurl.sh'
echo 'ws'
exit 3

  set -u -e

  [ -z "$BASH" ] && rhabort 1 'Use bash' && exit 1

  . ~/redis-scan-bash/bin/bashrc.rhlogging.sh

  account=${account-`cat ~/.redishub/telegramUser`}
  domain=${domain-cli.redishub.com}
  url=${url-"https://$domain/ak/$account"}
  rhdebug "account $account, url $url"

  if [ $# -eq 0 ]
  then
    rhinfo "Try as follows, with new keyspace name:"
    rhinfo "curl -s -E ~/.redishub/live/privcert.pem $url/:keyspace/create-keyspace"
    exit 1
  elif [ $# -eq 1 ]
  then
    rhinfo "Try as follows, to see routes:"
    rhinfo "curl -s -E ~/.redishub/live/privcert.pem $url/$1/help"
    exit 1
  fi

  cmd=''
  while [ $# -gt 0 ]
  do
    cmd="$cmd/$1"
    shift
  done

  cn=`openssl x509 -text -in ~/.redishub/live/privcert.pem |
    grep 'CN=' | sed -e 's/^.*\(CN=\w*\).*$/\1/' | head -1`
  if ! echo $cn | grep -q "${account}$"
  then
    rherror "Cert CN [$cn] does not match account $account"
    exit 3
  else
    rhdebug "$cn $url$cmd"
    curl -s -E ~/.redishub/live/privcert.pem "$url$cmd"
  fi
