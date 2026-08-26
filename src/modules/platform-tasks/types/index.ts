/**
 * The timelines an assignee can commit to when accepting.
 *
 * Picking one is what unlocks Accept — unless the task carried a resolve-by
 * at creation (engineering tickets), where the deadline is not the assignee's
 * to choose and Accept is one click.
 */
export const TASK_TIMELINES = ["4h", "8h", "1d", "2d", "3d"] as const
export type TaskTimeline = (typeof TASK_TIMELINES)[number]

export type TaskStep = {
  id: number
  body: string
  done: boolean
  completedBy: string | null
  completedAt: string | null
}

export type TaskTag = {
  user: string | null
  note: string | null
}

export type PlatformTask = {
  id: number
  reference: string
  title: string
  body: string | null
  priority: string
  /** Derived from timestamps server-side. There is no status picker. */
  status: string
  source: string | null
  institution: string | null
  ticketId: number | null
  assignee: string | null
  assigneeId: number | null
  assigner: string | null
  awaitingAcceptance: boolean
  overdue: boolean
  deadlineSetAtCreation: boolean
  assignedAt: string | null
  acceptedAt: string | null
  resolveBy: string | null
  resolvedAt: string | null
  minutesToAccept: number | null
  minutesToResolve: number | null
  steps: TaskStep[]
  tags: TaskTag[]
}

export type TaskListResponse = {
  data: PlatformTask[]
  meta: {
    openForYou: number
    awaitingAcceptance: number
  }
}

export type TeamMetric = {
  id: number
  staff: string
  open: number
  awaitingAcceptance: number
  /** Null, not zero, where nothing has completed — "no data" is not "instant". */
  avgAcceptMinutes: number | null
  avgResolveMinutes: number | null
}

export type TaskScope = "mine" | "all"
export type TaskStatusFilter = "" | "open" | "awaiting" | "resolved"
