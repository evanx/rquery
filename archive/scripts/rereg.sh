
set -u -e 

rdemoToken=`dd if=/dev/urandom bs=16 count=1 2>/dev/null | sha1sum | cut -b1-16`
rdemoUrl="https://demo.ibhala.com/rquery/kt/$rqueryGithubUser/$rdemoToken"
echo $rdemoUrl
[ -f rdemoUrl ] && curl -s `echo rdemoUrl`/deregister
echo $rdemoUrl > rdemoUrl # required to access and deregister, so save to file
curl -s $rdemoUrl/register/github.com/$rqueryGithubUser; printf '\n%d\n' $?

