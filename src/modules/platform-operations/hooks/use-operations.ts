"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { observabilityKeys } from "@/modules/platform-observability/services/observability.service"
import {
  operationsKeys,
  operationsService,
} from "@/modules/platform-operations/services/operations.service"

function errorMessage(error: unknown, fallback: string): string {
  const response = (error as { response?: { data?: { message?: string } } })
    ?.response
  return response?.data?.message ?? fallback
}

export function useTenantDirectory(
  tenantId: number,
  params: { kind: "lecturers" | "students"; search?: string }
) {
  return useQuery({
    queryKey: operationsKeys.directory(tenantId, params),
    queryFn: () => operationsService.directory(tenantId, params),
    enabled: Number.isFinite(tenantId) && tenantId > 0,
  })
}

export function usePreviewCourseImport(tenantId: number) {
  return useMutation({
    mutationFn: (file: File) =>
      operationsService.previewCourseImport(tenantId, file),
    onError: (error) =>
      toast.error("Could not read that file", {
        description: errorMessage(error, "Check the format and try again."),
      }),
  })
}

export function useImportCourses(tenantId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => operationsService.importCourses(tenantId, file),
    onSuccess: (result) => {
      toast.success("Courses imported", {
        description: `${result.created} created, ${result.updated} updated, ${result.skipped} skipped.`,
      })
      // The institution's course count just changed, so its profile figures
      // are stale.
      queryClient.invalidateQueries({ queryKey: observabilityKeys.all })
    },
    onError: (error) =>
      toast.error("Import failed", {
        description: errorMessage(error, "Nothing was written."),
      }),
  })
}
