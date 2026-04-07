"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useAuthHydrated } from "@/store";
import { UserRole, roleDashboardPath } from "@/config/nav.config";

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuthStore();
    const hydrated = useAuthHydrated();
    const router = useRouter();

    useEffect(() => {
        if (hydrated && user && user.role !== UserRole.STUDENT) {
            router.replace(roleDashboardPath[user.role]);
        }
    }, [hydrated, user, router]);

    if (!hydrated || !user || user.role !== UserRole.STUDENT) return null;

    return <>{children}</>;
}
