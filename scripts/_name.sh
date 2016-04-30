
name=`basename $PWD`
echo $name

mkdir -p tmp
mv -f ~/.pm2/logs/${name}* tmp/. || echo 'no pm2 logs'

port=88
config=demo
if echo $name | grep -q 'secure'
then
  port=44
  config=secure
fi
if echo $name | grep -q 'left'
then
  port=${port}0
elif echo $name | grep -q 'right'
then
  port=${port}1
else
  port=${port}0
fi
instance=1
if echo $name | grep -q '[0-9]$'
then
  instance=`echo $name | sed 's/.*\([1-9]\)$/\1/'`
fi
echo $instance | grep -q '^[0-9]$'
port="${port}${instance}"
echo "$name $config $instance $port"
