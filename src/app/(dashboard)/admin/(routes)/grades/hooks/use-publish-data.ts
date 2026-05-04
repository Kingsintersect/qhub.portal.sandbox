"use client";

import { useState, useEffect, useCallback } from "react";
import type { CourseOption, PublishSelectionFilters } from "../types/grades.types";
import {
   ACADEMIC_YEARS,
   SEMESTERS,
   PROGRAMS,
   gradesService,
} from "../services/grades.service";
import { usePublishStore } from "../store/publishStore";

// ─── Re-export reference data for use in wizard ───────────────────────────────

export { ACADEMIC_YEARS, SEMESTERS, PROGRAMS };

// ─── Courses filtered by program ─────────────────────────────────────────────

export function useCourseOptions(programId: string | null) {
   const [courses, setCourses] = useState<CourseOption[]>([]);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      if (!programId) { setCourses([]); return; }
      const id = programId;
      async function load() {
         setLoading(true);
         try {
            const data = await gradesService.getCoursesByProgram(id);
            setCourses(data);
         } catch {
            setCourses([]);
         } finally {
            setLoading(false);
         }
      }
      void load();
   }, [programId]);

   return { courses, loading };
}

// ─── Load grades for publish preview ─────────────────────────────────────────

export function usePublishPreview() {
   const { filters, setLoadedGrades, clearLoadedGrades } = usePublishStore();
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const isComplete =
      filters.academicYearId !== null &&
      filters.semesterId !== null &&
      filters.programId !== null &&
      filters.courseId !== null;

   const load = useCallback(async (f: PublishSelectionFilters) => {
      setLoading(true);
      setError(null);
      try {
         const grades = await gradesService.getGradesForPublish(f);
         setLoadedGrades(grades);
      } catch {
         setError("Failed to load results. Try again.");
         clearLoadedGrades();
      } finally {
         setLoading(false);
      }
   }, [setLoadedGrades, clearLoadedGrades]);

   return { isComplete, loading, error, load };
}

// ─── Publish action ───────────────────────────────────────────────────────────

export function usePublishAction() {
   const { selectedIds, setPublishing, applyPublished, publishing } = usePublishStore();

   const publish = useCallback(async () => {
      if (!selectedIds.length) return;
      setPublishing(true);
      try {
         const updated = await gradesService.publishGrades(selectedIds);
         applyPublished(updated);
      } catch {
         setPublishing(false);
      }
   }, [selectedIds, setPublishing, applyPublished]);

   return { publish, publishing };
}
