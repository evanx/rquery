
  cat /nginx-local/sites/redishub.com
  echo
  cat /nginx-local/sites/redishub.com | grep -v '^\s*#' | grep 'redishub'

  ls -l /nginx-local/routes/* | grep '^l'
