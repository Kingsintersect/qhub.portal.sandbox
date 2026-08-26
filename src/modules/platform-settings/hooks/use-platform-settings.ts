"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  platformSettingsKeys,
  platformSettingsService,
} from "@/modules/platform-settings/services/platform-settings.service"
import type { NotificationKind } from "@/modules/platform-notifications/types"

function errorMessage(error: unknown, fallback: string): string {
  return (
    (error as { message?: string } | null)?.message ??
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ??
    fallback
  )
}

export function useMfaStatus() {
  return useQuery({
    queryKey: platformSettingsKeys.mfa(),
    queryFn: () => platformSettingsService.mfaStatus(),
  })
}

export function usePlatformSessions() {
  return useQuery({
    queryKey: platformSettingsKeys.sessions(),
    queryFn: () => platformSettingsService.sessions(),
  })
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: platformSettingsKeys.notifications(),
    queryFn: () => platformSettingsService.notificationPreferences(),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: platformSettingsService.changePassword,
    onSuccess: (message) => toast.success(message),
    onError: (e) =>
      toast.error(errorMessage(e, "That password could not be changed.")),
  })
}

export function useBeginMfa() {
  return useMutation({
    mutationFn: () => platformSettingsService.beginMfa(),
    onError: (e) =>
      toast.error(errorMessage(e, "Enrolment could not be started.")),
  })
}

export function useConfirmMfa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (code: string) => platformSettingsService.confirmMfa(code),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: platformSettingsKeys.mfa(),
      })
    },
    onError: (e) =>
      toast.error(errorMessage(e, "That code is not right. Try the next one.")),
  })
}

export function useDisableMfa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (currentPassword: string) =>
      platformSettingsService.disableMfa(currentPassword),
    onSuccess: () => {
      toast.success("Two-factor authentication is off.")
      void queryClient.invalidateQueries({
        queryKey: platformSettingsKeys.mfa(),
      })
    },
    onError: (e) =>
      toast.error(errorMessage(e, "MFA could not be turned off.")),
  })
}

export function useEndSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => platformSettingsService.endSession(id),
    onSuccess: () => {
      toast.success("That session was ended.")
      void queryClient.invalidateQueries({
        queryKey: platformSettingsKeys.sessions(),
      })
    },
    onError: (e) =>
      toast.error(errorMessage(e, "That session could not be ended.")),
  })
}

export function useSignOutEverywhere() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => platformSettingsService.signOutEverywhere(),
    onSuccess: (ended) => {
      toast.success(
        `Signed out everywhere — ${ended} ${ended === 1 ? "session" : "sessions"} ended.`
      )
      void queryClient.invalidateQueries({
        queryKey: platformSettingsKeys.sessions(),
      })
    },
    onError: (e) => toast.error(errorMessage(e, "That did not work.")),
  })
}

export function useSetNotificationPreference() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { kind: NotificationKind; enabled: boolean }) =>
      platformSettingsService.setNotificationPreference(
        input.kind,
        input.enabled
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: platformSettingsKeys.notifications(),
      })
    },
    onError: (e) =>
      toast.error(errorMessage(e, "That preference could not be saved.")),
  })
}
