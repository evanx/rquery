
name=`basename $PWD`
echo $name

mkdir -p tmp
mv -f ~/.pm2/logs/${name}* tmp/. || echo 'no pm2 logs'

port=4
config=secure
if echo $name | grep -q 'demo'
then
  port=8
  config=demo
fi
if echo $name | grep -q 'test'
then
  port=${port}9
  config=test
else
  port=${port}${port}
fi

# color

color=9
if echo $name | grep -q 'blue'
then
  color=0
elif echo $name | grep -q 'green'
then
  color=1
elif echo $name | grep -q 'left'
then
  color=0
elif echo $name | grep -q 'right'
then
  color=1
fi
port=$port${color}

# instance

instance=1
if echo $name | grep -q '[0-9]$'
then
  instance=`echo $name | sed 's/.*\([1-9]\)$/\1/'`
fi
echo $instance | grep -q '^[0-9]$'
port="${port}${instance}"

echo "$name $config $instance $port"

