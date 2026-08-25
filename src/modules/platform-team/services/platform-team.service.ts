import apiClient from "@/lib/clients/apiClient"
import type {
  CreatePlatformUserPayload,
  PermissionCatalog,
  PlatformAuditEntry,
  PlatformRole,
  PlatformUser,
} from "@/modules/platform-team/types"

const AUTH = { access_token: true } as const

export const platformTeamService = {
  listUsers: async (): Promise<PlatformUser[]> =>
    (await apiClient.get<{ data: PlatformUser[] }>("/platform/team", AUTH))
      .data,

  createUser: async (
    payload: CreatePlatformUserPayload
  ): Promise<PlatformUser> =>
    apiClient.post<PlatformUser, CreatePlatformUserPayload>(
      "/platform/team",
      payload,
      AUTH
    ),

  updateUser: async (
    id: number,
    payload: { isActive?: boolean; roleIds?: number[] }
  ): Promise<PlatformUser> =>
    apiClient.patch<PlatformUser, typeof payload>(
      `/platform/team/${id}`,
      payload,
      AUTH
    ),

  listRoles: async (): Promise<PlatformRole[]> =>
    (await apiClient.get<{ data: PlatformRole[] }>("/platform/roles", AUTH))
      .data,

  listPermissions: async (): Promise<PermissionCatalog> =>
    (
      await apiClient.get<{ data: PermissionCatalog }>(
        "/platform/permissions",
        AUTH
      )
    ).data,

  updateRolePermissions: async (
    roleId: number,
    permissionIds: number[]
  ): Promise<unknown> =>
    apiClient.put(
      `/platform/roles/${roleId}/permissions`,
      { permissionIds },
      AUTH
    ),

  auditLog: async (params: { tenantId?: number; action?: string } = {}) =>
    apiClient.get<{ data: PlatformAuditEntry[]; meta: { total: number } }>(
      "/platform/audit",
      { ...AUTH, params }
    ),
}

export const platformTeamKeys = {
  all: ["platform-team"] as const,
  users: () => [...platformTeamKeys.all, "users"] as const,
  roles: () => [...platformTeamKeys.all, "roles"] as const,
  permissions: () => [...platformTeamKeys.all, "permissions"] as const,
  audit: (params: object) =>
    [...platformTeamKeys.all, "audit", params] as const,
}
