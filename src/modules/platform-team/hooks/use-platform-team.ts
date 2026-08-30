"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  platformTeamKeys,
  platformTeamService,
} from "@/modules/platform-team/services/platform-team.service"
import type { CreatePlatformUserPayload } from "@/modules/platform-team/types"
import { errorMessage } from "@/lib/api-error"

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
  params: {
    tenantId?: number
    action?: string
    category?: string
    actorClass?: string
    search?: string
    page?: number
    perPage?: number
  } = {},
  /** Off while the operator has paused the stream. */
  live = false
) {
  return useQuery({
    queryKey: platformTeamKeys.audit(params),
    queryFn: () => platformTeamService.auditLog(params),
    // The log is append-only and the console is a live tool, so it refreshes
    // itself. Pausing stops the poll rather than hiding new rows — an
    // operator reading one incident does not want the table moving underneath
    // them, and a paused feed that still fetched would do exactly that.
    refetchInterval: live ? 6_000 : false,
    placeholderData: (previous) => previous,
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

export function useCreateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: {
      name: string
      description: string
      permissionIds?: number[]
    }) => platformTeamService.createRole(payload),
    onSuccess: () => {
      toast.success("Role created")
      queryClient.invalidateQueries({ queryKey: platformTeamKeys.all })
    },
    onError: (error) =>
      toast.error("Could not create that role", {
        description: errorMessage(error, "Try again."),
      }),
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      roleId,
      ...payload
    }: {
      roleId: number
      name?: string
      description?: string
    }) => platformTeamService.updateRole(roleId, payload),
    onSuccess: () => {
      toast.success("Role updated")
      queryClient.invalidateQueries({ queryKey: platformTeamKeys.all })
    },
    onError: (error) =>
      // The API refuses renaming a built-in role and says why; that reason is
      // more useful than a generic failure.
      toast.error("Could not update that role", {
        description: errorMessage(error, "The change was not applied."),
      }),
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roleId: number) => platformTeamService.deleteRole(roleId),
    onSuccess: () => {
      toast.success("Role deleted")
      queryClient.invalidateQueries({ queryKey: platformTeamKeys.all })
    },
    onError: (error) =>
      toast.error("Could not delete that role", {
        description: errorMessage(error, "Try again."),
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
