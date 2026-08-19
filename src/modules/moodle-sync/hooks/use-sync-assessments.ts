"use client"

import { useQuery } from "@tanstack/react-query"
import { moodleSyncService } from "../services/moodle-sync.service"
import { moodleSyncKeys } from "./query-keys"

export function useSyncAssessments(filters?: {
  courseId?: number
  type?: string
}) {
  return useQuery({
    queryKey: moodleSyncKeys.assessments(filters),
    queryFn: () => moodleSyncService.listAssessments(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useSyncAssessmentsByCourse(courseOfferingId: number) {
  return useQuery({
    queryKey: moodleSyncKeys.assessmentsByCourse(courseOfferingId),
    queryFn: () => moodleSyncService.listAssessmentsByCourse(courseOfferingId),
    enabled: !!courseOfferingId,
  })
}

export function useUpcomingAssessments() {
  return useQuery({
    queryKey: moodleSyncKeys.assessmentsUpcoming(),
    queryFn: moodleSyncService.listUpcomingAssessments,
    // cron pulls every 30 min server-side; no need to poll aggressively
    staleTime: 5 * 60 * 1000,
  })
}
