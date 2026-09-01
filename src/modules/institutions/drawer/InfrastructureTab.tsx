"use client"

import { useState } from "react"

import {
  useInfrastructure,
  useMigrateStorage,
  useRetryDomain,
  useInfrastructureOperation,
  useSetStorageQuota,
} from "@/modules/platform-infrastructure/hooks/use-infrastructure"
import { useConfirm } from "@/modules/platform-shared/ConfirmProvider"
import { useMfaStatus } from "@/modules/platform-settings/hooks/use-platform-settings"
import { ComputeCard } from "@/modules/institutions/drawer/ComputeCard"
import type {
  InfraBackup,
  Infrastructure,
} from "@/modules/platform-infrastructure/types"
import { CustomDomainCard } from "@/modules/institutions/drawer/CustomDomainCard"
import { FileStorageCard } from "@/modules/institutions/drawer/FileStorageCard"

type Op = {
  kind: "backup" | "migrate" | "rotate" | "quota"
  label: string
  mark: "✓ existing" | "+ net-new"
  note: string
}

const OPS: Op[] = [
  {
    kind: "backup",
    label: "Take backup now",
    mark: "+ net-new",
    note: "snapshot to the backup store; appears in history below",
  },
  {
    kind: "migrate",
    label: "Re-run migrations",
    mark: "✓ existing",
    note: "runs pending migrations only — never rolls back",
  },
  {
    kind: "rotate",
    label: "Rotate DB credentials",
    mark: "+ net-new",
    note: "new secret to the vault; old one valid 24h",
  },
  {
    kind: "quota",
    label: "Set storage quota",
    mark: "+ net-new",
    note: "soft ceiling with a warning at 85%",
  },
]

/**
 * What one institution runs on, lifted from the draft.
 *
 * Opens read-only. Every operation is gated behind a deliberate, expiring
 * write window — the same rule a support session follows, for the same
 * reason. There is deliberately no raw-SQL tier: the surface is these
 * operations and nothing else.
 */
export function InfrastructureTab({
  tenantId,
  institution,
}: {
  tenantId: number
  institution: string
}) {
  const confirm = useConfirm()

  const { data, isPending } = useInfrastructure(tenantId)
  const retryDomain = useRetryDomain(tenantId)
  const migrateStorage = useMigrateStorage(tenantId)
  const { data: mfa } = useMfaStatus()
  const run = useInfrastructureOperation(tenantId)
  const setQuota = useSetStorageQuota(tenantId)

  const [blocked, setBlocked] = useState(false)

  const writes = data?.writes
  const enabled = writes?.enabled === true

  const onOp = async (op: Op) => {
    if (!enabled) {
      // The API refuses and logs this anyway. Saying so here saves a round
      // trip and explains what to do about it.
      setBlocked(true)

      return
    }

    if (op.kind === "quota") {
      const raw = window.prompt(
        `Soft ceiling for ${institution}, in gigabytes. Leave empty to clear it.`,
        data?.quota.bytes === null || data?.quota.bytes === undefined
          ? ""
          : String(Math.round(data.quota.bytes / 1_000_000_000))
      )

      if (raw === null) return

      const gb = raw.trim() === "" ? null : Number(raw.trim())

      if (gb !== null && (!Number.isFinite(gb) || gb <= 0)) return

      setQuota.mutate(gb === null ? null : Math.round(gb * 1_000_000_000))

      return
    }

    const ok = await confirm({
      title: op.label,
      body: `${op.note}. This runs against ${institution}'s live database and is written to the audit trail.`,
      label: op.label,
      danger: op.kind === "rotate",
    })

    if (ok) run.mutate({ kind: op.kind })
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Infrastructure</div>
        <div style={{ fontSize: 11.5, color: "var(--txt4)" }}>
          markers: <span style={{ color: "var(--accent)" }}>✓ existing</span> ·{" "}
          <span style={{ color: "var(--series2)" }}>+ net-new</span> ·{" "}
          <span style={{ color: "var(--txt3)" }}>
            ⚠ needs an infrastructure decision
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            setBlocked(false)
            run.mutate({ kind: enabled ? "disableWrites" : "enableWrites" })
          }}
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: `1px solid ${enabled ? "var(--warn)" : "var(--line-strong)"}`,
            color: enabled ? "var(--warn)" : "var(--txt2)",
            background: "transparent",
            fontSize: 12,
            fontWeight: 500,
            padding: "8px 14px",
            borderRadius: 10,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {enabled
            ? `Writes open · until ${clock(writes?.expiresAt ?? null)}`
            : "Enable writes for this session"}
        </button>
      </div>

      {blocked && !enabled && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "var(--warn-bg)",
            border: "1px solid var(--warn)",
            borderRadius: 11,
            padding: "10px 14px",
            fontSize: 12.5,
            color: "var(--txt)",
          }}
        >
          This tab opens read-only — the same rule as a support session. Enable
          writes for this session to run an operation; the attempt was logged.
          <button
            type="button"
            onClick={() => setBlocked(false)}
            aria-label="Dismiss"
            style={{
              marginLeft: "auto",
              color: "var(--txt4)",
              cursor: "pointer",
              padding: "0 4px",
              background: "none",
              border: "none",
              fontFamily: "inherit",
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 14,
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <CustomDomainCard
            domain={data?.customDomain ?? null}
            onRetry={() => retryDomain.mutate()}
            retrying={retryDomain.isPending}
          />
          <FileStorageCard
            storage={data?.fileStorage ?? null}
            onMigrate={() => migrateStorage.mutate()}
            migrating={migrateStorage.isPending}
          />
          <DatabaseCard data={data} loading={isPending} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              background: "var(--card)",
              borderRadius: 18,
              boxShadow: "var(--shadow-card)",
              padding: "16px 20px",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              Named operations
            </div>
            <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 3 }}>
              The surface is these operations and nothing else — no raw SQL from
              a browser, deliberately.
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginTop: 12,
              }}
            >
              {OPS.map((op) => (
                <button
                  key={op.kind}
                  type="button"
                  onClick={() => void onOp(op)}
                  style={{
                    border: `1px solid ${enabled ? "var(--line-strong)" : "var(--line2)"}`,
                    borderRadius: 11,
                    padding: "10px 13px",
                    cursor: "pointer",
                    background: "transparent",
                    textAlign: "left",
                    fontFamily: "inherit",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        fontSize: 12.5,
                        fontWeight: 500,
                        color: enabled ? "var(--txt)" : "var(--txt4)",
                      }}
                    >
                      {op.label}
                    </div>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 10,
                        color:
                          op.mark === "✓ existing"
                            ? "var(--accent)"
                            : "var(--series2)",
                      }}
                    >
                      {op.mark}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--txt4)",
                      marginTop: 2,
                    }}
                  >
                    {op.note}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <BackupsCard backups={data?.backups ?? []} />
        </div>
      </div>

      <ComputeCard
        tenantId={tenantId}
        institution={institution}
        compute={data?.compute}
        mfaEnrolled={mfa?.enabled === true}
        onGoToSettings={() => {
          window.location.href = "/platform/settings"
        }}
      />

      <NotProvisioned />
    </div>
  )
}

