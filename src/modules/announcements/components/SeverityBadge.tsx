import { AlertTriangle, Info, ShieldAlert } from "lucide-react"

import { cn } from "@/lib/utils"
import type { AnnouncementSeverity } from "@/modules/announcements/types"

/**
 * Severity, shown the same way in both consoles.
 *
 * Colour is never the only signal — each level carries its own icon and word —
 * so the difference survives a monochrome screen and colour-blind readers.
 */
const SEVERITY = {
  INFO: {
    label: "Info",
    Icon: Info,
    className:
      "border-sky-300 text-sky-700 dark:border-sky-900 dark:text-sky-300",
    surface: "border-sky-300 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/40",
  },
  WARNING: {
    label: "Warning",
    Icon: AlertTriangle,
    className:
      "border-amber-400 text-amber-700 dark:border-amber-900 dark:text-amber-300",
    surface:
      "border-amber-400 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40",
  },
  CRITICAL: {
    label: "Critical",
    Icon: ShieldAlert,
    className:
      "border-red-400 text-red-700 dark:border-red-900 dark:text-red-300",
    surface: "border-red-400 bg-red-50 dark:border-red-900 dark:bg-red-950/40",
  },
} as const

export function severityStyles(severity: AnnouncementSeverity) {
  return SEVERITY[severity] ?? SEVERITY.INFO
}

export function SeverityBadge({
  severity,
  className,
}: {
  severity: AnnouncementSeverity
  className?: string
}) {
  const { label, Icon, className: tone } = severityStyles(severity)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        tone,
        className
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </span>
  )
}
