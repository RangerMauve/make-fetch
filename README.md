# make-fetch
Implement your own `fetch()` with node.js streams

## Usage

```
npm i --save make-fetch
```

Basic example:

```javascript
import { makeFetch } from 'make-fetch'
const fetch = makeFetch(async (request) => {
  const {
    url, // String representing request URL
    headers, // An object mapping header titles to values
    referrer, // An optional string specify the referrer 
    method, // The HTTP method, will always be uppercase, default is `GET`
    body, // An optional async iterable of buffers for the request body
    signal // An optional AbortSignal that you might want to listen to for cancellation
  } = request

  return {
    status: 200, // Should specify the status code to send back
    headers: { // Optional object mapping response header titles to values
      "something": "whatever"
    },
    body: asyncIterator // Required async iterable for the response body, can be empty
  }
})

const response = await fetch('myscheme://whatever/foobar')
console.log(await response.text())
```

Routed example:

```JavaScript

import {makeRoutedFetch} from "make-fetch"

const {fetch, router} = makeRoutedFetch()

router.get('example://somehost/**', (request) => {
  return {
    body: "hello world",
    headers: {example: "Whatever"}
  }
})

// You can have wildcards in the protocol, hostname,
// or individual segments in the pathname
router.post('*://*/foo/*/bar/, () => {
  return {body: 'Goodbye world'}
})

// Match first handler
fetch('example://somehost/example/path/here')

// Match second handler
fetch('whatever://something/foo/whatever/bar/')

```

### API:

`makeFetch(async (Request) => ResponseOptions) => fetch()`

The main API is based on the handler which takes a standard [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) object, and must return options for constructing a response based on the [Response](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request) constructor.

Instead of having a separate parameter for the body and the response options, the fetch handler should return both in one object.

This will then return a standard [fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch) API which takes request info, and returns responses.

`makeRoutedFetch({onNotFound, onError}) => {router: Router, fetch}`

If you want to have an easier way of routing different methods/hostnames/paths, you can use a routed make-fetch which can make it easier to register handlers for different routes.
This will creat a Router, and a `fetch()` instance for that router.
Handlers you add on the router will be useful to match URLs+methods from the fetch request and will use the matched handler to generate the response.
You can optionally supply a `onNotFound` handler to be invoked if no other routes match.
You can optionally supply a `onError` handler to be invoked when an error is thrown from your handlers which will take the `Error` instance and the `Request` instance as arguments.
The default `onError` handler will print the stack trace to the body with a `500` status code.

`router.add(method, urlPattern, handler) => Router`

You can add routes for specific methods, and use URL patterns.
Then you can pass in the same basic handler as in makeFetch.
You can chain multiple add requests since the router returns itself when adding a route.

`router.get/head/put/post/delete(urlPattern, handler) => Router`

You can also use shorthands for methods with a similar API.

`router.any(urlPattern, handler)`

You can register handlers for any method.

For example `router.any('*://*/**', handler)` will register a handler that will be invoked on any method/protocol scheme/hostname/path.
