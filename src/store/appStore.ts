"use client"

import { useSyncExternalStore } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { UserRole, roleDashboardPath } from "@/config/nav.config"
import type { Permission } from "@/types/roles"

export interface AppUser {
  id: string
  name: string
  email: string
  role: UserRole
  availableRoles: UserRole[]
  permissions: Permission[]
  firstName?: string
  lastName?: string
  department?: string
  faculty?: string
  matricNo?: string
  staffId?: string
  level?: string
  avatar?: string
}

export interface AppRoleDefinition {
  role: UserRole
  label: string
  description: string
  dashboardPath: string
  permissions: Permission[]
  profile: AppUser
}

const ts = "2024-09-01T00:00:00Z"

const permission = (
  id: number,
  resource: string,
  action: string,
  module: string,
  description: string
): Permission => ({
  id,
  resource,
  action,
  module,
  description,
  created_at: ts,
})

const allPermissions: Permission[] = [
  // ========== ACADEMICS ==========
  permission(1, "results", "view.own", "academics", "View own results"),
  permission(2, "results", "view.all", "academics", "View all results"),
  permission(
    3,
    "results",
    "manage",
    "academics",
    "Create, edit, upload, approve results"
  ),
  permission(
    4,
    "results",
    "publish",
    "academics",
    "Publish results to students"
  ),
  permission(5, "results", "export", "academics", "Export results reports"),
  permission(6, "results", "analyze", "academics", "View grade analytics"),

  permission(7, "courses", "register", "academics", "Register for courses"),
  permission(
    8,
    "courses",
    "approve",
    "academics",
    "Approve course registration"
  ),

  // ========== USER MANAGEMENT ==========
  permission(9, "users", "manage", "admin", "Manage platform users"),
  permission(10, "departments", "manage", "admin", "Manage departments"),

  permission(11, "students", "view", "user-management", "View students"),
  permission(12, "students", "manage", "user-management", "Manage students"),
  permission(13, "students", "admit", "user-management", "Admit students"),

  permission(14, "tutors", "view", "user-management", "View tutors"),
  permission(15, "tutors", "manage", "user-management", "Manage tutors"),

  permission(16, "staff", "view", "user-management", "View staff"),
  permission(17, "staff", "manage", "user-management", "Manage staff"),

  // ========== FINANCE ==========
  // Student payments
  permission(18, "fees", "pay", "finance", "Pay school fees"),
  permission(
    19,
    "fees",
    "view.own",
    "finance",
    "View own fee schedule and transactions"
  ),

  // Fee management (Admin/Bursary)
  permission(
    20,
    "fees",
    "view",
    "finance",
    "View all fee structures and transactions"
  ),
  permission(
    21,
    "fees",
    "manage",
    "finance",
    "Manage freshers fees, tuition fees, other fees"
  ),
  permission(
    22,
    "fees",
    "configure",
    "finance",
    "Configure fee structures and generate accounts"
  ),
  permission(
    23,
    "fees",
    "verify",
    "finance",
    "Verify fee payments and approve waivers"
  ),

  // Financial reporting
  permission(
    24,
    "finance",
    "view.dashboard",
    "finance",
    "View financial dashboard and analytics"
  ),
  permission(
    25,
    "finance",
    "view.transactions",
    "finance",
    "View all student transactions"
  ),
  permission(
    26,
    "finance",
    "export",
    "finance",
    "Export financial reports and invoices"
  ),

  permission(
    27,
    "academics",
    "configure",
    "academics",
    "Configure academic sessions and semesters"
  ),
  permission(
    28,
    "admissions",
    "manage",
    "admissions",
    "Manage admission cycles and entry requirements"
  ),
  permission(
    29,
    "admissions",
    "view",
    "admissions",
    "View admission applications and statuses"
  ),
  permission(
    30,
    "course_structure",
    "manage",
    "academics",
    "Manage faculties, departments, programs, levels, semesters"
  ),

  // ========== ASSESSMENTS ==========
  permission(
    31,
    "assessments",
    "view.own",
    "assessments",
    "View own assessments (student)"
  ),
  permission(
    32,
    "assessments",
    "view",
    "assessments",
    "View assessments for assigned courses (tutor)"
  ),
  permission(
    33,
    "assessments",
    "view.all",
    "assessments",
    "View all assessments across courses"
  ),
  permission(
    34,
    "assessments",
    "manage",
    "assessments",
    "Create, edit and delete assessments"
  ),
  permission(
    35,
    "assessments",
    "toggle.visibility",
    "assessments",
    "Show or hide assessments for students"
  ),
  permission(
    36,
    "assessments",
    "sync",
    "assessments",
    "Trigger and monitor Moodle assessment sync"
  ),

  // ========== TIMETABLE ==========
  permission(
    37,
    "timetable",
    "view.own",
    "timetable",
    "View own timetable (student/tutor)"
  ),
  permission(
    38,
    "timetable",
    "view",
    "timetable",
    "View timetable for assigned offerings (tutor)"
  ),
  permission(
    39,
    "timetable",
    "view.all",
    "timetable",
    "View all class schedules"
  ),
  permission(
    40,
    "timetable",
    "manage",
    "timetable",
    "Create, edit and delete class schedules"
  ),
  permission(
    41,
    "calendar",
    "view.own",
    "timetable",
    "View own calendar events"
  ),
  permission(
    42,
    "calendar",
    "view.all",
    "timetable",
    "View all calendar events"
  ),
  permission(
    43,
    "calendar",
    "manage",
    "timetable",
    "Toggle calendar event visibility"
  ),

  // ========== NOTIFICATIONS ==========
  permission(
    44,
    "notifications",
    "view.own",
    "notifications",
    "View own notifications"
  ),
  permission(
    45,
    "notifications",
    "read",
    "notifications",
    "Mark notifications as read"
  ),
]

