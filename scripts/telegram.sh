
set -u -e 

cd ~/.bot.redishub
pwd
ls -l

bot=`cat id`
botSecret=`cat secret`

#echo bot $bot
#echo botSecret $botSecret

>&1 echo "curl -s https://api.telegram.org/bot$bot/getMe"

curlb() {
  curl -s "https://api.telegram.org/bot$bot/$1" > res
  if head -1 res | grep '^["\[{]'
  then
    cat res | python -mjson.tool
  else
    cat res
  fi
}

c0getMe() {
  curlb getMe 
}

c0getUpdates() {
  curlb getUpdates?limit=100
}

c1getUpdates() {
  offset=$1
  curlb getUpdates?offset=$offset&limit=100 | python -mjson.tool

}

c2sendMessage() {
  chatId=$1
  text=$2
  uri="sendMessage?chat_id=$chatId&text=$text"
  echo uri "$uri"
  curlb "$uri"
}

jsontool() {
  python -mjson.tool

}

c0testWebhook() {
  webhookUrl=`cat ~/.bot.redishub/webhook.url`
  echo "webhookUrl $webhookUrl"
  echo "curl -s '$webhookUrl'"
  curl -s -X POST -d '"test data"' "$webhookUrl"
}

c1setWebhook() {
  webhookUrl=$1
  echo "webhookUrl $webhookUrl"
  echo | openssl sclient -connect api.telegram.org:443 | grep 'CN='
  openssl x509 -text -in cert.pem  | grep 'CN='
  echo "curl -s -F certificate=@cert.pem 'https://api.telegram.org/bot$bot/setWebhook?url=$webhookUrl'"
  #if ! curl -s -F certificate=@cert.pem "https://api.telegram.org/bot$bot/setWebhook?url=$webhookUrl" > res
  if ! curl -s "https://api.telegram.org/bot$bot/setWebhook?url=$webhookUrl" > res
  then
    >&2 echo "curl $?"
  else
    echo >> res
    cat res | jsontool
  fi
}

c0setWebhook() {
  webhookUrl=`cat ~/.bot.redishub/webhook.url`
  c1setWebhook $webhookUrl
}

c0testWebhook() {
  webhookUrl=`cat ~/.bot.redishub/webhook.url`
  curl -v -s -X POST -d '{
    "message": {
      "text": "verify",
      "from": {
        "id": 1234,
        "username": "test"
      },
      "chat": {
        "chat_id": 3456
      }
    }
  }' $webhookUrl 
}


command=getMe
if [ $# -gt 0 ]
then
  command=$1
  shift
fi
c$#$command $@

