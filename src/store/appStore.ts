import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserRole, roleDashboardPath } from "@/config/nav.config";
import type { Permission } from "@/types/roles";

export interface AppUser {
   id: string;
   name: string;
   email: string;
   role: UserRole;
   availableRoles: UserRole[];
   permissions: Permission[];
   department?: string;
   faculty?: string;
   matricNo?: string;
   staffId?: string;
   level?: string;
   avatar?: string;
}

export interface AppRoleDefinition {
   role: UserRole;
   label: string;
   description: string;
   dashboardPath: string;
   permissions: Permission[];
   profile: AppUser;
}

const ts = "2024-09-01T00:00:00Z";

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
});

const allPermissions: Permission[] = [
   permission(1, "results", "view.own", "academics", "View own results"),
   permission(2, "results", "upload", "academics", "Upload course results"),
   permission(3, "courses", "register", "academics", "Register courses"),
   permission(4, "students", "view.class", "students", "View class list"),
   permission(5, "courses", "approve", "academics", "Approve course registration"),
   permission(6, "fees", "pay", "finance", "Pay school fees"),
   permission(7, "fees", "verify", "finance", "Verify fee payment"),
   permission(8, "users", "manage", "admin", "Manage platform users"),
   permission(9, "results", "approve", "academics", "Approve uploaded results"),
   permission(10, "departments", "manage", "admin", "Manage departments"),
   permission(11, "fees", "configure", "finance", "Configure fee structures"),
   permission(12, "students", "admit", "students", "Process student admissions"),
];

const pickPermissions = (...ids: number[]) =>
   allPermissions.filter((entry) => ids.includes(entry.id));

const clonePermissions = (permissions: Permission[]) =>
   permissions.map((entry) => ({ ...entry }));

const APP_ROLE_ORDER: UserRole[] = [
   UserRole.STUDENT,
   UserRole.LECTURER,
   UserRole.STAFF,
   UserRole.HOD,
   UserRole.DEAN,
   UserRole.BURSARY,
   UserRole.DIRECTOR,
   UserRole.ADMIN,
   UserRole.SUPER_ADMIN,
];

