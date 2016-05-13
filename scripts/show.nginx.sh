
  cat /nginx-local/sites/redishub.com
  echo
  cat /nginx-local/sites/redishub.com | grep -v '^\s*#' | grep 'server\|-left\|-right'

  ls -l /nginx-local/routes/* | grep '^l'
