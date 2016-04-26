/// <reference path="../typings/main.d.ts" />

import {Observer, Observable} from '@reactivex/rxjs'

export interface HTTPLogger {
  info (...args: any[]): void
}

export interface HTTPServer {
  listen(port: number): void
  close(): void
}

export interface HTTPTransport {
  createServer (cb: Function): HTTPServer
}

export interface HTTPRequest {
  headers: Object
  method: string
  url: string
}

export interface HTTPResponse {
  end(body: string): void
  writeHead(status: number, headers: Object): void
}

export interface HTTPContext {
  request: HTTPRequest
  response: HTTPResponse
  status?: number
  headers?: Object
  body?: string
}

export function createHTTPContext$<Observable> (port: number, logger: HTTPLogger, transport: HTTPTransport) {
  const httpContext$ = Observable.create((observer: Observer<HTTPContext>) => {
    const server = transport.createServer(
      (request: HTTPRequest, response: HTTPResponse) => {
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

export function makeHTTPContextDriver<DriverFunction> (port: number, logger: HTTPLogger, transport: HTTPTransport) {
  return function HTTPContextDriver<Observable> (outgoing$: any) {
    const incoming$ = createHTTPContext$(port, logger, transport)

    outgoing$.subscribe((outgoing: HTTPContext) => {
      logger.info(`Response headers: ${JSON.stringify(outgoing.headers)}`)
      logger.info(`Response status: ${outgoing.status || 200}`)
      logger.info(`Response body: ${outgoing.body}`)

      outgoing.response.writeHead(outgoing.status || 200, outgoing.headers || {})
      outgoing.response.end(outgoing.body)
    })

    return incoming$
  }
}
