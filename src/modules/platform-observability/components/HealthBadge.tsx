"use client"

import { AlertTriangle, CheckCircle2, CircleHelp, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import type { HealthStatus } from "@/modules/platform-observability/types"

/**
 * Health, shown as icon + word rather than colour alone.
 *
 * A red dot is unreadable to anyone with a colour-vision deficiency and
 * ambiguous to everyone else — "failing" is not.
 */
const STYLES: Record<
  HealthStatus,
  { label: string; className: string; Icon: typeof CheckCircle2 }
> = {
  OK: {
    label: "Healthy",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
    Icon: CheckCircle2,
  },
  WARN: {
    label: "Attention",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
    Icon: AlertTriangle,
  },
  FAIL: {
    label: "Failing",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
    Icon: XCircle,
  },
}

export function HealthBadge({
  status,
  count,
  className,
}: {
  status: HealthStatus
  count?: number
  className?: string
}) {
  const style = STYLES[status] ?? {
    label: "Unknown",
    className: "border-border text-muted-foreground",
    Icon: CircleHelp,
  }

  const { Icon } = style

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        style.className,
        className
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {style.label}
      {count !== undefined && count > 0 && (
        <span className="opacity-80">· {count}</span>
      )}
    </span>
  )
}
