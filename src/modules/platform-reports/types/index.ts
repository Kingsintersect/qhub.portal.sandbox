export type ReportTemplate = {
  key: string
  title: string
  description: string
  /** Every section this template can include. A run may exclude some. */
  sections: string[]
}

export type ReportFormat = "HTML" | "XLSX" | "CSV"

export type ReportRun = {
  id: number
  reference: string
  template: string
  title: string | null
  sections: string[] | null
  scope: string | null
  periodStart: string | null
  periodEnd: string | null
  format: ReportFormat
  status: "RUNNING" | "READY" | "FAILED"
  /** Shown inline on the row — a failure nobody can act on is just a red badge. */
  failureReason: string | null
  fileBytes: number | null
  requestedBy: string | null
  startedAt: string | null
  finishedAt: string | null
  expiresOn: string | null
}

/**
 * One run with its rendered contents.
 *
 * Built on read rather than stored: a report's tables are derived from the
 * estate as it was at the run's period, and holding them would mean a second
 * copy that can disagree with the first.
 */
export type ReportRunDetail = ReportRun & {
  kpis: Array<{ label: string; value: string; sub?: string | null }>
  tables: Array<{
    title?: string | null
    columns: string[]
    rows: string[][]
  }>
  /** The analyst notes, shown accent-barred beneath the table. */
  notes: string[]
  deliveries: Array<{
    channel: string
    recipient: string | null
    occurredAt: string | null
  }>
}

export type ReportRunPage = {
  data: ReportRun[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }
}

export type ReportSchedule = {
  id: number
  template: string
  title: string | null
  frequency: "ONCE" | "WEEKLY" | "MONTHLY"
  format: ReportFormat
  recipients: string[]
  isActive: boolean
  nextRunAt: string | null
  lastRunAt: string | null
}

export type GenerateReportPayload = {
  template: string
  title?: string
  sections?: string[]
  periodStart: string
  periodEnd: string
  format?: ReportFormat
  tenantIds?: number[]
}
