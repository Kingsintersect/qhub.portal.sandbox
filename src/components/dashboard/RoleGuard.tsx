"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserRole, roleDashboardPath } from "@/config/nav.config";
import { useAuthStore, useAuthHydrated } from "@/store";

interface RoleGuardProps {
    role: UserRole;
    children: React.ReactNode;
}

export default function RoleGuard({ role, children }: RoleGuardProps) {
    const { user } = useAuthStore();
    const hydrated = useAuthHydrated();
    const router = useRouter();

    useEffect(() => {
        if (hydrated && user && user.role !== role) {
            router.replace(roleDashboardPath[user.role]);
        }
    }, [hydrated, role, router, user]);

    if (!hydrated || !user || user.role !== role) return null;

    return <>{children}</>;
}
