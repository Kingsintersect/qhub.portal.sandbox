"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  opsOverviewKeys,
  opsOverviewService,
} from "@/modules/platform-ops-overview/services/ops-overview.service"

function errorMessage(error: unknown, fallback: string): string {
  return (
    (error as { message?: string } | null)?.message ??
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ??
    fallback
  )
}

export function useIncidents(status = "open") {
  return useQuery({
    queryKey: opsOverviewKeys.incidents(status),
    queryFn: () => opsOverviewService.incidents(status),
  })
}

export function useUpgrades() {
  return useQuery({
    queryKey: opsOverviewKeys.upgrades(),
    queryFn: () => opsOverviewService.upgrades(),
  })
}

export function useAnomalies(includeAcknowledged: boolean) {
  return useQuery({
    queryKey: opsOverviewKeys.anomalies(includeAcknowledged),
    queryFn: () => opsOverviewService.anomalies(includeAcknowledged),
    placeholderData: (previous) => previous,
  })
}

export function useLogUpgrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: opsOverviewService.logUpgrade,
    onSuccess: () => {
      toast.success("Upgrade logged")
      void queryClient.invalidateQueries({ queryKey: opsOverviewKeys.all })
    },
    onError: (error) =>
      toast.error("Could not log that upgrade", {
        description: errorMessage(error, "Nothing was recorded."),
      }),
  })
}

export function useOpenIncident() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: opsOverviewService.openIncident,
    onSuccess: () => {
      // Says what actually happens next, rather than "created": affected
      // tenants see a banner, so this is not a private note.
      toast.success("Incident opened — affected institutions are notified")
      void queryClient.invalidateQueries({ queryKey: opsOverviewKeys.all })
    },
    onError: (error) =>
      toast.error("Could not open that incident", {
        description: errorMessage(error, "Nothing was recorded."),
      }),
  })
}

export function useAcknowledgeAnomaly() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => opsOverviewService.acknowledgeAnomaly(id),
    onSuccess: () => {
      // Said precisely, because the button does not mean "fixed".
      toast.success("Acknowledged — recorded as seen and judged expected.")
      void queryClient.invalidateQueries({ queryKey: opsOverviewKeys.all })
    },
    onError: (e) =>
      toast.error(errorMessage(e, "That anomaly could not be acknowledged.")),
  })
}

export function useDetectAnomalies() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => opsOverviewService.detectAnomalies(),
    onSuccess: () => {
      toast.success("Detection run.")
      void queryClient.invalidateQueries({ queryKey: opsOverviewKeys.all })
    },
    onError: (e) => toast.error(errorMessage(e, "Detection could not run.")),
  })
}
