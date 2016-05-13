
keyspace=${keyspace:`hostname -s`-$USER}
echo keyspace $keyspace
token=`dd if=/dev/urandom bs=10 count=1 2>/dev/null | ~/rquery/node_modules/.bin/base32`
echo token $token 
echo e.g. https://redishub.com/rquery/kt/$keyspace/$token 
