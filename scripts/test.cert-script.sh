
. ~/redishub/bin/rhlogging.sh

openUrl='http://localhost:8765'
[[ $0 =~ \.local ]] && openUrl='http://localhost:8765'
[[ $0 =~ \.test ]] && openUrl='https://test.redishub.com'
[[ $0 =~ \.open ]] && openUrl='https://open.redishub.com'
[[ $0 =~ \.sec ]] && openUrl='https://secure.redishub.com'
[[ $0 =~ \.root ]] && openUrl='https://redishub.com'

rhinfo $openUrl 

  curl -s "$openUrl/cert-script/evanxsummers" 
  rhhead "curl -s '$openUrl/cert-script/evanxsummers' | head" 
  curl -s "$openUrl/cert-script/evanxsummers" | head -30

  if [ $# -eq 0 ] 
  then
    rhinfo 'commands: archive'
    exit 0
  fi

  sleep 2

  command="$1"
  shift

  if [ $command = archive ]
  then
    curl -s "$openUrl/cert-script/evanxsummers?dir=~/.redishub/live&archive" | bash
  fi


