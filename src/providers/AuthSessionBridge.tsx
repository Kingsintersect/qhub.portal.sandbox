"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { UserRole } from "@/config/nav.config"
import { useAppStore } from "@/store"
import { resolvePermissionsByKeys } from "@/store/appStore"
import apiClient from "@/lib/clients/apiClient"
import {
  clearStoredAuthTokens,
  getStoredRefreshToken,
  storeAccessToken,
  storeRefreshToken,
} from "@/lib/auth/backendAuth"

export default function AuthSessionBridge({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status, update } = useSession()
  const { isAuthenticated, logout, setUser } = useAppStore()

  useEffect(() => {
    // Platform staff: store the token so apiClient can authenticate against
    // the platform API, but skip the tenant store entirely — role, permissions
    // and dashboard routing are institution concepts a platform account has
    // none of. Handled explicitly so this stays deliberate rather than
    // depending on GUEST/empty-permissions happening to be inert.
    if (status === "authenticated" && session?.user?.isPlatform) {
      if (session.user.accessToken) {
        storeAccessToken(session.user.accessToken)
      }
      if (session.user.refreshToken) {
        storeRefreshToken(session.user.refreshToken)
      }
      return
    }

    if (status === "authenticated" && session?.user?.role) {
      const role = session.user.role as UserRole
      const availableRoles = session.user.availableRoles?.length
        ? session.user.availableRoles
        : [role]
      const storedAccessToken =
        typeof window === "undefined"
          ? null
          : localStorage.getItem("access_token")
      const storedRefreshToken =
        typeof window === "undefined"
          ? null
          : localStorage.getItem("refresh_token")

      if (storedAccessToken) {
        apiClient.setAccessToken(storedAccessToken, "local")
      } else if (session.user.accessToken) {
        storeAccessToken(session.user.accessToken)
      }

      if (!storedRefreshToken && session.user.refreshToken) {
        storeRefreshToken(session.user.refreshToken)
      }

      setUser({
        id: session.user.id || `session-${session.user.email ?? "user"}`,
        name:
          session.user.name ||
          [session.user.firstName, session.user.lastName]
            .filter(Boolean)
            .join(" ")
            .trim() ||
          "Portal User",
        email: session.user.email ?? "",
        role,
        availableRoles,
        permissions: resolvePermissionsByKeys(session.user.permissions),
        avatar: session.user.avatar ?? undefined,
        firstName: session.user.firstName ?? undefined,
        lastName: session.user.lastName ?? undefined,
      })
      return
    }

    if (status === "unauthenticated" && isAuthenticated) {
      clearStoredAuthTokens()
      logout()
    }
  }, [isAuthenticated, logout, session, setUser, status])

  // new effect: apiClient -> session, whenever apiClient refreshes
  useEffect(() => {
    apiClient.setHooks({
      onTokenRefreshed: async (token) => {
        if (!token) return
        await update({
          accessToken: token,
          refreshToken: getStoredRefreshToken(),
        })
      },
    })
  }, [update])

  return <>{children}</>
}
