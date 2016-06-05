
set -u -e

[ -n "$BASH" ]

declare -A arr

arr[0]='match'
arr[1]='*'

echo "${#arr} $arr"
exit 1
echo redis-cli scan 0 "$arr"
redis-cli scan 0 "$arr"
exit 1

info() {
  echo "INFO $@"
  echo redis-cli keys "$@"
}

value="args: $@"
echo "$value"
info "$value"
string="$value"
info "$string"
