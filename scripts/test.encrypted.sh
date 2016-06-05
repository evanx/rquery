
set -u -e

set -x 

c1set() {
  curl -s -E ~/.redishub/live/privcert.pem "https://cli.redishub.com/ak/evanxsummers/privateks/set-encrypt/encrypted1/$1"
}

c0get() {
  encrypted=`curl -s -E ~/.redishub/live/privcert.pem "$url"`
  privkey=~/.redishub/privkey.pem encrypted="$encrypted" node cli/rsaDecrypt.js
}

c0evanx() {
  url='https://cli.redishub.com/ak/evanxsummers/privateks/get/encrypted1' 
}

c1set hello_rsa
c0evanx
c0get
