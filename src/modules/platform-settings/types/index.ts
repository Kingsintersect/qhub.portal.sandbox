import type { NotificationKind } from "@/modules/platform-notifications/types"

export type MfaStatus = {
  enabled: boolean
  enrolledAt: string | null
  recoveryCodesRemaining: number
}

/** What an authenticator needs to enrol. Held only until the code confirms. */
export type MfaEnrolment = {
  secret: string
  /** The secret grouped for someone typing it rather than scanning. */
  manualEntry: string
  /** otpauth:// URI, rendered as the QR code. */
  uri: string
}

export type PlatformSession = {
  id: number
  device: string
  ipAddress: string | null
  lastActive: string | null
  createdAt: string | null
  /** The session the operator is sitting in. Never offered an end button. */
  isCurrent: boolean
}

/**
 * Preferences come back as a MAP keyed by kind, not a list.
 *
 * Every kind is present whether or not it was ever set — the API fills the
 * unset ones with true — so the console never has to guess a default.
 */
export type NotificationPreferences = Record<NotificationKind, boolean>
