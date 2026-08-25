"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { usePlatformAudit } from "@/modules/platform-team/hooks/use-platform-team"

/**
 * What platform staff have done, including anything they reached into an
 * institution's database to do.
 *
 * The institution column is the point: it is what makes scoped cross-tenant
 * access accountable rather than merely convenient.
 */
export function PlatformAuditPanel() {
  const [action, setAction] = useState("")
  const { data, isPending, isError } = usePlatformAudit(
    action.trim() ? { action: action.trim() } : {}
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Audit trail
        </h1>
        <p className="text-sm text-muted-foreground">
          Every action taken from this console, and which institution it
          touched.
        </p>
      </div>

      <div className="relative w-full sm:max-w-xs">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={action}
          onChange={(event) => setAction(event.target.value)}
          placeholder="Filter by action"
          aria-label="Filter by action"
          className="pl-9"
        />
      </div>

      {isError && (
        <p role="alert" className="text-sm text-destructive">
          Could not load the audit trail.
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <caption className="sr-only">Platform audit entries</caption>
          <thead className="border-b border-border bg-muted/40">
            <tr className="text-xs tracking-wide text-muted-foreground uppercase">
              <th scope="col" className="px-4 py-3 font-medium">
                Action
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Who
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Institution
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Target
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                When
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isPending &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((__, c) => (
                    <td key={c} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isPending && data?.data.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  Nothing recorded yet.
                </td>
              </tr>
            )}

            {data?.data.map((entry) => (
              <tr
                key={entry.id}
                className="transition-colors hover:bg-muted/40"
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  {entry.action}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {entry.actor ?? "system"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {/* Blank means the action was platform-side and touched no
                      institution's data — worth distinguishing from unknown. */}
                  {entry.institution ?? "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {entry.entityType}
                  {entry.entityId ? ` #${entry.entityId}` : ""}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {entry.createdAt
                    ? new Date(entry.createdAt).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.meta && (
        <p className="text-xs text-muted-foreground">
          {data.meta.total.toLocaleString()} entr
          {data.meta.total === 1 ? "y" : "ies"}
        </p>
      )}
    </div>
  )
}
