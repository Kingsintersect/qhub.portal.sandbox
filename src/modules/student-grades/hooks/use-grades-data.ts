"use client"

import { useCallback, useState } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import type { GradeFilters, GradesGroupBy } from "../types/grades.types"
import { gradesService } from "../services/grades.service"
import { gradesKeys } from "./query-keys"

// ─── Default Filter State ─────────────────────────────────────────────────────

export const DEFAULT_GRADE_FILTERS: GradeFilters = {
  search: "",
  status: "all",
  academicYearId: "all",
  semesterId: "all",
  programId: "all",
  gradeLetter: "all",
}

// ─── Analytics — each a separate real endpoint (see MISSING_BACKEND_APIS.md §2.7) ──
// getDashboardData returns the flat GradeSummaryStats shape directly; the
// distribution/program-performance/cgpa-trends/top-performers charts are each
// their own endpoint and are fetched independently rather than expected as
// nested fields of one aggregate response.

export function useGradesSummary() {
  return useQuery({
    queryKey: gradesKeys.dashboard(),
    queryFn: () => gradesService.getDashboardData(),
  })
}

export function useGradeDistributionData() {
  return useQuery({
    queryKey: gradesKeys.distribution(),
    queryFn: () => gradesService.getGradeDistribution(),
  })
}

export function useProgramPerformanceData() {
  return useQuery({
    queryKey: gradesKeys.programPerformance(),
    queryFn: () => gradesService.getProgramPerformance(),
  })
}

export function useCgpaTrendsData() {
  return useQuery({
    queryKey: gradesKeys.cgpaTrends(),
    queryFn: () => gradesService.getCgpaTrends(),
  })
}

export function useTopPerformersData(limit = 10) {
  return useQuery({
    queryKey: gradesKeys.topPerformers(limit),
    queryFn: () => gradesService.getTopPerformers(limit),
  })
}

// ─── Grades Hook (paginated + filtered) ──────────────────────────────────────

export function useGrades(initialPageSize = 15) {
  const [filters, setFilters] = useState<GradeFilters>(DEFAULT_GRADE_FILTERS)
  const [page, setPage] = useState(1)
  const pageSize = initialPageSize

  const query = useQuery({
    queryKey: gradesKeys.list(filters, page, pageSize),
    queryFn: () => gradesService.getGrades(filters, page, pageSize),
    placeholderData: keepPreviousData,
  })

  const updateFilters = useCallback((partial: Partial<GradeFilters>) => {
    setFilters((f) => ({ ...f, ...partial }))
    setPage(1)
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_GRADE_FILTERS)
    setPage(1)
  }, [])

  const goToPage = useCallback((p: number) => setPage(p), [])

  const activeFilterCount = (
    Object.keys(filters) as (keyof GradeFilters)[]
  ).filter((k) => filters[k] !== DEFAULT_GRADE_FILTERS[k]).length

  return {
    grades: query.data?.data ?? [],
    loading: query.isLoading,
    error: query.isError ? "Failed to load grades" : null,
    filters,
    pagination: query.data?.pagination ?? {
      page,
      pageSize,
      total: 0,
      totalPages: 0,
    },
    updateFilters,
    resetFilters,
    goToPage,
    refreshGrades: () => {
      void query.refetch()
    },
    activeFilterCount,
  }
}

// ─── Grouped Grades Hook ──────────────────────────────────────────────────────

export function useGroupedGrades(
  groupBy: GradesGroupBy,
  filters: GradeFilters,
  enabled = true
) {
  const query = useQuery({
    queryKey: gradesKeys.grouped(groupBy, filters),
    queryFn: () => gradesService.getGroupedGrades(groupBy, filters),
    enabled,
  })

  return { data: query.data ?? [], loading: query.isLoading }
}

// ─── Student Transcript Hook ──────────────────────────────────────────────────

export function useStudentTranscript(studentId: number | null) {
  const query = useQuery({
    queryKey: gradesKeys.transcript(studentId),
    queryFn: () => gradesService.getStudentTranscript(studentId as number),
    enabled: studentId !== null,
  })

  return {
    data: query.data ?? null,
    transcript: query.data ?? null,
    loading: query.isLoading,
  }
}

// ─── Term Results Hook (SECONDARY_SCHOOL / SIMPLE_AVERAGE) ────────────────────
// `enabled` is passed by the caller — only fetch once the student's
// Program.programCategory is known to be SECONDARY_SCHOOL, see
// StudentResultsPage.tsx.

export function useMyTermResults(enabled: boolean) {
  const query = useQuery({
    queryKey: [...gradesKeys.all, "term-results", "my"],
    queryFn: () => gradesService.getMyTermResults(),
    enabled,
  })

  return { data: query.data ?? [], loading: query.isLoading }
}

// ─── Grade Scales Hook ────────────────────────────────────────────────────────

export function useGradeScales() {
  const query = useQuery({
    queryKey: gradesKeys.gradeScales(),
    queryFn: () => gradesService.getGradeScales(),
    staleTime: 1000 * 60 * 10,
  })

  return {
    data: query.data ?? [],
    scales: query.data ?? [],
    loading: query.isLoading,
  }
}
