"use client";

import { motion } from "framer-motion";
import { BookOpen, ClipboardList, MessageSquare, ExternalLink, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/custom/StatusBadge";
// import { cn } from "@/lib/utils";
import { useAssessmentDetail } from "../hooks/use-assessment-detail";
import type { AssessmentType } from "../types";

const typeConfig: Record<AssessmentType, { icon: React.ElementType; label: string; badge: "info" | "purple" | "orange" }> = {
    assignment: { icon: ClipboardList, label: "Assignment", badge: "info" },
    quiz: { icon: BookOpen, label: "Quiz", badge: "purple" },
    forum: { icon: MessageSquare, label: "Forum", badge: "orange" },
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-3 border-b border-border last:border-none">
            <span className="text-xs font-medium text-muted-foreground w-36 shrink-0">{label}</span>
            <span className="text-sm text-foreground">{value}</span>
        </div>
    );
}

function DetailSkeleton() {
    return (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 animate-pulse">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-muted/60" />
                <div className="space-y-2 flex-1">
                    <div className="h-3 bg-muted/60 rounded w-24" />
                    <div className="h-5 bg-muted/60 rounded w-64" />
                </div>
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-muted/60 rounded w-full" />
            ))}
        </div>
    );
}

interface AssessmentDetailViewProps {
    id: number;
    backHref?: string;
}

export function AssessmentDetailView({ id, backHref }: AssessmentDetailViewProps) {
    const { data, isLoading, isError, refetch, isFetching } = useAssessmentDetail(id);

    if (isLoading) return <DetailSkeleton />;

    if (isError || !data) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                <p className="text-muted-foreground text-sm">Failed to load assessment. It may have been removed.</p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                    <RefreshCw size={14} className="mr-2" /> Retry
                </Button>
            </div>
        );
    }

    const { icon: Icon, label: typeLabel, badge } = typeConfig[data.assessmentType];

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Back link */}
            {backHref && (
                <Link
                    href={backHref}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft size={14} /> Back
                </Link>
            )}

            {/* Header card */}
            <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                        <Icon size={22} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <StatusBadge label={typeLabel} variant={badge} />
                            <StatusBadge label={data.isVisible ? "Visible" : "Hidden"} variant={data.isVisible ? "success" : "default"} />
                        </div>
                        <h1 className="mt-2 text-xl font-bold text-foreground leading-snug">{data.name}</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {data.course.courseOffering.course.code} — {data.course.courseOffering.course.title}
                        </p>
                    </div>

                    {isFetching && <RefreshCw size={14} className="text-muted-foreground animate-spin shrink-0 mt-1" />}
                </div>

                {data.description && (
                    <div className="mt-4 p-4 bg-muted/30 rounded-xl">
                        <p className="text-sm text-foreground leading-relaxed">{data.description}</p>
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="bg-card border border-border rounded-2xl px-6">
                <InfoRow
                    label="Due date"
                    value={
                        data.dueDate
                            ? new Date(data.dueDate).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" })
                            : <span className="text-muted-foreground">No deadline</span>
                    }
                />
                <InfoRow
                    label="Max grade"
                    value={data.maxGrade !== null ? `${data.maxGrade} marks` : <span className="text-muted-foreground">Ungraded</span>}
                />
                <InfoRow
                    label="Semester"
                    value={`${data.course.courseOffering.semester.name} — ${data.course.courseOffering.academicSession.name}`}
                />
                <InfoRow
                    label="Moodle course"
                    value={
                        <span className="flex items-center gap-1.5">
                            {data.course.moodleFullName}
                            <ExternalLink size={12} className="text-muted-foreground" />
                        </span>
                    }
                />
                <InfoRow
                    label="Last synced"
                    value={
                        data.lastSyncAt
                            ? new Date(data.lastSyncAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
                            : <span className="text-muted-foreground">Never</span>
                    }
                />
            </div>
        </motion.div>
    );
}
