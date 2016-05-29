
host=${host-api.telegram.org}
echo "host $host"

echo | openssl s_client -connect $host:443 | openssl x509 -text

