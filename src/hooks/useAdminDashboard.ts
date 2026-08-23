"use client"

import { useQuery } from "@tanstack/react-query"
import { usersApi, usersKeys } from "@/services/usersApi"
import { courseStructureQueryOptions } from "@/services/courseStructureApi"
import {
  applicationReviewApi,
  applicationReviewKeys,
} from "@/services/applicationReviewApi"
import { useCollectionsSummary } from "@/modules/fee-management/hooks/use-fee-reports"
import { useAssessmentSyncStatus } from "@/modules/moodle-sync/hooks/use-sync-assessments"

// Composes several already-real endpoints into the small set of live numbers
// the Admin/Manager landing dashboards show — see
// sandbox/MISSING_BACKEND_APIS.md §2.15 note on RoleDashboard for context.
// No single "dashboard summary" endpoint exists (or is needed) for this; each
// of these is a real, independently-useful query elsewhere in the app.
export function useOperationsDashboardData() {
  const stats = useQuery({
    queryKey: usersKeys.stats(),
    queryFn: () => usersApi.getStats(),
    staleTime: 60 * 1000,
  })

  const departments = useQuery({
    ...courseStructureQueryOptions.departments.list(),
    staleTime: 5 * 60 * 1000,
  })

  const pendingApplications = useQuery({
    queryKey: applicationReviewKeys.list({ status: "pending" }),
    queryFn: () => applicationReviewApi.list({ status: "pending" }),
    staleTime: 60 * 1000,
  })

  const collections = useCollectionsSummary()
  const assessmentSync = useAssessmentSyncStatus()

  const totalStudents = stats.data?.data?.total_students ?? null
  const totalTutors = stats.data?.data?.total_tutors ?? null
  const activeUsers = stats.data?.data?.active_users ?? null
  const departmentCount = departments.data?.data?.length ?? null
  const pendingApplicationCount = pendingApplications.data?.meta?.total ?? null
  const totalOutstanding =
    collections.data?.totals?.totalOutstanding != null
      ? Number(collections.data.totals.totalOutstanding)
      : null
  const totalInvoiced =
    collections.data?.totals?.totalInvoiced != null
      ? Number(collections.data.totals.totalInvoiced)
      : null
  const totalPaid =
    collections.data?.totals?.totalPaid != null
      ? Number(collections.data.totals.totalPaid)
      : null
  const collectionRate =
    totalInvoiced && totalInvoiced > 0 && totalPaid != null
      ? Math.round((totalPaid / totalInvoiced) * 100)
      : null
  const unsyncedAssessments =
    assessmentSync.data?.summary?.byStatus?.PENDING != null &&
    assessmentSync.data?.summary?.byStatus?.FAILED != null
      ? assessmentSync.data.summary.byStatus.PENDING +
        assessmentSync.data.summary.byStatus.FAILED
      : null

  return {
    totalStudents,
    totalTutors,
    activeUsers,
    departmentCount,
    pendingApplicationCount,
    totalOutstanding,
    collectionRate,
    unsyncedAssessments,
    isLoading:
      stats.isLoading ||
      departments.isLoading ||
      pendingApplications.isLoading ||
      collections.isLoading ||
      assessmentSync.isLoading,
  }
}
