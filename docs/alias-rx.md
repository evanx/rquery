
## rx bash alias for redis scan

We can try the following `rx` alias in our `~/.bashrc`

```shell
rherror() {
   [ -t 1 ] && >&2 echo -e "\e[1m\e[91m${*}\e[39m\e[0m"   
}

rhdebug() {
   [ -t 1 ] && >&2 echo -e "\e[33m${*}\e[39m"   
}
```

```shell
alias rx=redisx
```

We update our current bash shell:
```shell
. ~/.bashrc
```

Then we can select keys as run a command on each key as follows:

```shell
$ rx -n 13 scan 0 'demo:*' -- type
```

The above echos and executes the following command
```shell
redis-cli -n 13 keys * | xargs -n1 redis-cli -n 13 type
```
