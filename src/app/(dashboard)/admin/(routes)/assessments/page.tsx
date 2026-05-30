"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Link2, ShieldOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AssessmentFilters } from "@/modules/assessments/components/assessment-filters";
import { AssessmentList } from "@/modules/assessments/components/assessment-list";
import { useAssessments } from "@/modules/assessments/hooks/use-assessments";
import { useAssessmentsUiStore } from "@/modules/assessments/store/assessments-ui.store";
import { PermissionGate } from "@/lib/permissions/PermissionGate";

export default function AdminAssessmentsPage() {
   const { activeType, visibilityFilter, page, limit } = useAssessmentsUiStore();

   const isVisibleFilter =
      visibilityFilter === "visible" ? true : visibilityFilter === "hidden" ? false : undefined;

   const { data, isLoading } = useAssessments({
      type: activeType ?? undefined,
      isVisible: isVisibleFilter,
      page,
      limit,
   });

   const items = useMemo(() => data?.data ?? [], [data]);
   const total = data?.meta.total ?? 0;

   return (
      <PermissionGate
         require={{ resource: "assessments", action: "view.all" }}
         fallback={
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
               <ShieldOff size={40} className="opacity-40" />
               <p className="text-sm">You do not have permission to view all assessments.</p>
            </div>
         }
      >
         <div className="space-y-6 p-6">
            {/* Header */}
            <motion.div
               initial={{ opacity: 0, y: -8 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex items-start justify-between gap-4 flex-wrap"
            >
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                     <BookOpen size={18} className="text-primary" />
                  </div>
                  <div>
                     <h1 className="text-xl font-bold">All Assessments</h1>
                     <p className="text-xs text-muted-foreground mt-0.5">
                        View and manage all Moodle-synced assessments
                     </p>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  {total > 0 && (
                     <span className="text-xs text-muted-foreground bg-muted/50 border border-border px-2.5 py-1 rounded-full">
                        {total} assessment{total !== 1 ? "s" : ""}
                     </span>
                  )}
                  <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                     <Link href="/admin/assessments/sync-status">
                        <Link2 size={12} />
                        Sync Status
                     </Link>
                  </Button>
               </div>
            </motion.div>

            {/* Filters */}
            <AssessmentFilters showVisibilityFilter />

            {/* List */}
            <AssessmentList
               items={items}
               isLoading={isLoading}
               showVisibilityToggle
               baseHref="/assessments"
            />
         </div>
      </PermissionGate>
   );
}
