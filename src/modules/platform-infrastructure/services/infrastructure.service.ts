import apiClient from "@/lib/clients/apiClient"
import type { Infrastructure } from "@/modules/platform-infrastructure/types"

const AUTH = { access_token: true } as const

const base = (tenantId: number) =>
  `/platform/tenants/${tenantId}/infrastructure`

export const infrastructureService = {
  show: async (tenantId: number): Promise<Infrastructure> =>
    (await apiClient.get<{ data: Infrastructure }>(base(tenantId), AUTH)).data,

  enableWrites: async (tenantId: number) =>
    apiClient.post<{ data: Infrastructure["writes"] }, Record<string, never>>(
      `${base(tenantId)}/writes`,
      {},
      AUTH
    ),

  disableWrites: async (tenantId: number) =>
    apiClient.delete<void>(`${base(tenantId)}/writes`, AUTH),

  /** A TOTP or recovery code — the API accepts either. */
  enableComputeWrites: async (tenantId: number, code: string) =>
    apiClient.post<{ data: Infrastructure["compute"] }, { code: string }>(
      `${base(tenantId)}/compute/writes`,
      { code },
      AUTH
    ),

  disableComputeWrites: async (tenantId: number) =>
    apiClient.delete<void>(`${base(tenantId)}/compute/writes`, AUTH),

  migrate: async (tenantId: number) =>
    apiClient.post<{ data: unknown }, Record<string, never>>(
      `${base(tenantId)}/migrate`,
      {},
      AUTH
    ),

  backup: async (tenantId: number) =>
    apiClient.post<{ data: unknown }, Record<string, never>>(
      `${base(tenantId)}/backups`,
      {},
      AUTH
    ),

  rotate: async (tenantId: number) =>
    apiClient.post<{ data: unknown }, Record<string, never>>(
      `${base(tenantId)}/rotate`,
      {},
      AUTH
    ),

  /** Begin moving a school's files into object storage. */
  migrateStorage: async (tenantId: number) =>
    apiClient.post<{ data: unknown }, Record<string, never>>(
      `${base(tenantId)}/storage/migrate`,
      {},
      AUTH
    ),

  /** Ask again for a certificate after the school fixes their DNS. */
  retryDomain: async (tenantId: number) =>
    apiClient.post<{ data: unknown }, Record<string, never>>(
      `${base(tenantId)}/domain/retry`,
      {},
      AUTH
    ),

  setQuota: async (tenantId: number, bytes: number | null) =>
    apiClient.post<{ data: Infrastructure }, { bytes: number | null }>(
      `${base(tenantId)}/quota`,
      { bytes },
      AUTH
    ),
}

export const infrastructureKeys = {
  all: ["platform-infrastructure"] as const,
  tenant: (id: number) => [...infrastructureKeys.all, id] as const,
}