const APP_ROLE_CATALOG: Record<UserRole, AppRoleDefinition> = {
   [UserRole.STUDENT]: {
      role: UserRole.STUDENT,
      label: "Student",
      description: "Regular undergraduate or postgraduate student",
      dashboardPath: roleDashboardPath[UserRole.STUDENT],
      permissions: pickPermissions(1, 3, 6),
      profile: {
         id: "std-001",
         name: "Chukwuemeka Okonkwo",
         email: "c.okonkwo@students.unilag.edu.ng",
         role: UserRole.STUDENT,
         availableRoles: [UserRole.STUDENT],
         permissions: pickPermissions(1, 3, 6),
         department: "Computer Science",
         faculty: "Science",
         matricNo: "190404001",
         level: "400 Level",
      },
   },
   [UserRole.LECTURER]: {
      role: UserRole.LECTURER,
      label: "Lecturer",
      description: "Course lecturer and academic advisor",
      dashboardPath: roleDashboardPath[UserRole.LECTURER],
      permissions: pickPermissions(1, 2, 4),
      profile: {
         id: "lec-001",
         name: "Dr. Aisha Bello",
         email: "a.bello@unilag.edu.ng",
         role: UserRole.LECTURER,
         availableRoles: [UserRole.LECTURER],
         permissions: pickPermissions(1, 2, 4),
         department: "Computer Science",
         faculty: "Science",
         staffId: "STAFF-2145",
      },
   },
   [UserRole.STAFF]: {
      role: UserRole.STAFF,
      label: "Staff",
      description: "General non-academic staff member",
      dashboardPath: roleDashboardPath[UserRole.STAFF],
      permissions: pickPermissions(4, 8),
      profile: {
         id: "stf-001",
         name: "Chidinma Eze",
         email: "c.eze@unilag.edu.ng",
         role: UserRole.STAFF,
         availableRoles: [UserRole.STAFF],
         permissions: pickPermissions(4, 8),
         department: "Registry",
         staffId: "STF-0020",
      },
   },
   [UserRole.HOD]: {
      role: UserRole.HOD,
      label: "HOD",
      description: "Head of Department with lecturer privileges and approval authority",
      dashboardPath: roleDashboardPath[UserRole.HOD],
      permissions: pickPermissions(1, 2, 4, 5, 9),
      profile: {
         id: "hod-001",
         name: "Prof. Funke Adeyemi",
         email: "f.adeyemi@unilag.edu.ng",
         role: UserRole.HOD,
         availableRoles: [UserRole.HOD],
         permissions: pickPermissions(1, 2, 4, 5, 9),
         department: "Computer Science",
         faculty: "Science",
         staffId: "HOD-0007",
      },
   },
   [UserRole.DEAN]: {
      role: UserRole.DEAN,
      label: "Dean",
      description: "Faculty dean with cross-department oversight",
      dashboardPath: roleDashboardPath[UserRole.DEAN],
      permissions: pickPermissions(1, 2, 4, 5, 9),
      profile: {
         id: "dean-001",
         name: "Prof. Ngozi Ekanem",
         email: "n.ekanem@unilag.edu.ng",
         role: UserRole.DEAN,
         availableRoles: [UserRole.DEAN],
         permissions: pickPermissions(1, 2, 4, 5, 9),
         faculty: "Science",
         staffId: "DEAN-0002",
      },
   },
   [UserRole.BURSARY]: {
      role: UserRole.BURSARY,
      label: "Bursary",
      description: "Finance office staff responsible for fees and payment operations",
      dashboardPath: roleDashboardPath[UserRole.BURSARY],
      permissions: pickPermissions(6, 7, 11),
      profile: {
         id: "bur-001",
         name: "Ibrahim Musa",
         email: "i.musa@unilag.edu.ng",
         role: UserRole.BURSARY,
         availableRoles: [UserRole.BURSARY],
         permissions: pickPermissions(6, 7, 11),
         department: "Bursary",
         staffId: "BUR-0011",
      },
   },
   [UserRole.DIRECTOR]: {
      role: UserRole.DIRECTOR,
      label: "Director",
      description: "Director with oversight of academic and financial operations",
      dashboardPath: roleDashboardPath[UserRole.DIRECTOR],
      permissions: pickPermissions(1, 2, 4, 5, 6, 7, 9, 11),
      profile: {
         id: "dir-001",
         name: "Dr. Adebayo Oladipo",
         email: "a.oladipo@unilag.edu.ng",
         role: UserRole.DIRECTOR,
         availableRoles: [UserRole.DIRECTOR],
         permissions: pickPermissions(1, 2, 4, 5, 6, 7, 9, 11),
         faculty: "Science",
         staffId: "DIR-0001",
      },
   },
   [UserRole.ADMIN]: {
      role: UserRole.ADMIN,
      label: "Admin",
      description: "Legacy manager dashboard role used by the current route structure",
      dashboardPath: roleDashboardPath[UserRole.ADMIN],
      permissions: pickPermissions(1, 2, 4, 5, 8, 9, 10),
      profile: {
         id: "adm-001",
         name: "Oluwaseun Adeyemi",
         email: "o.adeyemi@admin.unilag.edu.ng",
         role: UserRole.ADMIN,
         availableRoles: [UserRole.ADMIN],
         permissions: pickPermissions(1, 2, 4, 5, 8, 9, 10),
         department: "Registry",
         staffId: "ADMIN-0012",
      },
   },
   [UserRole.SUPER_ADMIN]: {
      role: UserRole.SUPER_ADMIN,
      label: "Super Admin",
      description: "ICT or system administrator with full platform access",
      dashboardPath: roleDashboardPath[UserRole.SUPER_ADMIN],
      permissions: allPermissions,
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
};

const normalizeRoles = (roles: UserRole[]) => {
   const nextRoles = roles.filter((role, index) =>
      APP_ROLE_ORDER.includes(role) && roles.indexOf(role) === index
   );

   return nextRoles;
};

const cloneUserForRole = (role: UserRole, availableRoles: UserRole[]): AppUser => {
   const baseUser = APP_ROLE_CATALOG[role].profile;

   return {
      ...baseUser,
      availableRoles,
      permissions: clonePermissions(APP_ROLE_CATALOG[role].permissions),
   };
};

export interface AppState {
   user: AppUser | null;
   isAuthenticated: boolean;
   activeRole: UserRole | null;
   availableRoles: UserRole[];
   roleCatalog: Record<UserRole, AppRoleDefinition>;
   setUser: (user: AppUser | null) => void;
   updateUser: (updates: Partial<AppUser>) => void;
   setAvailableRoles: (roles: UserRole[]) => void;
   login: (role: UserRole, availableRoles?: UserRole[]) => void;
   switchRole: (role: UserRole) => void;
   logout: () => void;
   reset: () => void;
}

const initialState = {
   user: null,
   isAuthenticated: false,
   activeRole: null,
   availableRoles: [],
   roleCatalog: APP_ROLE_CATALOG,
};

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
               });
               return;
            }

            const availableRoles = normalizeRoles(
               user.availableRoles?.length ? user.availableRoles : [user.role]
            );
            const activeRole = user.role;

            set({
               user: {
                  ...user,
                  availableRoles,
                  permissions: user.permissions?.length
                     ? clonePermissions(user.permissions)
                     : clonePermissions(APP_ROLE_CATALOG[activeRole].permissions),
               },
               isAuthenticated: true,
               activeRole,
               availableRoles,
            });
         },
         updateUser: (updates) =>
            set((state) => {
               if (!state.user) {
                  return state;
               }

               const nextRole = updates.role ?? state.user.role;
               const nextAvailableRoles = normalizeRoles(
                  updates.availableRoles ?? state.availableRoles
               );

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
               };
            }),
         setAvailableRoles: (roles) =>
            set((state) => {
               const nextAvailableRoles = normalizeRoles(roles);

               if (!state.user || nextAvailableRoles.length === 0) {
                  return { availableRoles: nextAvailableRoles };
               }

               const nextActiveRole = nextAvailableRoles.includes(state.user.role)
                  ? state.user.role
                  : nextAvailableRoles[0];

               return {
                  availableRoles: nextAvailableRoles,
                  activeRole: nextActiveRole,
                  user: cloneUserForRole(nextActiveRole, nextAvailableRoles),
               };
            }),
         login: (role, availableRoles) => {
            const nextAvailableRoles = normalizeRoles(
               availableRoles?.length ? availableRoles : [role]
            );
            const nextUser = cloneUserForRole(role, nextAvailableRoles);

            set({
               user: nextUser,
               isAuthenticated: true,
               activeRole: role,
               availableRoles: nextAvailableRoles,
            });
         },
         switchRole: (role) =>
            set((state) => {
               if (!state.isAuthenticated || !state.availableRoles.includes(role)) {
                  return state;
               }

               return {
                  user: cloneUserForRole(role, state.availableRoles),
                  activeRole: role,
               };
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
);

export function useAppHydrated(): boolean {
   return useSyncExternalStore(
      (onStoreChange) => useAppStore.persist.onFinishHydration(onStoreChange),
      () => useAppStore.persist.hasHydrated(),
      () => false
   );
}

export { APP_ROLE_CATALOG, APP_ROLE_ORDER };
