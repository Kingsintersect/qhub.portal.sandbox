"use client"

import { useState } from "react"
import { Loader2, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { usePlatformPermissions } from "@/lib/auth/platform-permissions"
import { InvoiceDetailDialog } from "@/modules/billing/components/InvoiceDetailDialog"
import { PlanList } from "@/modules/billing/components/PlanList"
import { RevenueSummary } from "@/modules/billing/components/RevenueSummary"
import { SubscriptionList } from "@/modules/billing/components/SubscriptionList"
import { useInvoices, useRunBilling } from "@/modules/billing/hooks/use-billing"
import { formatMinor } from "@/modules/billing/lib/money"
import type { Invoice } from "@/modules/billing/types"

const FILTERS = [
  { label: "All", value: "" },
  { label: "Open", value: "open" },
  { label: "Overdue", value: "overdue" },
  { label: "Paid", value: "PAID" },
]

export function BillingShell() {
  const { can } = usePlatformPermissions()
  const [status, setStatus] = useState("")
  const [openInvoice, setOpenInvoice] = useState<number | null>(null)

  const { data, isPending } = useInvoices(status ? { status } : {})
  const run = useRunBilling()

  const canManage = can("billing.manage")

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Billing
          </h1>
          <p className="text-sm text-muted-foreground">
            What institutions owe QHub. Separate from the fees their students
            owe them.
          </p>
        </div>

        {canManage && (
          <Button onClick={() => run.mutate()} disabled={run.isPending}>
            {run.isPending ? (
              <Loader2
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Play className="mr-2 size-4" aria-hidden="true" />
            )}
            Run billing
          </Button>
        )}
      </div>

      <RevenueSummary rows={data?.meta.revenue} isPending={isPending} />

      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4 pt-4">
          <div
            className="flex flex-wrap gap-1"
            role="group"
            aria-label="Filter"
          >
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                aria-pressed={status === filter.value}
                onClick={() => setStatus(filter.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  status === filter.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {isPending && <Skeleton className="h-48 w-full" />}

          {!isPending && (data?.data.length ?? 0) === 0 && (
            <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No invoices yet. Subscribe an institution to a plan, then run
              billing once its first period has ended.
            </p>
          )}

          {(data?.data.length ?? 0) > 0 && (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40">
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Number</th>
                    <th className="px-3 py-2 font-medium">Institution</th>
                    <th className="px-3 py-2 font-medium">Period</th>
                    <th className="px-3 py-2 text-right font-medium">Total</th>
                    <th className="px-3 py-2 text-right font-medium">
                      Outstanding
                    </th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map((invoice) => (
                    <tr
                      key={invoice.id}
                      onClick={() => setOpenInvoice(invoice.id)}
                      tabIndex={0}
                      role="button"
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault()
                          setOpenInvoice(invoice.id)
                        }
                      }}
                      className="cursor-pointer border-b border-border/50 last:border-0 hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
                    >
                      <td className="px-3 py-2 font-mono text-xs text-foreground">
                        {invoice.number}
                      </td>
                      <td className="px-3 py-2 text-foreground">
                        {invoice.institution}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {invoice.periodStart} → {invoice.periodEnd}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-foreground">
                        {formatMinor(invoice.totalMinor, invoice.currency)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-foreground">
                        {formatMinor(
                          invoice.outstandingMinor,
                          invoice.currency
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <InvoiceStatusBadge invoice={invoice} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="subscriptions" className="pt-4">
          <SubscriptionList />
        </TabsContent>

        <TabsContent value="plans" className="pt-4">
          <PlanList />
        </TabsContent>
      </Tabs>

      <InvoiceDetailDialog
        invoiceId={openInvoice}
        onClose={() => setOpenInvoice(null)}
      />
    </div>
  )
}

/**
 * Overdue is shown in place of the status rather than beside it.
 *
 * The server derives it from the due date — there is no stored OVERDUE status —
 * and for an operator scanning a list, "overdue" is the more urgent fact about
 * an issued invoice than "issued".
 */
function InvoiceStatusBadge({ invoice }: { invoice: Invoice }) {
  if (invoice.isOverdue) {
    return (
      <span className="rounded-full border border-red-400 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:border-red-900 dark:text-red-300">
        Overdue
      </span>
    )
  }

  const tone =
    invoice.status === "PAID"
      ? "border-emerald-400 text-emerald-700 dark:border-emerald-900 dark:text-emerald-300"
      : invoice.status === "VOID"
        ? "border-border text-muted-foreground line-through"
        : "border-border text-muted-foreground"

  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[11px] font-medium",
        tone
      )}
    >
      {invoice.status.charAt(0) + invoice.status.slice(1).toLowerCase()}
    </span>
  )
}
