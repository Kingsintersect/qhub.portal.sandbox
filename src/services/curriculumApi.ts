import apiClient from "@/lib/clients/apiClient"
import {
  createApiMutationOptions,
  createApiQueryOptions,
} from "@/lib/clients/apiClient"

// Real backend contract per bruno/academic and bruno/course (the sole source
// of truth for this feature — see CLAUDE.md §13). `curriculumSemester` does
// NOT exist on the real Course model yet — see
// sandbox/course/missing_curriculum_apis.readme.md for the exact schema/DTO
// addition this feature is waiting on. Every course will read back
// `curriculumSemester: null` (shown as "Unassigned") until the backend ships
// it; that's an honest "not wired yet" state, not fabricated data.

export interface CurriculumProgram {
  id: number
  name: string
  code: string
  departmentId: number
}

export interface CurriculumCourse {
  id: number
  code: string
  title: string
  creditUnits: number
  levelId: number
  curriculumSemester: number | null
}

const AUTH = { access_token: true } as const

export const curriculumApi = {
  listPrograms: async (): Promise<CurriculumProgram[]> => {
    const res = await apiClient.get<{ data: CurriculumProgram[] }>(
      "/academic/programs",
      AUTH
    )
    return res.data
  },

  listProgramCourses: async (
    programId: number
  ): Promise<CurriculumCourse[]> => {
    const res = await apiClient.get<{ data: CurriculumCourse[] }>(
      `/courses/programs/${programId}`,
      AUTH
    )
    return res.data
  },

  updateCourseCurriculumSemester: async (
    courseId: number,
    curriculumSemester: 1 | 2 | null
  ): Promise<CurriculumCourse> => {
    const res = await apiClient.patch<{ data: CurriculumCourse }>(
      `/courses/${courseId}`,
      { curriculumSemester },
      AUTH
    )
    return res.data
  },
}

export const curriculumKeys = {
  all: ["curriculum"] as const,
  programs: () => [...curriculumKeys.all, "programs"] as const,
  courses: (programId: number) =>
    [...curriculumKeys.all, "courses", programId] as const,
}

export const curriculumQueryOptions = {
  programs: () =>
    createApiQueryOptions({
      queryKey: curriculumKeys.programs(),
      queryFn: () => curriculumApi.listPrograms(),
    }),
  programCourses: (programId: number) =>
    createApiQueryOptions({
      queryKey: curriculumKeys.courses(programId),
      queryFn: () => curriculumApi.listProgramCourses(programId),
    }),
}

export const curriculumMutationOptions = {
  updateCourseCurriculumSemester: () =>
    createApiMutationOptions<
      CurriculumCourse,
      { courseId: number; curriculumSemester: 1 | 2 | null }
    >({
      mutationKey: [...curriculumKeys.all, "update-course-semester"],
      mutationFn: ({ courseId, curriculumSemester }) =>
        curriculumApi.updateCourseCurriculumSemester(
          courseId,
          curriculumSemester
        ),
    }),
}
