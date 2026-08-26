import apiClient from "@/lib/clients/apiClient"
import type {
  PlatformTask,
  TaskListResponse,
  TaskScope,
  TaskStatusFilter,
  TaskTimeline,
  TeamMetric,
} from "@/modules/platform-tasks/types"

const AUTH = { access_token: true } as const

export const platformTaskKeys = {
  all: ["platform", "tasks"] as const,
  list: (scope: TaskScope, status: TaskStatusFilter) =>
    [...platformTaskKeys.all, "list", scope, status] as const,
  team: () => [...platformTaskKeys.all, "team"] as const,
}

export const platformTasksService = {
  list: async (params: {
    scope: TaskScope
    status: TaskStatusFilter
  }): Promise<TaskListResponse> => {
    const query = new URLSearchParams({ scope: params.scope })
    if (params.status) query.set("status", params.status)

    return apiClient.get<TaskListResponse>(
      `/platform/tasks?${query.toString()}`,
      AUTH
    )
  },

  team: async (days = 30): Promise<TeamMetric[]> =>
    (
      await apiClient.get<{ data: TeamMetric[] }>(
        `/platform/tasks/team?days=${days}`,
        AUTH
      )
    ).data,

  accept: async (id: number, timeline?: TaskTimeline): Promise<PlatformTask> =>
    (
      await apiClient.post<{ data: PlatformTask }>(
        `/platform/tasks/${id}/accept`,
        timeline ? { timeline } : {},
        AUTH
      )
    ).data,

  resolve: async (id: number): Promise<PlatformTask> =>
    (
      await apiClient.post<{ data: PlatformTask }>(
        `/platform/tasks/${id}/resolve`,
        {},
        AUTH
      )
    ).data,

  addStep: async (id: number, body: string): Promise<PlatformTask> =>
    (
      await apiClient.post<{ data: PlatformTask }>(
        `/platform/tasks/${id}/steps`,
        { body },
        AUTH
      )
    ).data,

  completeStep: async (stepId: number): Promise<PlatformTask> =>
    (
      await apiClient.post<{ data: PlatformTask }>(
        `/platform/task-steps/${stepId}/complete`,
        {},
        AUTH
      )
    ).data,

  tag: async (
    id: number,
    platformUserId: number,
    note?: string
  ): Promise<PlatformTask> =>
    (
      await apiClient.post<{ data: PlatformTask }>(
        `/platform/tasks/${id}/tag`,
        { platformUserId, ...(note ? { note } : {}) },
        AUTH
      )
    ).data,
}
