"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Users, BarChart2, CheckCircle2, Eye } from "lucide-react";
import StatusBadge from "@/components/custom/StatusBadge";
import EmptyState from "@/components/custom/EmptyState";
import type { Grade, GradeStatus, GroupedGradeData } from "../types/grades.types";

type StatusVariant = "success" | "warning" | "destructive" | "info" | "default";

const STATUS_BADGE_MAP: Record<GradeStatus, { label: string; variant: StatusVariant }> = {
    PUBLISHED: { label: "Published", variant: "success" },
    APPROVED: { label: "Approved", variant: "info" },
    SUBMITTED: { label: "Submitted", variant: "warning" },
    DRAFT: { label: "Draft", variant: "default" },
};

function GpaBar({ value }: { value: number }) {
    const pct = Math.min((value / 5) * 100, 100);
    const colour =
        value >= 4.0 ? "bg-emerald-500" :
            value >= 3.0 ? "bg-blue-500" :
                value >= 2.0 ? "bg-amber-500" :
                    "bg-red-500";
    return (
        <div className="flex items-center gap-2 min-w-28">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                    className={`h-full ${colour} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </div>
            <span className="text-xs font-mono font-semibold text-foreground tabular-nums w-8">
                {value.toFixed(2)}
            </span>
        </div>
    );
}

interface GroupRowProps {
    group: GroupedGradeData;
    onViewGrade: (grade: Grade) => void;
}

function GroupRow({ group, onViewGrade }: GroupRowProps) {
    const [open, setOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-border rounded-2xl overflow-hidden"
        >
            {/* Header row */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between px-5 py-4 bg-card hover:bg-muted/30 transition-colors text-left"
            >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">{group.label}</p>
                        {group.subLabel && (
                            <p className="text-xs text-muted-foreground">{group.subLabel}</p>
                        )}
                    </div>

                    <div className="hidden sm:flex items-center gap-6 shrink-0">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="w-3.5 h-3.5" />
                            {group.studentCount} students
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <BarChart2 className="w-3.5 h-3.5" />
                            {group.gradeCount} grades
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            {group.passRate}% pass
                        </span>
                        <GpaBar value={group.avgGPA} />
                    </div>
                </div>

                <motion.div
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-3 shrink-0"
                >
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </motion.div>
            </button>

            {/* Expanded grade rows */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        <div className="border-t border-border overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-muted/40 border-b border-border/50">
                                        <th className="px-4 py-2 text-left font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">Student</th>
                                        <th className="px-4 py-2 text-left font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">Course</th>
                                        <th className="px-4 py-2 text-center font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">Total</th>
                                        <th className="px-4 py-2 text-center font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">Grade</th>
                                        <th className="px-4 py-2 text-center font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">GP</th>
                                        <th className="px-4 py-2 text-center font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">Status</th>
                                        <th className="px-4 py-2 text-right font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {group.grades.map((grade) => (
                                        <tr key={grade.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors group/row">
                                            <td className="px-4 py-2.5">
                                                <p className="font-medium text-foreground">{grade.studentName}</p>
                                                <p className="text-[11px] text-muted-foreground font-mono">{grade.studentMatric}</p>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <p className="font-semibold text-foreground font-mono">{grade.courseCode}</p>
                                                <p className="text-[11px] text-muted-foreground max-w-36 truncate">{grade.courseName}</p>
                                            </td>
                                            <td className="px-4 py-2.5 text-center">
                                                <span className="font-mono font-bold text-foreground">{grade.totalScore ?? "—"}</span>
                                            </td>
                                            <td className="px-4 py-2.5 text-center">
                                                <span className="font-mono font-bold">{grade.gradeLetter ?? "—"}</span>
                                            </td>
                                            <td className="px-4 py-2.5 text-center">
                                                <span className="font-mono text-muted-foreground">{grade.gradePoint?.toFixed(2) ?? "—"}</span>
                                            </td>
                                            <td className="px-4 py-2.5 text-center">
                                                <StatusBadge {...STATUS_BADGE_MAP[grade.status]} />
                                            </td>
                                            <td className="px-4 py-2.5 text-right">
                                                <button
                                                    onClick={() => onViewGrade(grade)}
                                                    className="opacity-0 group-hover/row:opacity-100 p-1 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

interface GroupedViewProps {
    data: GroupedGradeData[];
    loading: boolean;
    onViewGrade: (grade: Grade) => void;
}

export function GradesGroupedView({ data, loading, onViewGrade }: GroupedViewProps) {
    if (loading) {
        return (
            <div className="space-y-3">
                {[80, 65, 75, 55].map((w, i) => (
                    <div key={i} className="h-16 bg-muted rounded-2xl animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
                ))}
            </div>
        );
    }

    if (data.length === 0) {
        return <EmptyState title="No grouped data" description="Adjust your filters to see grouped results." />;
    }

    return (
        <div className="space-y-3">
            {data.map((group) => (
                <GroupRow key={group.key} group={group} onViewGrade={onViewGrade} />
            ))}
        </div>
    );
}
