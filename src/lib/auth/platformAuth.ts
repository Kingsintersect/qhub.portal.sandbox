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
  /** Present with 202 when the password was right and the code is still owed. */
  mfaRequired?: boolean
  message?: string
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

/**
 * Why a sign-in did not produce a session.
 *
 * Three outcomes, deliberately distinguished, because the console says
 * something different for each and saying the wrong one wastes the person's
 * time. In particular an invited account that has never set a password is NOT
 * a wrong password — telling somebody to check their typing when the real
 * answer is "use the link in your invitation" sends them round in circles.
 */
export type PlatformLoginFailure =
  | "MFA_REQUIRED"
  | "PASSWORD_NOT_SET"
  | "ACCOUNT_INACTIVE"
  | "INVALID_CREDENTIALS"

export class PlatformLoginError extends Error {
  constructor(
    public readonly reason: PlatformLoginFailure,
    message: string
  ) {
    super(message)
    this.name = "PlatformLoginError"
  }
}

/**
 * The API answers a correct password on an MFA account with 202 and
 * `mfaRequired`, expecting the same credentials again with the code. Axios
 * treats 202 as success, so this is read off the body rather than caught.
 */
const isMfaChallenge = (response: PlatformLoginResponse): boolean =>
  response.mfaRequired === true

export const loginWithPlatformBackend = async (payload: {
  identifier: string
  password: string
  mfaCode?: string
  apiBaseUrl?: string
}): Promise<PlatformAuthUser> => {
  let response: PlatformLoginResponse

  try {
    response = await apiClient.post<PlatformLoginResponse>(
      "/platform/auth/login",
      {
        emailOrUsername: payload.identifier,
        password: payload.password,
        // Omitted on the first attempt. The API replies 202 asking for it.
        ...(payload.mfaCode ? { mfaCode: payload.mfaCode } : {}),
      },
      payload.apiBaseUrl ? { baseURL: payload.apiBaseUrl } : {}
    )
  } catch (error) {
    const status = (error as { status?: number } | null)?.status
    const message =
      (error as { message?: string } | null)?.message ?? "Sign-in failed."

    // Server-side only, and deliberately loud: every failure below collapses
    // into INVALID_CREDENTIALS for the browser, which is right for the user
    // and useless for diagnosing an outage. The real cause belongs in the
    // logs, where a wrong base URL or an unreachable API is distinguishable
    // from a genuinely wrong password.
    if (typeof window === "undefined") {
      console.error("[platform-login] failed", {
        baseUrl: payload.apiBaseUrl,
        status,
        message,
        code: (error as { code?: string } | null)?.code,
      })
    }

    if (status === 403) {
      // 403 covers two different refusals and the console must not merge
      // them: one is fixable by the person, the other is not.
      throw new PlatformLoginError(
        /invitation/i.test(message) ? "PASSWORD_NOT_SET" : "ACCOUNT_INACTIVE",
        message
      )
    }

    throw new PlatformLoginError("INVALID_CREDENTIALS", message)
  }

  if (isMfaChallenge(response)) {
    throw new PlatformLoginError(
      "MFA_REQUIRED",
      response.message ?? "Enter the six-digit code from your authenticator."
    )
  }

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

/**
 * Ask for a reset or invitation link.
 *
 * The API answers identically whether or not the address is registered, and
 * this screen must not undo that by behaving differently on failure — so the
 * caller reports "sent" either way.
 */
export const requestPlatformPasswordReset = async (
  email: string
): Promise<void> => {
  await apiClient.post("/platform/auth/forgot-password", { email })
}

/**
 * Spend a reset or invitation token and set the password.
 *
 * The token is what proves the person owns the address. An endpoint that set a
 * password from an email address alone would let anybody take over any
 * account, which is why the invitation card collects an address and sends a
 * link rather than setting the password there.
 */
export const setPlatformPassword = async (payload: {
  token: string
  password: string
  passwordConfirmation: string
}): Promise<void> => {
  await apiClient.post("/platform/auth/reset-password", {
    token: payload.token,
    password: payload.password,
    password_confirmation: payload.passwordConfirmation,
  })
}
