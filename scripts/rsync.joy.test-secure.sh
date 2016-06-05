
rsync -ra rquery config lib zbuild joy:test-secure/.

ssh joy "
  cd test-secure 
  cd
  ls -l rquery/*.js
  pm2 restart test-secure
"
