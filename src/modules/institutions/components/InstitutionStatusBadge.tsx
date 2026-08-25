"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { InstitutionStatus } from "@/modules/institutions/types"

/**
 * Status is the single most operationally important field on an institution —
 * it decides whether the institution serves traffic at all — so it gets a
 * consistent colour treatment everywhere it appears.
 */
const STATUS_STYLES: Record<InstitutionStatus, string> = {
  ACTIVE:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  PROVISIONING:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  SUSPENDED:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300",
  ARCHIVED:
    "border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400",
}

const STATUS_LABELS: Record<InstitutionStatus, string> = {
  ACTIVE: "Active",
  PROVISIONING: "Provisioning",
  SUSPENDED: "Suspended",
  ARCHIVED: "Archived",
}

export function InstitutionStatusBadge({
  status,
  className,
}: {
  status: InstitutionStatus
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", STATUS_STYLES[status], className)}
    >
      {STATUS_LABELS[status]}
    </Badge>
  )
}
