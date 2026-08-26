import apiClient from "@/lib/clients/apiClient"
import type {
  NotificationFeed,
  NotificationKind,
  NotificationKindCount,
  NotificationPage,
} from "@/modules/platform-notifications/types"

const AUTH = { access_token: true } as const

export const platformNotificationKeys = {
  all: ["platform", "notifications"] as const,
  feed: () => [...platformNotificationKeys.all, "feed"] as const,
  page: (kind: NotificationKind | "all", unreadOnly: boolean, page: number) =>
    [...platformNotificationKeys.all, "page", kind, unreadOnly, page] as const,
  counts: () => [...platformNotificationKeys.all, "counts"] as const,
}

export const platformNotificationsService = {
  /** The bell's dropdown: latest few plus the unread count. */
  feed: async (limit = 14): Promise<NotificationFeed> =>
    apiClient.get<NotificationFeed>(
      `/platform/notifications?limit=${limit}`,
      AUTH
    ),

  /** The full page, tabbed by kind and paginated. */
  page: async (params: {
    kind?: NotificationKind | "all"
    unreadOnly?: boolean
    page?: number
    perPage?: number
  }): Promise<NotificationPage> => {
    const query = new URLSearchParams()

    if (params.kind && params.kind !== "all") query.set("kind", params.kind)
    if (params.unreadOnly) query.set("unreadOnly", "1")
    if (params.page) query.set("page", String(params.page))
    query.set("perPage", String(params.perPage ?? 30))

    return apiClient.get<NotificationPage>(
      `/platform/notifications/all?${query.toString()}`,
      AUTH
    )
  },

  counts: async (): Promise<NotificationKindCount[]> =>
    (
      await apiClient.get<{ data: NotificationKindCount[] }>(
        "/platform/notifications/counts",
        AUTH
      )
    ).data,

  markRead: async (id: number): Promise<void> => {
    await apiClient.post(`/platform/notifications/${id}/read`, {}, AUTH)
  },

  markAllRead: async (): Promise<number> =>
    (
      await apiClient.post<{ data: { marked: number } }>(
        "/platform/notifications/read-all",
        {},
        AUTH
      )
    ).data.marked,
}
