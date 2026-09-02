"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

import apiClient from "@/lib/clients/apiClient"
import { errorMessage } from "@/lib/api-error"
import { useConfirm } from "@/modules/platform-shared/ConfirmProvider"
import {
  TableFooter,
  useTablePage,
} from "@/modules/platform-shared/TableFooter"

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
  const [logging, setLogging] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  /*
   * The file comes from the server, not from the rows on screen.
   *
   * The audit entry is written in the same request that produces the CSV, so
   * the log and the file cannot describe different rows — and the log is the
   * half somebody relies on months later.
   */
  const exportView = async () => {
    try {
      const blob = await apiClient.get<Blob>("/platform/overview/export", {
        access_token: true,
        responseType: "blob",
      })

      // A plain window.open cannot carry the Authorization header, and the
      // endpoint requires it — so the file is fetched, then handed to the
      // browser as an object URL.
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")

      link.href = url
      link.download = `tenant-health-${new Date().toISOString().slice(0, 10)}.csv`
      link.click()

      URL.revokeObjectURL(url)

      toast.success("Exported as CSV", {
        description: "Rows as filtered · the download is in the audit log.",
      })
    } catch (error) {
      toast.error("Could not export that view", {
        description: errorMessage(error, "Nothing was downloaded."),
      })
    }
  }
  // 3M, as the draft opens on — a quarter is where a trend becomes visible.
  const [days, setDays] = useState(90)

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
      "Fed automatically by platform probes and sync results — nothing here is entered by hand.",
    incidents: "Logged by staff, or opened automatically by monitoring alarms.",
    provisioning:
      "Rows appear when a tenant is created via New institution on the Institutions page.",
    upgrades: "Rollouts logged here post to affected tenants' consoles.",
    anomalies:
      "Detected hourly against each tenant's own baseline. Acknowledge to silence — an acknowledged anomaly that then doubles is un-acknowledged and re-alerts.",
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
          label="Institutions live"
          value={compact(overview?.totals.active ?? 0)}
          note={`of ${overview?.totals.institutions ?? 0}`}
          loading={overviewLoading}
        />
        <Kpi
          label="Active learners"
          value={compact(overview?.totals.students ?? 0)}
          note="estate-wide"
          loading={overviewLoading}
        />
        <Kpi
          label="Sessions now"
          value={compact(overview?.totals.sessionsNow ?? 0)}
          note="last 15 minutes"
          loading={overviewLoading}
        />
        <Kpi
          label="Uptime (30d)"
          // Null until something has been served. "—" says nothing has been
          // measured; "100%" would claim an estate that answered nothing was
          // perfectly available.
          value={
            overview?.totals.uptime30d === null ||
            overview?.totals.uptime30d === undefined
              ? "—"
              : `${overview.totals.uptime30d}%`
          }
          note="of requests served"
          loading={overviewLoading}
        />
        <Kpi
          label="Open tickets"
          value={compact(overview?.totals.openTickets ?? 0)}
          note="unresolved"
          tone={(overview?.totals.openTickets ?? 0) > 0 ? "warn" : undefined}
          loading={overviewLoading}
        />
        <Kpi
          label="Failed jobs · 24h"
          value={compact(overview?.totals.failedJobs24h ?? 0)}
          note="on the queue"
          tone={(overview?.totals.failedJobs24h ?? 0) > 0 ? "neg" : undefined}
          last
          loading={overviewLoading}
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
              position: "relative",
            }}
          >
            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  right: 18,
                  zIndex: 55,
                  width: 250,
                  background: "var(--surface-solid)",
                  border: "1px solid var(--line-strong)",
                  borderRadius: 13,
                  boxShadow: "var(--shadow-pop)",
                  padding: 6,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    void exportView()
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    width: "100%",
                    fontSize: 12.5,
                    color: "var(--txt2)",
                    padding: "9px 11px",
                    borderRadius: 9,
                    cursor: "pointer",
                    border: "none",
                    background: "transparent",
                    fontFamily: "inherit",
                    textAlign: "left",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--icon)"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  Download this view (CSV)
                </button>

                <div
                  style={{
                    fontSize: 10.5,
                    color: "var(--txt4)",
                    padding: "6px 11px 7px",
                    borderTop: "1px solid var(--line)",
                    marginTop: 4,
                  }}
                >
                  Exports the rows as filtered · the download is written to the
                  audit log
                </div>
              </div>
            )}

            {/*
              The control at the end of the tab strip, lifted as drawn.
              
              It carries no handler in the draft either — the only onClick in
              that block is the tab itself — so what it opens is a question for
              Design rather than something to invent. Rendered as a plain icon
              rather than a button until then: the draft's own product rule is
              that a control which reports success and does nothing is worse
              than no control, and a clickable-looking thing that opens nothing
              is exactly that.
            */}
            <button
              type="button"
              aria-label="View menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                borderRadius: 9,
                border: "none",
                background: menuOpen ? "var(--panel)" : "transparent",
              }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth={1.8}
                strokeLinecap="round"
                style={{ stroke: "var(--icon3)" }}
              >
                <path d="M5 7h14M8 12h11M11 17h8" />
                <circle
                  style={{ fill: "var(--icon3)" }}
                  cx="5"
                  cy="12"
                  r="1.2"
                />
                <circle
                  style={{ fill: "var(--icon3)" }}
                  cx="8"
                  cy="17"
                  r="1.2"
                />
              </svg>
            </button>
          </div>
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

          {(tab === "incidents" || tab === "upgrades") && (
            <button
              type="button"
              onClick={() => setLogging(true)}
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: "var(--accent)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 500,
                fontFamily: "inherit",
                border: "none",
                padding: "7px 13px",
                borderRadius: 9,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              {tab === "incidents" ? "Log incident" : "Log upgrade"}
            </button>
          )}
        </div>

        {logging && tab === "incidents" && (
          <LogIncidentDialog onClose={() => setLogging(false)} />
        )}
        {logging && tab === "upgrades" && (
          <LogUpgradeDialog onClose={() => setLogging(false)} />
        )}

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
const INCIDENT_GRID = "120px minmax(0,1.9fr) minmax(0,1.2fr) 80px 120px 130px"
const PROVISIONING_GRID =
  "90px minmax(0,1.3fr) minmax(0,1.6fr) 130px 80px 130px"
