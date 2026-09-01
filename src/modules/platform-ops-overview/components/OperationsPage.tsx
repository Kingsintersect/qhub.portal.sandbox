"use client"

import { useState } from "react"

import { usePlatformPermissions } from "@/lib/auth/platform-permissions"
import {
  useEstateOverview,
  useEstateTrends,
} from "@/modules/platform-observability/hooks/use-observability"
import type {
  EstateInstitution,
  HealthStatus,
} from "@/modules/platform-observability/types"
import { NoteDialog } from "@/modules/institutions/drawer/NoteDialog"
import { EscalateDialog } from "@/modules/institutions/drawer/EscalateDialog"
import {
  SupportSessionDialog,
  SupportSessionFrame,
  type SupportSession,
} from "@/modules/platform-shared/SupportSessionDialog"
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
import { LogIncidentDialog } from "@/modules/platform-ops-overview/components/LogIncidentDialog"
import { LogUpgradeDialog } from "@/modules/platform-ops-overview/components/LogUpgradeDialog"

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
        {/*
         * Folder tabs, not pills.
         *
         * They sit on the page background and the active one is painted
         * var(--card) so it merges into the card below — the 22px wedge
         * skewed 18 degrees is what gives each tab its angled right edge and
         * makes the active one read as continuous with the panel.
         */}
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            background: "var(--bg)",
            paddingTop: 8,
          }}
        >
          {tabs.map(([value, label, count], i) => {
            const on = tab === value
            const activeIdx = tabs.findIndex(([v]) => v === tab)

            return (
              <div
                key={value}
                style={{ display: "flex", alignItems: "stretch" }}
              >
                {/* Suppressed beside the active tab so nothing crosses the
                    seam where it joins the card. */}
                <div
                  style={{
                    width: 1,
                    alignSelf: "center",
                    height: 16,
                    background:
                      i === 0 || on || i === activeIdx + 1
                        ? "transparent"
                        : "var(--divider)",
                  }}
                />

                <button
                  type="button"
                  onClick={() => setTab(value)}
                  style={{
                    position: "relative",
                    zIndex: 1,
                    padding: "13px 12px 15px 20px",
                    fontSize: 13.5,
                    fontWeight: on ? 600 : 400,
                    color: on ? "var(--txt)" : "var(--txt3)",
                    cursor: "pointer",
                    background: on ? "var(--card)" : "transparent",
                    border: "none",
                    borderRadius: 0,
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontFamily: "inherit",
                  }}
                >
                  {label}
                  {count !== undefined && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--neg)",
                        background: "var(--neg-bg)",
                        padding: "2px 7px",
                        borderRadius: 999,
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>

                <div
                  style={{
                    width: 22,
                    alignSelf: "stretch",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: -11,
                      width: 22,
                      background: on ? "var(--card)" : "transparent",
                      transform: "skewX(18deg)",
                      transformOrigin: "top left",
                      borderRadius: "0 10px 0 0",
                    }}
                  />
                </div>
              </div>
            )
          })}

          <div
            style={{
              flex: "1 1 auto",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              padding: "0 18px 6px",
            }}
          />
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

const HEALTH_GRID = "150px 1.5fr 110px 110px 150px 110px 40px"

