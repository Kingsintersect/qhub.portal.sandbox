import apiClient from "@/lib/clients/apiClient"
import type { NotificationKind } from "@/modules/platform-notifications/types"
import type {
  MfaEnrolment,
  MfaStatus,
  NotificationPreferences,
  PlatformSession,
} from "@/modules/platform-settings/types"

const AUTH = { access_token: true } as const

export const platformSettingsKeys = {
  all: ["platform", "settings"] as const,
  mfa: () => [...platformSettingsKeys.all, "mfa"] as const,
  sessions: () => [...platformSettingsKeys.all, "sessions"] as const,
  notifications: () => [...platformSettingsKeys.all, "notifications"] as const,
}

export const platformSettingsService = {
  changePassword: async (payload: {
    currentPassword: string
    password: string
    passwordConfirmation: string
  }): Promise<string> =>
    (
      await apiClient.post<{ message: string }>(
        "/platform/settings/password",
        {
          currentPassword: payload.currentPassword,
          password: payload.password,
          password_confirmation: payload.passwordConfirmation,
        },
        AUTH
      )
    ).message,

  mfaStatus: async (): Promise<MfaStatus> =>
    (await apiClient.get<{ data: MfaStatus }>("/platform/settings/mfa", AUTH))
      .data,

  beginMfa: async (): Promise<MfaEnrolment> =>
    (
      await apiClient.post<{ data: MfaEnrolment }>(
        "/platform/settings/mfa/begin",
        {},
        AUTH
      )
    ).data,

  /** Returns the recovery codes. Shown once — they are stored only as hashes. */
  confirmMfa: async (code: string): Promise<string[]> =>
    (
      await apiClient.post<{ data: { recoveryCodes: string[] } }>(
        "/platform/settings/mfa/confirm",
        { code },
        AUTH
      )
    ).data.recoveryCodes,

  /**
   * POST rather than DELETE: the password travels in the body, and a DELETE
   * body is dropped by enough proxies that relying on it would fail in
   * production and nowhere else.
   */
  disableMfa: async (currentPassword: string): Promise<void> => {
    await apiClient.post(
      "/platform/settings/mfa/disable",
      { currentPassword },
      AUTH
    )
  },

  sessions: async (): Promise<PlatformSession[]> =>
    (
      await apiClient.get<{ data: PlatformSession[] }>(
        "/platform/settings/sessions",
        AUTH
      )
    ).data,

  endSession: async (id: number): Promise<void> => {
    await apiClient.delete(`/platform/settings/sessions/${id}`, AUTH)
  },

  signOutEverywhere: async (): Promise<number> =>
    (
      await apiClient.post<{ data: { sessionsEnded: number } }>(
        "/platform/settings/sessions/sign-out-everywhere",
        {},
        AUTH
      )
    ).data.sessionsEnded,

  notificationPreferences: async (): Promise<NotificationPreferences> =>
    (
      await apiClient.get<{ data: NotificationPreferences }>(
        "/platform/settings/notifications",
        AUTH
      )
    ).data,

  setNotificationPreference: async (
    kind: NotificationKind,
    enabled: boolean
  ): Promise<void> => {
    await apiClient.put(
      "/platform/settings/notifications",
      { kind, enabled },
      AUTH
    )
  },
}
