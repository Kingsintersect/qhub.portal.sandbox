"use client";

import { motion } from "framer-motion";
import { Send, AlertTriangle, CheckCircle2, Loader2, Users, BookOpen, TrendingUp } from "lucide-react";
import Modal from "@/components/custom/Modal";
import type { Grade, PublishSummary } from "../../types/grades.types";
import { gradesService } from "../../services/grades.service";

interface StatChipProps { icon: React.ReactNode; label: string; value: string | number; colour: string }
function StatChip({ icon, label, value, colour }: StatChipProps) {
    return (
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${colour}`}>
            <div className="shrink-0">{icon}</div>
            <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className="text-sm font-bold text-foreground tabular-nums">{value}</p>
            </div>
        </div>
    );
}

interface PublishConfirmModalProps {
    open: boolean;
    onClose: () => void;
    selectedGrades: Grade[];
    onConfirm: () => Promise<void>;
    publishing: boolean;
    courseName: string;
    courseCode: string;
    semesterLabel: string;
    academicYear: string;
}

export function PublishConfirmModal({
    open,
    onClose,
    selectedGrades,
    onConfirm,
    publishing,
    courseName,
    courseCode,
    semesterLabel,
    academicYear,
}: PublishConfirmModalProps) {
    const summary: PublishSummary = gradesService.buildPublishSummary(selectedGrades);
    const approvedCount = selectedGrades.filter((g) => g.status === "APPROVED").length;
    const otherCount = selectedGrades.length - approvedCount;
    const hasNonApproved = otherCount > 0;

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="md"
            title="Confirm Publication"
            subtitle={`${courseCode} — ${courseName}`}
            footer={
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={onClose}
                        disabled={publishing}
                        className="px-4 py-2 text-xs font-medium border border-border rounded-xl text-muted-foreground hover:text-foreground transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onConfirm}
                        disabled={publishing || selectedGrades.length === 0}
                        className="flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition disabled:opacity-50"
                    >
                        {publishing ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Publishing…
                            </>
                        ) : (
                            <>
                                <Send className="w-3.5 h-3.5" />
                                Publish {selectedGrades.length} Result{selectedGrades.length !== 1 ? "s" : ""}
                            </>
                        )}
                    </motion.button>
                </div>
            }
        >
            <div className="p-5 space-y-4">
                {/* Context */}
                <div className="flex items-start gap-3 bg-muted/30 rounded-xl p-3">
                    <BookOpen className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                        <p className="text-xs font-semibold text-foreground">{courseCode} — {courseName}</p>
                        <p className="text-[11px] text-muted-foreground">{semesterLabel} · {academicYear}</p>
                    </div>
                </div>

                {/* Stats chips */}
                <div className="grid grid-cols-2 gap-2">
                    <StatChip
                        icon={<Users className="w-4 h-4 text-primary" />}
                        label="Students"
                        value={selectedGrades.length}
                        colour="border-border"
                    />
                    <StatChip
                        icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        label="Pass Rate"
                        value={`${summary.passRate}%`}
                        colour="border-emerald-200 dark:border-emerald-900/50"
                    />
                    <StatChip
                        icon={<TrendingUp className="w-4 h-4 text-blue-500" />}
                        label="Avg Score"
                        value={summary.avgScore !== null ? `${summary.avgScore}` : "—"}
                        colour="border-blue-200 dark:border-blue-900/50"
                    />
                    <StatChip
                        icon={<CheckCircle2 className="w-4 h-4 text-violet-500" />}
                        label="Approved"
                        value={approvedCount}
                        colour="border-violet-200 dark:border-violet-900/50"
                    />
                </div>

                {/* Warning for non-approved grades */}
                {hasNonApproved && (
                    <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                                {otherCount} grade{otherCount !== 1 ? "s" : ""} not yet approved
                            </p>
                            <p className="text-[11px] text-amber-600 dark:text-amber-500 mt-0.5">
                                These results will be published bypassing the approval step. Ensure you have proper authorisation.
                            </p>
                        </div>
                    </div>
                )}

                {/* Confirm note */}
                <p className="text-xs text-muted-foreground">
                    Once published, students will be able to view their results for this course. This action can only be reversed by an administrator.
                </p>
            </div>
        </Modal>
    );
}