function HealthTab() {
  const { data, isPending } = useEstateOverview()
  const rows = data?.institutions ?? []

  const [openId, setOpenId] = useState<number | null>(null)

  // The three surfaces the expanded row opens. Held here rather than in the
  // panel so only one can ever be open at a time.
  const [noting, setNoting] = useState<EstateInstitution | null>(null)
  const [console_, setConsole] = useState<EstateInstitution | null>(null)
  const [escalating, setEscalating] = useState<EstateInstitution | null>(null)

  const [session, setSession] = useState<SupportSession | null>(null)
  const [reason, setReason] = useState("")

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
        <div>LAST CAPTURE</div>
        <div>INSTITUTION</div>
        <div>PLAN</div>
        <div>LEARNERS</div>
        <div>TENANT HEALTH</div>
        <div>OPEN ISSUES</div>
        <div />
      </div>

      {isPending && <Loading />}

      {!isPending && rows.length === 0 && (
        <Empty>No institutions on the estate yet.</Empty>
      )}

      {rows.map((r) => (
        <div key={r.id}>
          <div
            onClick={() => setOpenId(openId === r.id ? null : r.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setOpenId(openId === r.id ? null : r.id)
              }
            }}
            style={{
              display: "grid",
              gridTemplateColumns: HEALTH_GRID,
              columnGap: 18,
              alignItems: "center",
              padding: "13px 24px",
              fontSize: 13.5,
              borderTop: "1px solid var(--line2)",
              cursor: "pointer",
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
            {/* An em-dash at zero, not the word "none" — the column is a
                count, and a healthy institution should read as blank rather
                than as something to parse. */}
            <div
              style={{
                color: r.issues === 0 ? "var(--txt4)" : "var(--neg)",
                fontWeight: r.issues === 0 ? 400 : 600,
              }}
            >
              {r.issues === 0 ? "—" : r.issues}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                color: "var(--txt4)",
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
                style={{
                  transform: openId === r.id ? "rotate(180deg)" : "none",
                  transition: "transform .18s",
                }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

          {openId === r.id && (
            <HealthRowPanel
              institution={r}
              onNote={() => setNoting(r)}
              onOpenConsole={() => setConsole(r)}
              onEscalate={() => setEscalating(r)}
            />
          )}
        </div>
      ))}

      {noting !== null && (
        <NoteDialog
          tenantId={noting.id}
          institution={noting.name}
          onClose={() => setNoting(null)}
        />
      )}

      {console_ !== null && (
        <SupportSessionDialog
          tenantId={console_.id}
          name={console_.name}
          slug={console_.slug}
          onReason={setReason}
          onClose={() => setConsole(null)}
          onOpened={setSession}
        />
      )}

      {session !== null && (
        <SupportSessionFrame
          session={session}
          institution={console_?.name ?? ""}
          slug={console_?.slug ?? ""}
          reason={reason}
          onEnd={() => setSession(null)}
        />
      )}

      {escalating !== null && (
        <EscalateDialog
          tenantId={escalating.id}
          name={escalating.name}
          onClose={() => setEscalating(null)}
        />
      )}
    </>
  )
}

/**
 * The expanded institution row, lifted from the draft.
 *
 * A bordered panel inset from the row, not a nested table — it is a detail
 * view of one institution, and the three actions along the bottom are the
 * whole reason to open it: look inside, escalate, or write down what the next
 * person needs to know.
 */
function HealthRowPanel({
  institution,
  onNote,
  onOpenConsole,
  onEscalate,
}: {
  institution: EstateInstitution
  onNote: () => void
  onOpenConsole: () => void
  onEscalate: () => void
}) {
  return (
    <div
      style={{
        margin: "0 16px 14px",
        border: "1.5px solid var(--accent)",
        borderRadius: 16,
        background: "var(--panel-open)",
        padding: "20px 22px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.35fr 1fr 150px",
          gap: 28,
          alignItems: "start",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "12px 22px",
            fontSize: 13.5,
            alignItems: "center",
            whiteSpace: "nowrap",
          }}
        >
          <div style={{ color: "var(--txt3)" }}>Programmes</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {institution.programCategories.length === 0 && (
              <span style={{ color: "var(--txt3)" }}>None recorded</span>
            )}
            {institution.programCategories.map((category) => (
              <span
                key={category}
                style={{
                  fontSize: 12,
                  padding: "4px 10px",
                  borderRadius: 8,
                  border: "1px solid var(--accent-brd)",
                  color: "var(--accent)",
                  whiteSpace: "nowrap",
                }}
              >
                {category.replace(/_/g, " ").toLowerCase()}
              </span>
            ))}
          </div>

          <div style={{ color: "var(--txt3)" }}>Plan</div>
          <div>
            <b style={{ fontWeight: 600 }}>{institution.plan ?? "none"}</b>
          </div>

          <div style={{ color: "var(--txt3)" }}>Learners</div>
          <div>
            <b style={{ fontWeight: 600 }}>
              {institution.students.toLocaleString()}
            </b>{" "}
            <span style={{ color: "var(--txt3)" }}>
              · {institution.lecturers.toLocaleString()} lecturers
            </span>
          </div>

          <div style={{ color: "var(--txt3)" }}>Open issues</div>
          <div>
            <b
              style={{
                fontWeight: 600,
                color: institution.issues > 0 ? "var(--neg)" : "var(--txt)",
              }}
            >
              {institution.issues}
            </b>{" "}
            <span style={{ color: "var(--txt3)" }}>
              ({healthLabel(institution.health).toLowerCase()})
            </span>
          </div>
        </div>

        <div style={{ fontSize: 13.5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 600 }}>Note</span>
          </div>
          <p
            style={{
              margin: "8px 0 14px",
              color: "var(--txt2)",
              lineHeight: 1.55,
              textWrap: "pretty",
            }}
          >
            Internal and timestamped. The institution never sees these.
          </p>
          <button
            type="button"
            onClick={onNote}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              color: "var(--accent)",
              fontWeight: 500,
              cursor: "pointer",
              background: "none",
              border: "none",
              padding: 0,
              fontSize: 13.5,
              fontFamily: "inherit",
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <rect x="4" y="4" width="16" height="16" rx="4" />
              <path d="M12 9v6M9 12h6" />
            </svg>
            New Note
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <HealthDonut
            health={institution.health}
            issues={institution.issues}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: 20,
        }}
      >
        <button
          type="button"
          onClick={onOpenConsole}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            background: "var(--accent)",
            color: "#fff",
            fontSize: 13.5,
            fontWeight: 500,
            padding: "11px 18px",
            borderRadius: 11,
            border: "none",
            cursor: "pointer",
            whiteSpace: "nowrap",
            fontFamily: "inherit",
          }}
        >
          Open Tenant Console
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 17L17 7M9 7h8v8" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onEscalate}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            background: "var(--accent-soft)",
            color: "var(--accent)",
            fontSize: 13.5,
            fontWeight: 500,
            padding: "11px 18px",
            borderRadius: 11,
            border: "none",
            cursor: "pointer",
            whiteSpace: "nowrap",
            fontFamily: "inherit",
          }}
        >
          Escalate to Engineering
        </button>
      </div>
    </div>
  )
}

