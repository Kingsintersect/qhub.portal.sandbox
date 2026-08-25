"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  platformTeamKeys,
  platformTeamService,
} from "@/modules/platform-team/services/platform-team.service"
import type { CreatePlatformUserPayload } from "@/modules/platform-team/types"

function errorMessage(error: unknown, fallback: string): string {
  const response = (error as { response?: { data?: { message?: string } } })
    ?.response
  return response?.data?.message ?? fallback
}

export function usePlatformUsers() {
  return useQuery({
    queryKey: platformTeamKeys.users(),
    queryFn: () => platformTeamService.listUsers(),
  })
}

export function usePlatformRoles() {
  return useQuery({
    queryKey: platformTeamKeys.roles(),
    queryFn: () => platformTeamService.listRoles(),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePlatformPermissions() {
  return useQuery({
    queryKey: platformTeamKeys.permissions(),
    queryFn: () => platformTeamService.listPermissions(),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePlatformAudit(
  params: { tenantId?: number; action?: string } = {}
) {
  return useQuery({
    queryKey: platformTeamKeys.audit(params),
    queryFn: () => platformTeamService.auditLog(params),
  })
}

export function useCreatePlatformUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreatePlatformUserPayload) =>
      platformTeamService.createUser(payload),
    onSuccess: (user) => {
      toast.success(`${user.username} added to the team`)
      queryClient.invalidateQueries({ queryKey: platformTeamKeys.users() })
    },
    onError: (error) =>
      toast.error("Could not add that account", {
        description: errorMessage(error, "Check the details and try again."),
      }),
  })
}

export function useUpdatePlatformUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: { isActive?: boolean; roleIds?: number[] }
    }) => platformTeamService.updateUser(id, payload),
    onSuccess: () => {
      toast.success("Account updated")
      queryClient.invalidateQueries({ queryKey: platformTeamKeys.users() })
    },
    onError: (error) =>
      // The lockout guard returns 409 with a specific explanation — surfacing
      // the API's own message is the whole value here.
      toast.error("Could not update that account", {
        description: errorMessage(error, "The change was not applied."),
      }),
  })
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      roleId,
      permissionIds,
    }: {
      roleId: number
      permissionIds: number[]
    }) => platformTeamService.updateRolePermissions(roleId, permissionIds),
    onSuccess: () => {
      toast.success("Role permissions saved")
      queryClient.invalidateQueries({ queryKey: platformTeamKeys.roles() })
    },
    onError: (error) =>
      toast.error("Could not save permissions", {
        description: errorMessage(error, "The change was not applied."),
      }),
  })
}
