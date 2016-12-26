
set -e -u

sourceUrl=https://raw.githubusercontent.com/evanx/webserva/master/bin/cert-script.sh
curl -s $sourceUrl | shasum > assets/cert-script.sh.shasum
curl -s $sourceUrl > tmp/cert-script.sh
ls -l assets/cert-script.sh.shasum
cat assets/cert-script.sh.shasum
shasum tmp/cert-script.sh


