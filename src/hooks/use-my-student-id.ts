"use client"

import { useQuery } from "@tanstack/react-query"
import { usersApi, usersKeys } from "@/services/usersApi"
import { useAppStore } from "@/store/appStore"
import { UserRole } from "@/config/nav.config"

// Real backend gap — see MISSING_BACKEND_APIS.md §1.1. `GET /auth/me` returns
// only User fields, and `GET /users/students/:id` needs the caller to already
// know their own Student.id — there's no `/users/students/me` (yet). Wired
// against that proposed contract via `usersApi.getMyStudent()` so this hook
// starts resolving a real id the moment the backend adds it; until then the
// request 404s and every consumer degrades to `studentId: null`, same as
// before, but honestly (a failed request) rather than a hardcoded stub. Kept
// global (not module-scoped) because it's shared by student-grades, document,
// hostel, and clearance.
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
