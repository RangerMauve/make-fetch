const Headers = require('fetch-headers')
const bodyToStream = require('fetch-request-body-to-stream')
const concat = require('concat-stream')
const getStatus = require('statuses')

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
      url,
      headers: rawHeaders,
      method: rawMethod,
      body: rawBody,
      referrer
    } = resource

    const headers = rawHeaders ? headersToObject(rawHeaders) : {}
    const method = (rawMethod || 'GET').toUpperCase()
    const body = rawBody ? bodyToStream(rawBody) : null

    return new Promise((resolve, reject) => {
      handler({ url, headers, method, body, referrer }, (response) => {
        const {
          statusCode,
          statusText: rawStatusText,
          headers: rawResponseHeaders,
          data
        } = response

        try {
          const responseHeaders = new Headers(rawResponseHeaders || {})
          const statusText = rawStatusText || getStatus(statusCode)

          resolve(new FakeResponse(statusCode, statusText, responseHeaders, data, url))
        } catch (e) {
          reject(e)
        }
      })
    })
  }
}

class FakeResponse {
  constructor (status, statusText, headers, stream, url) {
    this.body = stream
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
    const buffer = await concatPromise(this.body)
    return buffer.buffer
  }

  async text () {
    const buffer = await concatPromise(this.body)
    return buffer.toString('utf-8')
  }

  async json () {
    return JSON.parse(await this.text())
  }
}

function headersToObject (headers) {
  if (!headers) return {}
  if (typeof headers.entries === 'function') {
    const result = {}
    for(let [key, value] of headers) {
      result[key] = value
    }
    return result
  } else headersToObject(new Headers(headers || {}))
}

function concatPromise (stream) {
  return new Promise((resolve, reject) => {
    var concatStream = concat(resolve)
    concatStream.once('error', reject)
    stream.pipe(concatStream)
  })
}
