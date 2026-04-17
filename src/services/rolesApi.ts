import { createApiMutationOptions, createApiQueryOptions } from "@/lib/clients/apiClient";
import type {
   Role,
   Permission,
   CreateRolePayload,
   UpdateRolePayload,
   CreatePermissionPayload,
   UpdatePermissionPayload,
   AssignRolePayload,
   RevokeRolePayload,
   UserWithRoles,
} from "@/types/roles";
import type { ApiListResponse, ApiSingleResponse } from "@/types/school";

// ── helpers ─────────────────────────────────
let _nextId = 100;
const nid = () => ++_nextId;
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

// ── seed: permissions ───────────────────────

const permissions: Permission[] = [
   { id: 1, resource: "results", action: "view.own", module: "academics", description: "View own results", created_at: "2024-09-01T00:00:00Z" },
   { id: 2, resource: "results", action: "upload", module: "academics", description: "Upload course results", created_at: "2024-09-01T00:00:00Z" },
   { id: 3, resource: "courses", action: "register", module: "academics", description: "Register courses for a semester", created_at: "2024-09-01T00:00:00Z" },
   { id: 4, resource: "students", action: "view.class", module: "students", description: "View class list for a course", created_at: "2024-09-01T00:00:00Z" },
   { id: 5, resource: "courses", action: "approve", module: "academics", description: "Approve course registration", created_at: "2024-09-01T00:00:00Z" },
   { id: 6, resource: "fees", action: "pay", module: "finance", description: "Pay school fees online", created_at: "2024-09-01T00:00:00Z" },
   { id: 7, resource: "fees", action: "verify", module: "finance", description: "Verify fee payment receipts", created_at: "2024-09-01T00:00:00Z" },
   { id: 8, resource: "users", action: "manage", module: "admin", description: "Manage platform users", created_at: "2024-09-01T00:00:00Z" },
   { id: 9, resource: "results", action: "approve", module: "academics", description: "Approve uploaded results", created_at: "2024-09-01T00:00:00Z" },
   { id: 10, resource: "departments", action: "manage", module: "admin", description: "Manage departments", created_at: "2024-09-01T00:00:00Z" },
   { id: 11, resource: "fees", action: "configure", module: "finance", description: "Configure fee structures", created_at: "2024-09-01T00:00:00Z" },
   { id: 12, resource: "students", action: "admit", module: "students", description: "Process student admissions", created_at: "2024-09-01T00:00:00Z" },
];

// ── seed: roles ─────────────────────────────

const roles: Role[] = [
   {
      id: 1, name: "Student", slug: "student",
      description: "Regular undergraduate/postgraduate student",
      is_default: true, created_at: "2024-09-01T00:00:00Z",
      permissions: permissions.filter((p) => [1, 3, 6].includes(p.id)),
      users_count: 1240,
   },
   {
      id: 2, name: "Lecturer", slug: "lecturer",
      description: "Course lecturer and academic advisor",
      is_default: false, created_at: "2024-09-01T00:00:00Z",
      permissions: permissions.filter((p) => [1, 2, 4].includes(p.id)),
      users_count: 86,
   },
   {
      id: 3, name: "Head of Department", slug: "hod",
      description: "Head of Department — inherits lecturer privileges plus approval rights",
      is_default: false, created_at: "2024-09-01T00:00:00Z",
      permissions: permissions.filter((p) => [1, 2, 4, 5, 9].includes(p.id)),
      users_count: 12,
   },
   {
      id: 4, name: "Dean", slug: "dean",
      description: "Faculty Dean with oversight across departments",
      is_default: false, created_at: "2024-09-01T00:00:00Z",
      permissions: permissions.filter((p) => [1, 2, 4, 5, 9].includes(p.id)),
      users_count: 5,
   },
   {
      id: 5, name: "Bursary", slug: "bursary",
      description: "Finance/Bursary department staff",
      is_default: false, created_at: "2024-09-01T00:00:00Z",
      permissions: permissions.filter((p) => [6, 7, 11].includes(p.id)),
      users_count: 8,
   },
   {
      id: 6, name: "Super Admin", slug: "super-admin",
      description: "ICT/System Administrator with full platform access",
      is_default: false, created_at: "2024-09-01T00:00:00Z",
      permissions: [...permissions],
      users_count: 3,
   },
   {
      id: 7, name: "Staff", slug: "staff",
      description: "General non-academic staff member",
      is_default: false, created_at: "2024-09-01T00:00:00Z",
      permissions: permissions.filter((p) => [4, 8].includes(p.id)),
      users_count: 15,
   },
   {
      id: 8, name: "Registrar", slug: "registrar",
      description: "Academic registry staff with student records access",
      is_default: false, created_at: "2024-09-01T00:00:00Z",
      permissions: permissions.filter((p) => [4, 8, 10, 12].includes(p.id)),
      users_count: 4,
   },
   {
      id: 9, name: "Admin", slug: "admin",
      description: "Administrative manager with user and department oversight",
      is_default: false, created_at: "2024-09-01T00:00:00Z",
      permissions: permissions.filter((p) => [1, 2, 4, 5, 8, 9, 10].includes(p.id)),
      users_count: 6,
   },
];

