"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Medal, Trophy, TrendingUp, Hash } from "lucide-react";
import { GradeStatsCards } from "../../_components/stats-cards";
import { GradeDistributionChart } from "../../_components/charts/grade-distribution-chart";
import { ProgramPerformanceChart } from "../../_components/charts/program-performance-chart";
import { CgpaTrendChart } from "../../_components/charts/cgpa-trend-chart";
import SectionCard from "@/components/custom/SectionCard";
import { useGradesDashboard, useGradeScales } from "../../hooks/use-grades-data";

const MEDAL_COLOURS = [
   "text-yellow-500",   // Gold
   "text-slate-400",    // Silver
   "text-amber-700",    // Bronze
];

const container = {
   hidden: { opacity: 0 },
   show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
   hidden: { opacity: 0, y: 12 },
   show: { opacity: 1, y: 0, transition: { type: "spring" as const, damping: 18, stiffness: 140 } },
};

export default function GradesSummaryPage() {
   const { data, loading } = useGradesDashboard();
   const { scales } = useGradeScales();
   const headerRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      if (!headerRef.current) return;
      gsap.from(headerRef.current, { y: -18, duration: 0.6, ease: "power3.out" });
   }, []);

   return (
      <div className="space-y-5">
         {/* Charts grid */}
         {!loading && data && (
            <motion.div
               ref={headerRef as unknown as React.RefObject<HTMLDivElement>}
               variants={container}
               initial="hidden"
               animate="show"
               className="space-y-5"
            >
               {/* Stats */}
               <motion.div variants={fadeUp}>
                  <GradeStatsCards stats={data.stats} />
               </motion.div>

               {/* Charts row */}
               <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <SectionCard title="Grade Distribution" icon={Hash} className="lg:col-span-1">
                     <GradeDistributionChart data={data.gradeDistribution} />
                  </SectionCard>
                  <SectionCard title="Program Performance" icon={TrendingUp} className="lg:col-span-1">
                     <ProgramPerformanceChart data={data.programPerformance} />
                  </SectionCard>
                  <SectionCard title="GPA Trend by Semester" icon={TrendingUp} className="lg:col-span-1">
                     <CgpaTrendChart data={data.cgpaTrends} />
                  </SectionCard>
               </motion.div>

               {/* Top performers + Grade scale */}
               <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Top performers */}
                  <SectionCard title="Top Performers" icon={Trophy}>
                     <div className="space-y-2 py-1">
                        {data.topPerformers.map((p, i) => (
                           <motion.div
                              key={p.studentId}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-center gap-3 bg-muted/30 hover:bg-muted/50 transition rounded-xl px-3 py-2.5"
                           >
                              {/* Rank */}
                              <div className="w-6 shrink-0 flex justify-center">
                                 {i < 3 ? (
                                    <Medal className={`w-4 h-4 ${MEDAL_COLOURS[i]}`} />
                                 ) : (
                                    <span className="text-xs font-mono text-muted-foreground">{i + 1}</span>
                                 )}
                              </div>
                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                 <p className="text-xs font-semibold text-foreground truncate">{p.studentName}</p>
                                 <p className="text-[11px] text-muted-foreground font-mono">{p.studentMatric}</p>
                              </div>
                              {/* Program tag */}
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-primary/10 text-primary shrink-0">
                                 {p.programCode}
                              </span>
                              {/* CGPA */}
                              <div className="text-right shrink-0">
                                 <p className="text-sm font-bold font-mono text-foreground">{p.cgpa.toFixed(2)}</p>
                                 <p className="text-[10px] text-muted-foreground">CGPA</p>
                              </div>
                           </motion.div>
                        ))}
                        {data.topPerformers.length === 0 && (
                           <p className="text-xs text-muted-foreground text-center py-6">No data available</p>
                        )}
                     </div>
                  </SectionCard>

                  {/* Grade scale reference */}
                  <SectionCard title="Grade Scale Reference" icon={Hash}>
                     <div className="border border-border rounded-xl overflow-hidden">
                        <table className="w-full text-xs">
                           <thead>
                              <tr className="bg-muted/40 border-b border-border">
                                 {["Grade", "Range (%)", "Grade Points", "Description"].map((h) => (
                                    <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted-foreground uppercase text-[10px] tracking-wide">
                                       {h}
                                    </th>
                                 ))}
                              </tr>
                           </thead>
                           <tbody>
                              {scales.map((s, i) => (
                                 <tr key={s.grade} className={`border-b border-border/30 last:border-0 ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                                    <td className="px-3 py-2.5">
                                       <span
                                          className="font-mono font-bold text-sm"
                                          style={{ color: s.color ? `var(--color-${s.color}-500, #64748b)` : "var(--foreground)" }}
                                       >
                                          {s.grade}
                                       </span>
                                    </td>
                                    <td className="px-3 py-2.5 font-mono text-foreground">{s.minScore}–{s.maxScore}</td>
                                    <td className="px-3 py-2.5 font-mono text-foreground">{s.gradePoint.toFixed(2)}</td>
                                    <td className="px-3 py-2.5 text-muted-foreground">{s.description}</td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </SectionCard>
               </motion.div>
            </motion.div>
         )}

         {/* Skeleton while loading */}
         {loading && (
            <div className="space-y-4 animate-pulse">
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                     <div key={i} className="h-24 bg-muted rounded-2xl" />
                  ))}
               </div>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                     <div key={i} className="h-64 bg-muted rounded-2xl" />
                  ))}
               </div>
            </div>
         )}
      </div>
   );
}