const pickPermissions = (...ids: number[]) =>
  allPermissions.filter((entry) => ids.includes(entry.id))

// Builds Permission objects straight from the backend's flattened "resource.action"
// keys (returned by /auth/login and /auth/me — see bruno/auth/Me.bru). This used to
// look each key up against the local `allPermissions` catalog below and silently drop
// anything not already registered there — meaning a permission the backend genuinely
// granted (e.g. via the "Assign Permissions" flow in admin/configurations/roles) could
// vanish before it ever reached usePermissions().can(). Parsing the key directly makes
// the real backend the single source of truth; `allPermissions`/APP_ROLE_CATALOG below
// remain only for the local dev/demo role switcher, which has no backend session to
// source permissions from.
export const resolvePermissionsByKeys = (
  permissionKeys: string[]
): Permission[] => {
  if (!permissionKeys.length) return []

  return permissionKeys
    .map((key, index): Permission | null => {
      const [resource, ...actionParts] = key.split(".")
      const action = actionParts.join(".")

      if (!resource || !action) return null

      return {
        id: index + 1,
        resource,
        action,
        module: resource,
        description: null,
        created_at: ts,
      }
    })
    .filter((permission): permission is Permission => Boolean(permission))
}

const clonePermissions = (permissions: Permission[]) =>
  permissions.map((entry) => ({ ...entry }))

const normalizeRole = (role: string): UserRole | null => {
  if ((Object.values(UserRole) as string[]).includes(role))
    return role as UserRole
  return null
}

const APP_ROLE_ORDER: UserRole[] = [
  UserRole.STUDENT,
  UserRole.TUTOR,
  UserRole.STAFF,
  UserRole.HOD,
  UserRole.DEAN,
  UserRole.BURSARY,
  UserRole.DIRECTOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
]