function DatabaseCard({
  data,
  loading,
}: {
  data: Infrastructure | undefined
  loading: boolean
}) {
  const db = data?.database
  const migrations = db?.migrations

  // While this is loading nothing is known yet, and "UNREACHABLE" /
  // "UNKNOWN" would read as a broken institution rather than a pending
  // request. A loading state that looks like a failure state is worse than
  // no state at all.
  const migrationLabel = loading
    ? "CHECKING"
    : migrations?.pending === null || migrations?.pending === undefined
      ? "UNKNOWN"
      : migrations.pending === 0
        ? "CURRENT"
        : `${migrations.pending} PENDING`

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 18,
        boxShadow: "var(--shadow-card)",
        padding: "16px 20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Database</div>
        <span style={{ fontSize: 10, color: "var(--accent)" }}>✓ existing</span>
        <span
          className="qhub-mono"
          style={{
            marginLeft: "auto",
            fontSize: 9.5,
            letterSpacing: ".05em",
            padding: "3px 8px",
            borderRadius: 6,
            color:
              migrations?.current === true ? "var(--accent)" : "var(--warn)",
            background:
              migrations?.current === true
                ? "var(--good-bg)"
                : "var(--warn-bg)",
          }}
        >
          MIGRATIONS {migrationLabel}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "8px 0",
          fontSize: 13,
          marginTop: 12,
        }}
      >
        <Key>Name</Key>
        <Mono>{db?.name ?? "—"}</Mono>

        <Key>Where</Key>
        <Value>
          {db?.dedicated === true
            ? `Dedicated server${db.sslVerified ? " · CA verified" : " · no CA bundle"}`
            : "Shared cluster"}
        </Value>

        <Key>Host</Key>
        <Mono>{db?.host ?? "—"}</Mono>

        <Key>Size · trend</Key>
        <Value>
          {bytes(db?.bytes ?? 0)}{" "}
          <span style={{ fontSize: 11.5, color: "var(--accent)" }}>
            {db?.trendPct === null || db?.trendPct === undefined
              ? ""
              : `${db.trendPct > 0 ? "+" : ""}${db.trendPct}% · 30d`}
          </span>
        </Value>

        <Key>Connection</Key>
        <div
          style={{
            fontSize: 12,
            color: loading
              ? "var(--txt4)"
              : db?.reachable === true
                ? "var(--accent)"
                : "var(--neg)",
          }}
        >
          {loading
            ? "Checking…"
            : db?.reachable === true
              ? "Reachable"
              : "Unreachable"}
        </div>

        <Key>Volume share</Key>
        <div style={{ fontSize: 12, color: "var(--txt2)" }}>
          {data === undefined
            ? "—"
            : `${data.volume.sharePct}% of ${bytes(data.volume.usedBytes)} used · shared volume`}
        </div>

        {data?.quota.bytes !== null && data?.quota.bytes !== undefined && (
          <>
            <Key>Quota</Key>
            <div
              style={{
                fontSize: 12,
                color: data.quota.warning ? "var(--warn)" : "var(--txt2)",
              }}
            >
              {bytes(data.quota.bytes)}
              {data.quota.warning ? " · past 85%" : ""}
            </div>
          </>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) 90px 90px",
          columnGap: 12,
          padding: "12px 0 6px",
          marginTop: 8,
          borderTop: "1px solid var(--line2)",
          fontSize: 10,
          letterSpacing: ".09em",
          color: "var(--txt4)",
        }}
      >
        <div>TABLE</div>
        <div style={{ textAlign: "right" }}>ROWS</div>
        <div style={{ textAlign: "right" }}>BYTES</div>
      </div>

      {(db?.tables ?? []).map((t) => (
        <div
          key={t.table}
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) 90px 90px",
            columnGap: 12,
            padding: "6px 0",
            fontSize: 12.5,
            borderTop: "1px solid var(--line2)",
          }}
        >
          <div
            className="qhub-mono"
            style={{ fontSize: 11, color: "var(--txt2)" }}
          >
            {t.table}
          </div>
          <div style={{ textAlign: "right", color: "var(--txt3)" }}>
            {t.rows.toLocaleString()}
          </div>
          <div style={{ textAlign: "right", fontWeight: 500 }}>
            {bytes(t.bytes)}
          </div>
        </div>
      ))}

      <div style={{ fontSize: 10.5, color: "var(--txt4)", marginTop: 9 }}>
        Row counts are InnoDB&rsquo;s own estimate, not a count — exact totals
        are on the Students and Lecturers tabs.
      </div>
    </div>
  )
}

