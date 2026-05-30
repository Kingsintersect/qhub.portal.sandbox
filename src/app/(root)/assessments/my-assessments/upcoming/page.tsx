"use client";

import { useMemo } from "react";
import { Clock, ShieldOff } from "lucide-react";
import { AssessmentList } from "@/modules/assessments/components/assessment-list";
import { useUpcomingAssessments } from "@/modules/assessments/hooks/use-upcoming-assessments";
import { AssessmentFilters } from "@/modules/assessments/components/assessment-filters";
import { useAssessmentsUiStore } from "@/modules/assessments/store/assessments-ui.store";
import { PermissionGate } from "@/lib/permissions/PermissionGate";

export default function UpcomingAssessmentsPage() {
   const { activeType } = useAssessmentsUiStore();

   const { data, isLoading } = useUpcomingAssessments(20);

   const items = useMemo(() => {
      const all = data?.data ?? [];
      if (!activeType) return all;
      return all.filter((a) => a.assessmentType === activeType);
   }, [data, activeType]);

   return (
      <PermissionGate
         require={{ resource: "assessments", action: "view.own" }}
         fallback={
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
               <ShieldOff size={40} className="opacity-40" />
               <p className="text-sm">You do not have permission to view assessments.</p>
            </div>
         }
      >
         <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
               <Clock size={16} />
               <span className="text-sm font-medium">Sorted by nearest deadline</span>
            </div>
            <AssessmentFilters />
            <AssessmentList
               items={items}
               isLoading={isLoading}
               baseHref="/assessments"
            />
         </div>
      </PermissionGate>
   );
}
