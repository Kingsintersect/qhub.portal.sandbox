import apiClient, {
  createApiMutationOptions,
  createApiQueryOptions,
} from "@/lib/clients/apiClient"
import type {
  Role,
  Permission,
  CreateRolePayload,
  UpdateRolePayload,
  CreatePermissionPayload,
  UpdatePermissionPayload,
  AssignRolesPayload,
  RevokeRolePayload,
  UserWithRoles,
  UserRoleSummary,
} from "@/types/roles"
import type { ApiListResponse, ApiSingleResponse } from "@/types/school"

const AUTH = { access_token: true } as const

// ── Roles ───────────────────────────────────

export const rolesApi = {
  list: async (): Promise<ApiListResponse<Role>> => {
    return apiClient.get<ApiListResponse<Role>>("/auth/roles", AUTH)
  },

  getById: async (id: number): Promise<ApiSingleResponse<Role>> => {
    return apiClient.get<ApiSingleResponse<Role>>(`/auth/roles/${id}`, AUTH)
  },

  create: async (
    payload: CreateRolePayload
  ): Promise<ApiSingleResponse<Role>> => {
    return apiClient.post<ApiSingleResponse<Role>>("/auth/roles", payload, AUTH)
  },

  update: async (
    id: number,
    payload: UpdateRolePayload
  ): Promise<ApiSingleResponse<Role>> => {
    const { permission_ids: _permission_ids, ...rolePayload } = payload
    return apiClient.patch<ApiSingleResponse<Role>>(
      `/auth/roles/${id}`,
      rolePayload,
      AUTH
    )
  },

  delete: async (id: number): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/auth/roles/${id}`, AUTH)
  },

  // MISSING_BACKEND_APIS.md §"POST /auth/roles/:id/duplicate", now shipped by
  // the backend team. Not yet in bruno. Same response shape as Create, name
  // suffixed "(Copy)".
  duplicate: async (id: number): Promise<ApiSingleResponse<Role>> => {
    return apiClient.post<ApiSingleResponse<Role>>(
      `/auth/roles/${id}/duplicate`,
      {},
      AUTH
    )
  },
}

// ── Permissions ─────────────────────────────

export const permissionsApi = {
  // GET /auth/permissions is paginated server-side (default page size well
  // below the real permission count — confirmed 89 permissions vs. a
  // hardcoded limit=15 here, which silently truncated the admin UI to
  // whatever the first page happened to contain). Page through every
  // result so callers get the full catalog; DataTable already handles
  // client-side pagination/search on top of the full array, matching every
  // other admin list in this app.
  list: async (): Promise<ApiListResponse<Permission>> => {
    const limit = 100
    let page = 1
    let all: Permission[] = []
    for (;;) {
      const res = await apiClient.get<{
        data: Permission[]
        meta: { total: number; page: number; limit: number }
      }>(`/auth/permissions?page=${page}&limit=${limit}`, AUTH)
      all = all.concat(res.data)
      const total = res.meta?.total ?? all.length
      if (all.length >= total || res.data.length === 0) break
      page += 1
    }
    return { data: all, total: all.length }
  },

  // bruno's Permissions collection documents list+create only (Show/Delete
  // weren't part of the original spec) — per MISSING_BACKEND_APIS.md, now
  // confirmed shipped by the backend team even though bruno isn't updated yet.
  getById: async (id: number): Promise<ApiSingleResponse<Permission>> => {
    return apiClient.get<ApiSingleResponse<Permission>>(
      `/auth/permissions/${id}`,
      AUTH
    )
  },

  create: async (
    payload: CreatePermissionPayload
  ): Promise<ApiSingleResponse<Permission>> => {
    return apiClient.post<ApiSingleResponse<Permission>>(
      "/auth/permissions",
      payload,
      AUTH
    )
  },

  update: async (
    id: number,
    payload: UpdatePermissionPayload
  ): Promise<ApiSingleResponse<Permission>> => {
    return apiClient.patch<ApiSingleResponse<Permission>>(
      `/auth/permissions/${id}`,
      payload,
      AUTH
    )
  },

  // See note on getById above — now shipped by the backend team.
  delete: async (id: number): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(
      `/auth/permissions/${id}`,
      AUTH
    )
  },
}

// ── Role-Permission Assignment ──────────────

export const rolePermissionsApi = {
  getForRole: async (roleId: number): Promise<ApiListResponse<Permission>> => {
    const response = await rolesApi.getById(roleId)
    const perms = response.data.permissions ?? []
    return { data: perms, total: perms.length }
  },

  sync: async (
    roleId: number,
    permissionIds: number[]
  ): Promise<ApiSingleResponse<Role>> => {
    return apiClient.post<ApiSingleResponse<Role>>(
      `/auth/roles/${roleId}/permissions`,
      { permissionIds },
      AUTH
    )
  },
}

// ── User-Role Assignment ────────────────────
// listForUser/assign/revoke are real, bruno-documented endpoints
// (Users - {List Roles, Assign Roles, Remove Role}.bru) with no prior
// frontend caller. getUsersWithRole is the reverse lookup ("which users
// hold this role") needed by RoleDetailView's Users tab — no such endpoint
// exists in bruno; built against the proposed contract in
// MISSING_BACKEND_APIS.md rather than left mocked.

export const userRolesApi = {
  listForUser: async (
    userId: number
  ): Promise<ApiListResponse<UserRoleSummary>> => {
    return apiClient.get<ApiListResponse<UserRoleSummary>>(
      `/auth/users/${userId}/roles`,
      AUTH
    )
  },

  assign: async (payload: AssignRolesPayload): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(
      `/auth/users/${payload.user_id}/roles`,
      { roleIds: payload.role_ids },
      AUTH
    )
  },

  revoke: async (payload: RevokeRolePayload): Promise<void> => {
    return apiClient.delete<void>(
      `/auth/users/${payload.user_id}/roles/${payload.role_id}`,
      AUTH
    )
  },

  getUsersWithRole: async (
    roleId: number
  ): Promise<ApiListResponse<UserWithRoles>> => {
    return apiClient.get<ApiListResponse<UserWithRoles>>(
      `/auth/roles/${roleId}/users`,
      AUTH
    )
  },
}

export const rolesKeys = {
  all: ["roles"] as const,
  list: () => [...rolesKeys.all, "list"] as const,
  detail: (roleId: number) => [...rolesKeys.all, "detail", roleId] as const,
  permissions: (roleId: number) =>
    [...rolesKeys.all, "permissions", roleId] as const,
  users: (roleId: number) => [...rolesKeys.all, "users", roleId] as const,
}

export const permissionsKeys = {
  all: ["permissions"] as const,
  list: () => [...permissionsKeys.all, "list"] as const,
  detail: (permissionId: number) =>
    [...permissionsKeys.all, "detail", permissionId] as const,
}

export const userRolesKeys = {
  all: ["user-roles"] as const,
  forUser: (userId: number) =>
    [...userRolesKeys.all, "for-user", userId] as const,
}

export const rolesQueryOptions = {
  list: () =>
    createApiQueryOptions({
      queryKey: rolesKeys.list(),
      queryFn: async () => {
        const response = await rolesApi.list()
        return response.data
      },
    }),

  detail: (roleId: number) =>
    createApiQueryOptions({
      queryKey: rolesKeys.detail(roleId),
      queryFn: async () => {
        const response = await rolesApi.getById(roleId)
        return response.data
      },
    }),

  permissions: (roleId: number) =>
    createApiQueryOptions({
      queryKey: rolesKeys.permissions(roleId),
      queryFn: async () => {
        const response = await rolePermissionsApi.getForRole(roleId)
        return response.data
      },
    }),

  users: (roleId: number) =>
    createApiQueryOptions({
      queryKey: rolesKeys.users(roleId),
      queryFn: async () => {
        const response = await userRolesApi.getUsersWithRole(roleId)
        return response.data
      },
    }),
}

export const permissionsQueryOptions = {
  list: () =>
    createApiQueryOptions({
      queryKey: permissionsKeys.list(),
      queryFn: async () => {
        const response = await permissionsApi.list()
        return response.data
      },
    }),

  detail: (permissionId: number) =>
    createApiQueryOptions({
      queryKey: permissionsKeys.detail(permissionId),
      queryFn: async () => {
        const response = await permissionsApi.getById(permissionId)
        return response.data
      },
    }),
}

export const userRolesQueryOptions = {
  forUser: (userId: number) =>
    createApiQueryOptions({
      queryKey: userRolesKeys.forUser(userId),
      queryFn: async () => {
        const response = await userRolesApi.listForUser(userId)
        return response.data
      },
    }),
}

export const rolesMutationOptions = {
  create: () =>
    createApiMutationOptions<ApiSingleResponse<Role>, CreateRolePayload>({
      mutationKey: [...rolesKeys.all, "create"],
      mutationFn: rolesApi.create,
    }),

  update: () =>
    createApiMutationOptions<
      ApiSingleResponse<Role>,
      { id: number; payload: UpdateRolePayload }
    >({
      mutationKey: [...rolesKeys.all, "update"],
      mutationFn: ({ id, payload }) => rolesApi.update(id, payload),
    }),

  delete: () =>
    createApiMutationOptions<{ message: string }, number>({
      mutationKey: [...rolesKeys.all, "delete"],
      mutationFn: rolesApi.delete,
    }),

  duplicate: () =>
    createApiMutationOptions<ApiSingleResponse<Role>, number>({
      mutationKey: [...rolesKeys.all, "duplicate"],
      mutationFn: rolesApi.duplicate,
    }),

  syncPermissions: () =>
    createApiMutationOptions<
      ApiSingleResponse<Role>,
      { roleId: number; permissionIds: number[] }
    >({
      mutationKey: [...rolesKeys.all, "sync-permissions"],
      mutationFn: ({ roleId, permissionIds }) =>
        rolePermissionsApi.sync(roleId, permissionIds),
    }),
}

export const permissionsMutationOptions = {
  create: () =>
    createApiMutationOptions<
      ApiSingleResponse<Permission>,
      CreatePermissionPayload
    >({
      mutationKey: [...permissionsKeys.all, "create"],
      mutationFn: permissionsApi.create,
    }),

  update: () =>
    createApiMutationOptions<
      ApiSingleResponse<Permission>,
      { id: number; payload: UpdatePermissionPayload }
    >({
      mutationKey: [...permissionsKeys.all, "update"],
      mutationFn: ({ id, payload }) => permissionsApi.update(id, payload),
    }),

  delete: () =>
    createApiMutationOptions<{ message: string }, number>({
      mutationKey: [...permissionsKeys.all, "delete"],
      mutationFn: permissionsApi.delete,
    }),
}

export const userRolesMutationOptions = {
  assign: () =>
    createApiMutationOptions<{ message: string }, AssignRolesPayload>({
      mutationKey: [...userRolesKeys.all, "assign"],
      mutationFn: userRolesApi.assign,
    }),

  revoke: () =>
    createApiMutationOptions<void, RevokeRolePayload>({
      mutationKey: [...userRolesKeys.all, "revoke"],
      mutationFn: userRolesApi.revoke,
    }),
}
