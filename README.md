
## rquery

- HTTP API for Redis queries

### Implementation

We use the component model specified in:
- https://github.com/evanx/component-validator

We use a supervisor implementation for such components via the `lib` submodule:
- https://github.com/evanx/libv


### Status

WORK IN PROGRESS


### Installation

```shell
git clone git@github.com:evanx/rquery.git --recursive && cd rquery && npm install
```

Let's run the demo
```shell
cd rquery
npm run demo
```
where this is configured with the following Redis URL and "keyspace:"
```yaml
redisUrl: 'redis://localhost:6379/13
redisKeyspace: 'demo:rquery
```

See the configuration module for this demo: https://github.com/evanx/rquery/blob/master/demo.js

### Further reading

Related projects and further plans: https://github.com/evanx/mpush-redis/blob/master/related.md
