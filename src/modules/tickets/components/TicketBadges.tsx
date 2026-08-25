"use client"

import { cn } from "@/lib/utils"
import type { TicketPriority, TicketStatus } from "@/modules/tickets/types"

const STATUS_STYLES: Record<TicketStatus, string> = {
  OPEN: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  PENDING:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  RESOLVED:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  CLOSED:
    "border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400",
}

const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Open",
  // Named for who is being waited on, which is the thing an operator scanning
  // a queue actually needs to know.
  PENDING: "Awaiting institution",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
}

const PRIORITY_STYLES: Record<TicketPriority, string> = {
  LOW: "text-muted-foreground",
  NORMAL: "text-muted-foreground",
  HIGH: "text-amber-600 dark:text-amber-400",
  URGENT: "text-red-600 dark:text-red-400",
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

export function TicketPriorityLabel({
  priority,
}: {
  priority: TicketPriority
}) {
  // Low and Normal are deliberately unstyled — colouring every row leaves
  // nothing standing out, which defeats the point of a priority.
  return (
    <span className={cn("text-xs font-medium", PRIORITY_STYLES[priority])}>
      {priority === "NORMAL" || priority === "LOW"
        ? priority.toLowerCase()
        : priority}
    </span>
  )
}
