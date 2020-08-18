
const { Readable } = require('stream')
const test = require('tape')

const makeFetch = require('./')

test('Kitchen sink', async (t) => {
  try {
    const fetch = makeFetch(({ url }, sendResponse) => {
      sendResponse({
        statusCode: 200,
        headers: {
          url
        },
        data: intoStream(url)
      })
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

function intoStream (data) {
  return new Readable({
    read () {
      this.push(data)
      this.push(null)
    }
  })
}
