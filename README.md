
## rquery



### Status

DESIGN STAGE - UNIMPLEMENTED


### Implementation


### Configuration

Upon startup, the service publishes its availability via Redis, and awaits for configuration `props` via Redis.

```shell
redis='redis://localhost:6379/14' npm start
redis-cli -n 14 hset demo:hbridge:service:1:props port 8000
redis-cli -n 14 lpush demo:hbridge:service:1:command start
```
where its `props` must include the port number for its ExpressJS server.

Upon receiving props via Redis, it starts an ExpressJS server.

### Logging

The service




### Installation

```shell
git clone https://github.com/evanx/rquery &&
  cd rquery &&
  npm install
```

Let's run the demo.
```shell
npm run demo
```

### Further reading

Related projects and further plans: https://github.com/evanx/mpush-redis/blob/master/related.md

