import apiClient from "@/lib/clients/apiClient"
import type {
  AnnouncementDetail,
  AnnouncementDraft,
  AnnouncementList,
  AudiencePreview,
  InstitutionNotice,
  PlatformAnnouncement,
} from "@/modules/announcements/types"

const AUTH = { access_token: true } as const

/** Composing and publishing, from the platform console. */
export const platformAnnouncementsService = {
  list: (params: { status?: string } = {}) =>
    apiClient.get<AnnouncementList>("/platform/announcements", {
      ...AUTH,
      params,
    }),

  show: async (id: number): Promise<AnnouncementDetail> =>
    (
      await apiClient.get<{ data: AnnouncementDetail }>(
        `/platform/announcements/${id}`,
        AUTH
      )
    ).data,

  /** Who a proposed audience would reach. Writes nothing. */
  preview: async (payload: {
    audience: string
    audienceCategory?: string | null
    tenantIds?: number[]
  }): Promise<AudiencePreview> =>
    (
      await apiClient.post<{ data: AudiencePreview }, typeof payload>(
        "/platform/announcements/preview",
        payload,
        AUTH
      )
    ).data,

  create: async (payload: AnnouncementDraft): Promise<PlatformAnnouncement> =>
    (
      await apiClient.post<{ data: PlatformAnnouncement }, AnnouncementDraft>(
        "/platform/announcements",
        payload,
        AUTH
      )
    ).data,

  update: async (
    id: number,
    payload: Partial<AnnouncementDraft>
  ): Promise<PlatformAnnouncement> =>
    (
      await apiClient.patch<
        { data: PlatformAnnouncement },
        Partial<AnnouncementDraft>
      >(`/platform/announcements/${id}`, payload, AUTH)
    ).data,

  publish: async (id: number): Promise<PlatformAnnouncement> =>
    (
      await apiClient.post<{ data: PlatformAnnouncement }, object>(
        `/platform/announcements/${id}/publish`,
        {},
        AUTH
      )
    ).data,

  unpublish: async (id: number): Promise<PlatformAnnouncement> =>
    (
      await apiClient.post<{ data: PlatformAnnouncement }, object>(
        `/platform/announcements/${id}/unpublish`,
        {},
        AUTH
      )
    ).data,

  /** Send a scheduled announcement immediately, ahead of its own clock. */
  sendNow: async (id: number): Promise<PlatformAnnouncement> =>
    (
      await apiClient.post<
        { data: PlatformAnnouncement },
        Record<string, never>
      >(`/platform/announcements/${id}/send-now`, {}, AUTH)
    ).data,

  /**
   * Cancel a schedule without deleting the announcement.
   *
   * Distinct from delete on purpose: cancelling returns it to a draft the
   * operator can fix and re-schedule, and deleting throws the writing away.
   */
  cancelSchedule: (id: number) =>
    apiClient.delete<void>(`/platform/announcements/${id}/schedule`, AUTH),

  /** Per-institution read stats, for the viewer. */
  reads: async (
    id: number
  ): Promise<{
    recipients: number
    read: number
    institutions: Array<{ id: number; name: string; readAt: string | null }>
  }> =>
    (
      await apiClient.get<{
        data: {
          recipients: number
          read: number
          institutions: Array<{
            id: number
            name: string
            readAt: string | null
          }>
        }
      }>(`/platform/announcements/${id}/reads`, AUTH)
    ).data,

  remove: (id: number) =>
    apiClient.delete<void>(`/platform/announcements/${id}`, AUTH),
}

/**
 * Notices as an institution reads them. Served from the institution's own host,
 * so nothing names which tenant this is — the API resolves it from the request.
 */
export const institutionNoticesService = {
  list: async (): Promise<InstitutionNotice[]> =>
    (
      await apiClient.get<{ data: InstitutionNotice[] }>(
        "/platform-notices",
        AUTH
      )
    ).data,

  dismiss: (id: number) =>
    apiClient.post<void, object>(`/platform-notices/${id}/read`, {}, AUTH),
}

export const announcementKeys = {
  all: ["platform-announcements"] as const,
  list: (params: object) => [...announcementKeys.all, "list", params] as const,
  detail: (id: number) => [...announcementKeys.all, "detail", id] as const,
  notices: ["platform-notices"] as const,
}
