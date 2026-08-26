"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  platformReportKeys,
  platformReportsService,
} from "@/modules/platform-reports/services/platform-reports.service"
import type { GenerateReportPayload } from "@/modules/platform-reports/types"

function errorMessage(error: unknown, fallback: string): string {
  return (
    (error as { message?: string } | null)?.message ??
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ??
    fallback
  )
}

export function useReportTemplates() {
  return useQuery({
    queryKey: platformReportKeys.templates(),
    queryFn: () => platformReportsService.templates(),
    staleTime: 10 * 60 * 1000,
  })
}

export function useReportRuns(status: string, page: number) {
  return useQuery({
    queryKey: platformReportKeys.runs(status, page),
    queryFn: () => platformReportsService.runs({ status, page }),
    placeholderData: (previous) => previous,
    /**
     * A run goes RUNNING → READY without the console asking again, so the list
     * polls while anything is still running. Stops once nothing is, rather
     * than polling an idle screen forever.
     */
    refetchInterval: (query) =>
      query.state.data?.data.some((r) => r.status === "RUNNING") ? 3000 : false,
  })
}

export function useReportSchedules() {
  return useQuery({
    queryKey: platformReportKeys.schedules(),
    queryFn: () => platformReportsService.schedules(),
  })
}

export function useGenerateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: GenerateReportPayload) =>
      platformReportsService.generate(payload),
    onSuccess: (run) => {
      toast.success(
        `${run.reference} queued. You will be told when it is ready.`
      )
      void queryClient.invalidateQueries({ queryKey: platformReportKeys.all })
    },
    onError: (e) =>
      toast.error(errorMessage(e, "That report could not be generated.")),
  })
}

export function useRerunReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => platformReportsService.rerun(id),
    onSuccess: (run) => {
      toast.success(
        `Re-running as ${run.reference} — the data will have moved on.`
      )
      void queryClient.invalidateQueries({ queryKey: platformReportKeys.all })
    },
    onError: (e) =>
      toast.error(errorMessage(e, "That re-run could not start.")),
  })
}

export function useDeleteReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => platformReportsService.destroy(id),
    onSuccess: () => {
      toast.success("Report deleted, along with its file.")
      void queryClient.invalidateQueries({ queryKey: platformReportKeys.all })
    },
    onError: (e) =>
      toast.error(errorMessage(e, "That report could not be deleted.")),
  })
}

export function useToggleSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { id: number; isActive: boolean }) =>
      platformReportsService.updateSchedule(input.id, {
        isActive: input.isActive,
      }),
    onSuccess: (_data, input) => {
      toast.success(input.isActive ? "Schedule resumed." : "Schedule paused.")
      void queryClient.invalidateQueries({
        queryKey: platformReportKeys.schedules(),
      })
    },
    onError: (e) =>
      toast.error(errorMessage(e, "That schedule could not change.")),
  })
}
