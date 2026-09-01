export type MigrationState = {
  /** Null when the institution's database could not be read just now. */
  pending: number | null
  current: boolean | null
}

export type InfraTable = {
  table: string
  /** An InnoDB estimate, not a count — the panel says so. */
  rows: number
  bytes: number
}

export type BackupStatus = "RUNNING" | "READY" | "FAILED"

export type InfraBackup = {
  id: number
  reference: string
  bytes: number
  status: BackupStatus
  /** Taken automatically before a restore, rather than asked for. */
  isPreRestore: boolean
  createdAt: string | null
  completedAt: string | null
  where: string
}

export type Infrastructure = {
  database: {
    name: string | null
    dedicated: boolean
    /** Host and port, or "shared cluster". Never the account or the secret. */
    host: string
    sslVerified: boolean
    bytes: number
    trendPct: number | null
    reachable: boolean
    migrations: MigrationState
    tables: InfraTable[]
  }
  volume: {
    totalBytes: number
    usedBytes: number
    sharePct: number
    shared: boolean
  }
  quota: {
    bytes: number | null
    warning: boolean
  }
  /**
   * The school's own hostname. Null until one is recorded.
   *
   * Unlike everything else on this tab, what is being waited on belongs to
   * somebody outside the company — a university's IT department creates the
   * record, and we can neither do it nor hurry it.
   */
  customDomain: {
    host: string
    state: "PENDING" | "POINTED" | "SECURING" | "LIVE" | "FAILED"
    /** The exact line a staff member emails to the university. */
    cname: string
    cnameTarget: string
    waitingDays: number | null
    worthChasing: boolean
    pointedAt: string | null
    checkedAt: string | null
    /** What the last lookup saw — wrong is different from absent. */
    resolvedTo: string | null
    certExpiresAt: string | null
    daysUntilExpiry: number | null
    lastError: string | null
  } | null
  /**
   * Where this institution's uploaded files live.
   *
   * Its own ceiling, separate from `quota` above — that one caps the DATABASE
   * despite being named storage_quota_bytes. A school can have a small
   * database and thousands of documents, or the reverse, and one combined
   * figure would hide whichever is actually filling up.
   */
  fileStorage: {
    state: "LOCAL" | "MIGRATING" | "FAILED" | "DONE"
    prefix: string | null
    bucket: string | null
    region: string | null
    /** False until a bucket AND a credential exist. */
    providerConfigured: boolean
    bytesUsed: number
    quotaBytes: number | null
    /** Null when no ceiling is set — not the same as 0% full. */
    usedPercent: number | null
    overWarningLine: boolean
    full: boolean
    warnAtPercent: number
    /** Movement over 30 days. Null when there is too little history to say. */
    trendBytes: number | null
    migration: {
      totalBytes: number | null
      movedBytes: number | null
      percent: number | null
      batch: number
      startedAt: string | null
      completedAt: string | null
      failedReason: string | null
    }
    measuredAt: string | null
  } | null
  writes: {
    enabled: boolean
    expiresAt: string | null
    openedBy: string | null
    minutes: number
  }
  /**
   * The second gate. Parallel to `writes`, never the same one — opening
   * storage writes does not open compute.
   */
  compute: {
    enabled: boolean
    expiresAt: string | null
    openedBy: string | null
    minutes: number
    /** False until a provider is chosen and wired; nothing works before then. */
    providerConfigured: boolean
  }
  backups: InfraBackup[]
}
