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
