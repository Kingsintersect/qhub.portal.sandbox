"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
    Award,
    Bell,
    BookOpen,
    Brain,
    ExternalLink,
    Flame,
    GraduationCap,
    PlayCircle,
    Trophy,
} from "lucide-react";
import Link from "next/link";
import { useAppStore, useNotificationStore } from "@/store";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface DashboardCardProps {
    title: string;
    subtitle?: string;
    icon: ReactNode;
    children: ReactNode;
    action?: ReactNode;
}

function DashboardCard({ title, subtitle, icon, action, children }: DashboardCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className="rounded-3xl border border-border/70 bg-card/95 p-5 shadow-sm backdrop-blur-sm"
        >
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-card-foreground">{title}</p>
                    {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {icon}
                </div>
            </div>
            {children}
            {action && <div className="mt-4">{action}</div>}
        </motion.div>
    );
}

const cbtPerformanceData = [
    { week: "W1", score: 72 },
    { week: "W2", score: 78 },
    { week: "W3", score: 76 },
    { week: "W4", score: 81 },
    { week: "W5", score: 87 },
    { week: "W6", score: 90 },
];

const weeklyRankingData = [
    { name: "Amina", grade: 96 },
    { name: "Daniel", grade: 92 },
    { name: "Bolu", grade: 90 },
    { name: "Grace", grade: 88 },
    { name: "Ife", grade: 86 },
];

const achievementData = [
    { name: "CBT Passed", value: 18, color: "#2563eb" },
    { name: "Streaks", value: 7, color: "#f97316" },
    { name: "Live Classes", value: 9, color: "#0f766e" },
    { name: "Badges", value: 5, color: "#7c3aed" },
];

const lessons = [
    { title: "Software Engineering Sprint", eta: "21 mins left", href: "/student/courses/csc401" },
    { title: "Algorithms Quick Drills", eta: "14 mins left", href: "/student/courses/csc405" },
    { title: "Networks Transport Layer", eta: "32 mins left", href: "/student/courses/csc403" },
];

const liveClasses = [
    { title: "CSC 407 - Operating Systems", time: "10:30 AM" },
    { title: "MTH 401 - Numerical Analysis", time: "1:00 PM" },
];

const achievements = [
    "7-day consistency streak",
    "Top 5 in weekly algorithm sprint",
    "3 consecutive CBT scores above 85%",
];

function hasPermission(
    permissions: { resource: string; action: string }[] | undefined,
    resource: string,
    action: string
): boolean {
    if (!permissions?.length) return false;
    return permissions.some((entry) => entry.resource === resource && entry.action === action);
}

function StatPill({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-border/70 bg-background/60 px-3 py-2">
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
        </div>
    );
}

