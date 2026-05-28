'use client'

import { usePermissions, type PermissionCheck } from './usePermissions'

interface PermissionGateProps {
   require: PermissionCheck | PermissionCheck[]  // ← objects, never strings
   mode?: 'all' | 'any'
   fallback?: React.ReactNode
   children: React.ReactNode
}

export function PermissionGate({
   require,
   mode = 'all',
   fallback = null,
   children,
}: PermissionGateProps) {
   const { can } = usePermissions()
   const checks = Array.isArray(require) ? require : [require]
   const allowed = mode === 'any' ? checks.some(can) : checks.every(can)

   return allowed ? <>{children}</> : <>{fallback}</>
}