/** The draft's ring, drawn from the institution's own health. */
function HealthDonut({
  health,
  issues,
}: {
  health: HealthStatus
  issues: number
}) {
  const tone =
    health === "OK"
      ? "var(--accent)"
      : health === "WARN"
        ? "var(--warn)"
        : "var(--neg)"

  // Full ring when healthy, and progressively less of one as issues mount.
  const filled = Math.max(0.15, 1 - Math.min(issues, 6) / 6)
  const circumference = 264

  return (
    <div style={{ position: "relative", width: 96, height: 96 }}>
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle
          style={{ stroke: "var(--donut-track)" }}
          cx="48"
          cy="48"
          r="42"
          fill="none"
          strokeWidth="6"
        />
        <circle
          style={{ stroke: tone }}
          cx="48"
          cy="48"
          r="42"
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${Math.round(circumference * filled)} ${circumference}`}
          transform="rotate(-90 48 48)"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 600, color: tone }}>
          {issues}
        </div>
        <div style={{ fontSize: 10.5, color: "var(--txt3)" }}>
          {issues === 1 ? "issue" : "issues"}
        </div>
      </div>
    </div>
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
  const [logging, setLogging] = useState(false)
  const { data, isLoading } = useIncidents(status)

  return (
    <>
      {logging && <LogIncidentDialog onClose={() => setLogging(false)} />}

      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 14,
          alignItems: "center",
        }}
      >
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
        <ActionButton label="Log incident" onClick={() => setLogging(true)} />
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
  const [logging, setLogging] = useState(false)
  const { data, isLoading } = useUpgrades()

  // The action stays available while loading and when empty — an operator
  // logging the first upgrade should not have to wait for a list of nothing.
  const header = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: 14,
      }}
    >
      <ActionButton label="Log upgrade" onClick={() => setLogging(true)} />
    </div>
  )

  if (isLoading) {
    return (
      <>
        {header}
        <Loading />
      </>
    )
  }

  if (!data?.length) {
    return (
      <>
        {logging && <LogUpgradeDialog onClose={() => setLogging(false)} />}
        {header}
        <Empty>No upgrades logged.</Empty>
      </>
    )
  }

  return (
    <>
      {logging && <LogUpgradeDialog onClose={() => setLogging(false)} />}
      {header}
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

/** The right-aligned action on a tab's filter row. */
function ActionButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        marginLeft: "auto",
        background: "var(--accent)",
        color: "#fff",
        border: "none",
        fontSize: 12.5,
        fontWeight: 500,
        padding: "8px 14px",
        borderRadius: 10,
        cursor: "pointer",
        fontFamily: "inherit",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  )
}
