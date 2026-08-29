/**
 * Billing institutions for their use of QHub.
 *
 * Not to be confused with student fees, which are per-institution and live in
 * the tenant databases. Every amount here is `*Minor` — an integer count of the
 * smallest unit of its currency — and the name is on the field so nothing has
 * to guess whether 1500 is fifteen naira or fifteen hundred.
 */

/**
 * SESSION plans are billed on demand rather than on a cadence: an academic
 * session has no fixed length or date, so the scheduled run leaves them alone
 * and a person raises the bill.
 */
export type BillingInterval = "MONTHLY" | "QUARTERLY" | "ANNUAL" | "SESSION"

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
  /**
   * The agreed rate per student, and whether it was negotiated with this
   * institution or inherited from the shared plan.
   */
  perStudentMinor: number | null
  rateSource: "NEGOTIATED" | "PLAN"
  /** True for session plans, which are billed by hand rather than on a cadence. */
  billedOnDemand: boolean
  /**
   * Base plus per-head, normalised to a month. Null when the plan is gone, and
   * null for a session plan — a session has no month count to divide by.
   */
  mrrMinor: number | null
  /** What one full period is worth at today's roll. */
  contractValueMinor: number | null
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
  /**
   * Session plans, reported whole rather than divided into months. Kept apart
   * from mrrMinor because there is no honest divisor to fold them in with.
   */
  sessionContractMinor: number
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

/**
 * What a per-head bill would come to, without raising one.
 *
 * `countedAt` is the moment the roll was actually read, not the moment a
 * rollup ran — on a per-head rate a stale count is a wrong invoice.
 */
export interface PerHeadPreview {
  tenantId: number
  metric: "students" | "active_students"
  studentsCounted: number
  includedByPlan: number
  studentsBillable: number
  perStudentMinor: number
  totalMinor: number
  currency: string | null
  countedAt: string
}

/**
 * The roll moved between the preview and the commit.
 *
 * The operator approved a total, not an instruction to bill whatever the
 * number happens to be a moment later, so the server refuses and hands back
 * fresh figures for the surface to re-preview.
 */
export interface RollMovedError extends PerHeadPreview {
  code: "ROLL_MOVED"
  expectedStudentsCounted: number
}
