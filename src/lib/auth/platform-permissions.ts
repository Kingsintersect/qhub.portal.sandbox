"use client"

import { useSession } from "next-auth/react"

/**
 * What the signed-in platform account may do.
 *
 * Used only to decide what the console renders. Every one of these is enforced
 * independently by the API — hiding a button is a courtesy, not a control, and
 * treating it as one would be the classic mistake.
 */
export function usePlatformPermissions(): {
  can: (permission: string) => boolean
  permissions: string[]
} {
  const { data: session } = useSession()
  const permissions = (session?.user?.permissions as string[] | undefined) ?? []

  return {
    permissions,
    can: (permission: string) => permissions.includes(permission),
  }
}