// ── seed: users for role lookup ─────────────

const usersPool: UserWithRoles[] = [
   { id: 1, matric_no: "CSC/2021/001", staff_id: null, email: "john.doe@student.edu.ng", first_name: "John", last_name: "Doe", phone: "08012345678", department_id: 1, faculty_id: 1, level: "300", is_active: true, roles: [] },
   { id: 2, matric_no: "CSC/2021/045", staff_id: null, email: "amina.bello@student.edu.ng", first_name: "Amina", last_name: "Bello", phone: "08098765432", department_id: 1, faculty_id: 1, level: "200", is_active: true, roles: [] },
   { id: 3, matric_no: null, staff_id: "STF/2019/012", email: "dr.okafor@staff.edu.ng", first_name: "Chinedu", last_name: "Okafor", phone: "08033445566", department_id: 1, faculty_id: 1, level: null, is_active: true, roles: [] },
   { id: 4, matric_no: null, staff_id: "STF/2015/003", email: "prof.adeyemi@staff.edu.ng", first_name: "Funke", last_name: "Adeyemi", phone: "08077889900", department_id: 2, faculty_id: 1, level: null, is_active: true, roles: [] },
   { id: 5, matric_no: null, staff_id: "STF/2010/001", email: "admin@edu.ng", first_name: "Ibrahim", last_name: "Musa", phone: "08011223344", department_id: null, faculty_id: null, level: null, is_active: true, roles: [] },
   { id: 6, matric_no: "EEE/2022/018", staff_id: null, email: "grace.eze@student.edu.ng", first_name: "Grace", last_name: "Eze", phone: "09012345678", department_id: 3, faculty_id: 2, level: "100", is_active: false, roles: [] },
];

// map role-id → user-ids for dummy lookups
const roleUserMap: Record<number, number[]> = {
   1: [1, 2, 6],
   2: [3, 4],
   3: [4],
   4: [4],
   5: [5],
   6: [5],
};

// ── Roles ───────────────────────────────────

export const rolesApi = {
   list: async (): Promise<ApiListResponse<Role>> => {
      await delay();
      return { data: [...roles], total: roles.length };
      // return apiClient.get<ApiListResponse<Role>>("/api/v1/roles", AUTH);
   },

   getById: async (id: number): Promise<ApiSingleResponse<Role>> => {
      await delay();
      const role = roles.find((r) => r.id === id);
      if (!role) throw new Error("Role not found");
      return { data: { ...role }, message: "OK" };
      // return apiClient.get<ApiSingleResponse<Role>>(`/api/v1/roles/${id}`, AUTH);
   },

   create: async (payload: CreateRolePayload): Promise<ApiSingleResponse<Role>> => {
      await delay();
      const newRole: Role = {
         id: nid(),
         name: payload.name,
         slug: payload.slug,
         description: payload.description || null,
         is_default: payload.is_default,
         created_at: new Date().toISOString(),
         permissions: permissions.filter((p) => payload.permission_ids.includes(p.id)),
         users_count: 0,
      };
      roles.push(newRole);
      return { data: newRole, message: "Created" };
      // return apiClient.post<ApiSingleResponse<Role>>("/api/v1/roles", payload, AUTH);
   },

   update: async (id: number, payload: UpdateRolePayload): Promise<ApiSingleResponse<Role>> => {
      await delay();
      const idx = roles.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error("Role not found");
      const updated: Role = {
         ...roles[idx],
         ...payload,
         description: payload.description ?? roles[idx].description,
         permissions: payload.permission_ids
            ? permissions.filter((p) => payload.permission_ids!.includes(p.id))
            : roles[idx].permissions,
      };
      roles[idx] = updated;
      return { data: { ...updated }, message: "Updated" };
      // return apiClient.put<ApiSingleResponse<Role>>(`/api/v1/roles/${id}`, payload, AUTH);
   },

   delete: async (id: number): Promise<{ message: string }> => {
      await delay();
      const idx = roles.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error("Role not found");
      roles.splice(idx, 1);
      return { message: "Deleted" };
      // return apiClient.delete<{ message: string }>(`/api/v1/roles/${id}`, AUTH);
   },

   duplicate: async (id: number): Promise<ApiSingleResponse<Role>> => {
      await delay();
      const source = roles.find((r) => r.id === id);
      if (!source) throw new Error("Role not found");
      const copy: Role = {
         ...source,
         id: nid(),
         name: `${source.name} (Copy)`,
         slug: `${source.slug}-copy`,
         is_default: false,
         created_at: new Date().toISOString(),
         users_count: 0,
         permissions: source.permissions ? [...source.permissions] : [],
      };
      roles.push(copy);
      return { data: copy, message: "Duplicated" };
      // return apiClient.post<ApiSingleResponse<Role>>(`/api/v1/roles/${id}/duplicate`, {}, AUTH);
   },
};

