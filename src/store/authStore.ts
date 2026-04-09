import { UserRole } from "@/config/nav.config";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSyncExternalStore } from "react";

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    department?: string;
    faculty?: string;
    matricNo?: string;
    staffId?: string;
    level?: string;
    avatar?: string;
}

const MOCK_USERS: Record<UserRole, User> = {
    STUDENT: {
        id: "std-001",
        name: "Chukwuemeka Okonkwo",
        email: "c.okonkwo@students.unilag.edu.ng",
        role: UserRole.STUDENT,
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
        department: "Computer Science",
        faculty: "Science",
        staffId: "STAFF-2145",
    },
    ADMIN: {
        id: "adm-001",
        name: "Oluwaseun Adeyemi",
        email: "o.adeyemi@admin.unilag.edu.ng",
        role: UserRole.ADMIN,
        department: "Registry",
        staffId: "ADMIN-0012",
    },
    SUPER_ADMIN: {
        id: "sa-001",
        name: "Prof. Ngozi Okafor",
        email: "registrar@unilag.edu.ng",
        role: UserRole.SUPER_ADMIN,
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
        (set: (state: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>)) => void) => ({
            user: null,
            isAuthenticated: false,
            login: (role: UserRole) =>
                set({ user: MOCK_USERS[role], isAuthenticated: true }),
            logout: () => set({ user: null, isAuthenticated: false }),
        }),
        {
            name: "qhub-portal-auth",
            partialize: (state: AuthState) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
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