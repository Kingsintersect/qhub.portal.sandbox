"use client"

import { useQuery } from "@tanstack/react-query"

import {
  observabilityKeys,
  observabilityService,
} from "@/modules/platform-observability/services/observability.service"

export function useEstateOverview() {
  return useQuery({
    queryKey: observabilityKeys.overview(),
    queryFn: () => observabilityService.overview(),
    // The rollup is refreshed every fifteen minutes; polling faster would only
    // re-read the same capture.
    refetchInterval: 60_000,
  })
}

export function useInstitutionObservability(id: number, days = 30) {
  return useQuery({
    queryKey: observabilityKeys.institution(id, days),
    queryFn: () => observabilityService.institution(id, days),
    enabled: Number.isFinite(id) && id > 0,
  })
}

export function useInstitutionActivity(id: number) {
  return useQuery({
    queryKey: observabilityKeys.activity(id),
    queryFn: () => observabilityService.activity(id),
    enabled: Number.isFinite(id) && id > 0,
  })
}

/**
 * The estate trend, polled.
 *
 * The console is a live operations tool, so this refreshes on its own rather
 * than waiting for a reload — the collector runs every fifteen minutes and a
 * chart that silently goes stale is worse than one that says it is loading.
 */
export function useEstateTrends(days = 30) {
  return useQuery({
    queryKey: observabilityKeys.trends(days),
    queryFn: () => observabilityService.trends(days),
    refetchInterval: 60_000,
    placeholderData: (previous) => previous,
  })
}
