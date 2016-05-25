
  while [ 1 ]
  do
    node_modules/.bin/babel -w lib -w rquery -w telegram -d zbuild -s
    sleep 4
  done