// ── Permissions ─────────────────────────────

export const permissionsApi = {
   list: async (): Promise<ApiListResponse<Permission>> => {
      await delay();
      return { data: [...permissions], total: permissions.length };
      // return apiClient.get<ApiListResponse<Permission>>("/api/v1/permissions", AUTH);
   },

   getById: async (id: number): Promise<ApiSingleResponse<Permission>> => {
      await delay();
      const perm = permissions.find((p) => p.id === id);
      if (!perm) throw new Error("Permission not found");
      return { data: { ...perm }, message: "OK" };
      // return apiClient.get<ApiSingleResponse<Permission>>(`/api/v1/permissions/${id}`, AUTH);
   },

   create: async (payload: CreatePermissionPayload): Promise<ApiSingleResponse<Permission>> => {
      await delay();
      const newPerm: Permission = {
         id: nid(),
         resource: payload.resource,
         action: payload.action,
         module: payload.module,
         description: payload.description || null,
         created_at: new Date().toISOString(),
      };
      permissions.push(newPerm);
      return { data: newPerm, message: "Created" };
      // return apiClient.post<ApiSingleResponse<Permission>>("/api/v1/permissions", payload, AUTH);
   },

   update: async (id: number, payload: UpdatePermissionPayload): Promise<ApiSingleResponse<Permission>> => {
      await delay();
      const idx = permissions.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error("Permission not found");
      const updated: Permission = {
         ...permissions[idx],
         ...payload,
         description: payload.description ?? permissions[idx].description,
      };
      permissions[idx] = updated;
      return { data: { ...updated }, message: "Updated" };
      // return apiClient.put<ApiSingleResponse<Permission>>(`/api/v1/permissions/${id}`, payload, AUTH);
   },

   delete: async (id: number): Promise<{ message: string }> => {
      await delay();
      const idx = permissions.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error("Permission not found");
      permissions.splice(idx, 1);
      // Also remove from any roles that had it
      roles.forEach((r) => {
         if (r.permissions) {
            r.permissions = r.permissions.filter((p) => p.id !== id);
         }
      });
      return { message: "Deleted" };
      // return apiClient.delete<{ message: string }>(`/api/v1/permissions/${id}`, AUTH);
   },
};

// ── Role-Permission Assignment ──────────────

export const rolePermissionsApi = {
   getForRole: async (roleId: number): Promise<ApiListResponse<Permission>> => {
      await delay();
      const role = roles.find((r) => r.id === roleId);
      if (!role) throw new Error("Role not found");
      const perms = role.permissions ?? [];
      return { data: [...perms], total: perms.length };
      // return apiClient.get<ApiListResponse<Permission>>(`/api/v1/roles/${roleId}/permissions`, AUTH);
   },

   sync: async (roleId: number, permissionIds: number[]): Promise<ApiSingleResponse<Role>> => {
      await delay();
      const idx = roles.findIndex((r) => r.id === roleId);
      if (idx === -1) throw new Error("Role not found");
      roles[idx] = {
         ...roles[idx],
         permissions: permissions.filter((p) => permissionIds.includes(p.id)),
      };
      return { data: { ...roles[idx] }, message: "Synced" };
      // return apiClient.put<ApiSingleResponse<Role>>(
      //     `/api/v1/roles/${roleId}/permissions`,
      //     { permission_ids: permissionIds },
      //     AUTH
      // );
   },
};

