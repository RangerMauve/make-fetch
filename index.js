export const WILDCARD = '*'

const MATCH_ORDER = ['method', 'protocol', 'hostname', 'pathname']

export function makeFetch (handler, {
  Request = globalThis.Request,
  Response = globalThis.Response
} = {}) {
  return async function fetch (...requestOptions) {
    const request = new Request(...requestOptions)

    const { body = null, ...responseOptions } = await handler(request)

    const response = new Response(body, responseOptions)

    return response
  }
}

export function makeRoutedFetch ({
  onNotFound = DEFAULT_NOT_FOUND,
  onError = DEFAULT_ON_ERROR
} = {}) {
  const router = new Router()

  const fetch = makeFetch(async (request) => {
    const route = router.route(request)
    if (!route) {
      return onNotFound(request)
    }
    try {
      const response = await route.handler(request)
      return response
    } catch (e) {
      return await onError(e, request)
    }
  })

  return { fetch, router }
}

export function DEFAULT_NOT_FOUND () {
  return { status: 404, statusText: 'Invalid URL' }
}

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
    this.routes = []
  }

  get (url, handler) {
    return this.add('GET', url, handler)
  }

  head (url, handler) {
    return this.add('HEAD', url, handler)
  }

  post (url, handler) {
    return this.add('POST', url, handler)
  }

  put (url, handler) {
    return this.add('PUT', url, handler)
  }

  delete (url, handler) {
    return this.add('DELETE', url, handler)
  }

  patch (url, handler) {
    return this.add('PATCH', url, handler)
  }

  any (url, handler) {
    return this.add(WILDCARD, url, handler)
  }

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
  } else if(property === 'method') {
    return areEqual(route.method, request.method.toUpperCase())
  } else {
    const routeProperty = route[property]
    const requestProperty = request[property]
    return areEqual(routeProperty, requestProperty)
  }
}

function areEqual (routeProperty, requestProperty) {
  if (routeProperty === '*') return true
  return routeProperty === requestProperty
}
