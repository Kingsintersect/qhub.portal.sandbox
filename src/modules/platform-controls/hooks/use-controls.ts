"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { institutionKeys } from "@/modules/institutions/hooks/query-keys"
import {
  controlKeys,
  controlsService,
} from "@/modules/platform-controls/services/controls.service"

function errorMessage(error: unknown, fallback: string): string {
  const response = (error as { response?: { data?: { message?: string } } })
    ?.response
  return response?.data?.message ?? fallback
}

export function useInstitutionFeatures(tenantId: number) {
  return useQuery({
    queryKey: controlKeys.features(tenantId),
    queryFn: () => controlsService.features(tenantId),
    enabled: Number.isFinite(tenantId) && tenantId > 0,
  })
}

export function useSetFeature(tenantId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
      controlsService.setFeature(tenantId, key, enabled),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: controlKeys.features(tenantId),
      }),
    onError: (error) =>
      // The API refuses changes that would break the dependency graph, and its
      // refusal names what to do first — that message is the useful one.
      toast.error("Could not change that feature", {
        description: errorMessage(error, "Try again."),
      }),
  })
}

export function useScheduleMaintenance(tenantId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: {
      message: string
      startsAt: string
      endsAt?: string | null
      openEnded?: boolean
    }) => controlsService.scheduleMaintenance(tenantId, payload),
    onSuccess: () => {
      toast.success("Maintenance scheduled")
      queryClient.invalidateQueries({ queryKey: institutionKeys.all })
    },
    onError: (error) =>
      toast.error("Could not schedule that", {
        description: errorMessage(error, "Try again."),
      }),
  })
}

export function useClearMaintenance(tenantId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => controlsService.clearMaintenance(tenantId),
    onSuccess: () => {
      toast.success("Maintenance cleared", {
        description: "The portal is serving traffic again.",
      })
      queryClient.invalidateQueries({ queryKey: institutionKeys.all })
    },
    onError: (error) =>
      toast.error("Could not clear that", {
        description: errorMessage(error, "Try again."),
      }),
  })
}
