
rhdebug() {
  if [ -t 1 ]
  then
    >&2 echo -e "\e[33m${*}\e[39m"
  else
    >&2 echo "DEBUG ${*}"
  fi
}

rhinfo() {
  if [ -t 1 ]
  then
    >&2 echo -e "\e[32m${*}\e[39m"
  else
    >&2 echo "INFO ${*}"
  fi
}

rherror() {
   if [ -t 1 ]
   then
     >&2 echo -e "\e[1m\e[91m${*}\e[39m\e[0m"
   else
     >&2 echo "ERROR ${*}"
   fi
}

RedisScan() { # scan command with sleep between iterations
  rhdebug "RedisScan args: ${*}"
  mkdir -p ~/tmp/RedisScan
  local tmp=~/tmp/RedisScan/$$
  local keyScanCommands='sscan zscan hscan'
  local scanCommands='scan sscan zscan hscan'
  local matchTypes='string set zset list hash any' # 'any' for testing
  local eachCommands='type persist expire del get scard zcard llen hlen hgetall sscan zscan lrange echo' # 'echo' for testing
  local keyArgsCommands='expire lrange'
  local sleep=${sleep:=.250}
  local loadavg=${loadavg:=1}
  local dryrun=${dryrun:=0}
  local eachLimit=${eachLimit:=20}
  local cursor=${cursor:=0}
  local redisArgs=''
  local matchType=''
  local eachCommand=''
  local eachArgs=''
  local scanCommand='scan'
  local scanKey=''
  local scanArgs=''
  rhdebug "sleep: $sleep, loadavg: $loadavg, eachLimit: $eachLimit"
  # iterate args for scan command
  if [ $# -eq 0 ]
  then
    scanCommand='scan'
  else
    if echo "$1" | grep -q "^[0-9][0-9]*$"
    then
      local dbn=$1
      shift
      redisArgs=" -n $dbn"
      rhinfo "dbn $dbn"
    fi
  fi
  while [ $# -gt 0 ]
  do
    local arg="$1"
    shift
    if printf '%s' "$arg" | grep -qi '^@'
    then
      local aarg=`echo "$arg" | tail -c+2`
      if echo " $matchTypes" | grep -q " $aarg"
      then
        matchType="$aarg"
        rhdebug "matchType $matchType"
        continue
      fi
      echo "Invalid arg: $arg"
      return 19
    fi
    if printf '%s' "$arg" | grep -qi 'scan$'
    then
      scanCommand=$arg
      break
    elif [ $arg = '--' ]
    then
      break
    elif [ $arg = '--type' ]
    then
      if [ $# -eq 0 ]
      then
        rherror "Invalid match type. Expecting after '--type' one of: $matchTypes"
        return 15
      fi
      matchType=$1
      shift
      if echo "$matchTypes" | grep -qv "$matchType"
      then
        rherror "Invalid specified key type: $matchType. Expecting one of: $matchTypes"
        return 13
      fi
      rhdebug "matchType $matchType"
    elif [ $arg = '--each' ]
    then
      eachCommand=$1
      shift
      if echo "$eachCommands" | grep -qvi "$eachCommand"
      then
        rherror "Invalid each command: $eachCommand. Expecting one of: $eachCommands"
        return 11
      fi
      rhdebug "eachCommand $eachCommand"
    else
      redisArgs="$redisArgs $arg"
    fi
  done
  # check scanCommand
  if [ ${#scanCommand} -eq 0 ]
  then
    rherror "Missing scan command: $scanCommands"
    return 27
  fi
  if echo "$scanCommands" | grep -qvi "$scanCommand"
  then
    rherror "Invalid scan command: $scanCommand. Expecting one of: $scanCommands"
    return 25
  fi
  if echo " $keyScanCommands" | grep -qi " $scanCommand"
  then
    if [ $# -eq 0 ]
    then
      rherror "Missing key for $scanCommand"
      return 25
    fi
    scanKey=$1
    shift
    scanCommand="$scanCommand $scanKey"
    rhdebug "scanCommand $scanCommand"
  fi
  if [ $# -gt 0 ]
  then
    if echo "$1" | grep '^[0-9][0-9]*$'
    then
      cursor=$1
      shift
    fi
  fi
  rhdebug "scanCommand $scanCommand"
  # iterate scanArgs until '--'
  while [ $# -gt 0 ]
  do
    local arg="$1"
    shift
    if [ $arg = '--' ]
    then
      if [ ${#eachCommand} -eq 0 ]
      then
        if [ $# -eq 0 ]
        then
           rherror "Missing each command after '--' delimiter."
           return 37
        fi
        eachCommand=$1
        shift
      fi
      if [ $# -gt 0 ]
      then
        eachArgs=" $@"
      elif echo "$keyArgsCommands" | grep -q "$eachCommand"
      then
        rherror "Missing each args for $eachCommand"
        return 35
      fi
      break
    else
      scanArgs="$scanArgs $arg"
    fi
  done
  # check matchType
  if [ ${#matchType} -gt 0 ]
  then
    rhdebug "matchType $matchType"
  fi
  if [ ${#eachCommand} -gt 0 ]
  then
    rhdebug "scan: redis-cli$redisArgs $scanCommand $cursor$scanArgs"
    rhdebug "each: redis-cli$redisArgs $eachCommand KEY$eachArgs"
    if [ -t 1 ]
    then
      rhinfo 'Press Ctrl-C to abort, enter to continue'
      read _confirm
    fi
  fi
  # scan keys
  local keyCount=0
  while [ true ]
  do
    rhdebug "redis-cli$redisArgs $scanCommand $cursor$scanArgs"
    redis-cli$redisArgs $scanCommand $cursor$scanArgs | cat > $tmp
    cursor=`head -1 $tmp`
    rhinfo cursor "$cursor"
    if echo "$cursor" | grep -qv '^[0-9][0-9]*$'
    then
      cat $tmp
      return 1
    fi
    if [ ${#matchType} -eq 0 -a ${#eachCommand} -eq 0 ]
    then
      tail -n +2 $tmp
    else
      for key in `tail -n +2 $tmp`
      do
        if [ ${#matchType} -gt 0 ]
        then
          local keyType=`redis-cli$redisArgs type $key`
          if [ $matchType != 'any' -a $keyType != $matchType ]
          then
            #rhdebug "ignore $key type $keyType, not $matchType"
            continue
          fi
        fi
        if [ ${#eachCommand} -eq 0 ]
        then
          echo $key
        elif [ $eachCommand = 'echo' ]
        then
          echo $key
        elif [ $dryrun -eq 1 ]
        then
          rhinfo redis-cli$redisArgs $eachCommand $key$eachArgs
        else
          rhdebug redis-cli$redisArgs $eachCommand $key$eachArgs
          redis-cli$redisArgs $eachCommand $key$eachArgs
        fi
      done
    fi
    if [ $cursor -eq 0 ]
    then
      rhinfo 'OK'
      break
    fi
    keyCount=$[ $keyCount + 1 ]
    if [ $eachLimit -gt 0 -a $keyCount -gt $eachLimit ]
    then
      rherror "Limit reached: eachLimit $eachLimit"
      return 1
    fi
    sleep $sleep # sleep to alleviate the load on Redis and the server
    while cat /proc/loadavg | grep -qv "^[0-${loadavg}]"
    do
      rhdebug loadavg `cat /proc/loadavg | cut -f1 -d' '`
      sleep 5 # sleep while load is too high
    done
  done
}

alias redis-scan=RedisScan
