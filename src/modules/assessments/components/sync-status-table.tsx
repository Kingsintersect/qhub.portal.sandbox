"use client";

import { motion } from "framer-motion";
import { RefreshCw, Loader2, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/custom/StatusBadge";
import { cn } from "@/lib/utils";
import { useSyncStatus } from "../hooks/use-sync-status";
import { useSyncCourse, useRetrySyncCourse, useSyncAll } from "../hooks/use-assessment-mutations";
import type { SyncStatus } from "../types";

// ── Status config ─────────────────────────────────────────────────────────────

const statusConfig: Record<SyncStatus, { icon: React.ElementType; badge: "success" | "warning" | "destructive" | "info"; label: string }> = {
    SYNCED: { icon: CheckCircle2, badge: "success", label: "Synced" },
    PENDING: { icon: Clock, badge: "info", label: "Pending" },
    FAILED: { icon: XCircle, badge: "destructive", label: "Failed" },
    STALE: { icon: AlertTriangle, badge: "warning", label: "Stale" },
};

function formatLastSync(lastSyncAt: string | null): string {
    if (!lastSyncAt) return "Never";
    const diff = Math.floor((Date.now() - new Date(lastSyncAt).getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
}

// ── Summary tiles ─────────────────────────────────────────────────────────────

function SummaryTile({ label, value, variant }: { label: string; value: number; variant: "success" | "warning" | "destructive" | "info" | "default" }) {
    const colours: Record<string, string> = {
        success: "text-emerald-600 dark:text-emerald-400",
        warning: "text-amber-600 dark:text-amber-400",
        destructive: "text-red-600 dark:text-red-400",
        info: "text-blue-600 dark:text-blue-400",
        default: "text-foreground",
    };

    return (
        <div className="flex flex-col items-center px-4 py-3 bg-muted/30 rounded-xl gap-0.5">
            <span className={cn("text-2xl font-bold tabular-nums", colours[variant])}>{value}</span>
            <span className="text-[11px] text-muted-foreground">{label}</span>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export function SyncStatusTable() {
    const { data, isLoading, isError, refetch, isFetching } = useSyncStatus();
    const syncCourse = useSyncCourse();
    const retryCourse = useRetrySyncCourse();
    const syncAll = useSyncAll();

    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-muted/40 rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
                <p className="text-sm text-muted-foreground">Failed to load sync status.</p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                    <RefreshCw size={14} className="mr-2" /> Retry
                </Button>
            </div>
        );
    }

    const { summary, courses } = data;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Summary row */}
            <div className="flex flex-wrap gap-3">
                <SummaryTile label="Total Courses" value={summary.totalCourses} variant="default" />
                <SummaryTile label="Total Assessments" value={summary.totalAssessments} variant="default" />
                <SummaryTile label="Synced" value={summary.byStatus.SYNCED} variant="success" />
                <SummaryTile label="Stale" value={summary.byStatus.STALE} variant="warning" />
                <SummaryTile label="Failed" value={summary.byStatus.FAILED} variant="destructive" />
                <SummaryTile label="Pending" value={summary.byStatus.PENDING} variant="info" />
            </div>

            {/* Sync all button */}
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Course Sync Status</h3>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        disabled={isFetching}
                        onClick={() => refetch()}
                    >
                        {isFetching ? <Loader2 size={12} className="mr-1 animate-spin" /> : <RefreshCw size={12} className="mr-1" />}
                        Refresh
                    </Button>
                    <Button
                        size="sm"
                        className="h-8 text-xs"
                        disabled={syncAll.isPending}
                        onClick={() => syncAll.mutate()}
                    >
                        {syncAll.isPending ? <Loader2 size={12} className="mr-1 animate-spin" /> : <RefreshCw size={12} className="mr-1" />}
                        Sync All
                    </Button>
                </div>
            </div>

            {/* Per-course table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5 border-b border-border bg-muted/20">
                    <span>Course</span>
                    <span className="text-right">Assessments</span>
                    <span className="text-right px-4">Last Synced</span>
                    <span className="text-right px-4">Status</span>
                    <span className="text-right">Action</span>
                </div>

                {courses.map((c, idx) => {
                    const syncStatus: SyncStatus = c.failedCount > 0 ? "FAILED" : c.lastSyncAt && (Date.now() - new Date(c.lastSyncAt).getTime()) > 24 * 60 * 60 * 1000 ? "STALE" : "SYNCED";
                    const { badge } = statusConfig[syncStatus];
                    const isSyncing = syncCourse.isPending || retryCourse.isPending;

                    return (
                        <motion.div
                            key={c.courseOfferingId}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center px-4 py-3.5 border-b border-border/50 last:border-none hover:bg-muted/20 transition-colors text-sm"
                        >
                            <div>
                                <span className="font-semibold text-foreground">{c.courseCode}</span>
                                <span className="text-xs text-muted-foreground ml-2">#{c.moodleCourseId}</span>
                            </div>
                            <span className="text-right tabular-nums font-medium">{c.assessmentCount}</span>
                            <span className="text-right text-xs text-muted-foreground px-4">{formatLastSync(c.lastSyncAt)}</span>
                            <div className="text-right px-4">
                                <StatusBadge label={syncStatus} variant={badge} dot />
                            </div>
                            <div className="flex justify-end">
                                {syncStatus === "FAILED" ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs"
                                        disabled={isSyncing}
                                        onClick={() => retryCourse.mutate(c.moodleCourseId)}
                                    >
                                        {isSyncing ? <Loader2 size={11} className="animate-spin" /> : "Retry"}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs"
                                        disabled={isSyncing}
                                        onClick={() => syncCourse.mutate(c.moodleCourseId)}
                                    >
                                        {isSyncing ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
