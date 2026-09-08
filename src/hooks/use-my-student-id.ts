"use client"

import { useQuery } from "@tanstack/react-query"
import { usersApi, usersKeys } from "@/services/usersApi"
import { useAppStore, useAppHydrated } from "@/store"
import { UserRole } from "@/config/nav.config"

// MISSING_BACKEND_APIS.md §1.1, now shipped by the backend team —
// `GET /users/students/me` resolves the current JWT's Student.id directly
// via `usersApi.getMyStudent()`, so every consumer (student-grades,
// document, hostel, clearance, enrollment) gets a real id. `studentId: null`
// can still occur transiently (loading) or for a genuinely non-student
// caller. Retry policy (no 4xx retries, 2 attempts) is the app-wide default
// set in Providers.tsx.
export function useMyStudentId(): {
  studentId: number | null
  programId: number | null
  isLoading: boolean
  isError: boolean
  refetch: () => void
} {
  const hydrated = useAppHydrated()
  const role = useAppStore((s) => s.user?.role)

  const query = useQuery({
    queryKey: usersKeys.students.me(),
    queryFn: () => usersApi.getMyStudent(),
    // Wait for the persisted session to rehydrate before firing — otherwise
    // this can fire before the API client has a valid Authorization header
    // wired in, 401, and (previously, with retries disabled) get stuck until
    // a manual page reload.
    enabled: hydrated && role === UserRole.STUDENT,
    staleTime: 1000 * 60 * 10,
  })

  return {
    studentId: query.data?.data.id ?? null,
    programId: query.data?.data.program_id ?? null,
    isLoading: hydrated && role === UserRole.STUDENT && query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  }
}
