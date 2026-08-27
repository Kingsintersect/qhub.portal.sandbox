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
}
