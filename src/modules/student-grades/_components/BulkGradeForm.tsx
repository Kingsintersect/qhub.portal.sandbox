"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronDown, Send, Check, AlertCircle, Loader2 } from "lucide-react";
import {
   COURSES,
   SEMESTERS,
   MOCK_GRADES,
} from "../services/grades.service";
// Real API: import apiClient from "@/lib/clients/apiClient";

// ─── Mock: tutor is assigned CSC courses ──────────────────────────────────────
// Real API: GET /api/v1/timetable/me → filter by offering → get courseIds
const MY_COURSES = COURSES.filter((c) => c.programId === "csc");

interface ScoreEntry {
   studentId: number;
   studentName: string;
   studentMatric: string;
   existingStatus: string | null;
   caScore: string;
   examScore: string;
   locked: boolean;
}

interface SubmitResult {
   saved: number;
   errors: string[];
}

export function BulkGradeForm() {
   const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
   const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
   const [entries, setEntries] = useState<ScoreEntry[]>([]);
   const [loaded, setLoaded] = useState(false);
   const [submitting, setSubmitting] = useState(false);
   const [result, setResult] = useState<SubmitResult | null>(null);

   const loadStudents = useCallback(() => {
      if (!selectedCourse || !selectedSemester) return;
      // Real API: GET /results/grades?courseId=X&semesterId=Y&tutorId=me
      const existing = MOCK_GRADES.filter(
         (g) => g.courseId === selectedCourse && g.semesterId === selectedSemester
      );
      const loaded: ScoreEntry[] = existing.map((g) => ({
         studentId: g.studentId,
         studentName: g.studentName,
         studentMatric: g.studentMatric,
         existingStatus: g.status,
         caScore: g.caScore?.toString() ?? "",
         examScore: g.examScore?.toString() ?? "",
         locked: g.status === "APPROVED" || g.status === "PUBLISHED",
      }));
      setEntries(loaded);
      setLoaded(true);
      setResult(null);
   }, [selectedCourse, selectedSemester]);

   const updateScore = (idx: number, field: "caScore" | "examScore", value: string) => {
      setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e)));
   };

   const handleSubmit = async () => {
      setSubmitting(true);
      setResult(null);
      try {
         // Real API: POST /results/grades/bulk { courseId: selectedCourse, semesterId: selectedSemester, grades: [...] }
         await new Promise<void>((res) => setTimeout(res, 700));
         const editable = entries.filter((e) => !e.locked);
         setResult({ saved: editable.length, errors: [] });
      } finally {
         setSubmitting(false);
      }
   };

   const editableCount = entries.filter((e) => !e.locked).length;

   return (
      <div className="space-y-6">
         {/* Selectors */}
         <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div>
               <h2 className="text-sm font-semibold text-foreground">Select Course & Semester</h2>
               <p className="text-xs text-muted-foreground mt-0.5">Load students to begin entering grades</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {/* Course */}
               <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Course</label>
                  <div className="relative">
                     <select
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        value={selectedCourse ?? ""}
                        onChange={(e) => { setSelectedCourse(Number(e.target.value) || null); setLoaded(false); setResult(null); }}
                     >
                        <option value="">Select course…</option>
                        {MY_COURSES.map((c) => (
                           <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                        ))}
                     </select>
                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  </div>
               </div>
               {/* Semester */}
               <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Semester</label>
                  <div className="relative">
                     <select
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        value={selectedSemester ?? ""}
                        onChange={(e) => { setSelectedSemester(e.target.value || null); setLoaded(false); setResult(null); }}
                     >
                        <option value="">Select semester…</option>
                        {SEMESTERS.map((s) => (
                           <option key={s.id} value={s.id}>{s.academicYear} — {s.label}</option>
                        ))}
                     </select>
                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  </div>
               </div>
            </div>
            <button
               className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
               onClick={loadStudents}
               disabled={!selectedCourse || !selectedSemester}
            >
               <BookOpen size={14} />
               Load Students
            </button>
         </div>

         {/* Grade entry table */}
         {loaded && (
            <motion.div
               initial={{ opacity: 0, y: 8 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-card border border-border rounded-2xl overflow-hidden"
            >
               <div className="flex items-center justify-between px-5 py-3 bg-muted/30 border-b border-border">
                  <div>
                     <p className="text-sm font-semibold text-foreground">Grade Entry</p>
                     <p className="text-xs text-muted-foreground">
                        {entries.length} students — CA max 40 pts, Exam max 60 pts
                        {editableCount < entries.length && ` · ${entries.length - editableCount} locked (approved/published)`}
                     </p>
                  </div>
               </div>

               {entries.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                     <AlertCircle size={28} className="opacity-40" />
                     <p className="text-sm">No students found for this selection.</p>
                  </div>
               ) : (
                  <>
                     <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                           <thead>
                              <tr className="bg-muted/20 border-b border-border">
                                 {["Student", "Matric No.", "CA (0–40)", "Exam (0–60)", "Total", "Status"].map((h) => (
                                    <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted-foreground uppercase text-[10px] tracking-wide whitespace-nowrap">
                                       {h}
                                    </th>
                                 ))}
                              </tr>
                           </thead>
                           <tbody>
                              {entries.map((entry, idx) => {
                                 const ca = parseFloat(entry.caScore) || 0;
                                 const exam = parseFloat(entry.examScore) || 0;
                                 const total = entry.caScore || entry.examScore ? ca + exam : null;
                                 const statusChip: Record<string, string> = {
                                    PUBLISHED: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300",
                                    APPROVED: "text-blue-700 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-300",
                                    SUBMITTED: "text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-300",
                                    DRAFT: "text-slate-600 bg-slate-100 dark:bg-slate-800/50",
                                 };
                                 return (
                                    <tr key={entry.studentId} className={`border-b border-border/30 last:border-0 ${entry.locked ? "opacity-60" : ""}`}>
                                       <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">{entry.studentName}</td>
                                       <td className="px-3 py-2.5 font-mono text-muted-foreground">{entry.studentMatric}</td>
                                       <td className="px-3 py-2.5">
                                          <input
                                             type="number" min={0} max={40} step={0.5}
                                             className="w-20 bg-background border border-border rounded-lg px-2 py-1 text-xs text-center font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-muted/30 disabled:cursor-not-allowed"
                                             value={entry.caScore}
                                             onChange={(e) => updateScore(idx, "caScore", e.target.value)}
                                             disabled={entry.locked}
                                             placeholder="—"
                                          />
                                       </td>
                                       <td className="px-3 py-2.5">
                                          <input
                                             type="number" min={0} max={60} step={0.5}
                                             className="w-20 bg-background border border-border rounded-lg px-2 py-1 text-xs text-center font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-muted/30 disabled:cursor-not-allowed"
                                             value={entry.examScore}
                                             onChange={(e) => updateScore(idx, "examScore", e.target.value)}
                                             disabled={entry.locked}
                                             placeholder="—"
                                          />
                                       </td>
                                       <td className="px-3 py-2.5 text-center font-mono font-bold text-foreground">
                                          {total !== null ? total : "—"}
                                       </td>
                                       <td className="px-3 py-2.5">
                                          {entry.existingStatus ? (
                                             <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${statusChip[entry.existingStatus] ?? ""}`}>
                                                {entry.existingStatus}
                                             </span>
                                          ) : (
                                             <span className="text-muted-foreground text-[11px]">New</span>
                                          )}
                                       </td>
                                    </tr>
                                 );
                              })}
                           </tbody>
                        </table>
                     </div>

                     {/* Actions */}
                     <div className="flex items-center justify-between px-5 py-4 bg-muted/10 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                           Grades are locked once approved or published.
                        </p>
                        <button
                           onClick={handleSubmit}
                           disabled={submitting || editableCount === 0}
                           className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           {submitting
                              ? <Loader2 size={13} className="animate-spin" />
                              : <Send size={13} />
                           }
                           Submit for Approval
                        </button>
                     </div>
                  </>
               )}
            </motion.div>
         )}

         {/* Result banner */}
         {result && (
            <motion.div
               initial={{ opacity: 0, y: -4 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4"
            >
               <Check size={16} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
               <div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                     {result.saved} grade{result.saved !== 1 ? "s" : ""} submitted for approval
                  </p>
                  <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                     An HOD or administrator will review and approve them.
                  </p>
               </div>
            </motion.div>
         )}
      </div>
   );
}
