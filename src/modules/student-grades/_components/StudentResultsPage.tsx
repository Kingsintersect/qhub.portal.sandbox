"use client";

import { motion } from "framer-motion";
import { Award, BookOpen, TrendingUp, Clock, GraduationCap } from "lucide-react";
import { useStudentTranscript } from "../hooks/use-grades-data";
import type { Grade, CgpaHistoryEntry } from "../types/grades.types";

// ─── Grade colour map ──────────────────────────────────────────────────────────

const GRADE_CHIP: Record<string, string> = {
   A: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300",
   AB: "text-teal-700 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-300",
   B: "text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300",
   BC: "text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-300",
   C: "text-violet-700 bg-violet-50 dark:bg-violet-950/40 dark:text-violet-300",
   CD: "text-orange-700 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-300",
   D: "text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300",
   F: "text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300",
};

const STATUS_CHIP: Record<string, string> = {
   PUBLISHED: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300",
   APPROVED: "text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300",
   SUBMITTED: "text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300",
   DRAFT: "text-slate-600 bg-slate-100 dark:bg-slate-800/50 dark:text-slate-300",
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function GradeLetterBadge({ letter }: { letter: string | null }) {
   if (!letter) return <span className="text-muted-foreground font-mono">—</span>;
   return (
      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${GRADE_CHIP[letter] ?? "text-foreground bg-muted"}`}>
         {letter}
      </span>
   );
}

function StatusPill({ status }: { status: string }) {
   return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${STATUS_CHIP[status] ?? ""}`}>
         {status}
      </span>
   );
}

function GradeRow({ grade }: { grade: Grade }) {
   return (
      <tr className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
         <td className="px-3 py-2.5">
            <p className="text-xs font-semibold text-foreground">{grade.courseCode}</p>
            <p className="text-[11px] text-muted-foreground leading-tight">{grade.courseName}</p>
         </td>
         <td className="px-3 py-2.5 text-center text-xs font-mono">{grade.caScore ?? "—"}</td>
         <td className="px-3 py-2.5 text-center text-xs font-mono">{grade.examScore ?? "—"}</td>
         <td className="px-3 py-2.5 text-center text-xs font-mono font-bold text-foreground">{grade.totalScore ?? "—"}</td>
         <td className="px-3 py-2.5 text-center"><GradeLetterBadge letter={grade.gradeLetter} /></td>
         <td className="px-3 py-2.5 text-center text-xs font-mono">{grade.gradePoint?.toFixed(2) ?? "—"}</td>
         <td className="px-3 py-2.5 text-center text-xs text-muted-foreground">{grade.creditUnits}</td>
         <td className="px-3 py-2.5 text-center"><StatusPill status={grade.status} /></td>
      </tr>
   );
}

// ─── CGPA history mini-chart ───────────────────────────────────────────────────