const UPGRADE_GRID = "110px minmax(0,1.9fr) 110px 90px 120px 120px"
const ANOMALY_GRID =
  "110px minmax(0,1.2fr) minmax(0,1.4fr) 150px minmax(0,1.3fr) 170px"

function HealthTab() {
  const { data, isPending } = useEstateOverview()
  const all = data?.institutions ?? []
  const { rows, footer } = useTablePage(all)

  const [openId, setOpenId] = useState<number | null>(null)

  // The three surfaces the expanded row opens. Held here rather than in the
  // panel so only one can ever be open at a time.
  const [noting, setNoting] = useState<EstateInstitution | null>(null)
  const [console_, setConsole] = useState<EstateInstitution | null>(null)
  const [escalating, setEscalating] = useState<EstateInstitution | null>(null)

  const [session, setSession] = useState<SupportSession | null>(null)
  const [reason, setReason] = useState("")

  const confirm = useConfirm()
  const queryClient = useQueryClient()

  /*
   * Suspend and resume, on the same endpoint the institution drawer uses.
   * The draft puts these on the health panel as well, which is the point:
   * whoever is reading a degraded institution's row is the person who decides
   * to close its portal, and making them go and find another surface to do it
   * is how the decision gets postponed.
   */
  const lifecycle = useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: number
      action: "suspend" | "resume"
    }) =>
      apiClient.post(
        `/platform/tenants/${id}/${action}`,
        {},
        { access_token: true }
      ),
    onSuccess: (_data, { action }) => {
      toast.success(action === "suspend" ? "Portal closed" : "Portal reopened")
      void queryClient.invalidateQueries({ queryKey: ["platform"] })
      void queryClient.invalidateQueries({
        queryKey: ["platform-observability"],
      })
    },
    onError: (error) =>
      toast.error("That did not work", {
        description: errorMessage(error, "Nothing changed."),
      }),
  })

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

      {!isPending && all.length === 0 && (
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
              onSuspend={async () => {
                const ok = await confirm({
                  title: `Suspend ${r.name}?`,
                  body: "Their portal closes on the next request. Nothing is deleted and every record is kept — resuming puts it straight back.",
                  label: "Suspend tenant",
                  danger: true,
                })

                if (ok) lifecycle.mutate({ id: r.id, action: "suspend" })
              }}
              onResume={() => lifecycle.mutate({ id: r.id, action: "resume" })}
            />
          )}
        </div>
      ))}

      {all.length > 0 && (
        <TableFooter
          {...footer}
          summary={`${rows.length} of ${all.length} ${all.length === 1 ? "institution" : "institutions"} · health recomputed every 5 minutes`}
        />
      )}

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
/**
 * The marker the draft puts beside a figure QHub derived rather than measured.
 *
 * Storage consumed and the health score are both rolled up by the collector,
 * and the draft labels them so nobody reads them as a direct reading off the
 * institution's own database.
 */
