"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import apiClient from "@/lib/clients/apiClient"
import { getStoredRefreshToken } from "@/lib/auth/backendAuth"

export function SessionSync() {
  const { update } = useSession()

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

  return null
}
