import apiClient from "@/lib/clients/apiClient"
import type {
  Incident,
  Upgrade,
  UsageAnomaly,
} from "@/modules/platform-ops-overview/types"

const AUTH = { access_token: true } as const

export const opsOverviewKeys = {
  all: ["platform", "ops"] as const,
  incidents: (status: string) =>
    [...opsOverviewKeys.all, "incidents", status] as const,
  upgrades: () => [...opsOverviewKeys.all, "upgrades"] as const,
  anomalies: (includeAcknowledged: boolean) =>
    [...opsOverviewKeys.all, "anomalies", includeAcknowledged] as const,
}

export const opsOverviewService = {
  incidents: async (
    status = "open"
  ): Promise<{ data: Incident[]; openCount: number }> => {
    const res = await apiClient.get<{
      data: Incident[]
      meta: { openCount: number }
    }>(`/platform/incidents?status=${status}`, AUTH)

    return { data: res.data, openCount: res.meta.openCount }
  },

  upgrades: async (): Promise<Upgrade[]> =>
    (await apiClient.get<{ data: Upgrade[] }>("/platform/upgrades", AUTH)).data,

  anomalies: async (includeAcknowledged: boolean): Promise<UsageAnomaly[]> =>
    (
      await apiClient.get<{ data: UsageAnomaly[] }>(
        `/platform/anomalies${includeAcknowledged ? "?includeAcknowledged=1" : ""}`,
        AUTH
      )
    ).data,

  logUpgrade: async (payload: {
    title: string
    component: string
    version?: string | null
    rolloutScope?: string
    status?: string
    scheduledFor?: string | null
  }) =>
    (
      await apiClient.post<{ data: unknown }, typeof payload>(
        "/platform/upgrades",
        payload,
        { access_token: true }
      )
    ).data,

  openIncident: async (payload: {
    title: string
    detail?: string | null
    severity: string
    isPlatformWide?: boolean
    tenantIds?: number[]
  }) =>
    (
      await apiClient.post<{ data: unknown }, typeof payload>(
        "/platform/incidents",
        payload,
        { access_token: true }
      )
    ).data,

  acknowledgeAnomaly: async (id: number): Promise<void> => {
    await apiClient.post(`/platform/anomalies/${id}/acknowledge`, {}, AUTH)
  },

  /** Run detection now rather than waiting for the hourly job. */
  detectAnomalies: async (): Promise<unknown> =>
    apiClient.post(
      "/platform/anomalies/detect",
      {},
      { ...AUTH, timeout: 60_000 }
    ),
}
