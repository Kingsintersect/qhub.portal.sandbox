"use client";

import { useMemo } from "react";
import { ShieldOff } from "lucide-react";
import { AssessmentFilters } from "@/modules/assessments/components/assessment-filters";
import { AssessmentList } from "@/modules/assessments/components/assessment-list";
import { useMyAssessments } from "@/modules/assessments/hooks/use-my-assessments";
import { useAssessmentsUiStore } from "@/modules/assessments/store/assessments-ui.store";
import { PermissionGate } from "@/lib/permissions/PermissionGate";

export default function MyAssessmentsPage() {
   const { activeType, searchQuery, upcomingOnly, page, limit } = useAssessmentsUiStore();

   const { data, isLoading } = useMyAssessments({
      type: activeType ?? undefined,
      upcoming: upcomingOnly || undefined,
      page,
      limit,
   });

   const items = useMemo(() => {
      const all = data?.data ?? [];
      const search = searchQuery.trim().toLowerCase();
      if (!search) return all;

      return all.filter((item) => {
         const haystack = [
            item.name,
            item.description ?? "",
            item.course.code,
            item.course.title,
            item.course.semesterName,
            item.assessmentType,
         ]
            .join(" ")
            .toLowerCase();

         return haystack.includes(search);
      });
   }, [data, searchQuery]);

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
            <AssessmentFilters showUpcomingToggle />
            <AssessmentList
               items={items}
               isLoading={isLoading}
               baseHref="/student/assessments"
            />
         </div>
      </PermissionGate>
   );
}
