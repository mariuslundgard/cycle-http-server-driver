/// <reference path="../typings/main.d.ts" />

import {Observer, Observable} from '@reactivex/rxjs'

export interface Logger {
  info (...args: any[]): void
}

export interface Server {
  listen(port: number): void
  close(): void
}

export interface Transport {
  createServer (...args: any[]): Server
}

export interface Request {
  headers: Object
  method: string
  url: string
}

export interface Response {
  end(body: string): void
  writeHead(status: number, headers: Object): void
}

export interface HTTPContext {
  request: Request
  response: Response
  status?: number
  headers?: Object
  body?: string
}

export function createHTTPContext$<Observable> (port: number, logger: Logger, transport: Transport) {
  const httpContext$ = Observable.create((observer: Observer<HTTPContext>) => {
    const server = transport.createServer(
      (request: Request, response: Response) => {
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

export function makeHTTPContextDriver<DriverFunction> (port: number, logger: Logger, transport: Transport) {
  return function HTTPContextDriver<Observable> (outgoing$: any) {
    const incoming$ = createHTTPContext$(port, logger, transport)

    outgoing$.subscribe((outgoing: HTTPContext) => {
      outgoing.response.writeHead(outgoing.status || 200, outgoing.headers || {})
      outgoing.response.end(outgoing.body)
    })

    return incoming$
  }
}
