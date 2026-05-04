"use client";

import { motion } from "framer-motion";
import { ExternalLink, Clock, Monitor, MapPin, ArrowRight, Tag } from "lucide-react";
import Link from "next/link";
import Modal from "@/components/custom/Modal";
import { ActionBadge } from "./ActionBadge";
import { useAuditStore } from "../store/audit.store";
import { formatDateTime } from "@/lib/utils/date.utils";
import { Badge } from "@/components/ui/badge";

// ─── Diff section ─────────────────────────────────────────────────────────────

function ValuesDiff({
    oldValues,
    newValues,
}: {
    oldValues: Record<string, unknown> | null;
    newValues: Record<string, unknown> | null;
}) {
    if (!oldValues && !newValues) return null;

    const keys = Array.from(
        new Set([
            ...Object.keys(oldValues ?? {}),
            ...Object.keys(newValues ?? {}),
        ]),
    );

    return (
        <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Changes
            </p>

            <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2 text-xs">
                {/* Old */}
                <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3 border border-red-200 dark:border-red-900">
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                        Before
                    </p>
                    {oldValues && keys.length > 0 ? (
                        keys
                            .filter((k) => k in (oldValues ?? {}))
                            .map((k) => (
                                <div key={k} className="flex items-baseline gap-1 mb-0.5">
                                    <span className="font-mono text-[9px] text-red-500 shrink-0">{k}:</span>
                                    <span className="text-red-700 dark:text-red-300 break-all">
                                        {String(oldValues[k])}
                                    </span>
                                </div>
                            ))
                    ) : (
                        <p className="text-[10px] text-muted-foreground italic">No prior values</p>
                    )}
                </div>

                <div className="flex items-center justify-center pt-6">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>

                {/* New */}
                <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-3 border border-green-200 dark:border-green-900">
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                        After
                    </p>
                    {newValues && keys.length > 0 ? (
                        keys
                            .filter((k) => k in (newValues ?? {}))
                            .map((k) => (
                                <div key={k} className="flex items-baseline gap-1 mb-0.5">
                                    <span className="font-mono text-[9px] text-green-500 shrink-0">{k}:</span>
                                    <span className="text-green-700 dark:text-green-300 break-all">
                                        {String(newValues[k])}
                                    </span>
                                </div>
                            ))
                    ) : (
                        <p className="text-[10px] text-muted-foreground italic">No new values</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function AuditDetailModal() {
    const { selectedLog, isDetailModalOpen, setDetailModalOpen, setSelectedLog } =
        useAuditStore();

    function handleClose() {
        setDetailModalOpen(false);
        setSelectedLog(null);
    }

    if (!selectedLog) return null;

    return (
        <Modal
            open={isDetailModalOpen}
            onClose={handleClose}
            title="Audit Log Details"
            subtitle={`Entry #${selectedLog.id}`}
            size="xl"
        >
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
            >
                {/* Actor + action header */}
                <div className="flex flex-wrap items-start gap-3 rounded-xl bg-muted/50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {selectedLog.user.firstName[0]}
                        {selectedLog.user.lastName[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground">
                            {selectedLog.user.firstName} {selectedLog.user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{selectedLog.user.email}</p>
                    </div>
                    <ActionBadge action={selectedLog.action} />
                </div>

                {/* Entity + deep links */}
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">Entity:</span>
                    <Badge variant="outline" className="text-xs">
                        {selectedLog.entityType}
                    </Badge>
                    <span className="text-xs text-muted-foreground">#{selectedLog.entityId}</span>
                    <div className="ml-auto flex flex-wrap gap-2">
                        <Link
                            href={`/admin/audit/entity/${selectedLog.entityType}/${selectedLog.entityId}`}
                            onClick={handleClose}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                            Entity trail
                            <ExternalLink className="h-3 w-3" />
                        </Link>
                        <Link
                            href={`/admin/audit/user/${selectedLog.userId}`}
                            onClick={handleClose}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                            User trail
                            <ExternalLink className="h-3 w-3" />
                        </Link>
                    </div>
                </div>

                {/* Diff */}
                <ValuesDiff
                    oldValues={selectedLog.oldValues}
                    newValues={selectedLog.newValues}
                />

                {/* Meta row */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <div>
                            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Timestamp
                            </p>
                            <p className="text-xs font-medium text-foreground">
                                {formatDateTime(selectedLog.createdAt)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <div>
                            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                IP Address
                            </p>
                            <p className="text-xs font-medium font-mono text-foreground">
                                {selectedLog.ipAddress ?? "—"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2.5">
                        <Monitor className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                User Agent
                            </p>
                            <p className="truncate text-xs font-medium text-foreground">
                                {selectedLog.userAgent
                                    ? selectedLog.userAgent.slice(0, 28) + "…"
                                    : "—"}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </Modal>
    );
}
