"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    CheckCircle2, XCircle, BookOpen, User, Calendar, Hash,
    ClipboardList, Loader2,
} from "lucide-react";
import Modal from "@/components/custom/Modal";
import StatusBadge from "@/components/custom/StatusBadge";
import type { Grade, GradeStatus } from "../../types/grades.types";
import { gradesService } from "../../services/grades.service";
import { useGradesStore } from "../../store/gradesStore";

type StatusVariant = "success" | "warning" | "destructive" | "info" | "default";

const STATUS_BADGE_MAP: Record<GradeStatus, { label: string; variant: StatusVariant }> = {
    PUBLISHED: { label: "Published", variant: "success" },
    APPROVED: { label: "Approved", variant: "info" },
    SUBMITTED: { label: "Submitted", variant: "warning" },
    DRAFT: { label: "Draft", variant: "default" },
};

interface InfoRowProps { label: string; value: React.ReactNode }
function InfoRow({ label, value }: InfoRowProps) {
    return (
        <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-xs font-medium text-foreground text-right max-w-48">{value}</span>
        </div>
    );
}

function GradeBar({ score, max, colour }: { score: number | null; max: number; colour: string }) {
    const pct = score !== null ? Math.min((score / max) * 100, 100) : 0;
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Score</span>
                <span className="font-mono font-bold text-foreground">{score ?? "—"} / {max}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                    className={`h-full ${colour} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}

interface GradeDetailModalProps {
    open: boolean;
    onClose: () => void;
    onGradeUpdated: (grade: Grade) => void;
}

export function GradeDetailModal({ open, onClose, onGradeUpdated }: GradeDetailModalProps) {
    const { selectedGrade, updateGradeInStore, actionLoadingId, setActionLoadingId } = useGradesStore();
    const [rejectRemarks, setRejectRemarks] = useState("");
    const [showRejectForm, setShowRejectForm] = useState(false);

    if (!selectedGrade) return null;
    const grade = selectedGrade;

    const handleApprove = async () => {
        setActionLoadingId(grade.id);
        try {
            const updated = await gradesService.approveGrade(grade.id);
            updateGradeInStore(updated);
            onGradeUpdated(updated);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleReject = async () => {
        if (!rejectRemarks.trim()) return;
        setActionLoadingId(grade.id);
        try {
            const updated = await gradesService.rejectGrade(grade.id, rejectRemarks.trim());
            updateGradeInStore(updated);
            onGradeUpdated(updated);
            setRejectRemarks("");
            setShowRejectForm(false);
        } finally {
            setActionLoadingId(null);
        }
    };

    const loading = actionLoadingId === grade.id;
    const canApprove = grade.status === "SUBMITTED";
    const canReject = grade.status === "SUBMITTED";

    const totalPct = grade.totalScore !== null ? Math.min((grade.totalScore / 100) * 100, 100) : 0;
    const totalColour =
        totalPct >= 70 ? "bg-emerald-500" :
            totalPct >= 50 ? "bg-blue-500" :
                totalPct >= 40 ? "bg-amber-500" :
                    "bg-red-500";

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="lg"
            title="Grade Details"
            subtitle={`${grade.studentName} · ${grade.courseCode}`}
            footer={
                (canApprove || canReject) ? (
                    <div className="flex items-center gap-2 flex-wrap">
                        {canReject && (
                            <button
                                onClick={() => setShowRejectForm((v) => !v)}
                                disabled={loading}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-destructive border border-destructive/30 rounded-xl hover:bg-destructive/10 transition disabled:opacity-50"
                            >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                            </button>
                        )}
                        {canApprove && (
                            <button
                                onClick={handleApprove}
                                disabled={loading}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 ml-auto"
                            >
                                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                Approve Grade
                            </button>
                        )}
                    </div>
                ) : null
            }
        >
            <div className="p-5 space-y-5">
                {/* Scores summary */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: "CA Score", value: grade.caScore, max: 40, colour: "bg-blue-500" },
                        { label: "Exam Score", value: grade.examScore, max: 60, colour: "bg-violet-500" },
                        { label: "Total", value: grade.totalScore, max: 100, colour: totalColour },
                    ].map((s) => (
                        <div key={s.label} className="bg-muted/30 rounded-xl p-3">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">{s.label}</p>
                            <GradeBar score={s.value} max={s.max} colour={s.colour} />
                        </div>
                    ))}
                </div>

                {/* Grade result */}
                <div className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3">
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Letter Grade</p>
                        <p className="text-3xl font-bold font-mono text-foreground">{grade.gradeLetter ?? "—"}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Grade Points</p>
                        <p className="text-3xl font-bold font-mono text-foreground">{grade.gradePoint?.toFixed(2) ?? "—"}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Status</p>
                        <StatusBadge {...STATUS_BADGE_MAP[grade.status]} dot />
                    </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                    <div>
                        <div className="flex items-center gap-1.5 mb-2">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                            <p className="text-xs font-semibold text-foreground">Student</p>
                        </div>
                        <InfoRow label="Name" value={grade.studentName} />
                        <InfoRow label="Matric" value={<span className="font-mono">{grade.studentMatric}</span>} />
                        <InfoRow label="Program" value={grade.programName} />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 mb-2">
                            <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                            <p className="text-xs font-semibold text-foreground">Course</p>
                        </div>
                        <InfoRow label="Code" value={<span className="font-mono">{grade.courseCode}</span>} />
                        <InfoRow label="Name" value={grade.courseName} />
                        <InfoRow label="Units" value={grade.creditUnits} />
                    </div>
                    <div className="sm:col-span-2 mt-3">
                        <div className="flex items-center gap-1.5 mb-2">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            <p className="text-xs font-semibold text-foreground">Period</p>
                        </div>
                        <InfoRow label="Semester" value={`${grade.semesterName} ${grade.academicYear}`} />
                        <InfoRow label="Academic Year" value={grade.academicYear} />
                        {grade.approvedByName && (
                            <InfoRow label="Approved by" value={grade.approvedByName} />
                        )}
                        {grade.remarks && (
                            <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <ClipboardList className="w-3 h-3 text-amber-600" />
                                    <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase">Remarks</p>
                                </div>
                                <p className="text-xs text-foreground">{grade.remarks}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reject form */}
                {showRejectForm && canReject && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="border border-destructive/30 rounded-xl p-4 bg-destructive/5"
                    >
                        <div className="flex items-center gap-1.5 mb-2">
                            <Hash className="w-3.5 h-3.5 text-destructive" />
                            <p className="text-xs font-semibold text-destructive">Rejection Reason</p>
                        </div>
                        <textarea
                            value={rejectRemarks}
                            onChange={(e) => setRejectRemarks(e.target.value)}
                            rows={3}
                            placeholder="Explain why this grade is being rejected…"
                            className="w-full text-xs bg-background border border-border rounded-xl p-3 resize-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={() => { setShowRejectForm(false); setRejectRemarks(""); }}
                                className="px-3 py-1.5 text-xs font-medium border border-border rounded-xl text-muted-foreground hover:text-foreground transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectRemarks.trim() || loading}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-destructive text-white rounded-xl hover:opacity-90 transition disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                                Confirm Reject
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </Modal>
    );
}
