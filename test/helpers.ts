import {
  Observer,
  ReplaySubject
} from '@reactivex/rxjs'

import {
  HTTPServer,
  HTTPLogger,
  HTTPRequest,
  HTTPResponse,
  HTTPTransport,
  HTTPContext
} from '../src/http-server-driver'

export interface MockHTTPTransport extends HTTPTransport {
  handleRequest(req: HTTPRequest, res: MockHTTPResponse): void
}

export interface MockHTTPResponse extends HTTPResponse {
  body: string
  status: number
  headers: Object
}

export interface MockHTTPContext extends HTTPContext {
  request: HTTPRequest
  response: MockHTTPResponse
}

export function makeMockHTTPLogger (): HTTPLogger {
  const logger: HTTPLogger = {
    info (...args) {
      console.log('LOG', ...args)
    }
  }

  return logger
}

export function makeMockHTTPServer (logger: HTTPLogger): HTTPServer {
  const server: HTTPServer = {
    listen (port: number) {
    },

    close () {
      logger.info('Close server')
    }
  }

  return server
}

export function makeMockHTTPResponse (): MockHTTPResponse {
  return {
    body: '',
    status: 200,
    headers: {},

    end (body: string) {
      this.body = body || ''
    },

    writeHead (status: number, headers: Object) {
      this.status = status
      this.headers = headers
    }
  }
}

export function makeMockHTTPTransport (logger: HTTPLogger): MockHTTPTransport {
  const server = makeMockHTTPServer(logger)

  let cb: Function

  const transport: MockHTTPTransport = {
    createServer (_cb) {
      cb = _cb

      return server
    },

    handleRequest (req, res) {
      cb(req, res)
    }
  }

  return transport
}

export function makeHoldSubject () {
  const stream = new ReplaySubject(1)
  const observer: Observer<HTTPContext> = {
    next: (value: HTTPContext) => {
      stream.next(value)
    },
    error: (error: Error) => {
      stream.error(error)
    },
    complete: () => stream.complete(),
  }

  return {stream, observer}
}
