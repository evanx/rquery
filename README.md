
## rquery

- HTTP API for Redis queries

### Implementation

We use the component model specified in:
- https://github.com/evanx/component-validator

We use a supervisor implementation for such components via the `lib` submodule:
- https://github.com/evanx/libv


### Status

UNSTABLE, WORK IN PROGRESS


### Installation

```shell
git clone git@github.com:evanx/rquery.git --recursive && cd rquery && npm install && npm run demo
```

Let's run the demo.
```shell
npm run demo
```
The configuration module for this demo: https://github.com/evanx/rquery/blob/master/demo.js

### Further reading

Related projects and further plans: https://github.com/evanx/mpush-redis/blob/master/related.md
