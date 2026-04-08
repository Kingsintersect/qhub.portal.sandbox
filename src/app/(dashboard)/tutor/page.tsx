"use client";

import { BookOpen, CalendarDays, ClipboardList, FileText, Layers, MessageSquare } from "lucide-react";
import RoleDashboard from "@/components/dashboard/RoleDashboard";

export default function TutorPage() {
    return (
        <RoleDashboard
            eyebrow="Teaching Workspace"
            title="Run classes, grading, and student support from one calm workspace."
            subtitle="See what needs attention today across lectures, assessment workflows, course materials, and student communication."
            accent="from-violet-100 via-background to-sky-50 dark:from-violet-950/35 dark:via-background dark:to-sky-950/20"
            stats={[
                {
                    title: "Assigned Courses",
                    value: "6",
                    detail: "Two departments, one active semester",
                    icon: BookOpen,
                    tone: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
                },
                {
                    title: "Today's Sessions",
                    value: "4",
                    detail: "Next class starts at 10:30 AM",
                    icon: CalendarDays,
                    tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                },
                {
                    title: "Pending Submissions",
                    value: "184",
                    detail: "Scripts and results awaiting action",
                    icon: ClipboardList,
                    tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                },
                {
                    title: "Student Messages",
                    value: "12",
                    detail: "Unread requests since yesterday",
                    icon: MessageSquare,
                    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                },
            ]}
            focusTitle="Teaching Agenda"
            focusItems={[
                {
                    title: "CSC 405 lab supervision",
                    meta: "Lab B2 · 10:30 AM to 12:00 PM",
                    description: "Prepare the troubleshooting guide and verify attendance capture before the practical starts.",
                    status: "Next up",
                    tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                },
                {
                    title: "Mid-semester grading batch",
                    meta: "Grade book · 184 scripts pending",
                    description: "Finish moderation for the current batch so provisional scores can be released to students by evening.",
                    status: "Needs attention",
                    tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                },
                {
                    title: "Course material refresh",
                    meta: "Resources hub · Week 9 content",
                    description: "Upload annotated slides, reading references, and the short demo video for tomorrow's lecture.",
                    status: "On track",
                    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                },
            ]}
            quickActions={[
                {
                    title: "Submit results",
                    href: "/tutor/grading/submit",
                    description: "Push approved scores into the semester result workflow.",
                    icon: FileText,
                    tone: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
                },
                {
                    title: "Open grade book",
                    href: "/tutor/grading/book",
                    description: "Review scripts, moderation notes, and grade trends.",
                    icon: ClipboardList,
                    tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                },
                {
                    title: "Update resources",
                    href: "/tutor/resources",
                    description: "Add lecture notes, links, and lab instructions.",
                    icon: Layers,
                    tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                },
            ]}
            signalsTitle="Teaching Signals"
            signals={[
                { label: "Attendance average", value: "87%", change: "+4.1%" },
                { label: "Assessment turnaround", value: "2.4 days", change: "-0.6d" },
                { label: "Active learners", value: "326", change: "+12%" },
            ]}
        />
    );
}
