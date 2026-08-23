import type {
  GradeFilters,
  GradesGroupBy,
  PublishSelectionFilters,
} from "../types/grades.types"

export const gradesKeys = {
  all: ["grades"] as const,

  gradeScales: () => [...gradesKeys.all, "grade-scales"] as const,

  coursesByProgram: (programId: string | null) =>
    [...gradesKeys.all, "courses-by-program", programId] as const,

  list: (filters: GradeFilters, page: number, pageSize: number) =>
    [...gradesKeys.all, "list", filters, page, pageSize] as const,

  transcript: (studentId: number | null) =>
    [...gradesKeys.all, "transcript", studentId] as const,

  dashboard: () => [...gradesKeys.all, "dashboard"] as const,
  distribution: () => [...gradesKeys.all, "distribution"] as const,
  programPerformance: () => [...gradesKeys.all, "program-performance"] as const,
  cgpaTrends: () => [...gradesKeys.all, "cgpa-trends"] as const,
  topPerformers: (limit: number) =>
    [...gradesKeys.all, "top-performers", limit] as const,

  grouped: (groupBy: GradesGroupBy, filters: GradeFilters) =>
    [...gradesKeys.all, "grouped", groupBy, filters] as const,

  publishPreview: (filters: PublishSelectionFilters) =>
    [...gradesKeys.all, "publish-preview", filters] as const,
} as const
