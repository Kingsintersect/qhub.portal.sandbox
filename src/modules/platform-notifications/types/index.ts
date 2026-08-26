/**
 * Notifications for a platform staff account.
 *
 * Seven kinds, matching the API exactly. They are not decoration: each one
 * carries its own badge tone in the console, and the full page tabs by them.
 */
export const NOTIFICATION_KINDS = [
  "ticket",
  "task",
  "incident",
  "billing",
  "user",
  "report",
  "tenant",
] as const

export type NotificationKind = (typeof NOTIFICATION_KINDS)[number]

export type PlatformNotification = {
  id: number
  kind: NotificationKind
  title: string
  body: string | null
  link: string | null
  actor: string | null
  read: boolean
  createdAt: string | null
}

/** What the bell reads. */
export type NotificationFeed = {
  unread: number
  data: PlatformNotification[]
}

export type NotificationPage = {
  data: PlatformNotification[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
    unread: number
  }
}

export type NotificationKindCount = {
  kind: NotificationKind
  total: number
  unread: number
}
