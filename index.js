/** @typedef {ConstructorParameters<typeof globalThis.Response>[0] | AsyncIterable<string>} Body */
/** @typedef {Response|ResponseInit & {body?: Body}} ResponseLike */
/** @typedef {(request: Request) => ResponseLike|Promise<ResponseLike> } Handler */
/** @typedef {(error: Error, request: Request) => ResponseLike } ErrorHandler */

/**
 * @typedef {object} Route
 * @property {string} protocol
 * @property {string} method
 * @property {string} hostname
 * @property {string[]} segments
 * @property {Handler} handler
*/

/** @typedef {'pathname' | 'hostname' | 'protocol' | 'method'} MatchProperty */

/** @type {MatchProperty[]} */
const MATCH_ORDER = ['method', 'protocol', 'hostname', 'pathname']

export const WILDCARD = '*'

/**
 * @param {Handler} handler
 * @param {object} [options]
 * @param {typeof globalThis.Request} [options.Request]
 * @param {typeof globalThis.Response} [options.Response]
 * @returns {typeof fetch}
 */
export function makeFetch (handler, {
  Request = globalThis.Request,
  Response = globalThis.Response
} = {}) {
  return fetch

  /** @type {typeof globalThis.fetch} */
  async function fetch (...requestOptions) {
    const isAlreadyRequest = requestOptions[0] instanceof Request
    const request = isAlreadyRequest ? /** @type {Request} */(requestOptions[0]) : new Request(...requestOptions)

    const { body = null, ...responseOptions } = await handler(request)

    // @ts-ignore You can use an AsyncIterable of strings for body
    const response = new Response(body, responseOptions)

    return response
  }
}

/**
 *
 * @param {object} [options]
 * @param {Handler} [options.onNotFound]
 * @param {ErrorHandler} [options.onError]
 * @returns
 */
export function makeRoutedFetch ({
  onNotFound = DEFAULT_NOT_FOUND,
  onError = DEFAULT_ON_ERROR
} = {}) {
  const router = new Router()

  const fetch = makeFetch(handler)

  /**
   * @param {Request} request
   * @returns {Promise<ResponseLike>}
   */
  async function handler (request) {
    const route = router.route(request)
    if (!route) {
      return onNotFound(request)
    }
    try {
      const response = await route.handler(request)
      return response
    } catch (e) {
      // Typescript is annoying
      return await onError(/** @type {Error} */ (e), request)
    }
  }

  return { fetch, router }
}

export function DEFAULT_NOT_FOUND () {
  return { status: 404, statusText: 'Invalid URL' }
}

/** @type {ErrorHandler} */
export function DEFAULT_ON_ERROR (e) {
  return {
    status: 500,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    },
    body: e.stack
  }
}

export class Router {
  constructor () {
    this.routes = /** @type {Route[]} */ ([])
  }

  /**
   *
   * @param {string} url
   * @param {Handler} handler
   * @returns {Router}
   */
  get (url, handler) {
    return this.add('GET', url, handler)
  }

  /**
   *
   * @param {string} url
   * @param {Handler} handler
   * @returns {Router}
   */
  head (url, handler) {
    return this.add('HEAD', url, handler)
  }

  /**
   *
   * @param {string} url
   * @param {Handler} handler
   * @returns {Router}
   */
  post (url, handler) {
    return this.add('POST', url, handler)
  }

  /**
   *
   * @param {string} url
   * @param {Handler} handler
   * @returns {Router}
   */
  put (url, handler) {
    return this.add('PUT', url, handler)
  }

  /**
   *
   * @param {string} url
   * @param {Handler} handler
   * @returns {Router}
   */
  delete (url, handler) {
    return this.add('DELETE', url, handler)
  }

  /**
   *
   * @param {string} url
   * @param {Handler} handler
   * @returns {Router}
   */
  patch (url, handler) {
    return this.add('PATCH', url, handler)
  }

  /**
   *
   * @param {string} url
   * @param {Handler} handler
   * @returns {Router}
   */
  any (url, handler) {
    return this.add(WILDCARD, url, handler)
  }

  /**
   *
   * @param {string} method
   * @param {string} url
   * @param {Handler} handler
   * @returns {Router}
   */
  add (method, url, handler) {
    const parsed = new URL(url)
    const { hostname, protocol, pathname } = parsed
    const segments = pathname.slice(1).split('/')

    const route = {
      protocol,
      method: method.toUpperCase(),
      hostname,
      segments,
      handler
    }

    this.routes.push(route)
    return this
  }

  /**
   *
   * @param {Request} request
   * @returns {Route?}
   */
  route (request) {
    for (const route of this.routes) {
      let hasFail = false
      for (const property of MATCH_ORDER) {
        if (!matches(request, route, property)) {
          hasFail = true
        }
      }
      if (!hasFail) {
        return route
      }
    }
    return null
  }
}

/**
 *
 * @param {Request} request
 * @param {Route} route
 * @param {MatchProperty} property
 * @returns
 */
function matches (request, route, property) {
  if (property === 'pathname') {
    const routeSegments = route.segments
    const { pathname } = new URL(request.url)
    const requestSegments = pathname.slice(1).split('/')

    let i = 0
    while (true) {
      const routeLast = i === (routeSegments.length - 1)
      const requestLast = i === (requestSegments.length - 1)

      const routeSegment = routeSegments[i]
      const requestSegment = requestSegments[i]
      const routeWild = routeSegment === WILDCARD
      const matches = routeWild || (routeSegment === requestSegment)

      if (routeLast) {
        if (routeSegment === (WILDCARD + WILDCARD)) return true
        if (requestLast) return matches
        return false
      } else if (requestLast) {
        return false
      }

      if (!matches) return false
      i++
    }
  } if (property === 'hostname') {
    return areEqual(route.hostname, new URL(request.url).hostname)
  } else if (property === 'protocol') {
    return areEqual(route.protocol, new URL(request.url).protocol)
  } else if (property === 'method') {
    return areEqual(route.method, request.method.toUpperCase())
  } else {
    const routeProperty = route[property]
    const requestProperty = request[property]
    return areEqual(routeProperty, requestProperty)
  }
}

/**
 * @param {string} routeProperty
 * @param {string} requestProperty
 * @returns
 */
function areEqual (routeProperty, requestProperty) {
  if (routeProperty === '*') return true
  return routeProperty === requestProperty
}