function BackupsCard({ backups }: { backups: InfraBackup[] }) {
  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 18,
        boxShadow: "var(--shadow-card)",
        padding: "16px 20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Backups</div>
        <span style={{ fontSize: 10, color: "var(--series2)" }}>+ net-new</span>
        <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--txt4)" }}>
          retention 30 days
        </div>
      </div>

      {backups.length === 0 && (
        <div style={{ fontSize: 12.5, color: "var(--txt3)", marginTop: 10 }}>
          None taken yet.
        </div>
      )}

      {backups.map((b) => (
        <div
          key={b.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 0",
            fontSize: 12.5,
            borderBottom: "1px solid var(--line2)",
          }}
        >
          <div style={{ color: "var(--txt2)", width: 120 }}>
            {stamp(b.createdAt)}
          </div>
          <div
            className="qhub-mono"
            style={{ fontSize: 11, color: "var(--txt3)" }}
          >
            {b.status === "READY" ? bytes(b.bytes) : b.status}
          </div>
          <div style={{ fontSize: 11, color: "var(--txt4)" }}>
            {b.isPreRestore ? "pre-restore" : b.where}
          </div>
        </div>
      ))}

      <div style={{ fontSize: 11, color: "var(--txt4)", marginTop: 9 }}>
        Restore is a named operation: typed confirmation naming the institution,
        then a fresh backup is taken before the restore runs.
      </div>
    </div>
  )
}

/**
 * What this console cannot show, said plainly.
 *
 * Dimmed and dashed rather than absent, because the honest answer to "where
 * are this school's buckets" is that there are none — and a blank space would
 * read as a screen that failed to load.
 */
function NotProvisioned() {
  return (
    <div
      style={{
        border: "1.5px dashed var(--line-strong)",
        borderRadius: 16,
        padding: "16px 20px",
        opacity: 0.75,
      }}
    >
      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--txt3)" }}>
        ⚠ Not provisioned — needs an infrastructure decision before any of this
        is real
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 14,
          marginTop: 12,
          fontSize: 12,
          color: "var(--txt4)",
          lineHeight: 1.55,
        }}
      >
        <div>
          <b style={{ color: "var(--txt3)" }}>Object storage / buckets</b>
          <br />
          None exist — uploads land on the shared droplet disk. Own bucket vs
          shared prefix, and who pays, is a commercial decision.
        </div>
        <div>
          <b style={{ color: "var(--txt3)" }}>Per-school volumes / droplets</b>
          <br />
          One shared volume today. Splitting it is the same decision, larger.
        </div>
        <div>
          <b style={{ color: "var(--txt3)" }}>DigitalOcean API</b>
          <br />
          No integration exists. It means holding a token with
          create-and-destroy rights — wants its own confirmation flow before it
          is designed.
        </div>
      </div>
    </div>
  )
}

function Key({ children }: { children: React.ReactNode }) {
  return <div style={{ color: "var(--txt2)" }}>{children}</div>
}

function Value({ children }: { children: React.ReactNode }) {
  return <div style={{ fontWeight: 500 }}>{children}</div>
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <div className="qhub-mono" style={{ fontSize: 11.5 }}>
      {children}
    </div>
  )
}

function bytes(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} GB`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} MB`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)} KB`

  return `${value} B`
}

function clock(iso: string | null): string {
  if (iso === null) return "—"

  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function stamp(iso: string | null): string {
  if (iso === null) return "—"

  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}
