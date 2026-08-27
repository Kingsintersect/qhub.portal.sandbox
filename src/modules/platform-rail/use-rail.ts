"use client"

import { useQuery } from "@tanstack/react-query"

import apiClient from "@/lib/clients/apiClient"

export type RailData = {
  tickets: {
    open: number
    openedToday: number
    breaching: number
    p1: number
    p2: number
    awaitingTenant: number
    resolvedToday: number
  }
  newestTenants: Array<{
    id: number
    name: string
    slug: string
    logoUrl: string | null
    onboardedAt: string | null
  }>
  load: {
    /** Sign-ins in the last 24h. NOT concurrency — nothing measures that. */
    signIns24h: number
    activity24h: number
    queueDepth: number
    failedJobs: number
    bars: Array<{ day: string; value: number }>
  }
}

/**
 * The right rail, polled.
 *
 * One request for all three panels — the rail is on every screen, so three
 * separate calls would be three round trips on every navigation.
 */
export function useRail(days: number, enabled: boolean) {
  return useQuery({
    queryKey: ["platform", "rail", days],
    queryFn: async () =>
      (
        await apiClient.get<{ data: RailData }>(`/platform/rail?days=${days}`, {
          access_token: true,
        })
      ).data,
    enabled,
    refetchInterval: 30_000,
    placeholderData: (previous) => previous,
  })
}
