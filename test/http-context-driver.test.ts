/// <reference path="../typings/main.d.ts" />

import * as test from 'tape'

import {makeHTTPContextDriver} from '../src/http-context-driver'

import {
  MockHTTPContext,
  makeMockLogger,
  makeMockResponse,
  makeMockTransport,
  makeHoldSubject
} from './helpers'

test('should respond', (t) => {
  t.plan(6)

  const logger = makeMockLogger()
  const transport = makeMockTransport(logger)
  const driver = makeHTTPContextDriver(8080, logger, transport)
  const request = {headers: {}, method: 'PUT', url: '/'}
  const response = makeMockResponse()
  const outgoing = makeHoldSubject()
  const incoming$ = driver(outgoing.stream)

  incoming$.subscribe((incoming: MockHTTPContext) => {
    t.equal(incoming.request.method, 'PUT')
    t.equal(incoming.request.url, '/')
    t.equal(JSON.stringify(incoming.request.headers), '{}')

    // Send response
    outgoing.stream.next({
      request,
      response,
      body: 'test',
      headers: {'Content-Type': 'text/html'},
      status: 204
    })

    t.equal(incoming.response.status, 204)
    t.equal(JSON.stringify(incoming.response.headers),
      '{"Content-Type":"text/html"}')
    t.equal(incoming.response.body, 'test')
  })

  transport.handleRequest(request, response)
})
