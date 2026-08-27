"use client"

import { useState } from "react"

import { usePlatformPermissions } from "@/lib/auth/platform-permissions"
import {
  useEstateOverview,
  useEstateTrends,
} from "@/modules/platform-observability/hooks/use-observability"
import type { HealthStatus } from "@/modules/platform-observability/types"
import { TrendsChart } from "@/modules/platform-ops-overview/components/TrendsChart"
import { useProvisioningProgress } from "@/modules/platform-ops-overview/hooks/use-provisioning-progress"
import {
  useAcknowledgeAnomaly,
  useAnomalies,
  useDetectAnomalies,
  useIncidents,
  useUpgrades,
} from "@/modules/platform-ops-overview/hooks/use-ops-overview"
import type {
  Incident,
  Upgrade,
  UsageAnomaly,
} from "@/modules/platform-ops-overview/types"

type Tab = "health" | "incidents" | "provisioning" | "upgrades" | "anomalies"

/**
 * Incidents, upgrades and usage anomalies — the operational half of Systems
 * Overview.
 *
 * Anomalies are auto-flagged against each institution's OWN baseline, never
 * hand-entered, and acknowledging one records "seen and judged expected"
 * rather than "fixed".
 */
export function SystemsOverviewPage() {
  const [tab, setTab] = useState<Tab>("health")
  const [days, setDays] = useState(30)

  const { data: overview, isPending: overviewLoading } = useEstateOverview()
  const { data: trends, isFetching: trendsLoading } = useEstateTrends(days)
  const { data: incidents } = useIncidents("open")
  const { data: anomalies } = useAnomalies(false)
  const { data: upgrades } = useUpgrades()

  const needingAttention =
    (overview?.health.failing ?? 0) + (overview?.health.warning ?? 0)

  const provisioning = (overview?.institutions ?? []).filter(
    (i) => i.status === "PROVISIONING"
  )

  const tabs: Array<[Tab, string, number | undefined]> = [
    ["health", "Tenant Health", needingAttention || undefined],
    ["incidents", "Incidents", incidents?.openCount || undefined],
    ["provisioning", "Provisioning", provisioning.length || undefined],
    [
      "upgrades",
      "Upgrades",
      (upgrades ?? []).filter((u) => u.status !== "COMPLETED").length ||
        undefined,
    ],
    ["anomalies", "Usage Anomalies", anomalies?.length || undefined],
  ]

  const note: Record<Tab, string> = {
    health:
      "Fed automatically by probes and sync. Nothing here is hand-entered.",
    incidents:
      "Open incidents across the estate. Affected institutions see a banner in their own portal.",
    provisioning:
      "Onboardings still building. Each one is a queued job you can follow to ten of ten.",
    upgrades: "Rollouts in flight and scheduled.",
    anomalies:
      "Flagged against each institution's own baseline. Acknowledging records that you have seen it and judged it expected — it does not mean fixed.",
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          background: "var(--card)",
          borderRadius: 20,
          padding: 4,
          boxShadow: "var(--shadow-card)",
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
        }}
      >
        <Kpi
          label="Institutions"
          value={overview?.totals.institutions ?? 0}
          note={`${overview?.totals.active ?? 0} active`}
          loading={overviewLoading}
        />
        <Kpi
          label="Needing attention"
          value={needingAttention}
          note="failing or warning"
          tone={needingAttention > 0 ? "neg" : undefined}
          loading={overviewLoading}
        />
        <Kpi
          label="Open incidents"
          value={incidents?.openCount ?? 0}
          note="unresolved"
          tone={(incidents?.openCount ?? 0) > 0 ? "neg" : undefined}
        />
        <Kpi
          label="Learners"
          value={overview?.totals.students ?? 0}
          note="estate-wide"
          loading={overviewLoading}
        />
        <Kpi
          label="Activity · 24h"
          value={overview?.totals.activity24h ?? 0}
          note="audited events"
          loading={overviewLoading}
        />
        <Kpi
          label="Unacknowledged anomalies"
          value={anomalies?.length ?? 0}
          note="auto-flagged"
          tone={(anomalies?.length ?? 0) > 0 ? "warn" : undefined}
          last
        />
      </div>

      <TrendsChart
        points={trends ?? []}
        days={days}
        onDaysChange={setDays}
        isLoading={trendsLoading}
      />

      <div
        style={{
          background: "var(--card)",
          borderRadius: 20,
          boxShadow: "var(--shadow-card)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "14px 18px 0",
            flexWrap: "wrap",
          }}
        >
          {tabs.map(([value, label, count]) => (
            <TabChip
              key={value}
              label={label}
              badge={count}
              active={tab === value}
              onClick={() => setTab(value)}
            />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 24px 2px",
          }}
        >
          <div style={{ fontSize: 12, color: "var(--txt3)" }}>{note[tab]}</div>
        </div>

        <div style={{ paddingBottom: 4 }}>
          {tab === "health" && <HealthTab />}
          {tab === "incidents" && <IncidentsTab />}
          {tab === "provisioning" && <ProvisioningTab rows={provisioning} />}
          {tab === "upgrades" && <UpgradesTab />}
          {tab === "anomalies" && <AnomaliesTab />}
        </div>
      </div>
    </div>
  )
}

