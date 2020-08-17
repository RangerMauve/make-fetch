# make-fetch
Implement your own `fetch()` with node.js streams

## Usage

```
npm i --save make-fetch
```

```js
const makeFetch = require('make-fetch')
const fetch = makeFetch((request, sendResponse) => {
  const {
    url, // String representing request URL
    headers, // An object mapping header titles to values
    referrer, // An optional string specify the referrer 
    method, // The HTTP method, will always be uppercase, default is GET
    body // An optional readable stream with the request body
  } = request

  sendResponse({
    statusCode: 200, // Should specify the status code to send back
    headers: { // Optional object mapping response header titles to values
      "something": "whatever"
    },
    data: readableStream // Required readable stream for the response body, can be empty
  })
})

const response = await fetch('myscheme://whatever/foobar')
console.log(await response.text())
```
