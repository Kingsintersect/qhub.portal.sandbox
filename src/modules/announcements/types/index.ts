/**
 * Announcements FROM the platform team TO the institutions it hosts.
 *
 * Not to be confused with `src/modules/content`, which is an institution
 * announcing to its own students and staff. Same word, opposite direction.
 */

export type AnnouncementSeverity = "INFO" | "WARNING" | "CRITICAL"

export type AnnouncementAudience = "ALL" | "SELECTED" | "CATEGORY"

/** What the platform console sees. */
export interface PlatformAnnouncement {
  id: number
  title: string
  body: string
  severity: AnnouncementSeverity
  audience: AnnouncementAudience
  audienceCategory: string | null
  isPublished: boolean
  isLive: boolean
  /** Set while it is queued to go out on its own clock. */
  scheduledFor: string | null
  publishedAt: string | null
  expiresAt: string | null
  notifyStaff: boolean
  notifiedCount: number | null
  recipientCount: number | null
  author: string | null
  createdAt: string | null
}

export interface AnnouncementDetail extends PlatformAnnouncement {
  recipients: Array<{ id: number; name: string; slug: string }>
  readCount: number
}

export interface AnnouncementList {
  data: PlatformAnnouncement[]
  meta: { liveCount: number; draftCount: number }
}

export interface AudiencePreview {
  count: number
  institutions: Array<{ id: number; name: string; slug: string }>
}

/**
 * What an institution sees — deliberately narrower. No author, no recipient
 * list, no sense of how large the estate is.
 */
export interface InstitutionNotice {
  id: number
  title: string
  body: string
  severity: AnnouncementSeverity
  publishedAt: string | null
  expiresAt: string | null
  dismissed: boolean
}

export interface AnnouncementDraft {
  title: string
  body: string
  severity: AnnouncementSeverity
  audience: AnnouncementAudience
  audienceCategory?: string | null
  tenantIds?: number[]
  expiresAt?: string | null
  notifyStaff?: boolean
}
