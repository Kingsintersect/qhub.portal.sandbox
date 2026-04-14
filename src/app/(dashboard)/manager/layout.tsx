"use client";

import { UserRole } from "@/config/nav.config";
import RoleGuard from "@/components/dashboard/RoleGuard";

export default function ManageLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return <RoleGuard role={[UserRole.ADMIN, UserRole.DEAN]}>{children}</RoleGuard>;
}
