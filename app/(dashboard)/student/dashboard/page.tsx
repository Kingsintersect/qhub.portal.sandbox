"use client";

import { motion } from "framer-motion";
import {
    BookOpen,
    CalendarDays,
    ClipboardList,
    CreditCard,
    Bell,
    TrendingUp,
    Clock,
    GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore, useNotificationStore } from "@/store";

/* ------------------------------------------------------------------ */
/*  Stat card                                                          */
/* ------------------------------------------------------------------ */

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    iconClass: string;
    iconBg: string;
    trend?: string;
}

function StatCard({ title, value, subtitle, icon: Icon, iconClass, iconBg, trend }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold text-card-foreground">{value}</p>
                    {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
                    <Icon size={18} className={iconClass} />
                </div>
            </div>
            {trend && (
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <TrendingUp size={12} />
                    {trend}
                </div>
            )}
        </motion.div>
    );
}

/* ------------------------------------------------------------------ */
/*  Quick-action link                                                  */
/* ------------------------------------------------------------------ */

interface QuickActionProps {
    title: string;
    href: string;
    icon: React.ElementType;
    iconClass: string;
    iconBg: string;
    description: string;
}

function QuickAction({ title, href, icon: Icon, iconClass, iconBg, description }: QuickActionProps) {
    return (
        <Link href={href}>
            <motion.div
                whileHover={{ y: -2 }}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-md transition-all cursor-pointer"
            >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                    <Icon size={18} className={iconClass} />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-card-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground truncate">{description}</p>
                </div>
            </motion.div>
        </Link>
    );
}

/* ------------------------------------------------------------------ */
/*  Upcoming schedule item                                             */
/* ------------------------------------------------------------------ */

interface ScheduleItem {
    course: string;
    code: string;
    time: string;
    venue: string;
    type: "lecture" | "lab" | "tutorial";
}

const SCHEDULE: ScheduleItem[] = [
    { course: "Software Engineering", code: "CSC 401", time: "08:00 – 10:00", venue: "LT-3", type: "lecture" },
    { course: "Computer Networks", code: "CSC 403", time: "10:30 – 12:00", venue: "Lab B2", type: "lab" },
    { course: "Artificial Intelligence", code: "CSC 405", time: "13:00 – 14:30", venue: "LT-6", type: "lecture" },
    { course: "Operating Systems", code: "CSC 407", time: "15:00 – 16:00", venue: "Room 204", type: "tutorial" },
];

const typeColors: Record<string, string> = {
    lecture: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    lab: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    tutorial: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function StudentDashboardPage() {
    const { user } = useAuthStore();
    const { notifications } = useNotificationStore();
    const unreadNotifs = notifications.filter((n) => !n.read);

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 17) return "Good afternoon";
        return "Good evening";
    };

    const firstName = user?.name.split(" ")[0] ?? "Student";

    return (
        <div className="space-y-8">
            {/* Greeting header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h1 className="text-2xl font-bold text-foreground">
                    {greeting()}, {firstName} 👋
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {user?.department} &middot; {user?.faculty} &middot; {user?.level}
                </p>
            </motion.div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    title="Registered Courses"
                    value={7}
                    subtitle="2025/2026 Session"
                    icon={BookOpen}
                    iconBg="bg-blue-500/10"
                    iconClass="text-blue-600 dark:text-blue-400"
                />
                <StatCard
                    title="Current CGPA"
                    value="4.31"
                    subtitle="First Class"
                    icon={GraduationCap}
                    iconBg="bg-emerald-500/10"
                    iconClass="text-emerald-600 dark:text-emerald-400"
                    trend="+0.12 from last semester"
                />
                <StatCard
                    title="Upcoming Exams"
                    value={3}
                    subtitle="Starts in 14 days"
                    icon={ClipboardList}
                    iconBg="bg-amber-500/10"
                    iconClass="text-amber-600 dark:text-amber-400"
                />
                <StatCard
                    title="Outstanding Fees"
                    value="₦45,000"
                    subtitle="Due 15 Apr 2026"
                    icon={CreditCard}
                    iconBg="bg-red-500/10"
                    iconClass="text-red-600 dark:text-red-400"
                />
            </div>

            {/* Two-column: Schedule + Notifications / Quick actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's schedule */}
                <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-card-foreground">
                            <CalendarDays size={16} className="text-primary" />
                            <h2 className="text-sm font-semibold">Today&apos;s Schedule</h2>
                        </div>
                        <Link
                            href="/student/timetable"
                            className="text-xs font-medium text-primary hover:underline"
                        >
                            View full timetable
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {SCHEDULE.map((s, i) => (
                            <motion.div
                                key={s.code}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.06 }}
                                className="flex items-center gap-4 rounded-xl bg-muted/50 dark:bg-muted/30 p-3"
                            >
                                <div className="flex flex-col items-center text-center w-16 shrink-0">
                                    <Clock size={12} className="text-muted-foreground mb-0.5" />
                                    <span className="text-[10px] leading-tight font-medium text-muted-foreground">
                                        {s.time}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-card-foreground truncate">{s.course}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {s.code} &middot; {s.venue}
                                    </p>
                                </div>
                                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${typeColors[s.type]}`}>
                                    {s.type}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right column */}
                <div className="space-y-6">
                    {/* Recent notifications */}
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-card-foreground">
                            <Bell size={16} className="text-primary" />
                            <h2 className="text-sm font-semibold">Recent Notifications</h2>
                        </div>
                        {unreadNotifs.length === 0 ? (
                            <p className="text-xs text-muted-foreground">All caught up!</p>
                        ) : (
                            <div className="space-y-3">
                                {unreadNotifs.slice(0, 4).map((n) => (
                                    <div key={n.id} className="flex items-start gap-3">
                                        <div className="mt-0.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-card-foreground truncate">{n.title}</p>
                                            <p className="text-[11px] text-muted-foreground line-clamp-1">{n.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Link
                            href="/student/announcements"
                            className="block text-xs font-medium text-primary hover:underline mt-3"
                        >
                            View all
                        </Link>
                    </div>

                    {/* Quick actions */}
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-card-foreground mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <QuickAction
                                title="Course Registration"
                                href="/student/registration"
                                icon={BookOpen}
                                iconBg="bg-blue-500/10"
                                iconClass="text-blue-600 dark:text-blue-400"
                                description="Register for new courses"
                            />
                            <QuickAction
                                title="View Results"
                                href="/student/results"
                                icon={ClipboardList}
                                iconBg="bg-emerald-500/10"
                                iconClass="text-emerald-600 dark:text-emerald-400"
                                description="Check your semester results"
                            />
                            <QuickAction
                                title="Make Payment"
                                href="/student/payments"
                                icon={CreditCard}
                                iconBg="bg-amber-500/10"
                                iconClass="text-amber-600 dark:text-amber-400"
                                description="Pay tuition & other fees"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
