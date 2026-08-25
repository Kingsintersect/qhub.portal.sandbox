import apiClient from "@/lib/clients/apiClient"
import type {
  ActivityEntry,
  EstateOverview,
  InstitutionObservability,
} from "@/modules/platform-observability/types"

const AUTH = { access_token: true } as const

export const observabilityService = {
  overview: async (): Promise<EstateOverview> =>
    (await apiClient.get<{ data: EstateOverview }>("/platform/overview", AUTH))
      .data,

  institution: async (
    id: number,
    days = 30
  ): Promise<InstitutionObservability> =>
    (
      await apiClient.get<{ data: InstitutionObservability }>(
        `/platform/tenants/${id}/observability`,
        { ...AUTH, params: { days } }
      )
    ).data,

  activity: async (id: number, limit = 25): Promise<ActivityEntry[]> =>
    (
      await apiClient.get<{ data: ActivityEntry[] }>(
        `/platform/tenants/${id}/activity`,
        { ...AUTH, params: { limit } }
      )
    ).data,
}

export const observabilityKeys = {
  all: ["platform-observability"] as const,
  overview: () => [...observabilityKeys.all, "overview"] as const,
  institution: (id: number, days: number) =>
    [...observabilityKeys.all, "institution", id, days] as const,
  activity: (id: number) => [...observabilityKeys.all, "activity", id] as const,
}
