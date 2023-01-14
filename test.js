import test from 'tape'

import { makeFetch, makeRoutedFetch } from './index.js'

test('Basic makeFetch test', async (t) => {
  const fetch = makeFetch(({ url }) => {
    return {
      status: 200,
      statusText: 'OK',
      headers: {
        url
      },
      body: intoAsyncIterable(url)
    }
  })

  const toFetch = 'example://hostname/pathname'

  const response = await fetch(toFetch)

  t.ok(response.ok, 'response was OK')

  const body = await response.text()

  t.equal(body, toFetch, 'got expected response body')

  t.equal(response.headers.get('url'), toFetch, 'got expected response headers')

  t.equal(response.statusText, 'OK', 'got expected status text')

  t.end()
})

test('Basic router tests', async (t) => {
  const { fetch, router } = makeRoutedFetch()

  router.get('ipfs://localhost/ipfs/**', ({ url }) => {
    return { body: url }
  })

  const toFetch = 'ipfs://localhost/ipfs/cidwould/gohere'
  const response = await fetch(toFetch)

  t.ok(response.ok, 'response was OK')

  const body = await response.text()

  t.equal(body, toFetch, 'got expected body')
})

async function * intoAsyncIterable (data) {
  yield data
}