export default function StudentDashboardPage() {
    const { user } = useAppStore();
    const { notifications } = useNotificationStore();
    const unreadNotifs = notifications.filter((n) => !n.read);
    const permissionSet = user?.permissions;

    const canViewAssessments = hasPermission(permissionSet, "assessments", "view.own");
    const canViewNotifications = hasPermission(permissionSet, "notifications", "view.own");
    const canViewTimetable = hasPermission(permissionSet, "timetable", "view.own");

    const dashboardProfile = {
        department: user?.department ?? "Computer Science",
        faculty: user?.faculty ?? "Science",
        level: user?.level ?? "400 Level",
    };

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 17) return "Good afternoon";
        return "Good evening";
    };

    const firstName = user?.name.split(" ")[0] ?? "Student";

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-br from-primary/15 via-background to-sky-500/10 p-6"
            >
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    Student Overview Page
                </p>
                <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
                    {greeting()}, {firstName}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    Track your learning rhythm, CBT readiness, and weekly class position from one focused dashboard.
                </p>
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <StatPill label="Department" value={dashboardProfile.department} />
                    <StatPill label="Faculty" value={dashboardProfile.faculty} />
                    <StatPill label="Level" value={dashboardProfile.level} />
                </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <DashboardCard
                    title="Study Streak"
                    subtitle="Your consistency pulse"
                    icon={<Flame size={18} />}
                >
                    <p className="text-3xl font-bold text-foreground">18 days</p>
                    <p className="mt-1 text-xs text-muted-foreground">+3 compared to last week</p>
                </DashboardCard>

                <DashboardCard
                    title="Upcoming CBT"
                    subtitle="Next exam and launch action"
                    icon={<GraduationCap size={18} />}
                    action={
                        canViewAssessments ? (
                            <a
                                href="https://cbt.qhub.edu.ng/exams/algorithms-midterm"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                            >
                                Take CBT Now
                                <ExternalLink size={15} />
                            </a>
                        ) : (
                            <p className="text-xs text-muted-foreground">Assessment access is not enabled for your role.</p>
                        )
                    }
                >
                    <p className="text-base font-semibold text-foreground">CSC 405 - Algorithms Midterm CBT</p>
                    <p className="mt-1 text-xs text-muted-foreground">Opens today, 4:00 PM - 5:00 PM</p>
                </DashboardCard>

                <DashboardCard
                    title="Subject Mastery"
                    subtitle="Most perfected subject"
                    icon={<Brain size={18} />}
                >
                    <p className="text-lg font-semibold text-foreground">Further Mathematics</p>
                    <p className="mt-1 text-xs text-muted-foreground">Average score: 94%</p>
                </DashboardCard>

                <DashboardCard
                    title="Weekly Ranking"
                    subtitle="Best performer in your class"
                    icon={<Trophy size={18} />}
                >
                    <p className="text-lg font-semibold text-foreground">Amina Yusuf</p>
                    <p className="mt-1 text-xs text-muted-foreground">Grade A+ • 96 points</p>
                </DashboardCard>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <DashboardCard
                    title="Continue Learning"
                    subtitle="Recommended lessons, live classes and achievements"
                    icon={<BookOpen size={18} />}
                >
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recommended Lessons</p>
                            <div className="mt-2 space-y-2">
                                {lessons.map((lesson) => (
                                    <Link
                                        key={lesson.title}
                                        href={lesson.href}
                                        className="block rounded-2xl border border-border/70 bg-background/60 p-3 transition-colors hover:bg-accent/40"
                                    >
                                        <p className="text-sm font-medium text-foreground">{lesson.title}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">{lesson.eta}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Live Classes</p>
                            <div className="mt-2 space-y-2">
                                {liveClasses.map((item) => (
                                    <Link
                                        key={item.title}
                                        href="/student/timetable"
                                        className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/60 p-3 transition-colors hover:bg-accent/40"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{item.title}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">Starts at {item.time}</p>
                                        </div>
                                        <PlayCircle size={18} className="text-primary" />
                                    </Link>
                                ))}
                            </div>
                            {!canViewTimetable && (
                                <p className="mt-2 text-xs text-muted-foreground">Timetable permission is not enabled for your role.</p>
                            )}
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Achievements</p>
                            <div className="mt-2 space-y-2">
                                {achievements.map((item) => (
                                    <p key={item} className="text-xs text-muted-foreground">
                                        • {item}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                </DashboardCard>

                <DashboardCard
                    title="Notifications"
                    subtitle="Latest updates"
                    icon={<Bell size={18} />}
                    action={
                        canViewNotifications ? (
                            <Link href="/student/notifications" className="text-xs font-semibold text-primary hover:underline">
                                View all notifications
                            </Link>
                        ) : undefined
                    }
                >
                    {!canViewNotifications ? (
                        <p className="text-xs text-muted-foreground">Notification access is disabled for your role.</p>
                    ) : unreadNotifs.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No unread notifications right now.</p>
                    ) : (
                        <div className="space-y-2">
                            {unreadNotifs.slice(0, 6).map((n) => (
                                <Link
                                    key={n.id}
                                    href="/student/notifications"
                                    className="block rounded-2xl border border-border/70 bg-background/60 p-3 transition-colors hover:bg-accent/40"
                                >
                                    <p className="text-sm font-medium text-foreground line-clamp-1">{n.title}</p>
                                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                                </Link>
                            ))}
                        </div>
                    )}
                </DashboardCard>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <DashboardCard
                    title="General Weekly Ranking"
                    subtitle="Top student performance this week"
                    icon={<Trophy size={18} />}
                >
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyRankingData} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.25} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                                <YAxis domain={[60, 100]} tickLine={false} axisLine={false} fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="grade" radius={[8, 8, 0, 0]} fill="#f59e0b" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </DashboardCard>

                <DashboardCard
                    title="Achievements Overview"
                    subtitle="This week"
                    icon={<Award size={18} />}
                >
                    <div className="h-52 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={achievementData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={48}
                                    outerRadius={70}
                                    paddingAngle={3}
                                >
                                    {achievementData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </DashboardCard>
            </div>

            <div className="grid grid-cols-1">
                <DashboardCard
                    title="CBT Performance"
                    subtitle="Weekly trend"
                    icon={<Award size={18} />}
                >
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={cbtPerformanceData} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="cbtScoreFill" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.5} />
                                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.25} />
                                <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={12} />
                                <YAxis domain={[55, 100]} tickLine={false} axisLine={false} fontSize={12} />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#0ea5e9"
                                    strokeWidth={2.5}
                                    fill="url(#cbtScoreFill)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </DashboardCard>
            </div>
        </div>
    );
}
