"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { useAcademicCalendar } from "../hooks/useAcademicCalendar";
import { useTimetableUIStore } from "../store/useTimetableUIStore";

export function AcademicCalendarBanner() {
   const { data, isLoading } = useAcademicCalendar();
   const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
   const { selectedSemesterId, setSelectedSemesterId } = useTimetableUIStore();

   const academicYearOptions = useMemo(() => {
      if (!data?.session?.name) return [];

      const current = data.session.name;
      const match = current.match(/^(\d{4})\/(\d{4})$/);
      if (!match) return [current];

      const start = Number(match[1]);
      const end = Number(match[2]);
      return [`${start - 1}/${end - 1}`, current, `${start + 1}/${end + 1}`];
   }, [data?.session?.name]);

   useEffect(() => {
      if (!data?.session?.name || selectedAcademicYear) return;
      setSelectedAcademicYear(data.session.name);
   }, [data?.session?.name, selectedAcademicYear]);

   useEffect(() => {
      const activeSemester = data?.currentSemester;
      if (!activeSemester || selectedSemesterId) return;
      setSelectedSemesterId(activeSemester.id);
   }, [data?.currentSemester, selectedSemesterId, setSelectedSemesterId]);

   if (isLoading) {
      return <Skeleton className="h-14 w-full rounded-xl" />;
   }

   if (!data) return null;

   return (
      <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm">
         <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
               <GraduationCap size={15} className="text-primary" />
               Academic Year & Semester
            </span>

            <div className="h-4 w-px bg-border hidden sm:block" />
            <span className="flex items-center gap-1.5 text-muted-foreground">
               <BookOpen size={13} />
               Select current academic year and semester
            </span>
         </div>

         <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-55">
               <Select
                  value={selectedAcademicYear}
                  onValueChange={setSelectedAcademicYear}
               >
                  <SelectTrigger className="w-full justify-between bg-background">
                     <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                     {academicYearOptions.map((year) => (
                        <SelectItem key={year} value={year}>
                           {year}
                        </SelectItem>
                     ))}
                  </SelectContent>
               </Select>
            </div>

            <div className="min-w-48">
               <Select
                  value={selectedSemesterId ? String(selectedSemesterId) : "all"}
                  onValueChange={(value) =>
                     setSelectedSemesterId(value === "all" ? null : Number(value))
                  }
               >
                  <SelectTrigger className="w-full justify-between bg-background">
                     <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">All semesters</SelectItem>
                     {(data?.semesters ?? []).map((semester) => (
                        <SelectItem key={semester.id} value={String(semester.id)}>
                           {semester.name}
                        </SelectItem>
                     ))}
                  </SelectContent>
               </Select>
            </div>
         </div>
      </div>
   );
}
