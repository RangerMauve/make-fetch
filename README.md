# make-fetch
Implement your own `fetch()` with node.js streams

## Usage

```
npm i --save make-fetch
```

```javascript
const makeFetch = require('make-fetch')
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
    statusCode: 200, // Should specify the status code to send back
    headers: { // Optional object mapping response header titles to values
      "something": "whatever"
    },
    data: asyncIterator // Required async iterable for the response body, can be empty
  }
})

const response = await fetch('myscheme://whatever/foobar')
console.log(await response.text())
```

## Gotchas

- The `response.body` is an Async Iterable of Buffer objects rather than a WHATWG ReadableStream
- Eventually ReadableStream will become asyn citerable so you'll be able to iterate either normally
