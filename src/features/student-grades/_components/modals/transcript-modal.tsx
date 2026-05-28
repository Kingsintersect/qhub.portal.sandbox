"use client";

import { motion } from "framer-motion";
import { TrendingUp, BookOpen, Award, Loader2 } from "lucide-react";
import Modal from "@/components/custom/Modal";
import StatusBadge from "@/components/custom/StatusBadge";
import type { GradeStatus, StudentTranscript } from "../../types/grades.types";

type StatusVariant = "success" | "warning" | "destructive" | "info" | "default";

const STATUS_BADGE_MAP: Record<GradeStatus, { label: string; variant: StatusVariant }> = {
    PUBLISHED: { label: "Published", variant: "success" },
    APPROVED: { label: "Approved", variant: "info" },
    SUBMITTED: { label: "Submitted", variant: "warning" },
    DRAFT: { label: "Draft", variant: "default" },
};

function CgpaBar({ value }: { value: number }) {
    const pct = Math.min((value / 5) * 100, 100);
    const colour = value >= 4.0 ? "bg-emerald-500" : value >= 3.0 ? "bg-blue-500" : value >= 2.0 ? "bg-amber-500" : "bg-red-500";
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                    className={`h-full ${colour} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </div>
            <span className="text-xs font-mono font-bold tabular-nums w-8">{value.toFixed(2)}</span>
        </div>
    );
}

interface TranscriptModalProps {
    open: boolean;
    onClose: () => void;
    transcript: StudentTranscript | null;
    loading: boolean;
}

export function TranscriptModal({ open, onClose, transcript, loading }: TranscriptModalProps) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            size="xl"
            title="Student Transcript"
            subtitle={transcript ? `${transcript.studentMatric} · ${transcript.programName}` : "Loading…"}
        >
            {loading && (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
            )}

            {!loading && transcript && (
                <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                    {/* Header card */}
                    <div className="flex flex-wrap items-start gap-4 bg-muted/30 rounded-2xl p-4">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-foreground text-base">{transcript.studentName}</h3>
                            <p className="text-xs text-muted-foreground font-mono">{transcript.studentMatric}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{transcript.programName} ({transcript.programCode})</p>
                            <p className="text-xs text-muted-foreground">{transcript.level}</p>
                        </div>
                        <div className="flex items-center gap-6 flex-wrap shrink-0">
                            <div className="text-center">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">CGPA</p>
                                <p className="text-2xl font-bold font-mono text-primary">{transcript.currentCGPA.toFixed(2)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Credit Units</p>
                                <p className="text-2xl font-bold font-mono text-foreground">{transcript.totalCreditUnits}</p>
                            </div>
                        </div>
                    </div>

                    {/* CGPA History */}
                    {transcript.cgpaHistory.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                <p className="text-sm font-semibold text-foreground">GPA / CGPA History</p>
                            </div>
                            <div className="space-y-2">
                                {transcript.cgpaHistory.map((h, i) => (
                                    <motion.div
                                        key={h.id}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="flex items-center gap-4 bg-card border border-border rounded-xl px-4 py-3"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-semibold text-foreground">{h.semesterName}</p>
                                            <p className="text-[11px] text-muted-foreground">{h.academicYear} · {h.totalCreditUnits} units</p>
                                        </div>
                                        <div className="flex items-center gap-4 shrink-0 min-w-48">
                                            <div className="flex-1">
                                                <p className="text-[10px] text-muted-foreground mb-1">GPA</p>
                                                <CgpaBar value={h.gpa} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-muted-foreground mb-1">CGPA</p>
                                                <CgpaBar value={h.cgpa} />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Grades by semester */}
                    {(() => {
                        const bySemester = new Map<string, typeof transcript.grades>();
                        for (const g of transcript.grades) {
                            const key = `${g.semesterId}-${g.academicYear}`;
                            const arr = bySemester.get(key) ?? [];
                            arr.push(g);
                            bySemester.set(key, arr);
                        }
                        return Array.from(bySemester.entries()).map(([key, semGrades]) => {
                            const g0 = semGrades[0];
                            return (
                                <div key={key}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                                        <p className="text-sm font-semibold text-foreground">
                                            {g0.semesterName} — {g0.academicYear}
                                        </p>
                                    </div>
                                    <div className="border border-border rounded-xl overflow-hidden">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="bg-muted/40 border-b border-border">
                                                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground uppercase text-[10px] tracking-wide">Course</th>
                                                    <th className="px-4 py-2.5 text-center font-semibold text-muted-foreground uppercase text-[10px] tracking-wide">Units</th>
                                                    <th className="px-4 py-2.5 text-center font-semibold text-muted-foreground uppercase text-[10px] tracking-wide">CA</th>
                                                    <th className="px-4 py-2.5 text-center font-semibold text-muted-foreground uppercase text-[10px] tracking-wide">Exam</th>
                                                    <th className="px-4 py-2.5 text-center font-semibold text-muted-foreground uppercase text-[10px] tracking-wide">Total</th>
                                                    <th className="px-4 py-2.5 text-center font-semibold text-muted-foreground uppercase text-[10px] tracking-wide">Grade</th>
                                                    <th className="px-4 py-2.5 text-center font-semibold text-muted-foreground uppercase text-[10px] tracking-wide">GP</th>
                                                    <th className="px-4 py-2.5 text-center font-semibold text-muted-foreground uppercase text-[10px] tracking-wide">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {semGrades.map((g) => (
                                                    <tr key={g.id} className="border-b border-border/30 last:border-0">
                                                        <td className="px-4 py-2.5">
                                                            <p className="font-semibold font-mono text-foreground">{g.courseCode}</p>
                                                            <p className="text-[11px] text-muted-foreground">{g.courseName}</p>
                                                        </td>
                                                        <td className="px-4 py-2.5 text-center font-mono text-foreground">{g.creditUnits}</td>
                                                        <td className="px-4 py-2.5 text-center font-mono text-foreground">{g.caScore ?? "—"}</td>
                                                        <td className="px-4 py-2.5 text-center font-mono text-foreground">{g.examScore ?? "—"}</td>
                                                        <td className="px-4 py-2.5 text-center font-mono font-bold text-foreground">{g.totalScore ?? "—"}</td>
                                                        <td className="px-4 py-2.5 text-center font-mono font-bold text-foreground">{g.gradeLetter ?? "—"}</td>
                                                        <td className="px-4 py-2.5 text-center font-mono text-muted-foreground">{g.gradePoint?.toFixed(2) ?? "—"}</td>
                                                        <td className="px-4 py-2.5 text-center">
                                                            <StatusBadge {...STATUS_BADGE_MAP[g.status]} />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        });
                    })()}

                    {/* Footer note */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-4">
                        <Award className="w-3.5 h-3.5 shrink-0" />
                        <span>{`This transcript is for internal review only. Official transcripts require the Registrar's seal.`}</span>
                    </div>
                </div>
            )}
        </Modal>
    );
}
