const test = require('tape')

const makeFetch = require('./')

test('Kitchen sink', async (t) => {
  try {
    const fetch = makeFetch(({ url }) => {
      return {
        statusCode: 200,
        headers: {
          url
        },
        data: intoAsyncIterable(url)
      }
    })

    const toFetch = 'example'

    const response = await fetch(toFetch)

    t.ok(response.ok, 'response was OK')

    const body = await response.text()

    t.equal(body, toFetch, 'got expected response body')

    t.equal(response.headers.get('url'), toFetch, 'got expected response headers')

    t.equal(response.statusText, 'OK', 'got expected status text')

    t.end()
  } catch (e) {
    t.error(e)
  }
})

async function * intoAsyncIterable (data) {
  yield data
}
