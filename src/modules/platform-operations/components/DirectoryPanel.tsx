"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { usePlatformPermissions } from "@/lib/auth/platform-permissions"
import { useTenantDirectory } from "@/modules/platform-operations/hooks/use-operations"

/**
 * The people inside one institution.
 *
 * Read live rather than from the rollup — the rollup holds counts, and someone
 * opening this wants the actual list.
 */
export function DirectoryPanel({ institutionId }: { institutionId: number }) {
  const { can } = usePlatformPermissions()
  const [kind, setKind] = useState<"lecturers" | "students">("lecturers")
  const [search, setSearch] = useState("")

  const { data, isPending } = useTenantDirectory(institutionId, {
    kind,
    ...(search.trim() ? { search: search.trim() } : {}),
  })

  if (!can("tenant_data.read")) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">People</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1" role="group" aria-label="Directory type">
            {(["lecturers", "students"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={kind === option}
                onClick={() => setKind(option)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  kind === option
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email"
              aria-label="Search people"
              className="pl-9"
            />
          </div>
        </div>

        {data?.error && (
          // The institution's database could not be read. Say so rather than
          // rendering an empty list that reads as "nobody works here".
          <p role="alert" className="text-xs text-destructive">
            Could not read this institution&rsquo;s records: {data.error}
          </p>
        )}

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <caption className="sr-only">Directory</caption>
            <thead className="border-b border-border bg-muted/40">
              <tr className="text-xs tracking-wide text-muted-foreground uppercase">
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Name
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Identifier
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  {kind === "students" ? "Programme" : "Department"}
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Email
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isPending &&
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 4 }).map((__, c) => (
                      <td key={c} className="px-4 py-2.5">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isPending && data?.data.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No {kind} recorded.
                  </td>
                </tr>
              )}

              {data?.data.map((person) => (
                <tr
                  key={person.id}
                  className="transition-colors hover:bg-muted/40"
                >
                  <td className="px-4 py-2.5 font-medium text-foreground">
                    {person.name}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                    {person.identifier ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {person.affiliation ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {person.email ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.total > data.data.length && (
          <p className="text-xs text-muted-foreground">
            Showing {data.data.length} of {data.total.toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
