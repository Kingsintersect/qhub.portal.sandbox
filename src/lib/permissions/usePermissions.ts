"use client"

import { useAppStore } from "@/store"

// Matches your actual Permission object shape from types/roles
export interface PermissionCheck {
   resource: string
   action: string
}

export function usePermissions() {
   const user = useAppStore((s) => s.user)
   const role = useAppStore((s) => s.activeRole)
   const permissions = user?.permissions ?? []

   const can = ({ resource, action }: PermissionCheck): boolean =>
      permissions.some((p) => p.resource === resource && p.action === action)

   const canAll = (...checks: PermissionCheck[]): boolean =>
      checks.every(can)

   const canAny = (...checks: PermissionCheck[]): boolean =>
      checks.some(can)

   const canAccessModule = (module: string): boolean =>
      permissions.some((p) => p.module === module)

   return { can, canAll, canAny, canAccessModule, role, permissions }
}
