import { NextResponse, type NextRequest } from "next/server"

/**
 * Splits traffic between the platform console and the institution portals by
 * host — the same split the API enforces server-side.
 *
 * The platform host serves institution management and nothing else; every
 * other host is an institution's own portal and must not expose the platform
 * surface at all. This is a UX/navigation guard only: the real enforcement is
 * the API's `platform` middleware, which 404s platform routes on a tenant host
 * regardless of what the browser managed to load.
 */

const PLATFORM_HOST = (
  process.env.NEXT_PUBLIC_PLATFORM_HOST ?? "platform.qhub.localhost"
)
  .trim()
  .toLowerCase()

const PLATFORM_PREFIX = "/platform"

export default function proxy(request: NextRequest) {
  const host = hostOf(request)
  const { pathname } = request.nextUrl
  const isPlatformHost = host === PLATFORM_HOST
  const isPlatformPath =
    pathname === PLATFORM_PREFIX || pathname.startsWith(`${PLATFORM_PREFIX}/`)

  if (isPlatformHost) {
    // Nothing but the console lives here — an institution portal route on the
    // platform host would render with no tenant behind it and every API call
    // would 404.
    if (!isPlatformPath) {
      const url = request.nextUrl.clone()
      url.pathname = PLATFORM_PREFIX
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  }

  // Tenant host: the console does not exist here. Rewriting to /404 rather
  // than redirecting keeps the URL as typed and reveals nothing about where
  // the console actually lives.
  if (isPlatformPath) {
    const url = request.nextUrl.clone()
    url.pathname = "/404"
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

/** Forwarded host wins — behind a proxy, `host` is the internal one. */
function hostOf(request: NextRequest): string {
  const raw =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? ""

  return raw.split(",")[0].trim().split(":")[0].toLowerCase()
}

export const config = {
  // Everything except Next internals, the auth API, and static assets. The
  // NextAuth routes are excluded because they are host-agnostic and the
  // platform console signs in through them too.
  matcher: ["/((?!_next/static|_next/image|api/auth|favicon.ico|.*\\..*).*)"],
}
