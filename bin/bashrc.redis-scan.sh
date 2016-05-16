
RedisScan_clean() {
  rm -rf ~/tmp/redis-scan/$$
}

RedisScan() { # scan command with sleep between iterations
  rhdebug "redis-scan args: ${*}"
  mkdir -p ~/tmp/redis-scan
  local tmp=~/tmp/redis-scan/$$
  rhdebug "tmp $tmp"
  local keyScanCommands='sscan zscan hscan'
  local scanCommands='scan sscan zscan hscan'
  local matchTypes='string set zset list hash any' # 'any' for testing
  local eachCommands='type persist expire del get scard smembers zcard llen hlen hgetall hkeys sscan zscan lrange lpush echo' # 'echo' for testing
  local eachArgsCommands='expire lrange'
  local -A typeEachCommands
  typeEachCommands['list']='llen lpush lrange'
  typeEachCommands['hash']='hlen hgetall hkeys hscan'
  typeEachCommands['set']='scard smembers sscan'
  typeEachCommands['zset']='zcard zrevrange zrange zscan'
  local sleep=${sleep:=.250}
  local loadavgLimit=${loadavgLimit:=1}
  local commit=${commit:=0}
  local eachLimit=${eachLimit:=100}
  local cursor=${cursor:=0}
  local redisArgs=''
  local matchType=''
  local eachCommand=''
  local eachArgs=''
  local scanCommand='scan'
  local scanKey=''
  local scanArgs=''
  rhdebug "sleep: $sleep, loadavgLimit: $loadavgLimit, eachLimit: $eachLimit, args: $@"
  # check initial arg for dbn
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
  # iterate initial args
  while [ $# -gt 0 ]
  do
    local arg="$1"
    shift
    if printf '%s' "$arg" | grep -qi '^@'
    then
      local argt=`echo "$arg" | tail -c+2`
      matchType="$argt"
      if echo "$matchTypes" | grep -qv "$matchType"
      then
        rherror "Invalid specified key type: $matchType. Expecting one of: $matchTypes"
        return $LINENO
      fi
      rhdebug "matchType $matchType"
    elif printf '%s' "$arg" | grep -qi '^scan$'
    then
      if [ $# -gt 0 ]
      then
        if echo "$1" | grep -q '^[0-9][0-9]*$'
        then
          cursor=$1
          shift
        fi
      fi
      break;
    elif printf '%s' "$arg" | grep -qi 'scan$'
    then
      scanCommand=$arg
      if [ $# -eq 0 ]
      then
        rherror "Missing key for $scanCommand"
        return $LINENO
      fi
      scanKey="$1"
      rhdebug "scanKey $scanKey"
      shift
      if [ $# -gt 0 ]
      then
        if echo "$1" | grep -q '^[0-9][0-9]*$'
        then
          cursor=$1
          shift
        fi
      fi
      scanArgs=" $scanKey"
      break;
    elif [ $arg = '--' ]
    then
      eachCommand="$1"
      if ! shift
      then
        rherror "missing each command [$@]"
        return $LINENO
      fi
      rhdebug "each '$eachCommand' [$@]"
      break
    elif printf '%s' "$arg" | grep -qi '^match$'
    then
      if [ $# -eq 0 ]
      then
        rherror "missing match pattern"
        return $LINENO
      fi
      local pattern="$1"
      shift
      scanArgs=" $arg '$pattern'"
      break
    elif printf '%s' "$arg" | grep -qi '*'
    then
      scanArgs=" match '$arg'"
      break
    else
      redisArgs="$redisArgs $arg"
      rhdebug redisArgs "$redisArgs"
    fi
  done
  # check scanCommand
  if [ ${#scanCommand} -eq 0 ]
  then
    rherror "Missing scan command: $scanCommands"
    return $LINENO
  fi
  if echo "$scanCommand" | grep -qvi "scan"
  then
    rherror "Invalid scan command: $scanCommand. Expecting one of: $scanCommands"
    return $LINENO
  fi
  # handle scan args
  if [ ${#eachCommand} -eq 0 ]
  then
    rhdebug "scanCommand $scanCommand [$@]"
    # iterate scanArgs until '--'
    while [ $# -gt 0 ]
    do
      local arg="$1"
      shift
      if [ "$arg" = '--' ]
      then
        if [ $# -eq 0 ]
        then
          rherror "Missing 'each' command after '--' delimiter"
          return $LINENO
        fi
        eachCommand=$1
        shift
        break
      else
        scanArgs="$scanArgs $arg"
      fi
    done
  fi
  # check eachCommand
  rhdebug eachCommand $eachCommand
  if [ ${#eachCommand} -gt 0 ]
  then
    if echo " $eachArgsCommands " | grep -q " $eachCommand "
    then
      if [ $# -eq 0 ]
      then
        rherror "Command (each) missing args: $eachCommand"
        return $LINENO
      fi
    else
      if [ $# -gt 0 ]
      then
        rherror "Command (each) has unexpected args: $eachCommand"
        return $LINENO
      fi
    fi
    if [ ${#matchType} -eq 0 ]
    then
      for keyType in set zset list hash
      do
        rhdebug "eachCommand: $eachCommand, $keyType: $typeEachCommands[$keyType]"
        if echo " $typeEachCommands[$keyType] " | grep -q " $eachCommand "
        then
          matchType=$keyType
          break
        fi
      done
    fi
    while [ $# -gt 0 ]
    do
      if printf '%s' "$1" | grep -q '^-'
      then
        rherror "Unsupported each arg: $1"
        return $LINENO
      fi
      eachArgs="$eachArgs $1"
      shift
    done
    rhinfo "scan: redis-cli$redisArgs $scanCommand $cursor$scanArgs"
    if [ ${#matchType} -gt 0 ]
    then
      rhinfo "type: $matchType, eachLimit: $eachLimit, commit: $commit"
    else
      rhinfo "eachLimit: $eachLimit, commit: $commit"
    fi
    rhinfo "each: redis-cli$redisArgs $eachCommand KEY$eachArgs"
    if [ $commit -eq 1 ]
    then
      rhwarn "WARNING: This is not a dry run"
      rhwarn 'Press Ctrl-C to abort, enter to continue'
      read _confirm
    fi
  fi
  # scan keys
  local keyCount=0
  local cursorCount=0
  local stime=`date +%s`
  local slowlogLen=`redis-cli$redisArgs slowlog len`
  rhdebug "redis-cli$redisArgs slowlog len # $slowlogLen"
  while [ true ]
  do
    if [ $eachLimit -gt 0 -a $keyCount -gt $eachLimit ]
    then
      rherror "Limit reached: eachLimit $eachLimit"
      return $LINENO
    fi
    redis-cli$redisArgs $scanCommand $cursor $scanArgs > $tmp
    if [ $? -ne 0 ]
    then
      rherror "redis-cli$redisArgs $scanCommand $cursor$ scanArgs"
      return $LINENO
    fi
    if ! head -1 $tmp | grep -q '^[0-9][0-9]*$'
    then
      rherror "redis-cli$redisArgs $scanCommand $cursor$scanArgs"
      >&2 cat $tmp
      return $LINENO
    fi
    cursor=`head -1 $tmp`
    keyCount=$[ $keyCount + `cat $tmp | wc -l` - 1 ]
    if [ $cursorCount -eq 0 -a $[ $cursorCount % 5 ] -eq 0 ]
    then
      rhdebug "redis-cli$redisArgs $scanCommand $cursor$scanArgs # cursor $cursor, keys $keyCount, matchType [$matchType] $eachCommand"
    fi
    cursorCount=$[ $cursorCount + 1 ]
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
        else
          rhinfo redis-cli$redisArgs $eachCommand $key$eachArgs
          if [ $commit -eq 1 ]
          then
            redis-cli$redisArgs $eachCommand $key$eachArgs
            if [ $? -ne 0 ]
            then
              rherror "redis-cli$redisArgs $eachCommand $key$eachArgs"
              return $LINENO
            fi
          fi
        fi
      done
    fi
    if [ $cursor -eq 0 ]
    then
      rhinfo 'OK'
      break
    fi
    sleep $sleep # sleep to alleviate the load on Redis and the server
    while cat /proc/loadavg | grep -qv "^[0-${loadavgLimit}]"
    do
      rhdebug loadavg `cat /proc/loadavg | cut -f1 -d' '`
      sleep 5 # sleep while load is too high
    done
    local _slowlogLen=`redis-cli$redisArgs slowlog len`
    if ! echo "$_slowlogLen" | grep -q '^[0-9][0-9]*$'
    then
      rherror "redis-cli$redisArgs slowlog len"
      return $LINENO
    fi
    if [ $_slowlogLen -ne $slowlogLen ]
    then
      rhwarn "slowlog length was $slowlogLen, now $_slowlogLen"
      slowlogLen=$_slowlogLen
      sleep 5 # sleep more
    fi
  done
}

alias redis-scan=RedisScan
