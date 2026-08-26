import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { UserRole } from "@/config/nav.config"
import { loginWithBackend } from "@/lib/auth/backendAuth"
import {
  loginWithPlatformBackend,
  PlatformLoginError,
} from "@/lib/auth/platformAuth"
import { resolveApiBaseUrl } from "@/lib/tenant/api-origin"

const normalizeRoles = (roles: string[] | undefined): UserRole[] => {
  if (!roles?.length) return []

  return roles
    .map((role) => role.trim().toUpperCase())
    .filter((role): role is UserRole =>
      (Object.values(UserRole) as string[]).includes(role)
    )
}

/**
 * Hostname (port stripped) from a NextAuth request's headers.
 *
 * `x-forwarded-host` wins when present: behind a proxy or load balancer the
 * `host` header is the internal one, and the institution's real subdomain is
 * the forwarded value.
 */
const hostFromHeaders = (
  headers: Record<string, unknown> | undefined
): string | null => {
  if (!headers) return null

  const raw =
    (headers["x-forwarded-host"] as string | undefined) ??
    (headers["host"] as string | undefined)

  if (!raw) return null

  return raw.split(",")[0].trim().split(":")[0].toLowerCase() || null
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const password = String(credentials?.password ?? "")
        const identifier = String(credentials?.identifier ?? "").trim()
        if (!identifier || !password) {
          return null
        }

        // Which institution is being signed in to. This runs on the server, so
        // the host has to come from the request rather than window.location —
        // the backend resolves the tenant from it, and getting it wrong would
        // mean authenticating against the wrong institution's user table.
        const host = hostFromHeaders(req?.headers)

        if (!host) {
          return null
        }

        try {
          const user = await loginWithBackend({
            identifier,
            password,
            apiBaseUrl: resolveApiBaseUrl(host),
          })
          //  console.log("user", user)
          //  const updatedUser = elevateToSuperAdmin(user)
          //  console.log(updatedUser)
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
            availableRoles: user.availableRoles,
            roles: user.roles,
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            permissions: user.permissions,
          }
        } catch {
          return null
        }
      },
    }),

    // Platform staff. A distinct provider rather than a branch inside the one
    // above: these accounts live in the central database, carry no roles or
    // permissions, and authenticate against a different API surface. Keeping
    // them separate means a tenant sign-in can never accidentally return a
    // platform account, or the reverse.
    CredentialsProvider({
      id: "platform-credentials",
      name: "Platform",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
        mfaCode: { label: "Authenticator code", type: "text" },
      },
      async authorize(credentials, req) {
        const password = String(credentials?.password ?? "")
        const identifier = String(credentials?.identifier ?? "").trim()
        const mfaCode = String(credentials?.mfaCode ?? "").trim()
        if (!identifier || !password) {
          return null
        }

        const host = hostFromHeaders(req?.headers)

        if (!host) {
          return null
        }

        try {
          const user = await loginWithPlatformBackend({
            identifier,
            password,
            mfaCode: mfaCode || undefined,
            apiBaseUrl: resolveApiBaseUrl(host),
          })

          return {
            id: user.id,
            name:
              [user.firstName, user.lastName].filter(Boolean).join(" ") ||
              user.username,
            email: user.email,
            username: user.username,
            // Platform accounts have no institution role. GUEST is the inert
            // value of the tenant-side enum; isPlatform is what actually
            // distinguishes them, and the proxy gates on that.
            role: UserRole.GUEST,
            availableRoles: [],
            roles: [],
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: null,
            // Carried through from the API so the console can hide what this
            // account cannot do. Hardcoding [] here left every platform
            // account looking unprivileged to its own UI.
            permissions: user.permissions,
            isPlatform: true,
          }
        } catch (error) {
          // Rethrown so the sign-in screen can tell the three refusals apart:
          // a code is owed, the account was invited but never set up, or the
          // credentials are simply wrong. next-auth surfaces the thrown
          // message as `result.error`, and returning null would flatten all
          // three into one unhelpful sentence.
          if (error instanceof PlatformLoginError) {
            throw new Error(error.reason)
          }

          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.availableRoles = user.availableRoles
        token.username = user.username
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.roles = normalizeRoles(user.roles ?? [user.role])
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.avatar = user.avatar
        token.permissions = user.permissions
        token.isPlatform = user.isPlatform ?? false
        return token
      }

      // pushed from client after apiClient silently refreshed
      if (trigger === "update" && session) {
        if (session.accessToken) token.accessToken = session.accessToken
        if (session.refreshToken) token.refreshToken = session.refreshToken
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string | undefined) ?? ""
        session.user.role =
          (token.role as UserRole | undefined) ?? UserRole.STUDENT
        session.user.availableRoles = (token.availableRoles as
          | UserRole[]
          | undefined) ?? [session.user.role]
        session.user.username = (token.username as string | undefined) ?? ""
        session.user.accessToken =
          (token.accessToken as string | undefined) ?? ""
        session.user.refreshToken =
          (token.refreshToken as string | undefined) ?? ""
        session.user.roles = (token.roles as UserRole[] | undefined)?.length
          ? (token.roles as UserRole[])
          : [session.user.role]
        session.user.firstName =
          (token.firstName as string | null | undefined) ?? null
        session.user.lastName =
          (token.lastName as string | null | undefined) ?? null
        session.user.avatar =
          (token.avatar as string | null | undefined) ?? null
        session.user.permissions =
          (token.permissions as string[] | undefined) ?? []
        session.user.isPlatform =
          (token.isPlatform as boolean | undefined) ?? false
      }

      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET ?? "qhub-portal-dev-secret-change-me",
}
