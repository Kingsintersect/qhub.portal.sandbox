export type HealthStatus = "OK" | "WARN" | "FAIL"

export type EstateInstitution = {
  id: number
  name: string
  slug: string
  status: string
  plan: string | null
  programCategories: string[]
  health: HealthStatus
  issues: number
  students: number
  lecturers: number
  programs: number
  activity24h: number
  capturedAt: string | null

  /** The four figures the designed health panel shows on an expanded row. */
  healthScore: number | null
  modules: string[]
  integrations: {
    sis?: { name: string; detail: string }
    [key: string]: { name: string; detail: string } | undefined
  }
  storage: {
    usedBytes: number
    /** Null means no ceiling, which is not the same as a ceiling of zero. */
    quotaBytes: number | null
  }
}

export type EstateOverview = {
  institutions: EstateInstitution[]
  totals: {
    institutions: number
    active: number
    suspended: number
    students: number
    lecturers: number
    programs: number
    activity24h: number
    databaseBytes: number

    /** The rest of the designed KPI strip, all measured. */
    sessionsNow: number
    openTickets: number
    failedJobs24h: number
    /** Null until something has been served — not 100%. */
    uptime30d: number | null
  }
  health: {
    failing: number
    warning: number
    healthy: number
    /** Never collected — usually means the scheduler is not running. */
    unknown: number
  }
  lastCapturedAt: string | null
}

export type HealthCheck = {
  key: string
  status: HealthStatus
  summary: string | null
  detail: Record<string, unknown> | null
  checkedAt: string | null
  failingSince: string | null
}

export type MetricPoint = {
  capturedAt: string | null
  /** Null on captures taken before the score was recorded. */
  healthScore: number | null
  students: number
  activeStudents: number
  lecturers: number
  programs: number
  courses: number
  enrollments: number
  activity24h: number
  logins24h: number
  invoicedTotal: number
  collectedTotal: number
  databaseBytes: number
}

export type InstitutionObservability = {
  health: HealthStatus
  checks: HealthCheck[]
  current: {
    users?: number
    students?: number
    lecturers?: number
    staff?: number
    programs?: number
    courses?: number
    /** True when the institution's database could not be read just now. */
    stale: boolean
  }
  series: MetricPoint[]
}

export type ActivityEntry = {
  id: number
  action: string
  actor: string | null
  entityType: string | null
  entityId: string | null
  ipAddress: string | null
  createdAt: string | null
}

/** One day of the estate's shape, for the Trends chart. */
export type TrendPoint = {
  day: string
  students: number
  activity: number
  logins: number
  institutions: number
  /**
   * Percentage of requests that returned a 5xx.
   *
   * Null when nothing was served that day — no requests means no rate, and a
   * plotted 0% would draw a healthy flat line across an outage.
   */
  errorRate: number | null
}
