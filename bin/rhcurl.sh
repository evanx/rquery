#!/bin/bash
  
  set -u -e 

  [ -z "$BASH" ] && rhabort 1 'Use bash' && exit 1

  . ~/redis-scan-bash/bin/bashrc.rhlogging.sh
  
  tuser=${tuser-`cat ~/.redishub/tuser`}
  domain=${domain-cli.redishub.com}
  url=${url-https://$domain/ak/$tuser}
  
  if [ $# -eq 0 ]
  then
    rhinfo "Try as follows, with new keyspace name:"
    rhinfo "curl -s -E ~/.redishub/privcert.pem $url/:keyspace/register-keyspace"
    exit 1
  elif [ $# -eq 1 ]
  then
    rhinfo "Try as follows, to see routes:"
    rhinfo "curl -s -E ~/.redishub/privcert.pem $url/$1/help"
    exit 1
  fi

  cmd=''
  while [ $# -gt 0 ]
  do
    cmd="$cmd/$1"
    shift
  done

  cn=`openssl x509 -text -in ~/.redishub/privcert.pem |
    grep 'CN=' | sed -e 's/^.*\(CN=\w*\).*$/\1/' | head -1`
  if ! echo $cn | grep -q "${tuser}$"
  then
    rherror "$cn does not match Telegram user $tuser"
    exit 3
  else
    rhdebug "$cn https://cli.redishub.com/ak/$tuser$cmd"
    curl -s -E ~/.redishub/privcert.pem "https://cli.redishub.com/ak/$tuser$cmd"
  fi

