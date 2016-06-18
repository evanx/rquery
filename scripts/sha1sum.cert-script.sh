
set -e -u

sourceUrl=https://raw.githubusercontent.com/webserva/webserva/master/bin/cert-script.sh
curl -s $sourceUrl | sha1sum > assets/cert-script.sh.sha1sum
curl -s $sourceUrl > tmp/cert-script.sh
ls -l assets/cert-script.sh.sha1sum
cat assets/cert-script.sh.sha1sum
sha1sum tmp/cert-script.sh


