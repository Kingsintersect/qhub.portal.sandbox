"use client"

import { cn } from "@/lib/utils"

/** One number with its label. Deliberately plain — the number is the content. */
export function StatTile({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string
  value: string | number
  hint?: string
  tone?: "default" | "warning" | "danger"
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums",
          tone === "danger"
            ? "text-red-600 dark:text-red-400"
            : tone === "warning"
              ? "text-amber-600 dark:text-amber-400"
              : "text-foreground"
        )}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