// ── User-Role Assignment ────────────────────

export const userRolesApi = {
   getUsersWithRole: async (roleId: number): Promise<ApiListResponse<UserWithRoles>> => {
      await delay();
      const userIds = roleUserMap[roleId] ?? [];
      const matchedUsers = usersPool
         .filter((u) => userIds.includes(u.id))
         .map((u) => ({ ...u, roles: roles.filter((r) => r.id === roleId) }));
      return { data: matchedUsers, total: matchedUsers.length };
      // return apiClient.get<ApiListResponse<UserWithRoles>>(`/api/v1/roles/${roleId}/users`, AUTH);
   },

   assign: async (payload: AssignRolePayload): Promise<{ message: string }> => {
      await delay();
      if (!roleUserMap[payload.role_id]) roleUserMap[payload.role_id] = [];
      if (!roleUserMap[payload.role_id].includes(payload.user_id)) {
         roleUserMap[payload.role_id].push(payload.user_id);
      }
      return { message: "Role assigned" };
      // return apiClient.post<{ message: string }>("/api/v1/user-roles", payload, AUTH);
   },

   revoke: async (payload: RevokeRolePayload): Promise<{ message: string }> => {
      await delay();
      if (roleUserMap[payload.role_id]) {
         roleUserMap[payload.role_id] = roleUserMap[payload.role_id].filter(
            (id) => id !== payload.user_id
         );
      }
      return { message: "Role revoked" };
      // return apiClient.delete<{ message: string }>(
      //     `/api/v1/user-roles/${payload.user_id}/${payload.role_id}`,
      //     AUTH
      // );
   },
};

export const rolesKeys = {
   all: ["roles"] as const,
   list: () => [...rolesKeys.all, "list"] as const,
   detail: (roleId: number) => [...rolesKeys.all, "detail", roleId] as const,
   permissions: (roleId: number) => [...rolesKeys.all, "permissions", roleId] as const,
   users: (roleId: number) => [...rolesKeys.all, "users", roleId] as const,
};

export const permissionsKeys = {
   all: ["permissions"] as const,
   list: () => [...permissionsKeys.all, "list"] as const,
   detail: (permissionId: number) =>
      [...permissionsKeys.all, "detail", permissionId] as const,
};

export const rolesQueryOptions = {
   list: () =>
      createApiQueryOptions({
         queryKey: rolesKeys.list(),
         queryFn: async () => {
            const response = await rolesApi.list();
            return response.data;
         },
      }),

   detail: (roleId: number) =>
      createApiQueryOptions({
         queryKey: rolesKeys.detail(roleId),
         queryFn: async () => {
            const response = await rolesApi.getById(roleId);
            return response.data;
         },
      }),

   permissions: (roleId: number) =>
      createApiQueryOptions({
         queryKey: rolesKeys.permissions(roleId),
         queryFn: async () => {
            const response = await rolePermissionsApi.getForRole(roleId);
            return response.data;
         },
      }),

   users: (roleId: number) =>
      createApiQueryOptions({
         queryKey: rolesKeys.users(roleId),
         queryFn: async () => {
            const response = await userRolesApi.getUsersWithRole(roleId);
            return response.data;
         },
      }),
};

export const permissionsQueryOptions = {
   list: () =>
      createApiQueryOptions({
         queryKey: permissionsKeys.list(),
         queryFn: async () => {
            const response = await permissionsApi.list();
            return response.data;
         },
      }),

   detail: (permissionId: number) =>
      createApiQueryOptions({
         queryKey: permissionsKeys.detail(permissionId),
         queryFn: async () => {
            const response = await permissionsApi.getById(permissionId);
            return response.data;
         },
      }),
};

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
};

export const permissionsMutationOptions = {
   create: () =>
      createApiMutationOptions<ApiSingleResponse<Permission>, CreatePermissionPayload>({
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
};
