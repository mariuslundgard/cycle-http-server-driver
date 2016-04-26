# cycle-http-context-driver

*In alpha.*

A HTTP server driver for CycleJS for managing request/response in Node.js.

## Installation

```sh
npm install cycle-http-context-driver --save
```

## Documentation

### Usage

```js
import {
  makeHTTPTransport,
  makeHTTPContextDriver
} from 'cycle-http-context-driver'

import bunyan from 'bunyan'

const logger = bunyan.createLogger({name: 'web'})
const transport = makeHTTPTransport()

const drivers = {
  HTTPContext: makeHTTPContextDriver(port, logger, transport)
}

function main (sources) {
  return {
    HTTPContext: sources.HTTP.map((context) => {
      return {
        ...context,
        headers: {'Content-Type': 'text/html'},
        body: 'Hello, world!'
      }
    })
  }
}

run(main, drivers)
```
