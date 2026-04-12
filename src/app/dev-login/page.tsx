"use client";

import { useRouter } from "next/navigation";
import { useAppStore, useAppHydrated } from "@/store";
import { UserRole, roleDashboardPath } from "@/config/nav.config";

/**
 * Temporary dev-only page. Delete this folder when real auth is ready.
 * Visit /dev-login in your browser to fake-login as any role.
 */
export default function DevLoginPage() {
   const { login, logout, isAuthenticated, user } = useAppStore();
   const hydrated = useAppHydrated();
   const router = useRouter();

   const handleLogin = (role: UserRole) => {
      login(role);
      router.push(roleDashboardPath[role]);
   };

   return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
         <div className="w-full max-w-sm space-y-6">
            <div className="text-center space-y-1">
               <h1 className="text-xl font-bold">Dev Login</h1>
               <p className="text-sm text-muted-foreground">
                  Pick a role to preview the dashboard
               </p>
            </div>

            {hydrated && isAuthenticated && user && (
               <div className="rounded-xl border border-border bg-muted/50 p-4 space-y-3">
                  <p className="text-sm text-foreground">
                     Logged in as <span className="font-semibold">{user.name}</span>{" "}
                     <span className="text-xs text-muted-foreground">({user.role})</span>
                  </p>
                  <div className="flex gap-2">
                     <button
                        onClick={() => {
                           router.push(roleDashboardPath[user.role]);
                        }}
                        className="flex-1 rounded-lg px-3 py-2 text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                     >
                        Go to Dashboard
                     </button>
                     <button
                        onClick={() => logout()}
                        className="flex-1 rounded-lg px-3 py-2 text-xs font-medium bg-destructive text-white hover:opacity-90 transition-opacity"
                     >
                        Logout
                     </button>
                  </div>
               </div>
            )}

            <div className="space-y-3">
               {(
                  [
                     { role: UserRole.STUDENT, label: "Student", color: "bg-blue-600 hover:bg-blue-700" },
                     { role: UserRole.LECTURER, label: "Lecturer", color: "bg-violet-600 hover:bg-violet-700" },
                     { role: UserRole.HOD, label: "HOD", color: "bg-fuchsia-600 hover:bg-fuchsia-700" },
                     { role: UserRole.DEAN, label: "Dean", color: "bg-orange-600 hover:bg-orange-700" },
                     { role: UserRole.BURSARY, label: "Bursary", color: "bg-cyan-600 hover:bg-cyan-700" },
                     { role: UserRole.ADMIN, label: "Admin", color: "bg-amber-600 hover:bg-amber-700" },
                     { role: UserRole.SUPER_ADMIN, label: "Super Admin", color: "bg-emerald-600 hover:bg-emerald-700" },
                  ] as const
               ).map(({ role, label, color }) => (
                  <button
                     key={role}
                     onClick={() => handleLogin(role)}
                     className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors ${color}`}
                  >
                     Login as {label}
                  </button>
               ))}
            </div>

            <p className="text-[11px] text-center text-muted-foreground">
               This page is for development only. Delete{" "}
               <code className="bg-muted px-1 rounded">app/dev-login/</code> when
               real auth is ready.
            </p>
         </div>
      </div>
   );
}