function AiBadge() {
  return (
    <span
      style={{
        fontSize: 9.5,
        letterSpacing: ".06em",
        border: "1px solid var(--line-strong)",
        borderRadius: 5,
        padding: "1px 5px",
        color: "var(--icon2)",
      }}
    >
      AI
    </span>
  )
}

/** 1.24M rather than 1,240,000 — the strip has six columns to fit. */
function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}k`

  return n.toLocaleString()
}

/** 1.8 TB, not 1980000000000. */
function formatBytes(n: number): string {
  if (n <= 0) return "0 MB"

  const units = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)))
  const value = n / 1024 ** i

  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`
}

function HealthRowPanel({
  institution,
  onNote,
  onOpenConsole,
  onEscalate,
  onSuspend,
  onResume,
}: {
  institution: EstateInstitution
  onNote: () => void
  onOpenConsole: () => void
  onEscalate: () => void
  onSuspend: () => void
  onResume: () => void
}) {
  const suspended = institution.status === "SUSPENDED"

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
          <div style={{ color: "var(--txt3)" }}>Modules Enabled</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {institution.modules.length === 0 && (
              <span style={{ color: "var(--txt3)" }}>None enabled</span>
            )}
            {institution.modules.map((module) => (
              <span
                key={module}
                style={{
                  fontSize: 12,
                  padding: "4px 10px",
                  borderRadius: 8,
                  border: "1px solid var(--accent-brd)",
                  color: "var(--accent)",
                  whiteSpace: "nowrap",
                }}
              >
                {module}
              </span>
            ))}
          </div>

          <div style={{ color: "var(--txt3)" }}>SIS Integration</div>
          <div>
            {institution.integrations.sis ? (
              <>
                <b style={{ fontWeight: 600 }}>
                  {institution.integrations.sis.name}
                </b>{" "}
                <span style={{ color: "var(--txt3)" }}>
                  ({institution.integrations.sis.detail})
                </span>
              </>
            ) : (
              /* No integration is a fact about the school, not a blank. */
              <span style={{ color: "var(--txt3)" }}>None connected</span>
            )}
          </div>

          <div
            style={{
              color: "var(--txt3)",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            Storage Consumed <AiBadge />
          </div>
          <div>
            <b style={{ fontWeight: 600 }}>
              {formatBytes(institution.storage.usedBytes)}
            </b>{" "}
            <span style={{ color: "var(--txt3)" }}>
              {institution.storage.quotaBytes === null
                ? "(no ceiling set)"
                : `(of ${formatBytes(institution.storage.quotaBytes)} plan)`}
            </span>
          </div>

          <div
            style={{
              color: "var(--txt3)",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            Health Score <AiBadge />
          </div>
          <div>
            {institution.healthScore === null ? (
              /* Never scored is not zero: the collector has not run for this
                 institution yet, and 0 would read as "in trouble". */
              <span style={{ color: "var(--txt3)" }}>Not yet scored</span>
            ) : (
              <>
                <b style={{ fontWeight: 600 }}>{institution.healthScore}</b>{" "}
                <span style={{ color: "var(--txt3)" }}>
                  ({healthLabel(institution.health)})
                </span>
              </>
            )}
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
            score={institution.healthScore}
            health={institution.health}
          />
        </div>
      </div>

      {suspended && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 16,
            background: "var(--neg-bg)",
            border: "1px solid var(--neg)",
            borderRadius: 11,
            padding: "10px 14px",
            fontSize: 12.5,
            color: "var(--txt)",
          }}
        >
          This tenant is suspended &mdash; the portal is closed to all learners
          and staff. Data and billing are untouched.
        </div>
      )}

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

        {suspended ? (
          <button
            type="button"
            onClick={onResume}
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 9,
              border: "1px solid var(--accent)",
              background: "transparent",
              color: "var(--accent)",
              fontSize: 13.5,
              fontWeight: 500,
              fontFamily: "inherit",
              padding: "11px 18px",
              borderRadius: 11,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Resume Tenant
          </button>
        ) : (
          <button
            type="button"
            onClick={onSuspend}
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 9,
              border: "1px solid var(--line-strong)",
              background: "transparent",
              color: "var(--txt2)",
              fontSize: 13.5,
              fontFamily: "inherit",
              padding: "11px 18px",
              borderRadius: 11,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Suspend Tenant
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
            >
              <rect x="3.5" y="5" width="17" height="4" rx="1.5" />
              <path d="M5.5 9v9.5h13V9M10 13h4" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

/** The draft's ring, drawn from the institution's own health. */
function HealthDonut({
  score,
  health,
}: {
  score: number | null
  health: HealthStatus
}) {
  /*
   * The ring is the score, not the issue count.
   *
   * The draft draws it as `stroke-dasharray="224 264"` against r=42 — 85% of
   * the circumference for a score of 85. An earlier version filled it from
   * open issues instead, which meant a perfectly healthy institution with one
   * stale check drew the same ring as one scoring 83.
   */
  const circumference = 2 * Math.PI * 42

  const tone =
    health === "OK"
      ? "var(--accent)"
      : health === "WARN"
        ? "var(--warn)"
        : "var(--neg)"

  // Never scored is not zero. An empty ring reading 0 says "this institution
  // is in trouble"; the truth is that the collector has not reached it.
  const filled = score === null ? 0 : Math.min(100, Math.max(0, score)) / 100

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
          strokeDasharray={`${Math.round(circumference * filled)} ${Math.round(circumference)}`}
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
        <div
          style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em" }}
        >
          {score === null ? "—" : score}
        </div>
        <div style={{ fontSize: 10.5, color: "var(--txt3)" }}>Health</div>
      </div>
    </div>
  )
}

// --- Provisioning -----------------------------------------------------------

function ProvisioningTab({
  rows: all,
}: {
  rows: Array<{ id: number; name: string; slug: string }>
}) {
  const { rows, footer } = useTablePage(all)

  if (all.length === 0) {
    return <Empty>Nothing being provisioned right now.</Empty>
  }

  return (
    <>
      <TableHead
        grid={PROVISIONING_GRID}
        cols={["STARTED", "INSTITUTION", "STAGE", "OWNER", "ENV", "STATUS"]}
      />
      {rows.map((r) => (
        <ProvisioningRow
          key={r.id}
          tenantId={r.id}
          name={r.name}
          slug={r.slug}
        />
      ))}
      <TableFooter
        {...footer}
        summary={`${all.length} ${all.length === 1 ? "onboarding" : "onboardings"} in flight`}
      />
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
}: {
  tenantId: number
  name: string
  slug: string
}) {
  const { data } = useProvisioningProgress(tenantId)

  // "Stage 3 of 7" is what the draft shows, and it is the useful phrasing:
  // a bare percentage does not say what is happening right now.
  const stage =
    data === undefined
      ? "…"
      : data.status === "FAILED"
        ? `Failed at ${data.failedAt ?? "an unknown step"}`
        : data.status === "QUEUED"
          ? "Waiting to start"
          : (data.steps.find((step) => !step.done)?.label ?? "Finishing up")

  return (
    <TableRow grid={PROVISIONING_GRID}>
      <WhenCell>{shortWhen(data?.startedAt ?? null)}</WhenCell>
      <TitleCell>{name}</TitleCell>
      <MutedCell>
        {data === undefined
          ? "…"
          : `Stage ${Math.min(data.completed + 1, data.total)} of ${data.total} — ${stage}`}
      </MutedCell>
      <MutedCell>{data?.owner ?? "Unassigned"}</MutedCell>
      <MutedCell mono>{data?.environment ?? "—"}</MutedCell>
      <div>
        <StatusPill label={data?.status ?? "QUEUED"} />
      </div>
    </TableRow>
  )
}

function TableHead({ grid, cols }: { grid: string; cols: string[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: grid,
        columnGap: 18,
        padding: "14px 24px 10px",
        fontSize: 10.5,
        letterSpacing: ".09em",
        color: "var(--txt4)",
      }}
    >
      {cols.map((c) => (
        <div key={c}>{c}</div>
      ))}
    </div>
  )
}

/** A table row, ruled and spaced as the draft has it. */
function TableRow({
  grid,
  children,
}: {
  grid: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: grid,
        columnGap: 18,
        alignItems: "center",
        padding: "13px 24px",
        fontSize: 13.5,
        borderTop: "1px solid var(--line2)",
      }}
    >
      {children}
    </div>
  )
}