const APP_ROLE_CATALOG: Record<UserRole, AppRoleDefinition> = {
  // ========== STUDENT ==========
  [UserRole.GUEST]: {
    role: UserRole.GUEST,
    label: "Student",
    description: "Random user trying to demo the system",
    dashboardPath: roleDashboardPath[UserRole.GUEST],
    permissions: pickPermissions(1, 7, 18, 19, 31, 37, 41, 44, 45), // + notifications
    profile: {
      id: "std-001",
      name: "Guest User",
      email: "guest@user.qhub.edu.ng",
      role: UserRole.GUEST,
      availableRoles: [UserRole.GUEST],
      permissions: pickPermissions(1, 7, 18, 19, 31, 37, 41, 44, 45),
      department: "Agric Science",
      faculty: "Science",
      matricNo: "260404001",
      level: "100 Level",
    },
  },
  [UserRole.STUDENT]: {
    role: UserRole.STUDENT,
    label: "Student",
    description: "Regular undergraduate or postgraduate student",
    dashboardPath: roleDashboardPath[UserRole.STUDENT],
    permissions: pickPermissions(1, 7, 18, 19, 31, 37, 41, 44, 45), // + notifications
    profile: {
      id: "std-001",
      name: "Chukwuemeka Okonkwo",
      email: "c.okonkwo@students.unilag.edu.ng",
      role: UserRole.STUDENT,
      availableRoles: [UserRole.STUDENT],
      permissions: pickPermissions(1, 7, 18, 19, 31, 37, 41, 44, 45),
      department: "Computer Science",
      faculty: "Science",
      matricNo: "190404001",
      level: "400 Level",
    },
  },

  // ========== TUTOR ==========
  [UserRole.TUTOR]: {
    role: UserRole.TUTOR,
    label: "Tutor",
    description: "Course tutor and academic advisor",
    dashboardPath: roleDashboardPath[UserRole.TUTOR],
    permissions: pickPermissions(1, 3, 5, 11, 14, 32, 35, 37, 38, 41, 44, 45), // + notifications
    profile: {
      id: "lec-001",
      name: "Dr. Aisha Bello",
      email: "a.bello@unilag.edu.ng",
      role: UserRole.TUTOR,
      availableRoles: [UserRole.TUTOR],
      permissions: pickPermissions(1, 3, 5, 11, 14, 32, 35, 37, 38, 41, 44, 45),
      department: "Computer Science",
      faculty: "Science",
      staffId: "STAFF-2145",
    },
  },

  // ========== STAFF ==========
  [UserRole.STAFF]: {
    role: UserRole.STAFF,
    label: "Staff",
    description: "General non-academic staff member",
    dashboardPath: roleDashboardPath[UserRole.STAFF],
    permissions: pickPermissions(11, 9, 44, 45), // + notifications
    profile: {
      id: "stf-001",
      name: "Chidinma Eze",
      email: "c.eze@unilag.edu.ng",
      role: UserRole.STAFF,
      availableRoles: [UserRole.STAFF],
      permissions: pickPermissions(11, 9, 44, 45),
      department: "Registry",
      staffId: "STF-0020",
    },
  },

  // ========== HOD ==========
  [UserRole.HOD]: {
    role: UserRole.HOD,
    label: "HOD",
    description:
      "Head of Department with tutor privileges and approval authority",
    dashboardPath: roleDashboardPath[UserRole.HOD],
    permissions: pickPermissions(
      1,
      2,
      3,
      4,
      5,
      6,
      8,
      11,
      14,
      32,
      35,
      37,
      38,
      41,
      44,
      45
    ), // + notifications
    profile: {
      id: "hod-001",
      name: "Prof. Funke Adeyemi",
      email: "f.adeyemi@unilag.edu.ng",
      role: UserRole.HOD,
      availableRoles: [UserRole.HOD],
      permissions: pickPermissions(
        1,
        2,
        3,
        4,
        5,
        6,
        8,
        11,
        14,
        32,
        35,
        37,
        38,
        41,
        44,
        45
      ),
      department: "Computer Science",
      faculty: "Science",
      staffId: "HOD-0007",
    },
  },

  // ========== DEAN ==========
  [UserRole.DEAN]: {
    role: UserRole.DEAN,
    label: "Dean",
    description: "Faculty dean with cross-department oversight",
    dashboardPath: roleDashboardPath[UserRole.DEAN],
    permissions: pickPermissions(
      1,
      2,
      3,
      4,
      5,
      6,
      8,
      11,
      14,
      16,
      32,
      33,
      37,
      38,
      39,
      41,
      42,
      44,
      45
    ), // + notifications
    profile: {
      id: "dean-001",
      name: "Prof. Ngozi Ekanem",
      email: "n.ekanem@unilag.edu.ng",
      role: UserRole.DEAN,
      availableRoles: [UserRole.DEAN],
      permissions: pickPermissions(
        1,
        2,
        3,
        4,
        5,
        6,
        8,
        11,
        14,
        16,
        32,
        33,
        37,
        38,
        39,
        41,
        42,
        44,
        45
      ),
      faculty: "Science",
      staffId: "DEAN-0002",
    },
  },

  // ========== BURSARY ==========
  [UserRole.BURSARY]: {
    role: UserRole.BURSARY,
    label: "Bursary",
    description:
      "Finance office staff responsible for fees and payment operations",
    dashboardPath: roleDashboardPath[UserRole.BURSARY],
    permissions: pickPermissions(19, 20, 21, 23, 24, 25, 26, 44, 45), // + notifications
    profile: {
      id: "bur-001",
      name: "Ibrahim Musa",
      email: "i.musa@unilag.edu.ng",
      role: UserRole.BURSARY,
      availableRoles: [UserRole.BURSARY],
      permissions: pickPermissions(19, 20, 21, 23, 24, 25, 26, 44, 45),
      department: "Bursary",
      staffId: "BUR-0011",
    },
  },

  // ========== DIRECTOR ==========
  [UserRole.DIRECTOR]: {
    role: UserRole.DIRECTOR,
    label: "Director",
    description: "Director with oversight of academic and financial operations",
    dashboardPath: roleDashboardPath[UserRole.DIRECTOR],
    permissions: pickPermissions(
      1,
      2,
      3,
      4,
      5,
      6,
      8,
      11,
      14,
      16,
      19,
      20,
      24,
      25,
      26,
      33,
      39,
      42,
      44,
      45
    ), // + notifications
    profile: {
      id: "dir-001",
      name: "Dr. Adebayo Oladipo",
      email: "a.oladipo@unilag.edu.ng",
      role: UserRole.DIRECTOR,
      availableRoles: [UserRole.DIRECTOR],
      permissions: pickPermissions(
        1,
        2,
        3,
        4,
        5,
        6,
        8,
        11,
        14,
        16,
        19,
        20,
        24,
        25,
        26,
        33,
        39,
        42,
        44,
        45
      ),
      faculty: "Science",
      staffId: "DIR-0001",
    },
  },

  // ========== ADMIN ==========
  [UserRole.ADMIN]: {
    role: UserRole.ADMIN,
    label: "Admin",
    description: "System administrator with user management access",
    dashboardPath: roleDashboardPath[UserRole.ADMIN],
    permissions: pickPermissions(
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8, // Academics
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17, // User management
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26, // Finance (full)
      27,
      28,
      29,
      30, // Sessions, admissions, course_structure
      32,
      33,
      34,
      35, // Assessments: view, view.all, manage, toggle.visibility
      37,
      38,
      39,
      40,
      41,
      42,
      43, // Timetable + Calendar (full)
      44,
      45 // Notifications
    ),
    profile: {
      id: "adm-001",
      name: "Oluwaseun Adeyemi",
      email: "o.adeyemi@admin.unilag.edu.ng",
      role: UserRole.ADMIN,
      availableRoles: [UserRole.ADMIN],
      permissions: pickPermissions(
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8, // Academics
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17, // User management
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26, // Finance (full)
        27,
        28,
        29,
        30, // Sessions, admissions, course_structure
        32,
        33,
        34,
        35, // Assessments: view, view.all, manage, toggle.visibility
        37,
        38,
        39,
        40,
        41,
        42,
        43, // Timetable + Calendar (full)
        44,
        45 // Notifications
      ),
      department: "Registry",
      staffId: "ADMIN-0012",
    },
  },

  // ========== SUPER ADMIN ==========
  [UserRole.SUPER_ADMIN]: {
    role: UserRole.SUPER_ADMIN,
    label: "Super Admin",
    description: "ICT or system administrator with full platform access",
    dashboardPath: roleDashboardPath[UserRole.SUPER_ADMIN],
    permissions: allPermissions, // All permissions
    profile: {
      id: "sa-001",
      name: "Prof. Ngozi Okafor",
      email: "registrar@unilag.edu.ng",
      role: UserRole.SUPER_ADMIN,
      availableRoles: [UserRole.SUPER_ADMIN],
      permissions: allPermissions,
      staffId: "SA-0001",
    },
  },
}

