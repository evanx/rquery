
  echo | openssl s_client -connect secure.redishub.com:443 2>/dev/null | grep CN