// --- Tenant health ----------------------------------------------------------

const HEALTH_GRID = "150px 1.1fr 1.5fr 90px 150px 130px"

function HealthTab() {
  const { data, isPending } = useEstateOverview()
  const rows = data?.institutions ?? []

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: HEALTH_GRID,
          columnGap: 18,
          padding: "14px 24px 10px",
          fontSize: 10.5,
          letterSpacing: ".09em",
          color: "var(--txt4)",
        }}
      >
        <div>LAST SYNC</div>
        <div>INSTITUTION</div>
        <div>PLAN</div>
        <div>LEARNERS</div>
        <div>TENANT HEALTH</div>
        <div>OPEN ISSUES</div>
      </div>

      {isPending && <Loading />}

      {!isPending && rows.length === 0 && (
        <Empty>No institutions on the estate yet.</Empty>
      )}

      {rows.map((r) => (
        <div
          key={r.id}
          style={{
            display: "grid",
            gridTemplateColumns: HEALTH_GRID,
            columnGap: 18,
            alignItems: "center",
            padding: "13px 24px",
            fontSize: 13.5,
            borderTop: "1px solid var(--line2)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              color: "var(--txt2)",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: healthDot(r.health),
              }}
            />
            <span style={{ fontSize: 12.5 }}>
              {r.capturedAt
                ? new Date(r.capturedAt).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                  })
                : "never"}
            </span>
          </div>
          <div style={{ fontWeight: 500, color: "var(--txt)" }}>{r.name}</div>
          <div style={{ color: "var(--txt2)" }}>{r.plan ?? "—"}</div>
          <div
            className="qhub-mono"
            style={{ fontSize: 12.5, color: "var(--txt2)" }}
          >
            {r.students.toLocaleString()}
          </div>
          <div>
            <span
              className="qhub-mono"
              style={{
                fontSize: 10.5,
                letterSpacing: ".06em",
                padding: "4px 9px",
                borderRadius: 7,
                ...healthTone(r.health),
              }}
            >
              {healthLabel(r.health)}
            </span>
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: r.issues > 0 ? "var(--neg)" : "var(--txt3)",
            }}
          >
            {r.issues > 0 ? `${r.issues} failing` : "none"}
          </div>
        </div>
      ))}
    </>
  )
}

// --- Provisioning -----------------------------------------------------------

function ProvisioningTab({
  rows,
}: {
  rows: Array<{ id: number; name: string; slug: string }>
}) {
  if (rows.length === 0) {
    return <Empty>Nothing being provisioned right now.</Empty>
  }

  return (
    <>
      {rows.map((r) => (
        <ProvisioningRow
          key={r.id}
          tenantId={r.id}
          name={r.name}
          slug={r.slug}
        />
      ))}
    </>
  )
}

/**
 * One onboarding in flight, followed to ten of ten.
 *
 * Polls only while it is still running — a finished build that keeps asking is
 * just noise on the server.
 */
