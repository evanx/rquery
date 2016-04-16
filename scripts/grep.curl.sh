
cat README.md | grep ^curl | grep '/ks/' | sed 's/.*\/ks\/[^\/]*\/\(\S*\).*$/c1curl \1/'

cat README.md | grep ^curl
