"use client"

import { useQuery } from "@tanstack/react-query"

import apiClient from "@/lib/clients/apiClient"

export type ProvisioningStep = {
  key: string
  label: string
  done: boolean
}

export type ProvisioningProgress = {
  status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED"
  /** Who is running it, and where it is going. Both drawn as columns. */
  owner: string | null
  environment: string | null
  startedAt: string | null
  completed: number
  total: number
  percent: number
  steps: ProvisioningStep[]
  /** The step it was attempting when it died. Null unless it failed. */
  failedAt: string | null
  error: string | null
  finishedAt: string | null
}

/**
 * How far an onboarding has got.
 *
 * Polls every two seconds while the build is still going and stops the moment
 * it finishes — a completed build that keeps asking is noise on a server that
 * has other work. Two seconds because the whole thing takes about nine on the
 * shared server, and a bar that only moves twice is not a bar.
 */
export function useProvisioningProgress(tenantId: number) {
  return useQuery({
    queryKey: ["platform", "provisioning", tenantId],
    queryFn: async () =>
      (
        await apiClient.get<{ data: ProvisioningProgress }>(
          `/platform/tenants/${tenantId}/provisioning`,
          { access_token: true }
        )
      ).data,
    refetchInterval: (query) => {
      const status = query.state.data?.status

      return status === "QUEUED" || status === "RUNNING" ? 2000 : false
    },
  })
}
