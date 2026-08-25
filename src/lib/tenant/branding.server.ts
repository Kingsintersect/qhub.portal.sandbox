import { headers } from "next/headers"

import { resolveApiBaseUrl } from "@/lib/tenant/api-origin"
import type { TenantBranding } from "@/lib/tenant/types"

/**
 * Loads the current institution's branding on the server.
 *
 * Server-side on purpose: the sign-in page has to render the right
 * institution's name before any session exists, and fetching it in the browser
 * would flash the wrong (or no) identity first.
 *
 * Uses plain fetch rather than apiClient — that client is built around browser
 * token state and interceptors, none of which apply to an unauthenticated
 * server-side read.
 */
export async function getTenantBranding(): Promise<TenantBranding | null> {
  const headerList = await headers()
  const raw = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? ""
  const host = raw.split(",")[0].trim().split(":")[0].toLowerCase()

  if (!host) return null

  try {
    const response = await fetch(`${resolveApiBaseUrl(host)}/tenant/public`, {
      headers: { Accept: "application/json" },
      // Branding changes rarely but must not be shared between institutions —
      // Next keys the cache by URL, and the URL carries the host, so each
      // institution gets its own entry.
      next: { revalidate: 60 },
    })

    if (!response.ok) return null

    return (await response.json()) as TenantBranding
  } catch {
    // The platform host has no institution, and an unreachable API should not
    // take the whole page down — callers fall back to neutral defaults.
    return null
  }
}
