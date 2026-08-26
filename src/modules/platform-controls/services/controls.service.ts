import apiClient from "@/lib/clients/apiClient"
import type {
  InstitutionFeature,
  MaintenanceNotice,
  UsageAnalytics,
} from "@/modules/platform-controls/types"

const AUTH = { access_token: true } as const

export const controlsService = {
  features: async (tenantId: number): Promise<InstitutionFeature[]> =>
    (
      await apiClient.get<{ data: InstitutionFeature[] }>(
        `/platform/tenants/${tenantId}/features`,
        AUTH
      )
    ).data,

  setFeature: (tenantId: number, key: string, enabled: boolean) =>
    apiClient.post<
      { data: { key: string; enabled: boolean } },
      { key: string; enabled: boolean }
    >(`/platform/tenants/${tenantId}/features`, { key, enabled }, AUTH),

  scheduleMaintenance: async (
    tenantId: number,
    payload: {
      message: string
      startsAt: string
      endsAt?: string | null
      openEnded?: boolean
    }
  ): Promise<MaintenanceNotice> =>
    (
      await apiClient.post<{ data: MaintenanceNotice }, typeof payload>(
        `/platform/tenants/${tenantId}/maintenance`,
        payload,
        AUTH
      )
    ).data,

  analytics: async (tenantId: number, days: number): Promise<UsageAnalytics> =>
    (
      await apiClient.get<{ data: UsageAnalytics }>(
        `/platform/tenants/${tenantId}/analytics`,
        { ...AUTH, params: { days } }
      )
    ).data,

  clearMaintenance: (tenantId: number) =>
    apiClient.delete<{ data: null }>(
      `/platform/tenants/${tenantId}/maintenance`,
      AUTH
    ),
}

export const controlKeys = {
  all: ["platform-controls"] as const,
  features: (tenantId: number) =>
    [...controlKeys.all, "features", tenantId] as const,
  analytics: (tenantId: number, days: number) =>
    [...controlKeys.all, "analytics", tenantId, days] as const,
}
