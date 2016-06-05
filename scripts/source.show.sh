
set -u -e 

file=`echo $1 | cut -d':' -f1`
line=`echo $1 | cut -d':' -f2`

head -$line $file | tail -30



