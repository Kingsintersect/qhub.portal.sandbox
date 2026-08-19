"use client"

import { useQuery } from "@tanstack/react-query"
import { moodleSyncService } from "../services/moodle-sync.service"
import { moodleSyncKeys } from "./query-keys"

export function useSyncCourses() {
  return useQuery({
    queryKey: moodleSyncKeys.courses(),
    queryFn: moodleSyncService.listCourses,
    staleTime: 60 * 1000,
  })
}

export function useSyncCourse(id: number) {
  return useQuery({
    queryKey: moodleSyncKeys.course(id),
    queryFn: () => moodleSyncService.getCourse(id),
    enabled: !!id,
  })
}