const normalizeRoles = (roles: UserRole[]) => {
  const mapped = (roles as string[])
    .map((r) => normalizeRole(r))
    .filter(Boolean) as UserRole[]
  const nextRoles = mapped.filter(
    (role, index) =>
      APP_ROLE_ORDER.includes(role) && mapped.indexOf(role) === index
  )

  return nextRoles
}

const cloneUserForRole = (
  role: UserRole,
  availableRoles: UserRole[]
): AppUser => {
  const baseUser = APP_ROLE_CATALOG[role].profile

  return {
    ...baseUser,
    availableRoles,
    permissions: clonePermissions(APP_ROLE_CATALOG[role].permissions),
  }
}

export interface AppState {
  user: AppUser | null
  isAuthenticated: boolean
  activeRole: UserRole | null
  availableRoles: UserRole[]
  roleCatalog: Record<UserRole, AppRoleDefinition>
  setUser: (user: AppUser | null) => void
  updateUser: (updates: Partial<AppUser>) => void
  setAvailableRoles: (roles: UserRole[]) => void
  login: (role: UserRole, availableRoles?: UserRole[]) => void
  switchRole: (role: UserRole) => void
  logout: () => void
  reset: () => void
}

const initialState = {
  user: null,
  isAuthenticated: false,
  activeRole: null,
  availableRoles: [],
  roleCatalog: APP_ROLE_CATALOG,
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      setUser: (user) => {
        if (!user) {
          set({
            user: null,
            isAuthenticated: false,
            activeRole: null,
            availableRoles: [],
          })
          return
        }

        const activeRole = normalizeRole(user.role as string)

        if (!activeRole || !APP_ROLE_CATALOG[activeRole]) {
          console.warn(
            `[appStore] Unknown role "${user.role}" — clearing session.`
          )
          set({
            user: null,
            isAuthenticated: false,
            activeRole: null,
            availableRoles: [],
          })
          return
        }

        const normalizedUser =
          activeRole !== user.role ? { ...user, role: activeRole } : user
        const availableRoles = normalizeRoles(
          normalizedUser.availableRoles?.length
            ? normalizedUser.availableRoles
            : [activeRole]
        )

        set({
          user: {
            ...normalizedUser,
            availableRoles,
            permissions: normalizedUser.permissions?.length
              ? clonePermissions(normalizedUser.permissions)
              : clonePermissions(APP_ROLE_CATALOG[activeRole].permissions),
          },
          isAuthenticated: true,
          activeRole,
          availableRoles,
        })
      },
      updateUser: (updates) =>
        set((state) => {
          if (!state.user) {
            return state
          }

          const nextRole = updates.role ?? state.user.role
          const nextAvailableRoles = normalizeRoles(
            updates.availableRoles ?? state.availableRoles
          )

          return {
            user: {
              ...state.user,
              ...updates,
              role: nextRole,
              availableRoles: nextAvailableRoles,
              permissions: updates.permissions?.length
                ? clonePermissions(updates.permissions)
                : state.user.permissions,
            },
            activeRole: nextRole,
            availableRoles: nextAvailableRoles,
          }
        }),
      setAvailableRoles: (roles) =>
        set((state) => {
          const nextAvailableRoles = normalizeRoles(roles)

          if (!state.user || nextAvailableRoles.length === 0) {
            return { availableRoles: nextAvailableRoles }
          }

          const nextActiveRole = nextAvailableRoles.includes(state.user.role)
            ? state.user.role
            : nextAvailableRoles[0]

          return {
            availableRoles: nextAvailableRoles,
            activeRole: nextActiveRole,
            user: cloneUserForRole(nextActiveRole, nextAvailableRoles),
          }
        }),
      login: (role, availableRoles) => {
        const nextAvailableRoles = normalizeRoles(
          availableRoles?.length ? availableRoles : [role]
        )
        const nextUser = cloneUserForRole(role, nextAvailableRoles)

        set({
          user: nextUser,
          isAuthenticated: true,
          activeRole: role,
          availableRoles: nextAvailableRoles,
        })
      },
      switchRole: (role) =>
        set((state) => {
          if (!state.isAuthenticated || !state.availableRoles.includes(role)) {
            return state
          }

          return {
            user: cloneUserForRole(role, state.availableRoles),
            activeRole: role,
          }
        }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          activeRole: null,
          availableRoles: [],
        }),
      reset: () => set(initialState),
    }),
    {
      name: "qhub-portal-app-store",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        activeRole: state.activeRole,
        availableRoles: state.availableRoles,
      }),
    }
  )
)

export function useAppHydrated(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => useAppStore.persist.onFinishHydration(onStoreChange),
    () => useAppStore.persist.hasHydrated(),
    () => false
  )
}

export { APP_ROLE_CATALOG, APP_ROLE_ORDER }