function CgpaHistorySection({ history }: { history: CgpaHistoryEntry[] }) {
   if (!history.length) return null;
   const max = 5;
   return (
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
         <div className="px-4 py-3 bg-muted/30 border-b border-border">
            <p className="text-sm font-semibold text-foreground">CGPA History</p>
            <p className="text-xs text-muted-foreground">Cumulative grade point average per semester</p>
         </div>
         <div className="p-4 space-y-3">
            {history.map((entry, idx) => (
               <div key={entry.id} className="flex items-center gap-3">
                  <div className="w-32 shrink-0">
                     <p className="text-[11px] font-medium text-foreground truncate">{entry.semesterName}</p>
                     <p className="text-[10px] text-muted-foreground">{entry.academicYear}</p>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                     <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                           className="h-full bg-primary rounded-full"
                           initial={{ width: 0 }}
                           animate={{ width: `${(entry.cgpa / max) * 100}%` }}
                           transition={{ delay: idx * 0.05, duration: 0.5, ease: "easeOut" }}
                        />
                     </div>
                     <span className="text-xs font-mono font-bold text-foreground w-10 text-right">
                        {entry.cgpa.toFixed(2)}
                     </span>
                  </div>
                  <div className="w-14 text-right">
                     <p className="text-[10px] text-muted-foreground">GPA</p>
                     <p className="text-xs font-mono font-semibold text-foreground">{entry.gpa.toFixed(2)}</p>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function StudentResultsPage() {
   // Real API: const user = useAppStore(s => s.user); const studentId = user?.studentId ?? null;
   // useStudentTranscript(studentId) → GET /results/grades/student/me
   const { transcript, loading } = useStudentTranscript(1);

   // Group grades by semester (most recent first)
   const bySemester = transcript?.grades.reduce<Record<string, Grade[]>>((acc, g) => {
      const key = `${g.academicYear}::${g.semesterId}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(g);
      return acc;
   }, {}) ?? {};

   const semesters = Object.entries(bySemester)
      .map(([key, grades]) => {
         const wSum = grades.reduce((a, g) => a + (g.gradePoint ?? 0) * g.creditUnits, 0);
         const cuSum = grades.reduce((a, g) => a + g.creditUnits, 0);
         const semesterId = parseInt(grades[0].semesterId.replace("sem-", ""));
         return {
            key,
            label: grades[0].semesterName,
            academicYear: grades[0].academicYear,
            semesterId,
            grades,
            gpa: cuSum ? Math.round((wSum / cuSum) * 100) / 100 : 0,
         };
      })
      .sort((a, b) => b.semesterId - a.semesterId); // most recent first

   if (loading) {
      return (
         <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
               {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-muted/50 rounded-2xl" />)}
            </div>
            {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-muted/50 rounded-2xl" />)}
         </div>
      );
   }

   if (!transcript) return null;

   return (
      <div className="space-y-6">
         {/* Header stats */}
         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
               { label: "Current CGPA", value: transcript.currentCGPA.toFixed(2), icon: Award, color: "text-primary" },
               { label: "Credit Units Earned", value: transcript.totalCreditUnits, icon: BookOpen, color: "text-blue-500" },
               { label: "Program", value: transcript.programCode, icon: GraduationCap, color: "text-violet-500" },
               { label: "Semesters Completed", value: semesters.length, icon: Clock, color: "text-amber-500" },
            ].map((stat) => (
               <div key={stat.label} className="bg-card border border-border rounded-2xl p-4">
                  <stat.icon size={16} className={`mb-2 ${stat.color}`} />
                  <p className="text-lg font-bold font-mono text-foreground">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground">{stat.label}</p>
               </div>
            ))}
         </div>

         {/* CGPA history */}
         {transcript.cgpaHistory.length > 0 && (
            <CgpaHistorySection history={transcript.cgpaHistory} />
         )}

         {/* Grades by semester */}
         <div className="space-y-1 flex items-center gap-2">
            <TrendingUp size={15} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Semester Results</h2>
         </div>

         {semesters.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground border border-dashed border-border rounded-2xl">
               <BookOpen size={36} className="opacity-30" />
               <p className="text-sm">No results available yet.</p>
               <p className="text-xs opacity-70">Results will appear here once published.</p>
            </div>
         ) : (
            semesters.map((sem, idx) => (
               <motion.div
                  key={sem.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden"
               >
                  {/* Semester header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
                     <div>
                        <p className="text-sm font-semibold text-foreground">{sem.label}</p>
                        <p className="text-xs text-muted-foreground">{sem.academicYear}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Semester GPA</p>
                        <p className="text-base font-bold font-mono text-foreground">{sem.gpa.toFixed(2)}<span className="text-xs font-normal text-muted-foreground"> / 5.0</span></p>
                     </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                     <table className="w-full text-xs">
                        <thead>
                           <tr className="bg-muted/20 border-b border-border">
                              {["Course", "CA", "Exam", "Total", "Grade", "GP", "Units", "Status"].map((h) => (
                                 <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted-foreground uppercase text-[10px] tracking-wide whitespace-nowrap">
                                    {h}
                                 </th>
                              ))}
                           </tr>
                        </thead>
                        <tbody>
                           {sem.grades.map((grade) => (
                              <GradeRow key={grade.id} grade={grade} />
                           ))}
                        </tbody>
                     </table>
                  </div>
               </motion.div>
            ))
         )}
      </div>
   );
}
