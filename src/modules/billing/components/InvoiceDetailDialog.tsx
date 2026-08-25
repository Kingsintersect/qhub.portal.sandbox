"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { usePlatformPermissions } from "@/lib/auth/platform-permissions"
import {
  useInvoice,
  useRecordPayment,
  useVoidInvoice,
} from "@/modules/billing/hooks/use-billing"
import { formatMinor, toMinor } from "@/modules/billing/lib/money"

const METHODS = [
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "CARD", label: "Card" },
  { value: "CASH", label: "Cash" },
  { value: "OTHER", label: "Other" },
]

/**
 * One invoice: what was charged, what has been paid, and a way to record more.
 *
 * Payments are entered by hand — there is no gateway behind this — so the form
 * is the actual mechanism by which an invoice gets settled, not a convenience.
 */
export function InvoiceDetailDialog({
  invoiceId,
  onClose,
}: {
  invoiceId: number | null
  onClose: () => void
}) {
  const { can } = usePlatformPermissions()
  const { data: invoice, isPending } = useInvoice(invoiceId)
  const record = useRecordPayment(invoiceId ?? 0)
  const voidInvoice = useVoidInvoice(invoiceId ?? 0)

  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("BANK_TRANSFER")
  const [reference, setReference] = useState("")

  const canManage = can("billing.manage")

  const submit = async () => {
    if (!invoice) return

    await record.mutateAsync({
      amountMinor: toMinor(amount, invoice.currency),
      method,
      reference: reference.trim() || null,
    })

    setAmount("")
    setReference("")
  }

  return (
    <Dialog
      open={invoiceId !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {/* The header renders in the loading state too. A DialogContent with
            no DialogTitle is announced to screen readers as an unnamed dialog,
            so skipping it while the invoice loads would leave anyone using one
            with no idea what had just opened. */}
        <DialogHeader>
          <DialogTitle className="font-mono">
            {invoice?.number ?? "Invoice"}
          </DialogTitle>
          <DialogDescription>
            {invoice
              ? `${invoice.institution ?? ""}${
                  invoice.periodStart && invoice.periodEnd
                    ? ` · ${invoice.periodStart} to ${invoice.periodEnd}`
                    : ""
                }`
              : "Loading…"}
          </DialogDescription>
        </DialogHeader>

        {isPending || !invoice ? (
          <Skeleton className="h-80 w-full" />
        ) : (
          <>
            <div className="space-y-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Description</th>
                    <th className="pb-2 text-right font-medium">Qty</th>
                    <th className="pb-2 text-right font-medium">Rate</th>
                    <th className="pb-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lines.map((line) => (
                    <tr key={line.id} className="border-b border-border/50">
                      <td className="py-2 text-foreground">
                        {line.description}
                      </td>
                      <td className="py-2 text-right font-mono text-muted-foreground">
                        {line.quantity}
                      </td>
                      <td className="py-2 text-right font-mono text-muted-foreground">
                        {formatMinor(line.unitPriceMinor, invoice.currency)}
                      </td>
                      <td className="py-2 text-right font-mono text-foreground">
                        {formatMinor(line.amountMinor, invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td
                      colSpan={3}
                      className="pt-3 text-right text-muted-foreground"
                    >
                      Total
                    </td>
                    <td className="pt-3 text-right font-mono font-medium text-foreground">
                      {formatMinor(invoice.totalMinor, invoice.currency)}
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={3}
                      className="text-right text-muted-foreground"
                    >
                      Paid
                    </td>
                    <td className="text-right font-mono text-foreground">
                      {formatMinor(invoice.paidMinor, invoice.currency)}
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={3}
                      className="text-right text-muted-foreground"
                    >
                      Outstanding
                    </td>
                    <td className="text-right font-mono font-medium text-foreground">
                      {formatMinor(invoice.outstandingMinor, invoice.currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {invoice.payments.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Payments
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {invoice.payments.map((payment) => (
                      <li
                        key={payment.id}
                        className="flex flex-wrap items-baseline gap-x-3 text-sm"
                      >
                        <span className="font-mono text-foreground">
                          {formatMinor(payment.amountMinor, invoice.currency)}
                        </span>
                        <span className="text-muted-foreground">
                          {payment.method.toLowerCase().replace(/_/g, " ")}
                        </span>
                        {payment.reference && (
                          <span className="font-mono text-xs text-muted-foreground">
                            {payment.reference}
                          </span>
                        )}
                        <span className="ml-auto text-xs text-muted-foreground">
                          {payment.receivedOn}
                          {payment.recordedBy ? ` · ${payment.recordedBy}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {canManage &&
                invoice.outstandingMinor > 0 &&
                invoice.status !== "VOID" && (
                  <div className="space-y-3 border-t border-border pt-4">
                    <h3 className="text-sm font-medium text-foreground">
                      Record a payment
                    </h3>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="payment-amount">
                          Amount ({invoice.currency})
                        </Label>
                        <Input
                          id="payment-amount"
                          inputMode="decimal"
                          value={amount}
                          onChange={(event) => setAmount(event.target.value)}
                          placeholder="0.00"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="payment-method">Method</Label>
                        <Select value={method} onValueChange={setMethod}>
                          <SelectTrigger id="payment-method">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {METHODS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="payment-reference">Reference</Label>
                        <Input
                          id="payment-reference"
                          value={reference}
                          onChange={(event) => setReference(event.target.value)}
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        onClick={submit}
                        disabled={!amount.trim() || record.isPending}
                      >
                        {record.isPending && (
                          <Loader2
                            className="mr-2 size-4 animate-spin"
                            aria-hidden="true"
                          />
                        )}
                        Record payment
                      </Button>

                      {/* Only while nothing has been paid — the API refuses
                        otherwise, since a part-paid invoice that vanishes
                        leaves money recorded against nothing. */}
                      {invoice.paidMinor === 0 && (
                        <Button
                          variant="ghost"
                          disabled={voidInvoice.isPending}
                          onClick={() =>
                            voidInvoice.mutate("Voided from console")
                          }
                        >
                          Void invoice
                        </Button>
                      )}
                    </div>
                  </div>
                )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
