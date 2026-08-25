"use client"

import { useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatBytes } from "@/modules/platform-observability/components/EstateDashboard"
import { HealthBadge } from "@/modules/platform-observability/components/HealthBadge"
import { MetricChart } from "@/modules/platform-observability/components/MetricChart"
import { StatTile } from "@/modules/platform-observability/components/StatTile"
import {
  useInstitutionActivity,
  useInstitutionObservability,
} from "@/modules/platform-observability/hooks/use-observability"
import type { MetricPoint } from "@/modules/platform-observability/types"

const RANGES = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
]

const CHARTS: Array<{ key: keyof MetricPoint; label: string }> = [
  { key: "activity24h", label: "Activity" },
  { key: "students", label: "Students" },
  { key: "enrollments", label: "Enrolments" },
  { key: "logins24h", label: "Sign-ins" },
]

/**
 * One institution's numbers, health and activity.
 *
 * Stat tiles read LIVE from the institution's database; the charts come from the
 * central rollup. That split is deliberate — someone opening this page to
 * investigate needs current counts, while a trend needs history the live
 * database does not keep.
 */
export function InstitutionObservabilityPanel({
  institutionId,
}: {
  institutionId: number
}) {
  const [days, setDays] = useState(30)
  const { data, isPending, isError } = useInstitutionObservability(
    institutionId,
    days
  )
  const activity = useInstitutionActivity(institutionId)

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <p role="alert" className="text-sm text-destructive">
        Could not load metrics for this institution.
      </p>
    )
  }

  const current = data.current
  const issues = data.checks.filter((c) => c.status !== "OK")
  const latest = data.series.at(-1)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <HealthBadge status={data.health} count={issues.length} />

        <div className="flex gap-1" role="group" aria-label="Chart range">
          {RANGES.map((range) => (
            <button
              key={range.days}
              type="button"
              aria-pressed={days === range.days}
              onClick={() => setDays(range.days)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                days === range.days
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {current.stale && (
        // The live read failed. Say so rather than showing zeros that look like
        // an empty institution.
        <p
          role="alert"
          className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
        >
          Could not read this institution&rsquo;s database just now — the
          figures below are from the last capture, not current.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile
          label="Students"
          value={current.students ?? latest?.students ?? 0}
        />
        <StatTile
          label="Lecturers"
          value={current.lecturers ?? latest?.lecturers ?? 0}
        />
        <StatTile label="Staff" value={current.staff ?? 0} />
        <StatTile
          label="Programmes"
          value={current.programs ?? latest?.programs ?? 0}
        />
        <StatTile
          label="Courses"
          value={current.courses ?? latest?.courses ?? 0}
        />
        <StatTile
          label="Storage"
          value={formatBytes(latest?.databaseBytes ?? 0)}
        />
      </div>

      {issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {issues.map((check) => (
              <div
                key={check.key}
                className="flex flex-wrap items-start justify-between gap-2 rounded-md border border-border px-3 py-2"
              >
                <span>
                  <span className="text-sm font-medium text-foreground capitalize">
                    {check.key}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {check.summary}
                  </span>
                </span>
                <span className="flex flex-col items-end gap-1">
                  <HealthBadge status={check.status} />
                  {check.failingSince && (
                    // How long it has been broken, not merely that it is.
                    <span className="text-[11px] text-muted-foreground">
                      since {new Date(check.failingSince).toLocaleDateString()}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {CHARTS.map((chart) => (
          <Card key={String(chart.key)}>
            <CardHeader>
              <CardTitle className="text-base">{chart.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <MetricChart
                points={data.series}
                dataKey={chart.key}
                label={chart.label}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activity.isPending && <Skeleton className="h-24 w-full" />}

          {activity.data?.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No recorded activity.
            </p>
          )}

          <ul className="divide-y divide-border">
            {activity.data?.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-baseline gap-x-2 py-2 text-sm"
              >
                <span className="font-medium text-foreground">
                  {entry.action}
                </span>
                <span className="text-muted-foreground">
                  {entry.entityType}
                  {entry.entityId ? ` #${entry.entityId}` : ""}
                </span>
                <span className="text-xs text-muted-foreground">
                  by {entry.actor ?? "system"}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {entry.createdAt
                    ? new Date(entry.createdAt).toLocaleString()
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
