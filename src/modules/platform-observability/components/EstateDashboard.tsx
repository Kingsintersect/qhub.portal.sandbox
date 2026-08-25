"use client"

import Link from "next/link"
import { AlertTriangle } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { HealthBadge } from "@/modules/platform-observability/components/HealthBadge"
import { StatTile } from "@/modules/platform-observability/components/StatTile"
import { useEstateOverview } from "@/modules/platform-observability/hooks/use-observability"

/**
 * The estate at a glance: totals, and which institutions need attention.
 *
 * Everything here comes from the central rollup, so it is one query no matter
 * how many institutions exist.
 */
export function EstateDashboard() {
  const { data, isPending, isError } = useEstateOverview()

  if (isError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        Could not load estate metrics.
      </p>
    )
  }

  const totals = data?.totals
  const health = data?.health

  // Sorted worst-first: the reason to open this page is to find what is wrong.
  const needingAttention = (data?.institutions ?? [])
    .filter((i) => i.health !== "OK")
    .sort(
      (a, b) => (a.health === "FAIL" ? -1 : 1) - (b.health === "FAIL" ? -1 : 1)
    )

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {isPending ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))
        ) : (
          <>
            <StatTile
              label="Institutions"
              value={totals?.institutions ?? 0}
              hint={`${totals?.active ?? 0} active · ${totals?.suspended ?? 0} suspended`}
            />
            <StatTile
              label="Students"
              value={totals?.students ?? 0}
              hint="Across the estate"
            />
            <StatTile
              label="Lecturers"
              value={totals?.lecturers ?? 0}
              hint="Across the estate"
            />
            <StatTile
              label="Activity (24h)"
              value={totals?.activity24h ?? 0}
              hint={`${formatBytes(totals?.databaseBytes ?? 0)} stored`}
            />
          </>
        )}
      </div>

      {health && (
        <div className="flex flex-wrap items-center gap-2">
          <HealthBadge status="FAIL" count={health.failing} />
          <HealthBadge status="WARN" count={health.warning} />
          <HealthBadge status="OK" count={health.healthy} />

          {/* Distinct from healthy: never collected at all, which almost always
              means the scheduler is not running. Worth saying out loud. */}
          {health.unknown > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
              <AlertTriangle className="size-3.5" aria-hidden="true" />
              {health.unknown} never collected
            </span>
          )}

          <span className="ml-auto text-xs text-muted-foreground">
            {data?.lastCapturedAt
              ? `Last capture ${new Date(data.lastCapturedAt).toLocaleTimeString()}`
              : "No captures yet"}
          </span>
        </div>
      )}

      {needingAttention.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">
            Needs attention
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {needingAttention.map((institution) => (
              <Link
                key={institution.id}
                href={`/platform/${institution.id}`}
                className="rounded-lg border border-border p-3 transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {institution.name}
                  </span>
                  <HealthBadge status={institution.health} />
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {institution.issues} issue
                  {institution.issues === 1 ? "" : "s"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B"

  const units = ["B", "KB", "MB", "GB", "TB"]
  const exponent = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024))
  )

  return `${(bytes / 1024 ** exponent).toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`
}
