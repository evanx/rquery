
set -u -e 

host=$1
shift

user=root
  mkdir -p ~/backups/rquery/$host/$user
  rsync -r $user@$host:/etc/nginx ~/backups/rquery/$host/$user
  find ~/backups/rquery/$host/$user

