"use client"

import { useQuery } from "@tanstack/react-query"
import { academicCalendarQueryOptions } from "../services/timetable.service"

export function useAcademicCalendar() {
  return useQuery({
    ...academicCalendarQueryOptions.current(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useActiveSemester() {
  return useQuery({
    ...academicCalendarQueryOptions.activeSemester(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useActiveSession() {
  return useQuery({
    ...academicCalendarQueryOptions.activeSession(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useSessions() {
  return useQuery({
    ...academicCalendarQueryOptions.sessions(),
    staleTime: 10 * 60 * 1000,
  })
}
