"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { formatMinor } from "@/modules/billing/lib/money"
import type { RevenueRow } from "@/modules/billing/types"

/**
 * Estate revenue, one card per currency.
 *
 * There is deliberately no grand total. QHub does no FX, so adding kobo to
 * cents would be arithmetic on incompatible units — and the resulting number
 * would look authoritative while meaning nothing. If the estate bills in two
 * currencies, the operator sees two cards.
 */
export function RevenueSummary({
  rows,
  isPending,
}: {
  rows: RevenueRow[] | undefined
  isPending: boolean
}) {
  if (isPending) {
    return <Skeleton className="h-28 w-full" />
  }

  if (!rows || rows.length === 0) {
    return null
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => (
        <div key={row.currency} className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {row.currency}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatMinor(row.mrrMinor, row.currency)} / month
            </span>
          </div>

          <dl className="mt-3 space-y-1.5">
            <Line
              label="Collected"
              value={formatMinor(row.paidMinor, row.currency)}
            />
            <Line
              label="Outstanding"
              value={formatMinor(row.outstandingMinor, row.currency)}
            />
            <Line
              label="Overdue"
              value={formatMinor(row.overdueMinor, row.currency)}
              emphasis={row.overdueMinor > 0}
            />
          </dl>
        </div>
      ))}
    </div>
  )
}

function Line({
  label,
  value,
  emphasis,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd
        className={
          emphasis
            ? "font-mono text-sm font-medium text-red-600 dark:text-red-400"
            : "font-mono text-sm text-foreground"
        }
      >
        {value}
      </dd>
    </div>
  )
}
