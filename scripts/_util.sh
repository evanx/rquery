
# bash echo styles and colors

sBold="\e[1m"
sItalic="\e[3m"
sUnderline="\e[4m"
sReset="\e[0m"

cNormal="\e[39m"
cRed="\e[91m"
cGreen="\e[32m"
cYellow="\e[33m"
cLightGray="\e[37m"
cDarkGray="\e[90m"
cLightBlue="\e[94m"

# environment

debug() {
  local name="$1"
  shift
  echo -e "${cDarkGray}$name ${cDarkGray}${sBold}${*}${sReset}"
}

# echo utils

abort() {
   if [ -t 1 ]
   then
     echo -e "${sBold}${cRed}${1}${sReset}"
     shift
     if [ $# -gt 0 ]
     then
       echo "Try:"
       while [ $# -gt 0 ]
       do
         echo -e "${cGreen}${1}${cNormal}"
         shift
       done
     fi
   else
      echo "$1"
      shift
      if [ $# -gt 0 ]
      then
        echo "Try:"
        while [ $# -gt 0 ]
        do
          echo "$1"
          shift
        done
     fi
   fi
   exit 1
}

abortc() {
   if [ -t 1 ]
   then
     echo -e "${sBold}${cRed}${1}${sReset}"
     shift
     if [ $# -gt 0 ]
     then
       echo -e "${sBold}${cGreen}Try:${sReset}"
       while [ $# -gt 0 ]
       do
         echo -e "${cGreen}${1}${cNormal}"
         shift
       done
     fi
   else
      echo "$1"
      shift
      if [ $# -gt 0 ]
      then
        echo "Try:"
        while [ $# -gt 0 ]
        do
          echo "$1"
          shift
        done
     fi
   fi
   exit 1
}

headline() {
   echo
   if [ -t 1 ]
   then
      echo -e "${cYellow}${*}${cNormal}"
   else
      echo "$*"
   fi
}

headlinew() {
   echo
   if [ -t 1 ]
   then
      echo -e "${cRed}${sBold}${*}${cNormal}${sReset}"
   else
      echo "$*"
   fi
}

warn() {
   if [ -t 1 ]
   then
      echo -e "${cRed}${*}${cNormal}"
   else
      echo "$*"
   fi
}

info() {
   if [ -t 1 ]
   then
      echo -e "${cGreen}${*}${cNormal}"
   else
      echo "$*"
   fi
}

headlineb() {
   echo
   if [ -t 1 ]
   then
      echo -e "${sBold}${cYellow}${*}${sReset}"
   else
      echo "$*"
   fi
}

headlinei() {
   echo
   if [ -t 1 ]
   then
      echo -e "${sItalic}${cYellow}${*}${sReset}"
   else
      echo "$*"
   fi
}

hint() {
   echo
   if [ -t 1 ]
   then
      if echo "$1" | grep -q '^[A-Z]'
      then
        echo -e "${cGreen}Hint: ${*}${cNormal}"
      else
        echo -e "${cGreen}Hint:\n${*}${cNormal}"
      fi
   else
      echo "Hint: $*"
   fi
}

carg() {
  [ $# -ge 2 ] || abort "Invalid number of args: $# for 'carg' but expect 2 or more"
  count=$1
  shift
  name=$1
  shift
  expected=$#
  if [ $expected -ne $count ]
  then
    if [ $# -gt 0]
    then
      abort "Invalid $count args for '$name' but expect $# ($@)"
    else
      abort "Invalid $count args for '$name' but expect none"
    fi
  fi
}


