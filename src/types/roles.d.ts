// ──────────────────────────────────────────────
// Roles & Permissions Domain Types
// ──────────────────────────────────────────────

export interface Permission {
    id: number;
    resource: string;
    action: string;
    module: string;
    description: string | null;
    created_at: string;
}

export interface Role {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_default: boolean;
    created_at: string;
    permissions?: Permission[];
    users_count?: number;
}

export interface RolePermission {
    role_id: number;
    permission_id: number;
    created_at: string;
}

export interface UserRole {
    user_id: number;
    role_id: number;
    assigned_by: number | null;
    assigned_at: string;
    expires_at: string | null;
}

export interface UserWithRoles {
    id: number;
    matric_no: string | null;
    staff_id: string | null;
    email: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    department_id: number | null;
    faculty_id: number | null;
    level: string | null;
    is_active: boolean;
    roles: Role[];
}

// ── Form / Payload types ────────────────────

export type CreateRolePayload = {
    name: string;
    slug: string;
    description: string;
    is_default: boolean;
    permission_ids: number[];
};

export type UpdateRolePayload = Partial<CreateRolePayload>;

export type CreatePermissionPayload = {
    resource: string;
    action: string;
    module: string;
    description: string;
};

export type UpdatePermissionPayload = Partial<CreatePermissionPayload>;

export type AssignRolePayload = {
    user_id: number;
    role_id: number;
    expires_at?: string | null;
};

export type RevokeRolePayload = {
    user_id: number;
    role_id: number;
};

// ── Grouped permission view ──────────────────

export interface PermissionGroup {
    module: string;
    permissions: Permission[];
}
