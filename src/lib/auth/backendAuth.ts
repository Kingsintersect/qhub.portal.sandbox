import { UserRole } from "@/config/nav.config"
import apiClient from "@/lib/clients/apiClient"

const REFRESH_TOKEN_KEY = "refresh_token"

type BackendRoleValue = string | null | undefined

export type BackendAuthTokens = {
  accessToken?: string | null
  access_token?: string | null
  refreshToken?: string | null
  refresh_token?: string | null
}

export type BackendAuthUser = {
  id: string | number
  email?: string | null
  username?: string | null
  name?: string | null
  firstName?: string | null
  lastName?: string | null
  role?: BackendRoleValue
  roles?: BackendRoleValue[]
  permissions?: string[]
  avatar?: string | null
}

export type BackendAuthResponse = BackendAuthTokens & {
  user?: BackendAuthUser
  message?: string
}

export type BackendLoginPayload = {
  identifier: string
  password: string
}

export type BackendRegisterPayload = {
  email: string
  username: string
  password: string
}

export type BackendRefreshResponse = BackendAuthTokens & {
  message?: string
}

export type NormalizedBackendAuthUser = {
  id: string
  email: string
  username: string
  name: string
  firstName: string | null
  lastName: string | null
  role: UserRole
  availableRoles: UserRole[]
  roles: UserRole[]
  permissions: string[]
  avatar: string | null
}

const normalizeRole = (value: BackendRoleValue): UserRole | null => {
  if (!value) return null

  const normalized = value.trim().toUpperCase()
  return (Object.values(UserRole) as string[]).includes(normalized)
    ? (normalized as UserRole)
    : null
}

const normalizeRoleList = (
  values: BackendRoleValue[] | undefined
): UserRole[] => {
  if (!values?.length) return []

  return values
    .map((value) => normalizeRole(value))
    .filter((value): value is UserRole => Boolean(value))
}

const pickToken = (payload: BackendAuthTokens): string | null => {
  if (typeof payload.accessToken === "string" && payload.accessToken)
    return payload.accessToken
  if (typeof payload.access_token === "string" && payload.access_token)
    return payload.access_token
  return null
}

const pickRefreshToken = (payload: BackendAuthTokens): string | null => {
  if (typeof payload.refreshToken === "string" && payload.refreshToken)
    return payload.refreshToken
  if (typeof payload.refresh_token === "string" && payload.refresh_token)
    return payload.refresh_token
  return null
}

export const getStoredRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null

  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  } catch {
    return null
  }
}

export const storeRefreshToken = (token: string | null): void => {
  if (typeof window === "undefined") return

  try {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token)
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    }
  } catch {
    // Ignore storage failures.
  }
}

export const storeAccessToken = (token: string | null): void => {
  apiClient.setAccessToken(token, "local")
}

export const storeAuthTokens = (payload: BackendAuthTokens): void => {
  const accessToken = pickToken(payload)
  const refreshToken = pickRefreshToken(payload)

  storeAccessToken(accessToken)
  storeRefreshToken(refreshToken)
}

export const clearStoredAuthTokens = (): void => {
  apiClient.clearAccessToken()

  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  } catch {
    // Ignore storage failures.
  }
}

export const normalizeBackendAuthUser = (
  payload: BackendAuthResponse
): NormalizedBackendAuthUser | null => {
  const user = payload.user
  if (!user) return null

  const roles = normalizeRoleList(user.roles)
  const primaryRole = normalizeRole(user.role) ?? roles[0] ?? UserRole.STUDENT
  const availableRoles = roles.length > 0 ? roles : [primaryRole]
  const email = String(user.email ?? "").trim()
  const username = String(user.username ?? "").trim()
  const firstName = user.firstName?.trim() ?? null
  const lastName = user.lastName?.trim() ?? null
  const name =
    user.name?.trim() ||
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    username ||
    email ||
    "Portal User"

  return {
    id: String(user.id),
    email,
    username,
    name,
    firstName,
    lastName,
    role: primaryRole,
    availableRoles,
    roles: roles.length > 0 ? roles : [primaryRole],
    permissions: user.permissions ?? [],
    avatar: user.avatar ?? null,
  }
}

export const loginWithBackend = async (
  payload: BackendLoginPayload
): Promise<
  NormalizedBackendAuthUser & { accessToken: string; refreshToken: string }
> => {
  const response = await apiClient.post<BackendAuthResponse>("/auth/login", {
    emailOrUsername: payload.identifier,
    password: payload.password,
  })

  const normalizedUser = normalizeBackendAuthUser(response)
  const accessToken = pickToken(response)
  const refreshToken = pickRefreshToken(response)

  if (!normalizedUser || !accessToken || !refreshToken) {
    throw new Error("Invalid authentication response from backend.")
  }

  return {
    ...normalizedUser,
    accessToken,
    refreshToken,
  }
}

export const registerWithBackend = async (
  payload: BackendRegisterPayload
): Promise<BackendAuthResponse> => {
  return apiClient.post<BackendAuthResponse>("/auth/register", payload)
}

const refreshWithBackend = async (): Promise<string | null> => {
  const refreshToken = getStoredRefreshToken()
  if (!refreshToken) return null

  try {
    const response = await apiClient.post<BackendRefreshResponse>(
      "/auth/refresh",
      { refreshToken },
      { skipAuthRefresh: true }
    )

    const nextAccessToken = pickToken(response)
    const nextRefreshToken = pickRefreshToken(response) ?? refreshToken

    if (!nextAccessToken) {
      clearStoredAuthTokens()
      return null
    }

    storeAccessToken(nextAccessToken)
    storeRefreshToken(nextRefreshToken)

    return nextAccessToken
  } catch {
    clearStoredAuthTokens()
    return null
  }
}

apiClient.setRefreshHandler(async () => refreshWithBackend())
