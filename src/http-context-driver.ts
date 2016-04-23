/// <reference path="../typings/main.d.ts" />

import * as http from 'http'
import {Observer, Observable} from '@reactivex/rxjs'

export interface Logger {
  info (...args: any[]): void
}

export interface HTTPContext {
  request: http.IncomingMessage
  response: http.ServerResponse
  status?: number
  headers?: Object
  body?: String
}

function createHTTPContext$<Observable> (port: number, logger: Logger) {
  const httpContext$ = Observable.create((observer: Observer<HTTPContext>) => {
    const server = http.createServer(
      (request: http.IncomingMessage, response: http.ServerResponse) => {
        logger.info(`${request.method} ${request.url}`)

        const incoming: HTTPContext = {
          request,
          response
        }

        observer.next(incoming)
      })

    server.listen(port)
    logger.info(`Listening at port ${port}`)

    return () => {
      server.close()
    }
  }).publish().refCount(1)

  return httpContext$
}

export function makeHTTPContextDriver<DriverFunction> (port: number, logger: Logger) {
  return function HTTPContextDriver<Observable> (outgoing$: any) {
    const incoming$ = createHTTPContext$(port, logger)

    outgoing$.subscribe((outgoing: HTTPContext) => {
      outgoing.response.writeHead(outgoing.status || 200, outgoing.headers || {})
      outgoing.response.end(outgoing.body)
    })

    return incoming$
  }
}
