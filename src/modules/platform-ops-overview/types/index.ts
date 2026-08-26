export type Incident = {
  id: number
  reference: string
  title: string
  severity: "SEV1" | "SEV2" | "SEV3"
  status: string
  owner: string | null
  isPlatformWide: boolean
  institutions: string[]
  openedAt: string | null
  resolvedAt: string | null
}

export type Upgrade = {
  id: number
  title: string
  component: string | null
  version: string | null
  rolloutScope: string | null
  status: string
  scheduledFor: string | null
  startedAt: string | null
  completedAt: string | null
  loggedBy: string | null
  institutions: string[]
}

export type UsageAnomaly = {
  id: number
  institution: string | null
  tenantId: number | null
  metric: string
  baseline: number
  observed: number
  /** Signed: a collapse in sign-ins and a spike in storage differ. */
  deviationPct: number
  likelyCause: string | null
  detectedAt: string | null
  acknowledgedAt: string | null
  acknowledgedBy: string | null

  /**
   * Set when an acknowledged anomaly came back at twice the deviation.
   * A re-alert must never render like a first-time alert.
   */
  reAlertedAt: string | null
  acknowledgedDeviationPct: number | null
  previouslyAcknowledgedBy: string | null
}
