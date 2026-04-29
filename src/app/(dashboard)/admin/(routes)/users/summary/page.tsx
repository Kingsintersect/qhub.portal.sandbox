"use client";

import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserStats, useUsers } from "./hooks/useUsersData";
import DataTable, { type Column } from "@/components/custom/DataTable";
import Avatar from "@/components/custom/Avatar";
import StatusBadge from "@/components/custom/StatusBadge";
import type { User } from "@/types/users";
import {
   PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
   BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const COLORS = {
   students: "#10b981",
   lecturers: "#8b5cf6",
   staff: "#f59e0b",
   active: "#06b6d4",
   inactive: "#ef4444",
};

const columns: Column<User & Record<string, unknown>>[] = [
   {
      key: "name", header: "User", sortable: true, width: "30%",
      render: (row) => (
         <div className="flex items-center gap-3">
            <Avatar name={`${row.first_name ?? ""} ${row.last_name ?? ""}`} size="sm" status={row.is_active ? "online" : "offline"} />
            <div>
               <p className="font-medium text-foreground text-sm">
                  {row.first_name ?? "—"} {row.last_name ?? ""}
               </p>
               <p className="text-xs text-muted-foreground">{row.username}</p>
            </div>
         </div>
      ),
   },
   { key: "email", header: "Email", sortable: true },
   {
      key: "roles", header: "Roles",
      render: (row) =>
         row.roles.length > 0 ? (
            <div className="flex flex-wrap gap-1">
               {row.roles.map((r) => (
                  <StatusBadge key={r.id} label={r.name} variant="purple" />
               ))}
            </div>
         ) : (
            <span className="text-xs text-muted-foreground">No role</span>
         ),
   },
   {
      key: "is_active", header: "Status", align: "center",
      render: (row) => (
         <StatusBadge label={row.is_active ? "Active" : "Inactive"} variant={row.is_active ? "success" : "destructive"} dot />
      ),
   },
   {
      key: "created_at", header: "Registered", sortable: true,
      render: (row) => (
         <span className="text-xs text-muted-foreground">
            {new Date(row.created_at).toLocaleDateString()}
         </span>
      ),
   },
];

export default function UsersSummaryPage() {
   const router = useRouter();
   const { data: statsData, isLoading: statsLoading } = useUserStats();
   const { data: usersData, isLoading: usersLoading } = useUsers();
   const stats = statsData?.data;

   return (
      <div className="space-y-8 mx-auto px-4 py-8 sm:px-6 lg:px-8">
         {/* Header */}
         <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">User Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
               Overview of all platform users. Use the tabs in the sidebar to manage Students, Lecturers, and Staff.
            </p>
         </motion.div>

         {/* Charts */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribution Donut */}
            <motion.div
               initial={{ opacity: 0, y: 12 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
               <h2 className="text-sm font-semibold text-foreground mb-1">User Distribution</h2>
               <p className="text-xs text-muted-foreground mb-4">
                  Breakdown by role — {stats?.total_users ?? 0} total users
               </p>
               {statsLoading ? (
                  <div className="h-55 flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
               ) : (
                  <div className="flex items-center gap-6">
                     <ResponsiveContainer width="60%" height={220}>
                        <PieChart>
                           <Pie
                              data={[
                                 { name: "Students", value: stats?.total_students ?? 0 },
                                 { name: "Lecturers", value: stats?.total_lecturers ?? 0 },
                                 { name: "Staff", value: stats?.total_staff ?? 0 },
                              ]}
                              innerRadius={55}
                              outerRadius={90}
                              paddingAngle={3}
                              dataKey="value"
                              strokeWidth={0}
                           >
                              <Cell fill={COLORS.students} />
                              <Cell fill={COLORS.lecturers} />
                              <Cell fill={COLORS.staff} />
                           </Pie>
                           <Tooltip
                              contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid var(--border)", background: "var(--card)" }}
                              itemStyle={{ color: "var(--foreground)" }}
                           />
                        </PieChart>
                     </ResponsiveContainer>
                     <div className="space-y-3">
                        {[
                           { label: "Students", value: stats?.total_students ?? 0, color: COLORS.students, icon: GraduationCap },
                           { label: "Lecturers", value: stats?.total_lecturers ?? 0, color: COLORS.lecturers, icon: BookOpen },
                           { label: "Staff", value: stats?.total_staff ?? 0, color: COLORS.staff, icon: Briefcase },
                        ].map((item) => (
                           <div key={item.label} className="flex items-center gap-2.5">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                              <item.icon size={14} className="text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{item.label}</span>
                              <span className="text-sm font-bold text-foreground ml-auto">{item.value}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </motion.div>

            {/* Active vs Inactive Bar */}
            <motion.div
               initial={{ opacity: 0, y: 12 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.18 }}
               className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
               <h2 className="text-sm font-semibold text-foreground mb-1">Activity Status</h2>
               <p className="text-xs text-muted-foreground mb-4">Active vs inactive users</p>
               {statsLoading ? (
                  <div className="h-55 flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
               ) : (
                  <ResponsiveContainer width="100%" height={220}>
                     <BarChart
                        data={[
                           { name: "Students", active: stats?.total_students ?? 0, inactive: 0 },
                           { name: "Lecturers", active: stats?.total_lecturers ?? 0, inactive: 0 },
                           { name: "Staff", active: stats?.total_staff ?? 0, inactive: 0 },
                           {
                              name: "Overall",
                              active: stats?.active_users ?? 0,
                              inactive: (stats?.total_users ?? 0) - (stats?.active_users ?? 0),
                           },
                        ]}
                        barGap={4}
                     >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={30} />
                        <Tooltip
                           contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid var(--border)", background: "var(--card)" }}
                           itemStyle={{ color: "var(--foreground)" }}
                        />
                        <Bar dataKey="active" name="Active" fill={COLORS.active} radius={[6, 6, 0, 0]} />
                        <Bar dataKey="inactive" name="Inactive" fill={COLORS.inactive} radius={[6, 6, 0, 0]} />
                     </BarChart>
                  </ResponsiveContainer>
               )}
            </motion.div>
         </div>

         {/* Quick links */}
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
               { label: "Manage Students", desc: "View & update student records", icon: GraduationCap, href: "/admin/users/students", color: "text-emerald-500" },
               { label: "Manage Lecturers", desc: "Add lecturers from existing users", icon: BookOpen, href: "/admin/users/lecturers", color: "text-violet-500" },
               { label: "Manage Staff", desc: "Add staff & assign roles", icon: Briefcase, href: "/admin/users/staff", color: "text-amber-500" },
            ].map((item, i) => (
               <motion.button
                  key={item.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  onClick={() => router.push(item.href)}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm text-left hover:bg-accent transition-colors"
               >
                  <div className="rounded-xl bg-muted p-3">
                     <item.icon size={22} className={item.color} />
                  </div>
                  <div>
                     <p className="font-semibold text-foreground text-sm">{item.label}</p>
                     <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
               </motion.button>
            ))}
         </div>

         {/* All users table */}
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <h2 className="text-lg font-semibold text-foreground mb-4">All Users</h2>
            <DataTable
               data={(usersData?.data ?? []) as (User & Record<string, unknown>)[]}
               columns={columns}
               loading={usersLoading}
               searchPlaceholder="Search by name, email, or username…"
               searchExtractor={(row) => `${row.first_name ?? ""} ${row.last_name ?? ""} ${row.email} ${row.username}`}
               rowKey="id"
               pageSize={10}
               emptyMessage="No users found"
            />
         </motion.div>
      </div>
   );
}
