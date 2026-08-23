"use client"

import { useQuery } from "@tanstack/react-query"
import { rolesQueryOptions } from "@/services/rolesApi"
import { courseStructureQueryOptions } from "@/services/courseStructureApi"
import { useOperationsDashboardData } from "./useAdminDashboard"

// Manager (ADMIN role) shares the same operational data as the Admin
// (SUPER_ADMIN) dashboard, plus a real role-count specific to platform
// governance framing — see useAdminDashboard.ts for the shared composition.
export function usePlatformDashboardData() {
  const ops = useOperationsDashboardData()

  const roles = useQuery({
    ...rolesQueryOptions.list(),
    staleTime: 5 * 60 * 1000,
  })

  const faculties = useQuery({
    ...courseStructureQueryOptions.faculties.list(),
    staleTime: 5 * 60 * 1000,
  })

  return {
    ...ops,
    roleCount: roles.data?.length ?? null,
    facultyCount: faculties.data?.data?.length ?? null,
    isLoading: ops.isLoading || roles.isLoading || faculties.isLoading,
  }
}
