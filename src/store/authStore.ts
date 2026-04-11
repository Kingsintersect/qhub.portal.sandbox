import { UserRole } from "@/config/nav.config";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSyncExternalStore } from "react";
import type { Permission } from "@/types/roles";

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    permissions?: Permission[];
    department?: string;
    faculty?: string;
    matricNo?: string;
    staffId?: string;
    level?: string;
    avatar?: string;
}

// ── Mock permissions per role ────────────────

const ts = "2024-09-01T00:00:00Z";
const p = (id: number, resource: string, action: string, module: string, description: string): Permission => ({
    id, resource, action, module, description, created_at: ts,
});

const ALL_PERMISSIONS: Permission[] = [
    p(1, "results", "view.own", "academics", "View own results"),
    p(2, "results", "upload", "academics", "Upload course results"),
    p(3, "courses", "register", "academics", "Register courses"),
    p(4, "students", "view.class", "students", "View class list"),
    p(5, "courses", "approve", "academics", "Approve course registration"),
    p(6, "fees", "pay", "finance", "Pay school fees"),
    p(7, "fees", "verify", "finance", "Verify fee payment"),
    p(8, "users", "manage", "admin", "Manage platform users"),
    p(9, "results", "approve", "academics", "Approve uploaded results"),
    p(10, "departments", "manage", "admin", "Manage departments"),
    p(11, "fees", "configure", "finance", "Configure fee structures"),
    p(12, "students", "admit", "students", "Process student admissions"),
];

const pick = (...ids: number[]) => ALL_PERMISSIONS.filter((pm) => ids.includes(pm.id));

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    STUDENT: pick(1, 3, 6),
    LECTURER: pick(1, 2, 4),
    ADMIN: pick(1, 2, 4, 5, 8, 9, 10),
    SUPER_ADMIN: [...ALL_PERMISSIONS],
};

const MOCK_USERS: Record<UserRole, User> = {
    STUDENT: {
        id: "std-001",
        name: "Chukwuemeka Okonkwo",
        email: "c.okonkwo@students.unilag.edu.ng",
        role: UserRole.STUDENT,
        permissions: ROLE_PERMISSIONS.STUDENT,
        department: "Computer Science",
        faculty: "Science",
        matricNo: "190404001",
        level: "400 Level",
    },
    LECTURER: {
        id: "lec-001",
        name: "Dr. Aisha Bello",
        email: "a.bello@unilag.edu.ng",
        role: UserRole.LECTURER,
        permissions: ROLE_PERMISSIONS.LECTURER,
        department: "Computer Science",
        faculty: "Science",
        staffId: "STAFF-2145",
    },
    ADMIN: {
        id: "adm-001",
        name: "Oluwaseun Adeyemi",
        email: "o.adeyemi@admin.unilag.edu.ng",
        role: UserRole.ADMIN,
        permissions: ROLE_PERMISSIONS.ADMIN,
        department: "Registry",
        staffId: "ADMIN-0012",
    },
    SUPER_ADMIN: {
        id: "sa-001",
        name: "Prof. Ngozi Okafor",
        email: "registrar@unilag.edu.ng",
        role: UserRole.SUPER_ADMIN,
        permissions: ROLE_PERMISSIONS.SUPER_ADMIN,
        staffId: "SA-0001",
    },
};

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (role: UserRole) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: (role) =>
                set({ user: MOCK_USERS[role], isAuthenticated: true }),
            logout: () => set({ user: null, isAuthenticated: false }),
        }),
        {
            name: "qhub-portal-auth",
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);

/**
 * Returns true once the auth store has finished rehydrating from localStorage.
 * Uses useSyncExternalStore so it's reactive without setState-in-effect.
 */
export function useAuthHydrated(): boolean {
    return useSyncExternalStore(
        (onStoreChange) => useAuthStore.persist.onFinishHydration(onStoreChange),
        () => useAuthStore.persist.hasHydrated(),
        () => false, // server snapshot — always false during SSR
    );
}