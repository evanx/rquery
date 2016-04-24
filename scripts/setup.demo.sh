
set -u -e

force=${force:=false}
loggerLevel=${loggerLevel:=debug}

# logging

## styles
stBold="\e[1m"
stReset="\e[0m"

## colors
cfDefault="\e[39m"
cfRed="\e[31m"
cfGreen="\e[32m"
cfYellow="\e[33m"
cfLightGray="\e[37m"
cfDarkGray="\e[90m"
cfLightBlue="\e[94m"

debug() {
   if [ -n "$loggerLevel" -a "$loggerLevel" = 'debug' ]
   then
      if [ -t 1 ]
      then
         >&2 echo -e "${cfLightBlue}DEBUG $*${cfDefault}"
      else
         >&2 echo "DEBUG $*"
      fi
   fi
}

rdebug() {
   if [ -n "$loggerLevel" -a "$loggerLevel" = 'debug' ]
   then
     >&2 echo -e "${cfDarkGray}DEBUG redis $*${cfDefault}"
   fi
}

info() {
   if [ -t 1 ]
   then
      >&2 echo -e "${cfGreen}INFO  $*${cfDefault}"
   else
      >&2 echo "INFO $*"
   fi
}

warn() {
   if [ -t 1 ]
   then
      >&2 echo -e "${cfYellow}${stBold}WARN  $*${stReset}"
   else
      >&2 echo "WARN $*"
   fi
}

error() {
   if [ -t 1 ]
   then
      >&2 echo -e "${cfRed}${stBold}ERROR $*${stReset}"
   else
      >&2 echo "ERROR $*"
   fi
}


# exit

abort() {
   if [ -t 1 ]
   then
      echo -e "${cfRed}${stBold}ABORT $*${stReset}"
   else
      echo "ABORT $*"
   fi
   exit 1
}


# parameters

echo -n 'dir (e.g. ~/demo-rquery) '; echo $dir
echo -n 'auth (e.g. github.com) '; echo $auth
echo -n 'user '; echo $user
echo -n 'force (deregister existing) '; echo $force

if [ $auth != 'github.com' ]
then
  abort "Supported auth providers: github.com"
fi

serviceUrl='https://demo.ibhala.com/rquery'

debug "Validating https://github.com/$user"
curl -I -s https://github.com/$user | grep ^HTTP | grep OK || abort "Invalid Github user: $user"

if [ -d $dir ]
then
  if [ -f $dir/url ]
  then
    if [ "$force" == 'true' ]
    then
      curl -I -s `cat $dir/url`/deregister; printf '\n'
    else
      abort "Directory already exists ($dir), try: force=true"
    fi
  fi
elif [ -f $dir ]
then
  abort "File exists: $dir"
else
  mkdir -p $dir
fi

cd $dir
pwd

info "Generating token (10 random bytes, base32 encoded)"
dd if=/dev/urandom bs=10 count=1 2>/dev/null | ~/rquery/node_modules/.bin/base32 > token
uri="kt/$user/"`cat token`
echo uri $uri
echo $uri > uri
rdemo="$serviceUrl/$uri"
echo rdemo $rdemo
echo $rdemo > url # required to access and deregister, so save to file
ls -l url
cat url

echo "curl -s $rdemo/register/github.com/$user"
curl -s $rdemo/register/github.com/$user | python -mjson.tool
