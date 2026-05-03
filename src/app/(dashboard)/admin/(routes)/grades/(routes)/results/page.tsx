"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutList, LayoutGrid, ChevronDown } from "lucide-react";
import { GradesFiltersBar } from "../../_components/filters-bar";
import { GradesExportToolbar } from "../../_components/export-toolbar";
import { GradesTable } from "../../_components/grades-table";
import { GradesGroupedView } from "../../_components/grouped-view";
import { GradeDetailModal } from "../../_components/modals/grade-detail-modal";
import { TranscriptModal } from "../../_components/modals/transcript-modal";
import { useGrades, useGroupedGrades, useStudentTranscript } from "../../hooks/use-grades-data";
import { useGradesExport } from "../../hooks/use-grades-export";
import { useGradesStore } from "../../store/gradesStore";
import type { GradesGroupBy } from "../../types/grades.types";

const GROUP_BY_OPTIONS: { label: string; value: GradesGroupBy }[] = [
   { label: "Academic Year", value: "academic_year" },
   { label: "Semester", value: "semester" },
   { label: "Program", value: "program" },
];

export default function GradesResultsPage() {
   const [activeView, setActiveView] = useState<"table" | "grouped">("table");
   const [groupBy, setGroupBy] = useState<GradesGroupBy>("academic_year");
   const [groupByOpen, setGroupByOpen] = useState(false);

   const { grades, filters, pagination, loading, updateFilters, resetFilters, goToPage, refreshGrades, activeFilterCount } = useGrades(15);
   const { data: groupedData, loading: groupedLoading } = useGroupedGrades(groupBy, filters);
   const { exporting, exportCSV, exportExcel, exportPDF } = useGradesExport();

   const {
      gradeDetailOpen,
      closeGradeDetail,
      openGradeDetail,
      openTranscript,
      transcriptOpen,
      closeTranscript,
      transcriptStudentId,
   } = useGradesStore();

   const { transcript, loading: transcriptLoading } = useStudentTranscript(transcriptStudentId);

   return (
      <div className="space-y-4">
         {/* Toolbar row */}
         <div className="flex flex-wrap items-center justify-between gap-3">
            {/* View toggle */}
            <div className="flex items-center gap-1 bg-muted/50 border border-border rounded-xl p-1">
               <button
                  onClick={() => setActiveView("table")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeView === "table" ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                     }`}
               >
                  <LayoutList className="w-3.5 h-3.5" /> Table
               </button>
               <button
                  onClick={() => setActiveView("grouped")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeView === "grouped" ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                     }`}
               >
                  <LayoutGrid className="w-3.5 h-3.5" /> Grouped
               </button>
            </div>

            <div className="flex items-center gap-2">
               {/* Group by selector (only in grouped view) */}
               {activeView === "grouped" && (
                  <div className="relative">
                     <button
                        onClick={() => setGroupByOpen((v) => !v)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-xl text-xs font-medium text-foreground hover:bg-muted/50 transition"
                     >
                        Group: {GROUP_BY_OPTIONS.find((o) => o.value === groupBy)?.label}
                        <ChevronDown className={`w-3 h-3 transition-transform ${groupByOpen ? "rotate-180" : ""}`} />
                     </button>
                     {groupByOpen && (
                        <motion.div
                           initial={{ opacity: 0, y: -4 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="absolute right-0 mt-1 z-20 bg-card border border-border rounded-xl shadow-lg overflow-hidden min-w-36"
                        >
                           {GROUP_BY_OPTIONS.map((opt) => (
                              <button
                                 key={opt.value}
                                 onClick={() => { setGroupBy(opt.value); setGroupByOpen(false); }}
                                 className={`w-full px-4 py-2.5 text-xs text-left hover:bg-muted transition ${groupBy === opt.value ? "text-primary font-semibold" : "text-foreground"
                                    }`}
                              >
                                 {opt.label}
                              </button>
                           ))}
                        </motion.div>
                     )}
                  </div>
               )}

               {/* Export toolbar */}
               <GradesExportToolbar
                  grades={grades}
                  exporting={exporting}
                  onExportCSV={exportCSV}
                  onExportExcel={exportExcel}
                  onExportPDF={exportPDF}
                  totalCount={pagination.total}
               />
            </div>
         </div>

         {/* Filters */}
         <GradesFiltersBar
            filters={filters}
            onChange={updateFilters}
            onReset={resetFilters}
            activeFilterCount={activeFilterCount}
         />

         {/* Main content */}
         {activeView === "table" ? (
            <GradesTable
               grades={grades}
               loading={loading}
               pagination={pagination}
               onPageChange={goToPage}
               onViewGrade={openGradeDetail}
               onViewTranscript={(grade) => openTranscript(grade.studentId)}
            />
         ) : (
            <GradesGroupedView
               data={groupedData}
               loading={groupedLoading}
               onViewGrade={openGradeDetail}
            />
         )}

         {/* Modals */}
         <GradeDetailModal
            open={gradeDetailOpen}
            onClose={closeGradeDetail}
            onGradeUpdated={refreshGrades}
         />
         <TranscriptModal
            open={transcriptOpen}
            onClose={closeTranscript}
            transcript={transcript ?? null}
            loading={transcriptLoading}
         />
      </div>
   );
}
