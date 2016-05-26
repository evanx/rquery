#!/bin/bash
  
  set -u -e 

  [ -z "$BASH" ] && rhabort 1 'Use bash' && exit 1

  . ~/redis-scan-bash/bin/bashrc.rhlogging.sh
  
  tuser=`cat ~/.redishub/tuser`
  
  if [ $# -eq 0 ]
  then
    rhdebug "curl -s -E ~/.redishub/privcert.pem https://cli.redishub.com/ak/$tuser/:keyspace/register-keyspace"
    exit 1
  elif [ $# -eq 1 ]
  then
    rhdebug "curl -s -E ~/.redishub/privcert.pem https://cli.redishub.com/ak/$tuser/$1"
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

