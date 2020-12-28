const Headers = require('fetch-headers')
const getStatus = require('statuses')
const bodyToIterator = require('fetch-request-body-to-async-iterator')
const { TransformStream } = require('web-streams-polyfill/ponyfill/es6')

module.exports = function makeFetch (handler) {
  return async function fetch (resource, init = {}) {
    if (!resource) throw new Error('Must specify resource')
    if (typeof resource === 'string') {
      return fetch({
        ...(init || {}),
        url: resource
      })
    }

    const {
      session,
      url,
      headers: rawHeaders,
      method: rawMethod,
      body: rawBody,
      referrer,
      signal
    } = resource

    const headers = rawHeaders ? headersToObject(rawHeaders) : {}
    const method = (rawMethod || 'GET').toUpperCase()
    const body = rawBody ? bodyToIterator(rawBody, session) : null

    const {
      statusCode,
      statusText: rawStatusText,
      headers: rawResponseHeaders,
      data
    } = await handler({
      url,
      headers,
      method,
      body,
      referrer,
      signal
    })

    const responseHeaders = new Headers(rawResponseHeaders || {})
    const statusText = rawStatusText || getStatus(statusCode)

    return new FakeResponse(statusCode, statusText, responseHeaders, data, url)
  }
}

class FakeResponse {
  constructor (status, statusText, headers, iterator, url) {
    this.body = makeBody(iterator)
    this.headers = headers
    this.url = url
    this.status = status
    this.statusText = statusText
  }

  get ok () {
    return this.status && this.status < 400
  }

  get useFinalURL () {
    return true
  }

  async arrayBuffer () {
    const buffer = await collectBuffers(this.body)
    return buffer.buffer
  }

  async text () {
    const buffer = await collectBuffers(this.body)
    return buffer.toString('utf-8')
  }

  async json () {
    return JSON.parse(await this.text())
  }
}

function makeBody (iterator) {
  const { readable, writable } = new TransformStream();
  (async () => {
    try {
      const writer = writable.getWriter()
      try {
        for await (const x of iterator) await writer.write(x)
      } finally {
        await writer.close()
      }
    } catch {
      // There was some sort of unhandled error?
    }
  })()
  return readable
}

function headersToObject (headers) {
  if (!headers) return {}
  if (typeof headers.entries === 'function') {
    const result = {}
    for (const [key, value] of headers) {
      result[key] = value
    }
    return result
  } else return headersToObject(new Headers(headers || {}))
}

async function collectBuffers (iterable) {
  const all = []
  for await (const buff of iterable) {
    all.push(Buffer.from(buff))
  }

  return Buffer.concat(all)
}
