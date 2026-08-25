"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useInstitutions } from "@/modules/institutions/hooks/use-institutions"
import { InstitutionStatusBadge } from "@/modules/institutions/components/InstitutionStatusBadge"
import type { InstitutionStatus } from "@/modules/institutions/types"

const STATUS_FILTERS: Array<{ label: string; value: InstitutionStatus | "" }> =
  [
    { label: "All", value: "" },
    { label: "Active", value: "ACTIVE" },
    { label: "Suspended", value: "SUSPENDED" },
    { label: "Archived", value: "ARCHIVED" },
  ]

export function InstitutionsTable() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<InstitutionStatus | "">("")

  const filters = useMemo(
    () => ({
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(status ? { status } : {}),
    }),
    [search, status]
  )

  const { data, isPending, isError, error } = useInstitutions(filters)
  const institutions = data?.data ?? []

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or slug"
            aria-label="Search institutions"
            className="pl-9"
          />
        </div>

        <div
          className="flex flex-wrap gap-1"
          role="group"
          aria-label="Filter by status"
        >
          {STATUS_FILTERS.map((filter) => {
            const isActive = status === filter.value
            return (
              <button
                key={filter.label}
                type="button"
                onClick={() => setStatus(filter.value)}
                aria-pressed={isActive}
                className={
                  isActive
                    ? "rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                    : "rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                }
              >
                {filter.label}
              </button>
            )
          })}
        </div>
      </div>

      {isError && (
        <p role="alert" className="text-sm text-destructive">
          Could not load institutions.{" "}
          {(error as Error | undefined)?.message ?? ""}
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[46rem] text-left text-sm">
          <caption className="sr-only">
            Institutions onboarded to the platform
          </caption>
          <thead className="border-b border-border bg-muted/40">
            <tr className="text-xs tracking-wide text-muted-foreground uppercase">
              <th scope="col" className="px-4 py-3 font-medium">
                Institution
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Host
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Status
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Plan
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Onboarded
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isPending &&
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={index}>
                  {Array.from({ length: 5 }).map((__, cell) => (
                    <td key={cell} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isPending && institutions.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No institutions yet.
                </td>
              </tr>
            )}

            {institutions.map((institution) => {
              const primary =
                institution.domains.find((domain) => domain.isPrimary) ??
                institution.domains[0]

              return (
                <tr
                  key={institution.id}
                  className="transition-colors hover:bg-muted/40"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/platform/${institution.id}`}
                      className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      {institution.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {institution.slug}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {primary?.domain ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <InstitutionStatusBadge status={institution.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {institution.plan ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(institution.provisionedAt)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {data?.meta && institutions.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing {institutions.length} of {data.meta.total}
        </p>
      )}
    </div>
  )
}

function formatDate(value: string | null): string {
  if (!value) return "—"

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
}
