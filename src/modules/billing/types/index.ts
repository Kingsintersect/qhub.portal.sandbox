/**
 * Billing institutions for their use of QHub.
 *
 * Not to be confused with student fees, which are per-institution and live in
 * the tenant databases. Every amount here is `*Minor` — an integer count of the
 * smallest unit of its currency — and the name is on the field so nothing has
 * to guess whether 1500 is fifteen naira or fifteen hundred.
 */

export type BillingInterval = "MONTHLY" | "QUARTERLY" | "ANNUAL"

export type SubscriptionStatus =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELLED"

export type InvoiceStatus = "DRAFT" | "ISSUED" | "PAID" | "VOID"

export type PaymentMethod = "BANK_TRANSFER" | "CARD" | "CASH" | "OTHER"

export interface BillingPlan {
  id: number
  name: string
  code: string
  description: string | null
  interval: BillingInterval
  currency: string
  basePriceMinor: number
  includedStudents: number
  perStudentMinor: number
  isActive: boolean
  subscriptionCount: number | null
}

export interface Subscription {
  id: number
  tenantId: number
  institution: string | null
  planId: number
  plan: string | null
  currency: string | null
  interval: BillingInterval | null
  status: SubscriptionStatus
  inTrial: boolean
  startedOn: string | null
  trialEndsOn: string | null
  cancelledOn: string | null
  invoicedThrough: string | null
}

export interface Invoice {
  id: number
  number: string
  tenantId: number
  institution: string | null
  status: InvoiceStatus
  /** Derived server-side from the due date — there is no OVERDUE status. */
  isOverdue: boolean
  currency: string
  totalMinor: number
  paidMinor: number
  outstandingMinor: number
  periodStart: string | null
  periodEnd: string | null
  issuedOn: string | null
  dueOn: string | null
  notes: string | null

  /**
   * Raised by hand rather than by the billing run, so it has no period. The
   * console shows ONE-OFF and the description in the period column — a blank
   * cell there reads as missing data rather than as a deliberate one-off.
   */
  isManual: boolean

  /** Drives "Reminded today", so nobody chases twice in an afternoon. */
  remindedAt: string | null
  reminderCount: number
}

export interface InvoiceDetail extends Invoice {
  lines: Array<{
    id: number
    description: string
    quantity: number
    unitPriceMinor: number
    amountMinor: number
  }>
  payments: Array<{
    id: number
    amountMinor: number
    method: PaymentMethod
    reference: string | null
    receivedOn: string | null
    recordedBy: string | null
  }>
}

/**
 * Revenue is reported PER CURRENCY and must never be summed across them —
 * there is no FX in this system, so a single total spanning NGN and USD would
 * be arithmetic on incompatible units.
 */
export interface RevenueRow {
  currency: string
  paidMinor: number
  outstandingMinor: number
  overdueMinor: number
  mrrMinor: number
}

export interface InvoiceList {
  data: Invoice[]
  meta: { revenue: RevenueRow[] }
}

export interface BillingRunResult {
  invoiced: number
  skipped: number
  failed: number
  invoices: string[]
}
