

  
  echo test | 
    openssl rsautl -inkey ~/.redishub/privkey.pem -keyform pem -encrypt | 
    openssl base64 | 
    openssl base64 -d | 
    openssl rsautl -inkey ~/.redishub/privkey.pem -keyform pem -decrypt

