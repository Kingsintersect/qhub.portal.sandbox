"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { UserRole } from "@/config/nav.config";
import { useAppStore } from "@/store";

export default function AuthSessionBridge({
   children,
}: {
   children: React.ReactNode;
}) {
   const { data: session, status } = useSession();
   const { isAuthenticated, logout, setUser } = useAppStore();

   useEffect(() => {
      if (status === "authenticated" && session?.user?.role) {
         const role = session.user.role as UserRole;
         const availableRoles =
            session.user.availableRoles?.length
               ? session.user.availableRoles
               : [role];

         setUser({
            id: session.user.id || `session-${session.user.email ?? "user"}`,
            name: session.user.name ?? "Portal User",
            email: session.user.email ?? "",
            role,
            availableRoles,
            permissions: [],
         });
         return;
      }

      if (status === "unauthenticated" && isAuthenticated) {
         logout();
      }
   }, [isAuthenticated, logout, session, setUser, status]);

   return <>{children}</>;
}
