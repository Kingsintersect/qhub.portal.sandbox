"use client"

import { useQuery } from "@tanstack/react-query"
import { moodleSyncService } from "../services/moodle-sync.service"
import { moodleSyncKeys } from "./query-keys"
import type { UserSyncQueryFilters } from "../types"

export function useSyncUsers(filters?: UserSyncQueryFilters) {
  return useQuery({
    queryKey: moodleSyncKeys.users(filters),
    queryFn: () => moodleSyncService.listUsers(filters),
    staleTime: 60 * 1000,
  })
}

export function useSyncUserMapping(id: number) {
  return useQuery({
    queryKey: moodleSyncKeys.user(id),
    queryFn: () => moodleSyncService.getUserMapping(id),
    enabled: !!id,
  })
}
