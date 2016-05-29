
name=`basename $PWD`
echo $name

mkdir -p tmp
mv -f ~/.pm2/logs/${name}* tmp/. || echo 'no pm2 logs'

# domain 

port=4
config=secure
if echo $name | grep -q 'demo'
then
  port=8
  config=demo
fi

# env 

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

# bot 

bot=redishub
if [ $config = test ] 
then
  bot=rhtest
elif [ $config = demo ] 
then
  bot=rhdemo
fi

botSecret=`cat ~/.bot.$bot/secret`
echo botSecret $botSecret

botUrl=`cat ~/.bot.$bot/url`
echo botUrl $botUrl

# ok 

>&2 echo "$0 $name $config $instance $port"


