"use client"

import { useState } from "react"

import { usePlatformPermissions } from "@/lib/auth/platform-permissions"
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

type Tab = "incidents" | "upgrades" | "anomalies"

/**
 * Incidents, upgrades and usage anomalies — the operational half of Systems
 * Overview.
 *
 * Anomalies are auto-flagged against each institution's OWN baseline, never
 * hand-entered, and acknowledging one records "seen and judged expected"
 * rather than "fixed".
 */
export function OperationsPage() {
  const [tab, setTab] = useState<Tab>("incidents")
  const { data: incidents } = useIncidents("open")

  return (
    <div style={{ padding: "26px 30px" }}>
      <h1
        style={{
          fontSize: 21,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: "var(--txt)",
          margin: 0,
        }}
      >
        Operations
      </h1>
      <p style={{ fontSize: 13, color: "var(--txt3)", marginTop: 5 }}>
        Health, incidents and upgrades across the estate. Everything here is
        derived from probes and sync — none of it is hand-set.
      </p>

      <div
        style={{
          display: "flex",
          gap: 6,
          marginTop: 20,
          borderBottom: "1px solid var(--line)",
          paddingBottom: 12,
        }}
      >
        <TabChip
          label="Incidents"
          badge={incidents?.openCount}
          active={tab === "incidents"}
          onClick={() => setTab("incidents")}
        />
        <TabChip
          label="Upgrades"
          active={tab === "upgrades"}
          onClick={() => setTab("upgrades")}
        />
        <TabChip
          label="Usage anomalies"
          active={tab === "anomalies"}
          onClick={() => setTab("anomalies")}
        />
      </div>

      <div style={{ marginTop: 18 }}>
        {tab === "incidents" && <IncidentsTab />}
        {tab === "upgrades" && <UpgradesTab />}
        {tab === "anomalies" && <AnomaliesTab />}
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
