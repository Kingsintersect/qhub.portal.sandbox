"use client";

import { BarChart3, Database, Globe, ShieldCheck, UserCog, Users } from "lucide-react";
import RoleDashboard from "@/components/dashboard/RoleDashboard";

export default function ManagePage() {
    return (
        <RoleDashboard
            eyebrow="Platform Control"
            title="Monitor the entire portal like a control room."
            subtitle="Oversee governance, platform health, user access, and cross-campus configuration from one executive dashboard."
            accent="from-emerald-100 via-background to-cyan-50 dark:from-emerald-950/35 dark:via-background dark:to-cyan-950/20"
            stats={[
                {
                    title: "Platform Users",
                    value: "24,908",
                    detail: "Students, tutors, admins, and service accounts",
                    icon: Users,
                    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                },
                {
                    title: "Role Policies",
                    value: "46",
                    detail: "Three access changes awaiting approval",
                    icon: ShieldCheck,
                    tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                },
                {
                    title: "Service Availability",
                    value: "99.98%",
                    detail: "No critical incidents in the last 7 days",
                    icon: Database,
                    tone: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
                },
                {
                    title: "Active Campuses",
                    value: "4",
                    detail: "All portals synced to the latest config",
                    icon: Globe,
                    tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                },
            ]}
            focusTitle="Platform Oversight"
            focusItems={[
                {
                    title: "Permission policy rollout",
                    meta: "Identity layer · stage 2 deployment",
                    description: "Validate the revised faculty-level access rules before promoting them from staging into production tonight.",
                    status: "Awaiting sign-off",
                    tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                },
                {
                    title: "Multi-campus analytics review",
                    meta: "Executive reporting · board pack due tomorrow",
                    description: "Compare adoption, request volume, and academic workflow throughput across all connected portal instances.",
                    status: "In progress",
                    tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                },
                {
                    title: "Session configuration audit",
                    meta: "Academics core · annual rollover checks",
                    description: "Confirm session, course, and results settings are aligned before the next academic cycle opens.",
                    status: "Stable",
                    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                },
            ]}
            quickActions={[
                {
                    title: "Manager user access",
                    href: "/manager/user-management",
                    description: "Review elevated privileges and role assignments.",
                    icon: UserCog,
                    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                },
                {
                    title: "Open system config",
                    href: "/manager/config",
                    description: "Tune platform settings, integrations, and guardrails.",
                    icon: Database,
                    tone: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
                },
                {
                    title: "Review analytics",
                    href: "/manager/analytics",
                    description: "Inspect traffic, workflow health, and adoption trends.",
                    icon: BarChart3,
                    tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                },
            ]}
            signalsTitle="System Signals"
            signals={[
                { label: "Daily active users", value: "11.2k", change: "+6.4%" },
                { label: "Provisioning speed", value: "38s", change: "-12s" },
                { label: "Support escalations", value: "7", change: "-3" },
            ]}
        />
    );
}

