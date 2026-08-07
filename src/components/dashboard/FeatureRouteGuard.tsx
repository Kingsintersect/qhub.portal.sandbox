"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { roleDashboardPath } from "@/config/nav.config"
import { canAccessPath } from "@/lib/feature-flags/featureAccess"
import { useFeatureFlags } from "@/hooks/useFeatureFlags"
import { useAppStore } from "@/store"

export default function FeatureRouteGuard({
  children,
  instanceId = "default",
}: {
  children: React.ReactNode
  instanceId?: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAppStore()
  const { data, isLoading } = useFeatureFlags(instanceId)

  const allowed = canAccessPath(pathname, data?.flags)

  useEffect(() => {
    if (isLoading || !user || allowed) return
    router.replace(roleDashboardPath[user.role])
  }, [allowed, isLoading, router, user])

  if (!isLoading && !allowed) {
    return null
  }

  return <>{children}</>
}
