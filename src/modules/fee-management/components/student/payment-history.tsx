"use client"

import { useRef } from "react"
import { Printer, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CurrencyDisplay } from "../shared/currency-display"
import { useInvoicePaymentHistory } from "../../hooks/use-payment"

// Method display labels
const METHOD_LABEL: Record<string, string> = {
  GATEWAY: "Online Gateway",
  CARD: "Card",
  USSD: "USSD",
  BANK_TRANSFER: "Bank Transfer",
}

interface PaymentHistoryProps {
  invoiceId: number
  invoiceNumber: string
  feeTypeName: string
}

export function PaymentHistory({
  invoiceId,
  invoiceNumber,
  feeTypeName,
}: PaymentHistoryProps) {
  const { data, isLoading } = useInvoicePaymentHistory(invoiceId)
  const printRef = useRef<HTMLDivElement>(null)
  const payments = data?.data ?? []

  function printReceipt(paymentId: number) {
    const payment = payments.find((p) => p.id === paymentId)
    if (!payment) return
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt — ${invoiceNumber}</title>
        <style>
          body { font-family: sans-serif; padding: 32px; max-width: 480px; margin: auto; }
          h1 { font-size: 18px; margin-bottom: 4px; }
          .sub { color: #666; font-size: 13px; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; font-size: 14px; }
          td { padding: 8px 0; border-bottom: 1px solid #eee; }
          td:last-child { text-align: right; font-weight: 600; }
          .total td { font-size: 16px; border-bottom: none; padding-top: 16px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <h1>Payment Receipt</h1>
        <p class="sub">${feeTypeName}</p>
        <table>
          <tr><td>Invoice No.</td><td>${invoiceNumber}</td></tr>
          <tr><td>Reference</td><td>${payment.referenceNumber}</td></tr>
          <tr><td>Method</td><td>${METHOD_LABEL[payment.method] ?? payment.method}</td></tr>
          <tr><td>Date</td><td>${new Date(payment.paidAt).toLocaleDateString("en-NG", { dateStyle: "long" })}</td></tr>
          <tr><td>Status</td><td>${payment.status}</td></tr>
          <tr class="total"><td>Amount</td><td>₦${Number(payment.amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</td></tr>
        </table>
      </body>
      </html>
    `
    const win = window.open("", "_blank", "width=520,height=640")
    if (win) {
      win.document.write(content)
      win.document.close()
      win.focus()
      win.print()
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
        <Receipt size={28} className="opacity-30" />
        <p className="text-sm">No payments recorded yet.</p>
      </div>
    )
  }

  return (
    <div ref={printRef} className="space-y-3">
      {payments.map((payment) => (
        <div
          key={payment.id}
          className="flex items-start justify-between gap-3 rounded-xl border border-border p-4"
        >
          <div className="space-y-0.5">
            <p className="font-mono text-xs text-muted-foreground">
              {payment.referenceNumber}
            </p>
            <p className="text-sm font-medium text-foreground">
              <CurrencyDisplay amount={payment.amount} />
            </p>
            <p className="text-xs text-muted-foreground">
              {METHOD_LABEL[payment.method] ?? payment.method}
              {" · "}
              {new Date(payment.paidAt).toLocaleDateString("en-NG", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <span
              className={
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
                (payment.status === "COMPLETED"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  : payment.status === "FAILED"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300")
              }
            >
              {payment.status.charAt(0) + payment.status.slice(1).toLowerCase()}
            </span>

            {payment.status === "COMPLETED" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => printReceipt(payment.id)}
                title="Print receipt"
              >
                <Printer size={11} />
                Receipt
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
