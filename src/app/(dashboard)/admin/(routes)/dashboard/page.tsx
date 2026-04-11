"use client";

import { Bell, Building2, ClipboardList, GraduationCap, Layers, Users } from "lucide-react";
import RoleDashboard from "@/components/dashboard/RoleDashboard";

export default function AdminPage() {
    return (
        <RoleDashboard
            eyebrow="Faculty Administration"
            title="Keep academic operations moving with confidence."
            subtitle="Track admissions, course allocation, department performance, and the approvals that need attention across the admin office."
            accent="from-amber-100 via-background to-orange-50 dark:from-amber-950/40 dark:via-background dark:to-orange-950/20"
            stats={[
                {
                    title: "Active Students",
                    value: "18,240",
                    detail: "Across 12 faculties this session",
                    icon: GraduationCap,
                    tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                },
                {
                    title: "Lecturer Records",
                    value: "742",
                    detail: "31 profiles updated this week",
                    icon: Users,
                    tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                },
                {
                    title: "Pending Approvals",
                    value: "28",
                    detail: "Course and registry actions awaiting review",
                    icon: ClipboardList,
                    tone: "bg-red-500/10 text-red-600 dark:text-red-400",
                },
                {
                    title: "Departments Online",
                    value: "27",
                    detail: "100% reporting status submitted",
                    icon: Building2,
                    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                },
            ]}
            focusTitle="Operational Focus"
            focusItems={[
                {
                    title: "Registration exception review",
                    meta: "Registry queue · closes 2:00 PM",
                    description: "Clear final edge cases for late course registration so timetable and billing syncs stay accurate before the next nightly run.",
                    status: "High priority",
                    tone: "bg-red-500/10 text-red-600 dark:text-red-400",
                },
                {
                    title: "Department staffing balance",
                    meta: "Academic planning · 6 departments affected",
                    description: "Review lecturer allocation gaps in Engineering and Science before auto-publishing the new teaching load summary.",
                    status: "In review",
                    tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                },
                {
                    title: "Announcement publishing batch",
                    meta: "Campus desk · scheduled for 4:30 PM",
                    description: "Prepare exam timetable notices, registration reminders, and senate updates for coordinated release to students and tutors.",
                    status: "On track",
                    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                },
            ]}
            quickActions={[
                {
                    title: "Review student records",
                    href: "/admin/students",
                    description: "Audit enrolment, clearance, and department distribution.",
                    icon: GraduationCap,
                    tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                },
                {
                    title: "Update course allocation",
                    href: "/admin/courses/allocation",
                    description: "Adjust teaching assignments before publication.",
                    icon: Layers,
                    tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                },
                {
                    title: "Publish announcements",
                    href: "/admin/announcements",
                    description: "Send school-wide notices and faculty updates.",
                    icon: Bell,
                    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                },
            ]}
            signalsTitle="Admin Signals"
            signals={[
                { label: "Registration completion", value: "91.4%", change: "+3.2%" },
                { label: "Allocation accuracy", value: "97.8%", change: "+1.1%" },
                { label: "Announcement reach", value: "14.8k", change: "+8.6%" },
            ]}
        />
    );
}
