"use client"

import { useQuery } from "@tanstack/react-query"

import apiClient from "@/lib/clients/apiClient"

/**
 * The numbers on the navigation badges.
 *
 * One request for all of them — they are on screen in every module, and
 * fetching them per-module would be seven round trips per page load to render
 * eight small numbers.
 */
export type NavCounts = {
  institutions: number
  operations: number
  tickets: number
  announcements: number
  billing: number
  tasks: number
  reports: number
  team: number
}

export function useNavCounts(enabled: boolean) {
  return useQuery({
    queryKey: ["platform", "nav-counts"],
    queryFn: async () =>
      (
        await apiClient.get<{ data: NavCounts }>("/platform/nav-counts", {
          access_token: true,
        })
      ).data,
    enabled,
    // Same cadence as the bell. These are attention counts; stale ones send
    // people to a screen that no longer needs them.
    refetchInterval: 15_000,
    staleTime: 10_000,
  })
}
