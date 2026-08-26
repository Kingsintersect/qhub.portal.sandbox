"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { resolveApiBaseUrl } from "@/lib/tenant/api-origin"
import { usePlatformPermissions } from "@/lib/auth/platform-permissions"
import { useInstitutionAnalytics } from "@/modules/platform-controls/hooks/use-controls"

const RANGES = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
]

/**
 * Whether this institution actually uses what it is paying for.
 *
 * Counts rather than a feed — the activity log above already shows individual
 * events. Adoption is the number that matters: five thousand students and
 * forty logins a week is a churn signal months before anyone cancels.
 */
export function UsagePanel({ institutionId }: { institutionId: number }) {
  const { can } = usePlatformPermissions()
  const [days, setDays] = useState(30)
  const [exporting, setExporting] = useState(false)

  const { data, isPending } = useInstitutionAnalytics(institutionId, days)

  const canExport = can("data.export")

  /**
   * The export is a file download, not JSON, so it goes through a direct fetch
   * rather than the API client — and the token has to ride on the request,
   * which rules out pointing a plain link at the endpoint.
   */
  const download = async () => {
    setExporting(true)

    try {
      // Same origin resolution as every other call, so this works on the
      // platform host in production and across the dev port split alike.
      const response = await fetch(
        `${resolveApiBaseUrl()}/platform/tenants/${institutionId}/export`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}`,
          },
        }
      )

      if (!response.ok) {
        toast.error("Could not export that institution", {
          description:
            response.status === 403
              ? "Your account does not hold the export permission."
              : `The server returned ${response.status}.`,
        })

        return
      }

      // The filename comes from the response, so it matches what the server
      // actually named the archive rather than a second guess at it.
      const suggested = response.headers
        .get("content-disposition")
        ?.match(/filename="?([^";]+)"?/)?.[1]

      const url = URL.createObjectURL(await response.blob())
      const link = document.createElement("a")
      link.href = url
      link.download = suggested ?? `institution-${institutionId}-export.zip`
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error("Could not export that institution", {
        description: "The download did not complete.",
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Usage</CardTitle>
            <p className="text-sm text-muted-foreground">
              {data
                ? `${data.totals.logins.toLocaleString()} sign-in${data.totals.logins === 1 ? "" : "s"} by ${data.totals.activeUsers.toLocaleString()} ${data.totals.activeUsers === 1 ? "person" : "people"} over ${data.windowDays} days`
                : "How much of the portal this institution uses."}
            </p>
          </div>

          {canExport && (
            <Button
              variant="outline"
              onClick={download}
              disabled={exporting}
              title="Download this institution's own records as CSVs"
            >
              {exporting ? (
                <Loader2
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Download className="mr-2 size-4" aria-hidden="true" />
              )}
              Export data
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-1" role="group" aria-label="Range">
          {RANGES.map((range) => (
            <button
              key={range.value}
              type="button"
              aria-pressed={days === range.value}
              onClick={() => setDays(range.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                days === range.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isPending && <Skeleton className="h-64 w-full" />}

        {!isPending && data && data.totals.events === 0 && (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nothing recorded in this window. Either nobody signed in, or this
            institution is not yet in use.
          </p>
        )}

        {!isPending && data && data.totals.events > 0 && (
          <>
            <div>
              <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Sign-ins by hour
                {/* Named, because timestamps are stored UTC and an unlabelled
                    "9am" is a guess about which 9am. */}
                <span className="ml-1 normal-case">({data.timezone})</span>
              </h3>

              <div className="mt-2 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.byHour}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="hour"
                      tickFormatter={(hour: number) => `${hour}`}
                      stroke="var(--muted-foreground)"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      stroke="var(--muted-foreground)"
                      fontSize={11}
                      tickLine={false}
                      width={28}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      labelFormatter={(hour) => `${hour}:00`}
                    />
                    <Bar
                      dataKey="logins"
                      fill="var(--primary)"
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Adoption by role
              </h3>

              <ul className="mt-2 space-y-2">
                {data.adoption.map((row) => {
                  const share =
                    row.total === 0
                      ? 0
                      : Math.round((row.active / row.total) * 100)

                  return (
                    <li key={row.role}>
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="text-foreground">
                          {row.role.replace(/_/g, " ")}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {row.active} of {row.total} active
                        </span>
                      </div>

                      <div
                        className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                        role="img"
                        aria-label={`${share}% of ${row.role} accounts were active`}
                      >
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
