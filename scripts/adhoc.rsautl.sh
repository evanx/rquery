


  echo test |
    openssl rsautl -inkey ~/.webserva/privkey.pem -keyform pem -encrypt |
    openssl base64 |
    openssl base64 -d |
    openssl rsautl -inkey ~/.webserva/privkey.pem -keyform pem -decrypt