/** The muted first column every table starts with: when it happened. */
function WhenCell({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>{children}</div>
}

/** The one column that carries the weight: what the row is about. */
function TitleCell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontWeight: 500,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {children}
    </div>
  )
}

function MutedCell({
  children,
  mono,
}: {
  children: React.ReactNode
  mono?: boolean
}) {
  return (
    <div
      className={mono ? "qhub-mono" : undefined}
      style={{
        fontSize: mono ? 11.5 : 12.5,
        color: mono ? "var(--txt3)" : "var(--txt2)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {children}
    </div>
  )
}

function IncidentsTab() {
  /*
   * Unfiltered, as drawn. The draft pages this list rather than filtering it,
   * and the Open/All chips that were here defaulted to "open" — so a resolved
   * incident vanished from the tab that is supposed to be the record of what
   * happened.
   */
  const { data, isLoading } = useIncidents("")

  const all = data?.data ?? []
  const { rows, footer } = useTablePage(all)

  return (
    <>
      {isLoading && <Loading />}

      {!isLoading && all.length === 0 && <Empty>No incidents logged.</Empty>}

      {all.length > 0 && (
        <>
          <TableHead
            grid={INCIDENT_GRID}
            cols={[
              "STARTED",
              "INCIDENT",
              "AFFECTED",
              "SEVERITY",
              "STATUS",
              "OWNER",
            ]}
          />
          {rows.map((incident) => (
            <IncidentRow key={incident.id} incident={incident} />
          ))}
          <TableFooter
            {...footer}
            summary={`${all.length} ${all.length === 1 ? "incident" : "incidents"} in the last 30 days`}
          />
        </>
      )}
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
    <TableRow grid={INCIDENT_GRID}>
      <WhenCell>{shortWhen(incident.openedAt)}</WhenCell>
      <TitleCell>{incident.title}</TitleCell>
      <MutedCell>
        {/* Platform-wide is not "every institution listed" — it is a
            different kind of incident, and it says so. */}
        {incident.isPlatformWide
          ? "Platform-wide"
          : incident.institutions.length > 0
            ? incident.institutions.join(", ")
            : "None attached"}
      </MutedCell>
      <div>
        <span
          className="qhub-mono"
          style={{
            fontSize: 10,
            letterSpacing: ".05em",
            padding: "4px 8px",
            borderRadius: 7,
            color: sev.c,
            background: sev.bg,
          }}
        >
          {incident.severity}
        </span>
      </div>
      <div>
        <StatusPill label={incident.status} />
      </div>
      <MutedCell>{incident.owner ?? "Unassigned"}</MutedCell>
    </TableRow>
  )
}

/** "3 Aug, 15:17" — the draft's format, not a full timestamp. */
function shortWhen(iso: string | null): string {
  if (iso === null) return "—"

  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/** The status chip every table's last-but-one column uses. */
function StatusPill({ label }: { label: string }) {
  const upper = label.toUpperCase()

  const tone =
    upper.includes("RESOLV") || upper.includes("COMPLETE")
      ? { c: "var(--accent)", bg: "var(--good-bg)" }
      : upper.includes("FAIL")
        ? { c: "var(--neg)", bg: "var(--neg-bg)" }
        : upper.includes("SCHEDUL") || upper.includes("QUEUE")
          ? { c: "var(--txt3)", bg: "var(--panel)" }
          : { c: "var(--warn)", bg: "var(--warn-bg)" }

  return (
    <span
      style={{
        fontSize: 10.5,
        fontWeight: 500,
        padding: "4px 9px",
        borderRadius: 7,
        color: tone.c,
        background: tone.bg,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  )
}

function UpgradesTab() {
  const { data, isLoading } = useUpgrades()

  const all = data ?? []
  // Called before any early return: a hook behind a condition is a hook that
  // runs a different number of times between renders.
  const { rows, footer } = useTablePage(all)

  if (isLoading) return <Loading />

  if (all.length === 0) return <Empty>No upgrades logged.</Empty>

  return (
    <>
      <TableHead
        grid={UPGRADE_GRID}
        cols={["DATE", "UPGRADE", "COMPONENT", "VERSION", "ROLLOUT", "STATUS"]}
      />
      {rows.map((u) => (
        <UpgradeRow key={u.id} upgrade={u} />
      ))}
      <TableFooter
        {...footer}
        summary={`${all.length} ${all.length === 1 ? "upgrade" : "upgrades"} tracked`}
      />
    </>
  )
}

function UpgradeRow({ upgrade }: { upgrade: Upgrade }) {
  return (
    <TableRow grid={UPGRADE_GRID}>
      {/* The date the draft shows is when it is happening, which for a
          scheduled upgrade is the scheduled date, not when it was logged. */}
      <WhenCell>
        {shortWhen(
          upgrade.startedAt ?? upgrade.scheduledFor ?? upgrade.completedAt
        )}
      </WhenCell>
      <TitleCell>{upgrade.title}</TitleCell>
      <MutedCell>{upgrade.component ?? "—"}</MutedCell>
      <MutedCell mono>{upgrade.version ?? "—"}</MutedCell>
      <MutedCell>
        {upgrade.rolloutScope ??
          (upgrade.institutions.length > 0
            ? upgrade.institutions.join(", ")
            : "—")}
      </MutedCell>
      <div>
        <StatusPill label={upgrade.status} />
      </div>
    </TableRow>
  )
}

function AnomaliesTab() {
  /*
   * Every anomaly, acknowledged ones included, as the draft has it: its
   * footer counts new against re-alerted across the whole set, which only
   * reads as a sentence if the whole set is on the table.
   *
   * The "include acknowledged" toggle and the manual detect button that were
   * here are not in the draft. Detection is hourly and automatic — the note
   * above the table says so — and a toggle that hides acknowledged rows hides
   * exactly the ones a re-alert would come from.
   */
  const { data, isLoading } = useAnomalies(true)
  const { can } = usePlatformPermissions()
  const canManage = can("anomalies.manage")

  const all = data ?? []
  const { rows, footer } = useTablePage(all)

  const newCount = all.filter((a) => a.acknowledgedAt === null).length
  const reAlerted = all.filter((a) => a.reAlertedAt !== null).length

  return (
    <>
      {isLoading && <Loading />}

      {!isLoading && all.length === 0 && (
        <Empty>Nothing has deviated from baseline.</Empty>
      )}

      {all.length > 0 && (
        <>
          <TableHead
            grid={ANOMALY_GRID}
            cols={[
              "DETECTED",
              "INSTITUTION",
              "ANOMALY",
              "MAGNITUDE",
              "LIKELY CAUSE",
              "STATUS",
            ]}
          />
          {rows.map((a) => (
            <AnomalyRow key={a.id} anomaly={a} canManage={canManage} />
          ))}
          <TableFooter
            {...footer}
            summary={`${newCount} new · ${reAlerted} re-alerted`}
          />
        </>
      )}
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

  const tone = reAlerted
    ? { c: "var(--neg)", bg: "var(--neg-bg)" }
    : anomaly.acknowledgedAt !== null
      ? { c: "var(--txt3)", bg: "var(--panel)" }
      : { c: "var(--warn)", bg: "var(--warn-bg)" }

  return (
    <TableRow grid={ANOMALY_GRID}>
      <WhenCell>{shortWhen(anomaly.detectedAt)}</WhenCell>
      <TitleCell>{anomaly.institution ?? "Unknown institution"}</TitleCell>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            color: "var(--txt2)",
            fontSize: 12.5,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {anomaly.metric}
        </div>
        {/* A re-alert must never read like a first sighting: somebody already
            looked at this one and judged it expected, and it came back
            worse. */}
        {reAlerted && (
          <div
            style={{
              fontSize: 10.5,
              color: "var(--neg)",
              marginTop: 2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Came back worse ·{" "}
            {anomaly.previouslyAcknowledgedBy ?? "previously acknowledged"}
          </div>
        )}
      </div>
      <div className="qhub-mono" style={{ fontSize: 11.5, color: tone.c }}>
        {sign}
        {anomaly.deviationPct.toFixed(0)}%
        {reAlerted && anomaly.acknowledgedDeviationPct !== null && (
          <span style={{ color: "var(--txt4)" }}>
            {" "}
            (was {anomaly.acknowledgedDeviationPct.toFixed(0)}%)
          </span>
        )}
      </div>
      <MutedCell>{anomaly.likelyCause ?? "—"}</MutedCell>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 500,
            padding: "4px 9px",
            borderRadius: 7,
            color: tone.c,
            background: tone.bg,
            whiteSpace: "nowrap",
          }}
        >
          {reAlerted
            ? "Re-alerted"
            : anomaly.acknowledgedAt !== null
              ? "Acknowledged"
              : "Open"}
        </span>
        {canManage && (anomaly.acknowledgedAt === null || reAlerted) && (
          <button
            type="button"
            onClick={() => acknowledge.mutate(anomaly.id)}
            disabled={acknowledge.isPending}
            style={{
              border: "1px solid var(--line-strong)",
              background: "transparent",
              color: "var(--txt2)",
              fontSize: 11,
              fontWeight: 500,
              fontFamily: "inherit",
              padding: "4px 9px",
              borderRadius: 8,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Acknowledge
          </button>
        )}
      </div>
    </TableRow>
  )
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
  value: string
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
  // Inset to match the rows it stands in for. Without it the placeholder sits
  // flush against the card edge and the table appears to shift when it loads.
  return (
    <div style={{ fontSize: 13, color: "var(--txt3)", padding: "20px 24px" }}>
      Loading…
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 13, color: "var(--txt3)", padding: "20px 24px" }}>
      {children}
    </div>
  )
}

function healthDot(health: HealthStatus): string {
  if (health === "FAIL") return "var(--neg)"
  if (health === "WARN") return "var(--warn)"

  return "var(--accent)"
}
