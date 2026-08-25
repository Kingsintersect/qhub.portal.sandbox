import apiClient from "@/lib/clients/apiClient"
import {
  clearStoredAuthTokens,
  getStoredRefreshToken,
  storeAccessToken,
  storeRefreshToken,
} from "@/lib/auth/backendAuth"

/**
 * Sign-in for platform staff, against the central database.
 *
 * Separate from backendAuth.ts because a platform account is not an
 * institution's user: it has no roles, no permissions, and no tenant. Its token
 * is signed under a different key and is rejected by every institution's API.
 */

export type PlatformAuthUser = {
  id: string
  email: string
  username: string
  firstName: string | null
  lastName: string | null
  accessToken: string
  refreshToken: string
  /** What this account may do. Drives what the console renders, never what it allows. */
  permissions: string[]
  roles: string[]
}

type PlatformLoginResponse = {
  accessToken?: string
  refreshToken?: string
  user?: {
    id: number | string
    email: string
    username: string
    firstName?: string | null
    lastName?: string | null
    permissions?: string[]
    roles?: string[]
  }
}

export const loginWithPlatformBackend = async (payload: {
  identifier: string
  password: string
  apiBaseUrl?: string
}): Promise<PlatformAuthUser> => {
  const response = await apiClient.post<PlatformLoginResponse>(
    "/platform/auth/login",
    {
      emailOrUsername: payload.identifier,
      password: payload.password,
    },
    payload.apiBaseUrl ? { baseURL: payload.apiBaseUrl } : {}
  )

  if (!response.user || !response.accessToken || !response.refreshToken) {
    throw new Error("Invalid authentication response from platform API.")
  }

  return {
    id: String(response.user.id),
    email: response.user.email,
    username: response.user.username,
    firstName: response.user.firstName ?? null,
    lastName: response.user.lastName ?? null,
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    permissions: response.user.permissions ?? [],
    roles: response.user.roles ?? [],
  }
}

/**
 * Refresh a platform session.
 *
 * Platform access tokens live 15 minutes, so without this the console breaks
 * silently a quarter of an hour after sign-in and cannot recover — every
 * request 401s with "Unauthenticated" and the operator has to sign out and back
 * in. The tenant refresh endpoint cannot serve this: /auth/refresh resolves
 * against a tenant database, and on the platform host no tenant is bound, so it
 * 500s.
 */
let platformRefreshInFlight: Promise<string | null> | null = null

export const refreshWithPlatformBackend = async (): Promise<string | null> => {
  // Single-flight. Refresh tokens are single-use — rotating one revokes it — so
  // two requests 401ing at the same moment would fire two refreshes, and the
  // second would present a token the first had just revoked. That is not
  // theoretical: it took out the institutions list while the dashboard beside
  // it loaded fine, because they raced.
  if (platformRefreshInFlight) {
    return platformRefreshInFlight
  }

  platformRefreshInFlight = performPlatformRefresh().finally(() => {
    platformRefreshInFlight = null
  })

  return platformRefreshInFlight
}

const performPlatformRefresh = async (): Promise<string | null> => {
  const refreshToken = getStoredRefreshToken()

  if (!refreshToken) {
    return null
  }

  try {
    const response = await apiClient.post<{
      accessToken?: string
      refreshToken?: string
    }>(
      "/platform/auth/refresh",
      { refreshToken },
      // Without this the 401 that triggered the refresh would trigger another
      // refresh, recursively.
      { skipAuthRefresh: true }
    )

    if (!response.accessToken) {
      clearStoredAuthTokens()
      return null
    }

    storeAccessToken(response.accessToken)
    storeRefreshToken(response.refreshToken ?? refreshToken)

    return response.accessToken
  } catch {
    clearStoredAuthTokens()
    return null
  }
}

/** True when this browser is on the platform console's host. */
export const isPlatformHost = (): boolean => {
  if (typeof window === "undefined") return false

  const platformHost =
    process.env.NEXT_PUBLIC_PLATFORM_HOST?.trim().toLowerCase()

  return (
    !!platformHost && window.location.hostname.toLowerCase() === platformHost
  )
}
