// lib/permissions/roles.ts

export const ROLES = ['SUPER_ADMIN', 'MANAGER', 'TUTOR', 'STUDENT'] as const
export type Role = typeof ROLES[number]

export type Permission =
   | 'user-management:view'
   | 'user-management:create'
   | 'user-management:delete'      // super_admin only
   | 'user-management:export'      // super_admin only
   | 'students:manage'
   | 'tutors:manage'
   | 'staff:manage'

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
   SUPER_ADMIN: [
      'user-management:view',
      'user-management:create',
      'user-management:delete',
      'user-management:export',
      'students:manage',
      'tutors:manage',
      'staff:manage',
   ],
   MANAGER: [
      'user-management:view',
      'user-management:create',   // can create but not delete
      'students:manage',
      'tutors:manage',
      // staff:manage NOT included
   ],
   TUTOR: [],
   STUDENT: [],
}