function ProvisioningRow({
  tenantId,
  name,
  slug,
}: {
  tenantId: number
  name: string
  slug: string
}) {
  const { data } = useProvisioningProgress(tenantId)

  return (
    <div
      style={{
        padding: "13px 24px",
        borderTop: "1px solid var(--line2)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--txt)" }}>
          {name}
        </div>
        <div
          className="qhub-mono"
          style={{ fontSize: 11.5, color: "var(--txt4)" }}
        >
          {slug}
        </div>
        <div
          className="qhub-mono"
          style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--txt3)" }}
        >
          {data ? `${data.completed}/${data.total}` : "…"}
        </div>
      </div>

      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: "var(--panel)",
          marginTop: 9,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${data?.percent ?? 0}%`,
            background:
              data?.status === "FAILED" ? "var(--neg)" : "var(--accent)",
            transition: "width .4s ease",
          }}
        />
      </div>

      <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 6 }}>
        {data?.status === "FAILED"
          ? `Failed at ${data.failedAt ?? "an unknown step"}${data.error ? ` — ${data.error}` : ""}`
          : data?.status === "QUEUED"
            ? "Waiting for a worker to pick it up."
            : (data?.steps.find((s) => !s.done)?.label ?? "Finishing up")}
      </div>
    </div>
  )
}

// --- Incidents --------------------------------------------------------------

function IncidentsTab() {
  const [status, setStatus] = useState("open")
  const { data, isLoading } = useIncidents(status)

  return (
    <>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[
          ["open", "Open"],
          ["", "All"],
        ].map(([value, label]) => (
          <Chip
            key={value || "all"}
            label={label}
            active={status === value}
            onClick={() => setStatus(value)}
          />
        ))}
      </div>

      {isLoading && <Loading />}

      {!isLoading && (data?.data.length ?? 0) === 0 && (
        <Empty>No incidents match these filters.</Empty>
      )}

      {data?.data.map((incident) => (
        <IncidentRow key={incident.id} incident={incident} />
      ))}
    </>
  )
}

function IncidentRow({ incident }: { incident: Incident }) {
  const sev =
    incident.severity === "SEV1"
      ? { c: "var(--neg)", bg: "var(--neg-bg)" }
      : incident.severity === "SEV2"
        ? { c: "var(--warn)", bg: "var(--warn-bg)" }
        : { c: "var(--txt3)", bg: "var(--panel)" }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 14,
        padding: "12px 0",
        borderBottom: "1px solid var(--line2)",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Pill tone={sev}>{incident.severity}</Pill>
          <span
            className="qhub-mono"
            style={{ fontSize: 11, color: "var(--txt4)" }}
          >
            {incident.reference}
          </span>
          <span style={{ fontSize: 11.5, color: "var(--txt3)" }}>
            {incident.status}
          </span>
        </div>

        <div style={{ fontSize: 13.5, color: "var(--txt)", marginTop: 5 }}>
          {incident.title}
        </div>

        <div style={{ fontSize: 11.5, color: "var(--txt3)", marginTop: 4 }}>
          {incident.isPlatformWide
            ? "Platform-wide"
            : incident.institutions.length > 0
              ? incident.institutions.join(", ")
              : "No institutions attached"}
          {incident.owner ? ` · owned by ${incident.owner}` : ""}
        </div>
      </div>

      <div
        className="qhub-mono"
        style={{ fontSize: 11, color: "var(--txt4)", whiteSpace: "nowrap" }}
      >
        {incident.openedAt
          ? new Date(incident.openedAt).toLocaleString(undefined, {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })
          : ""}
      </div>
    </div>
  )
}

// --- Upgrades ---------------------------------------------------------------

function UpgradesTab() {
  const { data, isLoading } = useUpgrades()

  if (isLoading) return <Loading />
  if (!data?.length) return <Empty>No upgrades logged.</Empty>

  return (
    <>
      {data.map((u) => (
        <UpgradeRow key={u.id} upgrade={u} />
      ))}
    </>
  )
}

function UpgradeRow({ upgrade }: { upgrade: Upgrade }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 14,
        padding: "12px 0",
        borderBottom: "1px solid var(--line2)",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Pill
            tone={
              upgrade.status === "COMPLETED"
                ? { c: "var(--accent)", bg: "var(--accent-soft)" }
                : { c: "var(--warn)", bg: "var(--warn-bg)" }
            }
          >
            {upgrade.status}
          </Pill>
          {upgrade.component && (
            <span
              className="qhub-mono"
              style={{ fontSize: 10.5, color: "var(--txt4)" }}
            >
              {upgrade.component}
              {upgrade.version ? ` ${upgrade.version}` : ""}
            </span>
          )}
        </div>

        <div style={{ fontSize: 13.5, color: "var(--txt)", marginTop: 5 }}>
          {upgrade.title}
        </div>

        <div style={{ fontSize: 11.5, color: "var(--txt3)", marginTop: 4 }}>
          {upgrade.rolloutScope ?? "scope unset"}
          {upgrade.institutions.length > 0
            ? ` · ${upgrade.institutions.length} institution${upgrade.institutions.length === 1 ? "" : "s"}`
            : ""}
          {upgrade.loggedBy ? ` · ${upgrade.loggedBy}` : ""}
        </div>
      </div>

      <div
        className="qhub-mono"
        style={{ fontSize: 11, color: "var(--txt4)", whiteSpace: "nowrap" }}
      >
        {upgrade.scheduledFor
          ? `scheduled ${new Date(upgrade.scheduledFor).toLocaleDateString()}`
          : upgrade.completedAt
            ? `done ${new Date(upgrade.completedAt).toLocaleDateString()}`
            : ""}
      </div>
    </div>
  )
}

// --- Anomalies --------------------------------------------------------------

function AnomaliesTab() {
  const { can } = usePlatformPermissions()
  const canManage = can("anomalies.manage")

  const [includeAcknowledged, setIncludeAcknowledged] = useState(false)
  const { data, isLoading } = useAnomalies(includeAcknowledged)
  const detect = useDetectAnomalies()

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: "var(--txt3)",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={includeAcknowledged}
            onChange={(e) => setIncludeAcknowledged(e.target.checked)}
          />
          Include acknowledged
        </label>

        {canManage && (
          <button
            type="button"
            onClick={() => detect.mutate()}
            disabled={detect.isPending}
            style={{
              fontSize: 12,
              color: "var(--accent)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Run detection now
          </button>
        )}
      </div>

      <p
        style={{
          fontSize: 12,
          color: "var(--txt4)",
          marginBottom: 14,
          lineHeight: 1.55,
        }}
      >
        Flagged automatically against each institution&apos;s own baseline —
        never hand-entered. Acknowledging records that you have seen it and
        judged it expected. It does not mean fixed.
      </p>

      {isLoading && <Loading />}

      {!isLoading && (data?.length ?? 0) === 0 && (
        <Empty>No anomalies match these filters.</Empty>
      )}

      {data?.map((a) => (
        <AnomalyRow key={a.id} anomaly={a} canManage={canManage} />
      ))}
    </>
  )
}

function AnomalyRow({
  anomaly,
  canManage,
}: {
  anomaly: UsageAnomaly
  canManage: boolean
}) {
  const acknowledge = useAcknowledgeAnomaly()
  const reAlerted = anomaly.reAlertedAt !== null
  const sign = anomaly.deviationPct > 0 ? "+" : ""

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 14,
        padding: "12px 14px",
        marginBottom: 8,
        // A re-alert is tinted and railed so it cannot be mistaken for a
        // first-time alert at a glance.
        background: reAlerted ? "var(--neg-bg)" : "transparent",
        borderLeft: reAlerted
          ? "2px solid var(--neg)"
          : "2px solid transparent",
        borderBottom: "1px solid var(--line2)",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {reAlerted && (
            <Pill tone={{ c: "#fff", bg: "var(--neg)" }}>RE-ALERTED</Pill>
          )}

          <span
            className="qhub-mono"
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: reAlerted ? "var(--neg)" : "var(--txt)",
            }}
          >
            {sign}
            {anomaly.deviationPct.toFixed(0)}%
          </span>

          {/* Both magnitudes, per the design: what it is now, and what it was
              when somebody judged it expected. */}
          {reAlerted && anomaly.acknowledgedDeviationPct !== null && (
            <span
              className="qhub-mono"
              style={{ fontSize: 11.5, color: "var(--txt3)" }}
            >
              · was {anomaly.acknowledgedDeviationPct > 0 ? "+" : ""}
              {anomaly.acknowledgedDeviationPct.toFixed(0)}% when acknowledged
            </span>
          )}

          <span style={{ fontSize: 11.5, color: "var(--txt3)" }}>
            {anomaly.metric}
          </span>
        </div>

        <div style={{ fontSize: 13, color: "var(--txt)", marginTop: 5 }}>
          {anomaly.institution ?? "Unknown institution"}
        </div>

        {anomaly.likelyCause && (
          <div
            style={{
              fontSize: 12,
              color: "var(--txt3)",
              marginTop: 3,
              lineHeight: 1.5,
            }}
          >
            {anomaly.likelyCause}
          </div>
        )}

        {reAlerted && anomaly.previouslyAcknowledgedBy && (
          <div style={{ fontSize: 12, color: "var(--neg)", marginTop: 5 }}>
            Came back worse · acknowledged by {anomaly.previouslyAcknowledgedBy}
          </div>
        )}

        {!reAlerted && anomaly.acknowledgedAt && anomaly.acknowledgedBy && (
          <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 5 }}>
            Acknowledged by {anomaly.acknowledgedBy}
          </div>
        )}
      </div>

      <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
        <div
          className="qhub-mono"
          style={{ fontSize: 11, color: "var(--txt4)" }}
        >
          {anomaly.detectedAt
            ? new Date(anomaly.detectedAt).toLocaleString(undefined, {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </div>

        {canManage && !anomaly.acknowledgedAt && (
          <button
            type="button"
            onClick={() => acknowledge.mutate(anomaly.id)}
            disabled={acknowledge.isPending}
            style={{
              fontSize: 12,
              color: "var(--accent)",
              background: "none",
              border: "none",
              cursor: "pointer",
              marginTop: 6,
              padding: 0,
              fontFamily: "inherit",
            }}
          >
            Acknowledge
          </button>
        )}
      </div>
    </div>
  )
}

// --- Small pieces -----------------------------------------------------------

function healthDot(health: HealthStatus): string {
  if (health === "FAIL") return "var(--neg)"
  if (health === "WARN") return "var(--warn)"

  return "var(--accent)"
}

function healthTone(health: HealthStatus) {
  if (health === "FAIL") {
    return { color: "var(--neg)", background: "var(--neg-bg)" }
  }
  if (health === "WARN") {
    return { color: "var(--warn)", background: "var(--warn-bg)" }
  }

  return { color: "var(--accent)", background: "var(--accent-soft)" }
}

function healthLabel(health: HealthStatus): string {
  if (health === "FAIL") return "DEGRADED"
  if (health === "WARN") return "WARNING"

  return "HEALTHY"
}

function Kpi({
  label,
  value,
  note,
  tone,
  last,
  loading,
}: {
  label: string
  value: number
  note: string
  tone?: "neg" | "warn"
  last?: boolean
  loading?: boolean
}) {
  return (
    <div
      style={{
        padding: "18px 20px",
        borderRight: last ? "none" : "1px solid var(--line)",
      }}
    >
      <div style={{ fontSize: 13, color: "var(--txt3)", marginBottom: 7 }}>
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          whiteSpace: "nowrap",
        }}
      >
        <div
          className="qhub-mono"
          style={{
            fontSize: 23,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            opacity: loading ? 0.5 : 1,
            color:
              tone === "neg"
                ? "var(--neg)"
                : tone === "warn"
                  ? "var(--warn)"
                  : "var(--txt)",
          }}
        >
          {value.toLocaleString()}
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--txt4)" }}>
          {note}
        </div>
      </div>
    </div>
  )
}

function Loading() {
  return <div style={{ fontSize: 13, color: "var(--txt3)" }}>Loading…</div>
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 13, color: "var(--txt3)", padding: "20px 0" }}>
      {children}
    </div>
  )
}

function Pill({
  children,
  tone,
}: {
  children: React.ReactNode
  tone: { c: string; bg: string }
}) {
  return (
    <span
      className="qhub-mono"
      style={{
        fontSize: 9.5,
        letterSpacing: ".06em",
        color: tone.c,
        background: tone.bg,
        padding: "3px 6px",
      }}
    >
      {children}
    </span>
  )
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 11px",
        fontSize: 12,
        border: `1px solid ${active ? "var(--accent-brd)" : "var(--line-strong)"}`,
        background: active ? "var(--accent-soft)" : "transparent",
        color: active ? "var(--accent)" : "var(--txt3)",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  )
}

function TabChip({
  label,
  badge,
  active,
  onClick,
}: {
  label: string
  badge?: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "7px 13px",
        fontSize: 12.5,
        border: "none",
        background: active ? "var(--accent-soft)" : "transparent",
        color: active ? "var(--accent)" : "var(--txt3)",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {label}
      {!!badge && badge > 0 && (
        <span
          className="qhub-mono"
          style={{
            fontSize: 9.5,
            color: "#fff",
            background: "var(--neg)",
            padding: "1px 5px",
            borderRadius: 7,
          }}
        >
          {badge}
        </span>
      )}
    </button>
  )
}
