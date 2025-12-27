/**
 * @param {Handler} handler
 * @param {object} [options]
 * @param {typeof globalThis.Request} [options.Request]
 * @param {typeof globalThis.Response} [options.Response]
 * @returns {typeof fetch}
 */
export function makeFetch(handler: Handler, { Request, Response }?: {
    Request?: typeof import("undici-types").Request | undefined;
    Response?: typeof import("undici-types").Response | undefined;
}): (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
/**
 *
 * @param {object} [options]
 * @param {Handler} [options.onNotFound]
 * @param {ErrorHandler} [options.onError]
 * @returns
 */
export function makeRoutedFetch({ onNotFound, onError }?: {
    onNotFound?: Handler | undefined;
    onError?: ErrorHandler | undefined;
}): {
    fetch: (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
    router: Router;
};
export function DEFAULT_NOT_FOUND(): {
    status: number;
    statusText: string;
};
export function DEFAULT_ON_ERROR(error: Error, request: Request): ResponseLike;
export const WILDCARD: "*";
export class Router {
    routes: Route[];
    /**
     *
     * @param {string} url
     * @param {Handler} handler
     * @returns {Router}
     */
    get(url: string, handler: Handler): Router;
    /**
     *
     * @param {string} url
     * @param {Handler} handler
     * @returns {Router}
     */
    head(url: string, handler: Handler): Router;
    /**
     *
     * @param {string} url
     * @param {Handler} handler
     * @returns {Router}
     */
    post(url: string, handler: Handler): Router;
    /**
     *
     * @param {string} url
     * @param {Handler} handler
     * @returns {Router}
     */
    put(url: string, handler: Handler): Router;
    /**
     *
     * @param {string} url
     * @param {Handler} handler
     * @returns {Router}
     */
    delete(url: string, handler: Handler): Router;
    /**
     *
     * @param {string} url
     * @param {Handler} handler
     * @returns {Router}
     */
    patch(url: string, handler: Handler): Router;
    /**
     *
     * @param {string} url
     * @param {Handler} handler
     * @returns {Router}
     */
    any(url: string, handler: Handler): Router;
    /**
     *
     * @param {string} method
     * @param {string} url
     * @param {Handler} handler
     * @returns {Router}
     */
    add(method: string, url: string, handler: Handler): Router;
    /**
     *
     * @param {Request} request
     * @returns {Route?}
     */
    route(request: Request): Route | null;
}
export type Body = ConstructorParameters<typeof globalThis.Response>[0] | AsyncIterable<string>;
export type ResponseLike = Response | (ResponseInit & {
    body?: Body;
});
export type Handler = (request: Request) => ResponseLike | Promise<ResponseLike>;
export type ErrorHandler = (error: Error, request: Request) => ResponseLike;
export type Route = {
    protocol: string;
    method: string;
    hostname: string;
    segments: string[];
    handler: Handler;
};
export type MatchProperty = "pathname" | "hostname" | "protocol" | "method";
