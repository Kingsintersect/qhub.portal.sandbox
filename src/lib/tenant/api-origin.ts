/**
 * Resolves which institution's API a request should go to.
 *
 * The backend identifies the institution from the Host header, so the API base
 * URL has to carry the tenant's own hostname rather than a single fixed origin.
 * Two deployment shapes are supported:
 *
 *   Production — web app and API sit behind the same host
 *     (unilag.qhub.ng/api/v1 proxied to Laravel). Same-origin, so a relative
 *     base is both correct and automatically tenant-scoped.
 *
 *   Local dev — same hostname, different ports (web :3030, API :8000).
 *     NEXT_PUBLIC_API_PORT bridges that gap while keeping the hostname, so
 *     unilag.qhub.localhost:3030 talks to unilag.qhub.localhost:8000.
 *
 * NEXT_PUBLIC_API_BASE_URL still works as an explicit override for a
 * single-tenant or pinned setup, and takes precedence over both.
 */

const API_PATH = "/api/v1"

/** Explicit override — a full origin, e.g. http://localhost:8000. */
const EXPLICIT_ORIGIN = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()

/** Dev-only: the port the API listens on, when it differs from the web app's. */
const API_PORT = process.env.NEXT_PUBLIC_API_PORT?.trim()

/**
 * @param host  Hostname (no port) to build the URL for. Required on the server,
 *              where there is no `window` to read it from — pass the value from
 *              the request's Host header.
 */
export function resolveApiBaseUrl(host?: string): string {
  if (EXPLICIT_ORIGIN) {
    return `${stripTrailingSlash(EXPLICIT_ORIGIN)}${API_PATH}`
  }

  const isBrowser = typeof window !== "undefined"
  const hostname = host ?? (isBrowser ? window.location.hostname : undefined)

  if (!hostname) {
    // Server-side with no host supplied. Returning a relative path here would
    // produce an unresolvable request rather than a wrong-tenant one, which is
    // the safer of the two failures.
    return API_PATH
  }

  const protocol = isBrowser ? window.location.protocol : "http:"

  if (API_PORT) {
    return `${protocol}//${hostname}:${API_PORT}${API_PATH}`
  }

  // Same-origin: relative, so the browser sends the tenant's own Host header.
  return isBrowser && !host ? API_PATH : `${protocol}//${hostname}${API_PATH}`
}

function stripTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value
}
