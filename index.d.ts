declare module 'make-fetch' {
  export interface NormalizedRequest {
    url: string
    headers: RawHeaders
    method: string
    body: AsyncIterableIterator<Uint8Array>
    referrer?: string

    // Hard to add types for. 😂
    signal?: any
  }

  export interface HandlerResponse {
    statusCode?: number
    statusText?: string
    headers?: RawHeaders
    data?: AsyncIterableIterator<Uint8Array | string>
  }

  export interface RawHeaders {
    [name: string]: string | undefined
  }

  // TODO: Support actual fetch Headers
  export interface Headers {
    append(name: string, value: string) : void
    delete(name: string) : void
    entries() : IterableIterator<[string, string]>
    get(name: string): string | undefined
    has(name: string) : boolean
    keys() : IterableIterator<string>
    set(name: string, value: string) : void
    values() : IterableIterator<string>
  }

  export interface Request {
    // This is kind of a pain to document
    session?: any
    signal?: any

    url?: string
    headers?: Headers | RawHeaders
    method?: string,
    body?: string | Uint8Array | AsyncIterableIterator<Uint8Array|string>,
    referrer?: string,
  }

  export interface Body {
   // TODO: Fill this in
  }

  export interface Response {
    url: string
    headers: Headers
    status: number
    statusText: string
    ok: boolean
    useFinalURL: true
    body: Body
    arrayBuffer() : Promise<ArrayBuffer>
    text(): Promise<string>
    json(): Promise<any>
  }

  export interface Fetch {
    (request: string | Request, info? : Request): Promise<Response>
  }

  export interface FetchHandler {
    (request: NormalizedRequest): Promise<HandlerResponse>
  }

  export default function makeFetch(handler: FetchHandler) : Fetch
}
