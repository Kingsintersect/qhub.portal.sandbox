"use client"

import { useQuery } from "@tanstack/react-query"
import { usersApi, usersKeys } from "@/services/usersApi"
import { useAppStore } from "@/store/appStore"
import { UserRole } from "@/config/nav.config"

// MISSING_BACKEND_APIS.md §1.1, now shipped by the backend team —
// `GET /users/students/me` resolves the current JWT's Student.id directly
// via `usersApi.getMyStudent()`, so every consumer (student-grades,
// document, hostel, clearance) gets a real id. `studentId: null` can still
// occur transiently (loading) or for a genuinely non-student caller. Kept
// global (not module-scoped) because it's shared across those 4+ modules.
export function useMyStudentId(): {
  studentId: number | null
  programId: number | null
  isLoading: boolean
} {
  const role = useAppStore((s) => s.user?.role)

  const query = useQuery({
    queryKey: usersKeys.students.me(),
    queryFn: () => usersApi.getMyStudent(),
    enabled: role === UserRole.STUDENT,
    retry: false,
    staleTime: 1000 * 60 * 10,
  })

  return {
    studentId: query.data?.data.id ?? null,
    programId: query.data?.data.program_id ?? null,
    isLoading: role === UserRole.STUDENT && query.isLoading,
  }
}
