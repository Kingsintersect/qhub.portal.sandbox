"use client"

import { useQuery } from "@tanstack/react-query"
import { usersApi, usersKeys } from "@/services/usersApi"
import { useAppStore } from "@/store/appStore"
import { UserRole } from "@/config/nav.config"

// Real backend gap — see MISSING_BACKEND_APIS.md §"GET /users/lecturers/me".
// Mirrors useMyStudentId(): no endpoint today lets a logged-in tutor resolve
// their own Lecturer.id (needed for "my assigned courses" and "my teaching
// schedule" lookups that take a lecturerId). Wired against the proposed
// contract via usersApi.getMyLecturer() so this starts resolving a real id
// the moment the backend ships it; until then the request 404s and every
// consumer degrades to `lecturerId: null`.
export function useMyLecturerId(): {
  lecturerId: number | null
  isLoading: boolean
} {
  const role = useAppStore((s) => s.user?.role)

  const query = useQuery({
    queryKey: usersKeys.tutors.me(),
    queryFn: () => usersApi.getMyLecturer(),
    enabled: role === UserRole.TUTOR,
    retry: false,
    staleTime: 1000 * 60 * 10,
  })

  return {
    lecturerId: query.data?.data.id ?? null,
    isLoading: role === UserRole.TUTOR && query.isLoading,
  }
}
