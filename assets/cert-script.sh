  echo "${account}" > account
  if openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -subj "/CN=${CN}/OU=${OU}/O=${O}" \
    -keyout privkey.pem -out cert.pem
  then
    openssl x509 -text -in cert.pem > x509.txt
    grep 'CN=' x509.txt
    echo -n `cat cert.pem | head -n-1 | tail -n+2` | sed -e 's/\s//g' | shasum | cut -f1 -d' ' > cert.pem.shasum
    cat privkey.pem cert.pem > privcert.pem
    openssl x509 -text -in privcert.pem | grep 'CN='
    curl -s -E privcert.pem "$certWebhook" ||
      echo "Registered account ${account} ERROR $?"
    if ! openssl pkcs12 -export -out privcert.p12 -inkey privkey.pem -in cert.pem
    then
      echo "ERROR $?: openssl pkcs12 ($PWD)"
      false # error code 1
    else
      echo "Exported $PWD/privcert.p12 OK"
      pwd; ls -l
      sleep 2
      curl -s https://open.webserva.com/cert-script-help/${account}
      curl -s https://raw.githubusercontent.com/webserva/webserva/master/docs/install.wscurl.txt
      certSha=`cat cert.pem.shasum`
      echo "Try '/grantcert $certSha' via https://telegram.me/WebServaBot?start"
    fi
  fi
