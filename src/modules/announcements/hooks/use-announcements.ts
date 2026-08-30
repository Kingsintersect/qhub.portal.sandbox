"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  announcementKeys,
  institutionNoticesService,
  platformAnnouncementsService,
} from "@/modules/announcements/services/announcements.service"
import type { AnnouncementDraft } from "@/modules/announcements/types"
import { errorMessage } from "@/lib/api-error"

// --- Platform console -------------------------------------------------------

export function useAnnouncements(params: { status?: string } = {}) {
  return useQuery({
    queryKey: announcementKeys.list(params),
    queryFn: () => platformAnnouncementsService.list(params),
  })
}

export function useAnnouncement(id: number) {
  return useQuery({
    queryKey: announcementKeys.detail(id),
    queryFn: () => platformAnnouncementsService.show(id),
    enabled: Number.isFinite(id) && id > 0,
  })
}

/**
 * Who an audience would reach.
 *
 * A query rather than a mutation despite the POST: it writes nothing, and the
 * composer wants it cached per audience so switching back and forth does not
 * re-ask.
 */
export function useAudiencePreview(payload: {
  audience: string
  audienceCategory?: string | null
  tenantIds?: number[]
}) {
  return useQuery({
    queryKey: [...announcementKeys.all, "preview", payload],
    queryFn: () => platformAnnouncementsService.preview(payload),
    enabled:
      payload.audience === "ALL" ||
      (payload.audience === "CATEGORY" && Boolean(payload.audienceCategory)) ||
      (payload.audience === "SELECTED" && (payload.tenantIds?.length ?? 0) > 0),
  })
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AnnouncementDraft) =>
      platformAnnouncementsService.create(payload),
    onSuccess: () => {
      toast.success("Draft saved")
      queryClient.invalidateQueries({ queryKey: announcementKeys.all })
    },
    onError: (error) =>
      toast.error("Could not save that", {
        description: errorMessage(error, "Try again."),
      }),
  })
}

export function useUpdateAnnouncement(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<AnnouncementDraft>) =>
      platformAnnouncementsService.update(id, payload),
    onSuccess: () => {
      toast.success("Announcement updated")
      queryClient.invalidateQueries({ queryKey: announcementKeys.all })
    },
    onError: (error) =>
      toast.error("Could not update that", {
        description: errorMessage(error, "The change was not applied."),
      }),
  })
}

export function usePublishAnnouncement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, publish }: { id: number; publish: boolean }) =>
      publish
        ? platformAnnouncementsService.publish(id)
        : platformAnnouncementsService.unpublish(id),
    onSuccess: (announcement, variables) => {
      const reached = announcement.recipientCount
      toast.success(
        variables.publish
          ? reached === null
            ? "Published"
            : `Published to ${reached} institution${reached === 1 ? "" : "s"}`
          : "Withdrawn"
      )
      queryClient.invalidateQueries({ queryKey: announcementKeys.all })
    },
    onError: (error) =>
      toast.error("Could not change that", {
        description: errorMessage(error, "Try again."),
      }),
  })
}

export function useSendAnnouncementNow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => platformAnnouncementsService.sendNow(id),
    onSuccess: () => {
      toast.success("Sent")
      void queryClient.invalidateQueries({ queryKey: announcementKeys.all })
    },
    onError: (error) =>
      toast.error("Could not send that", {
        description: errorMessage(error, "Nothing was delivered."),
      }),
  })
}

export function useCancelAnnouncementSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => platformAnnouncementsService.cancelSchedule(id),
    onSuccess: () => {
      // Cancelling returns it to a draft rather than throwing the writing
      // away — say which of the two happened.
      toast.success("Schedule cancelled — it is a draft again")
      void queryClient.invalidateQueries({ queryKey: announcementKeys.all })
    },
    onError: (error) =>
      toast.error("Could not cancel that schedule", {
        description: errorMessage(error, "It is still scheduled."),
      }),
  })
}

export function useAnnouncementReads(id: number | null) {
  return useQuery({
    queryKey: [...announcementKeys.all, "reads", id],
    queryFn: () => platformAnnouncementsService.reads(id as number),
    enabled: id !== null && id > 0,
  })
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => platformAnnouncementsService.remove(id),
    onSuccess: () => {
      toast.success("Draft deleted")
      queryClient.invalidateQueries({ queryKey: announcementKeys.all })
    },
    onError: (error) =>
      toast.error("Could not delete that", {
        description: errorMessage(error, "Try again."),
      }),
  })
}

// --- Institution side -------------------------------------------------------

export function useInstitutionNotices() {
  return useQuery({
    queryKey: announcementKeys.notices,
    queryFn: () => institutionNoticesService.list(),
    // Long enough not to be chatty on every navigation, short enough that an
    // incident notice appears without a reload.
    staleTime: 60_000,
    refetchInterval: 300_000,
  })
}

export function useDismissNotice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => institutionNoticesService.dismiss(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: announcementKeys.notices }),
    // Dismissing is not worth interrupting anyone over if it fails; the notice
    // simply reappears on the next load.
    onError: () => undefined,
  })
}
