"use client"

import { useQuery } from "@tanstack/react-query"
import { usersApi, usersKeys } from "@/services/usersApi"
import { useAppStore } from "@/store/appStore"
import { UserRole } from "@/config/nav.config"

// MISSING_BACKEND_APIS.md §1.1b, now shipped by the backend team — mirrors
// useMyStudentId(): `GET /users/lecturers/me` resolves the current JWT's
// Lecturer.id directly via usersApi.getMyLecturer(), needed for "my assigned
// courses" and "my teaching schedule" lookups that take a lecturerId.
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
