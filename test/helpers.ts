import {
  Observer,
  ReplaySubject
} from '@reactivex/rxjs'

import {
  Server,
  Logger,
  Request,
  Response,
  Transport,
  HTTPContext
} from '../src/http-context-driver'

export interface MockTransport extends Transport {
  handleRequest(req: Request, res: MockResponse): void
}

export interface MockResponse extends Response {
  body: string
  status: number
  headers: Object
}

export interface MockHTTPContext extends HTTPContext {
  request: Request
  response: MockResponse
}

export function makeMockLogger (): Logger {
  const logger: Logger = {
    info (...args) {
      console.log('LOG', ...args)
    }
  }

  return logger
}

export function makeMockServer (logger: Logger): Server {
  const server: Server = {
    listen (port: number) {
    },

    close () {
      logger.info('Close server')
    }
  }

  return server
}

export function makeMockResponse (): MockResponse {
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

export function makeMockTransport (logger: Logger): MockTransport {
  const server = makeMockServer(logger)

  let cb: Function

  const transport: MockTransport = {
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
      console.log('NEXT', value)
      stream.next(value)
    },
    error: (error: Error) => {
      stream.error(error)
    },
    complete: () => stream.complete(),
  }

  return {stream, observer}
}
