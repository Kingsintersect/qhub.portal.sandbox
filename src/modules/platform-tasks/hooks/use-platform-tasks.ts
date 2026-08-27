"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  platformTaskKeys,
  platformTasksService,
} from "@/modules/platform-tasks/services/platform-tasks.service"
import type {
  TaskScope,
  TaskStatusFilter,
  TaskTimeline,
} from "@/modules/platform-tasks/types"

function errorMessage(error: unknown, fallback: string): string {
  return (
    (error as { message?: string } | null)?.message ??
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ??
    fallback
  )
}

export function useTasks(scope: TaskScope, status: TaskStatusFilter) {
  return useQuery({
    queryKey: platformTaskKeys.list(scope, status),
    queryFn: () => platformTasksService.list({ scope, status }),
    placeholderData: (previous) => previous,
  })
}

export function useTeamMetrics() {
  return useQuery({
    queryKey: platformTaskKeys.team(),
    queryFn: () => platformTasksService.team(30),
  })
}

/** Everything that changes a task invalidates the same tree. */
function useTaskMutation<TVars>(
  fn: (vars: TVars) => Promise<unknown>,
  success: (vars: TVars) => string,
  fallback: string
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: fn,
    onSuccess: (_data, vars) => {
      toast.success(success(vars))
      void queryClient.invalidateQueries({ queryKey: platformTaskKeys.all })
      // Accepting or ticking a step notifies somebody, so the bell should
      // reflect it without waiting for its next poll.
      void queryClient.invalidateQueries({
        queryKey: ["platform", "notifications"],
      })
    },
    onError: (e) => toast.error(errorMessage(e, fallback)),
  })
}

export function useAcceptTask() {
  return useTaskMutation<{ id: number; timeline?: TaskTimeline }>(
    ({ id, timeline }) => platformTasksService.accept(id, timeline),
    ({ timeline }) =>
      timeline
        ? `Accepted — due in ${timeline}. Your assigner has been told.`
        : "Accepted. Your assigner has been told.",
    "That task could not be accepted."
  )
}

export function useResolveTask() {
  return useTaskMutation<number>(
    (id) => platformTasksService.resolve(id),
    () => "Marked resolved.",
    "That task could not be resolved."
  )
}

export function useCancelTask() {
  return useTaskMutation<{ id: number; reason: string }>(
    ({ id, reason }) => platformTasksService.cancel(id, reason),
    () => "Task cancelled.",
    "That task could not be cancelled."
  )
}

export function useAddTaskStep() {
  return useTaskMutation<{ id: number; body: string }>(
    ({ id, body }) => platformTasksService.addStep(id, body),
    () => "Step added.",
    "That step could not be added."
  )
}

export function useCompleteTaskStep() {
  return useTaskMutation<number>(
    (stepId) => platformTasksService.completeStep(stepId),
    () => "Step ticked — the assigner has been told, with the time.",
    "That step could not be ticked."
  )
}

export function useTagColleague() {
  return useTaskMutation<{ id: number; platformUserId: number; note?: string }>(
    ({ id, platformUserId, note }) =>
      platformTasksService.tag(id, platformUserId, note),
    () => "Tagged — they have been notified.",
    "That person could not be tagged."
  )
}
