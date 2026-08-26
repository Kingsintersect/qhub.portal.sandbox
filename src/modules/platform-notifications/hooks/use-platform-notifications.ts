"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  platformNotificationKeys,
  platformNotificationsService,
} from "@/modules/platform-notifications/services/platform-notifications.service"
import type { NotificationKind } from "@/modules/platform-notifications/types"

/**
 * How often the bell asks.
 *
 * Fifteen seconds, from the design. Polling rather than a stream: this
 * deployment runs PHP-FPM with a small worker pool, and a held-open connection
 * per signed-in operator would starve the pool that serves everything else.
 */
const BELL_POLL_MS = 15_000

export function useNotificationFeed(enabled = true) {
  return useQuery({
    queryKey: platformNotificationKeys.feed(),
    queryFn: () => platformNotificationsService.feed(14),
    refetchInterval: enabled ? BELL_POLL_MS : false,
    // Keeps polling while the operator is in another tab: coming back to a
    // stale bell is how you miss an incident.
    refetchIntervalInBackground: false,
    enabled,
  })
}

export function useNotificationPage(params: {
  kind: NotificationKind | "all"
  unreadOnly: boolean
  page: number
}) {
  return useQuery({
    queryKey: platformNotificationKeys.page(
      params.kind,
      params.unreadOnly,
      params.page
    ),
    queryFn: () => platformNotificationsService.page(params),
    // The page a person reads to catch up; a flash of the previous tab's rows
    // while the next loads reads as data changing under them.
    placeholderData: (previous) => previous,
  })
}

export function useNotificationCounts() {
  return useQuery({
    queryKey: platformNotificationKeys.counts(),
    queryFn: () => platformNotificationsService.counts(),
    refetchInterval: BELL_POLL_MS,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => platformNotificationsService.markRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: platformNotificationKeys.all,
      })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => platformNotificationsService.markAllRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: platformNotificationKeys.all,
      })
    },
  })
}
