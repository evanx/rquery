
set -e -u

curl -s https://raw.githubusercontent.com/evanx/redishub/master/bin/cert-script.sh | sha1sum > assets/cert-script.sh.sha1sum
curl -s https://raw.githubusercontent.com/evanx/redishub/master/bin/cert-script.sh > tmp/cert-script.sh
ls -l assets/cert-script.sh.sha1sum
cat assets/cert-script.sh.sha1sum
sha1sum tmp/cert-script.sh


