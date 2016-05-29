
rsync -ra rquery config lib joy:test-secure/.

ssh joy "
  cd test-secure 
  cd
  ls -l rquery/*.js
  pm2 restart test-secure
"
