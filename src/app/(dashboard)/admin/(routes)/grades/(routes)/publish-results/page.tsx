"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import {
   Send, RotateCcw, CheckCircle2, Users, BookOpen,
   AlertCircle, Info,
} from "lucide-react";
import { SelectionWizard } from "../../_components/publish/selection-wizard";
import { PublishResultsTable } from "../../_components/publish/publish-results-table";
import { PublishConfirmModal } from "../../_components/publish/publish-confirm-modal";
import {
   ACADEMIC_YEARS,
   SEMESTERS,
   PROGRAMS,
   useCourseOptions,
   usePublishPreview,
   usePublishAction,
} from "../../hooks/use-publish-data";
import { usePublishStore } from "../../store/publishStore";
import { COURSES } from "../../services/grades.service";

// ─── Summary stat pill ────────────────────────────────────────────────────────

function SummaryPill({ label, value, colour }: { label: string; value: string | number; colour: string }) {
   return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs ${colour}`}>
         <span className="text-muted-foreground">{label}:</span>
         <span className="font-semibold text-foreground">{value}</span>
      </div>
   );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublishResultsPage() {
   const headerRef = useRef<HTMLDivElement>(null);

   const {
      filters,
      loadedGrades,
      gradesLoaded,
      selectedIds,
      confirmOpen,
      setFilter,
      resetFilters,
      openConfirm,
      closeConfirm,
   } = usePublishStore();

   const { courses, loading: coursesLoading } = useCourseOptions(filters.programId);
   const { isComplete, loading: loadingGrades, error, load } = usePublishPreview();
   const { publish, publishing } = usePublishAction();

   useEffect(() => {
      if (!headerRef.current) return;
      gsap.from(headerRef.current, { y: -16, duration: 0.5, ease: "power3.out" });
   }, []);

   const handleLoad = () => {
      if (isComplete) void load(filters);
   };

   // Derive display labels for confirmation modal
   const selectedAY = ACADEMIC_YEARS.find((y) => y.id === filters.academicYearId);
   const selectedSem = SEMESTERS.find((s) => s.id === filters.semesterId);
   const selectedCourse = COURSES.find((c) => c.id === filters.courseId);

   // Stats for result header
   const publishedCount = loadedGrades.filter((g) => g.status === "PUBLISHED").length;
   const approvedCount = loadedGrades.filter((g) => g.status === "APPROVED").length;
   const pendingCount = loadedGrades.filter((g) => g.status === "SUBMITTED" || g.status === "DRAFT").length;

   const selectedGradeObjects = loadedGrades.filter((g) => selectedIds.includes(g.id));

   return (
      <div className="space-y-4">
         {/* Page header */}
         <div ref={headerRef} className="bg-card border border-border rounded-2xl px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
               <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                     <Send className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                     <h2 className="text-sm font-bold text-foreground">Publish Results</h2>
                     <p className="text-xs text-muted-foreground">Select a course and publish student results to the portal</p>
                  </div>
               </div>
               {gradesLoaded && (
                  <button
                     onClick={resetFilters}
                     className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-xl px-3 py-1.5 bg-card hover:bg-muted transition"
                  >
                     <RotateCcw className="w-3 h-3" />
                     Start Over
                  </button>
               )}
            </div>
         </div>

         {/* Selection wizard */}
         <SelectionWizard
            academicYears={ACADEMIC_YEARS}
            semesters={SEMESTERS}
            programs={PROGRAMS}
            courses={courses}
            coursesLoading={coursesLoading}
            selectedAY={filters.academicYearId}
            selectedSem={filters.semesterId}
            selectedProgram={filters.programId}
            selectedCourse={filters.courseId}
            onAYChange={(v) => setFilter({ academicYearId: v })}
            onSemChange={(v) => setFilter({ semesterId: v })}
            onProgramChange={(v) => setFilter({ programId: v })}
            onCourseChange={(v) => setFilter({ courseId: Number(v) })}
            onLoad={handleLoad}
            loading={loadingGrades}
            isComplete={isComplete}
         />

         {/* Error */}
         {error && (
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-xs text-destructive">
               <AlertCircle className="w-4 h-4 shrink-0" />
               {error}
            </div>
         )}

         {/* Results panel */}
         <AnimatePresence>
            {gradesLoaded && (
               <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className="space-y-3"
               >
                  {/* Results summary header */}
                  <div className="bg-card border border-border rounded-2xl px-5 py-4">
                     <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <BookOpen className="w-4 h-4 text-primary" />
                              <p className="text-sm font-bold text-foreground">
                                 {selectedCourse
                                    ? `${selectedCourse.code} — ${selectedCourse.name}`
                                    : "Course Results"}
                              </p>
                           </div>
                           <p className="text-xs text-muted-foreground ml-6">
                              {selectedSem?.label} · {selectedAY?.label}
                           </p>
                           <div className="flex flex-wrap items-center gap-2 mt-2.5">
                              <SummaryPill label="Total" value={loadedGrades.length} colour="border-border" />
                              <SummaryPill label="Published" value={publishedCount} colour="border-emerald-200 dark:border-emerald-900/50" />
                              <SummaryPill label="Approved" value={approvedCount} colour="border-blue-200 dark:border-blue-900/50" />
                              <SummaryPill label="Pending" value={pendingCount} colour="border-amber-200 dark:border-amber-900/50" />
                           </div>
                        </div>

                        {/* Publish action area */}
                        <div className="flex flex-col items-end gap-2">
                           <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={openConfirm}
                              disabled={selectedIds.length === 0}
                              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                           >
                              <Send className="w-3.5 h-3.5" />
                              Publish Selected ({selectedIds.length})
                           </motion.button>
                           {selectedIds.length === 0 && approvedCount > 0 && (
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                 <Info className="w-3 h-3" />
                                 Select rows to publish
                              </p>
                           )}
                           {approvedCount === 0 && pendingCount > 0 && (
                              <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                 <AlertCircle className="w-3 h-3" />
                                 No approved grades to publish
                              </p>
                           )}
                           {loadedGrades.length > 0 && publishedCount === loadedGrades.length && (
                              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                 <CheckCircle2 className="w-3 h-3" />
                                 All results already published
                              </p>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Quick stats chips */}
                  {loadedGrades.length > 0 && (
                     <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                           <Users className="w-3.5 h-3.5" />
                           <span>{loadedGrades.length} student{loadedGrades.length !== 1 ? "s" : ""}</span>
                        </div>
                        {selectedIds.length > 0 && (
                           <span className="text-xs text-primary font-medium">
                              · {selectedIds.length} selected for publish
                           </span>
                        )}
                     </div>
                  )}

                  {/* Table */}
                  <PublishResultsTable grades={loadedGrades} />
               </motion.div>
            )}
         </AnimatePresence>

         {/* Empty state before selection */}
         {!gradesLoaded && !loadingGrades && !error && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
               <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
                  <Send className="w-5 h-5 text-muted-foreground" />
               </div>
               <p className="text-sm font-medium text-foreground mb-1">No results loaded</p>
               <p className="text-xs text-muted-foreground max-w-72">
                  Use the selector above to pick an academic year, semester, program and course, then click <strong>Load Results</strong>.
               </p>
            </div>
         )}

         {/* Confirm modal */}
         {selectedCourse && selectedSem && selectedAY && (
            <PublishConfirmModal
               open={confirmOpen}
               onClose={closeConfirm}
               selectedGrades={selectedGradeObjects}
               onConfirm={publish}
               publishing={publishing}
               courseName={selectedCourse.name}
               courseCode={selectedCourse.code}
               semesterLabel={selectedSem.label}
               academicYear={selectedAY.label}
            />
         )}
      </div>
   );
}
