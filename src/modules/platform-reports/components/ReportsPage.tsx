"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"

import { usePlatformPermissions } from "@/lib/auth/platform-permissions"
import {
  useDeleteReport,
  useGenerateReport,
  useReportRuns,
  useReportSchedules,
  useReportTemplates,
  useRerunReport,
  useToggleSchedule,
} from "@/modules/platform-reports/hooks/use-platform-reports"
import { platformReportsService } from "@/modules/platform-reports/services/platform-reports.service"
import type {
  ReportFormat,
  ReportRun,
  ReportSchedule,
  ReportTemplate,
} from "@/modules/platform-reports/types"

const RUN_GRID =
  "minmax(0,1.8fr) minmax(0,1.1fr) 120px 110px 110px 64px 110px 170px"
const SCHED_GRID =
  "minmax(0,1.5fr) minmax(0,1.2fr) 130px minmax(0,1.3fr) 64px 100px 100px"

/**
 * Reports, lifted from the draft.
 *
 * HTML rather than PDF is deliberate and said out loud in the builder: there
 * is no PDF library on this deployment, and offering a format we cannot
 * produce is worse than not offering it.
 */
export function ReportsPage() {
  const { can } = usePlatformPermissions()
  const canManage = can("reports.manage")

  const { data: catalog } = useReportTemplates()
  const [status, setStatus] = useState("")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [builderOpen, setBuilderOpen] = useState(false)
  const [seedTemplate, setSeedTemplate] = useState<string | null>(null)

  const { data: runs, isLoading } = useReportRuns(status, page)
  const { data: schedules } = useReportSchedules()

  const rows = (runs?.data ?? []).filter((r) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()

    return (
      (r.title ?? "").toLowerCase().includes(q) ||
      r.template.toLowerCase().includes(q) ||
      r.reference.toLowerCase().includes(q)
    )
  })

  const readyCount = (runs?.data ?? []).filter(
    (r) => r.status === "READY"
  ).length
  const runningCount = (runs?.data ?? []).filter(
    (r) => r.status === "RUNNING"
  ).length
  const failedCount = (runs?.data ?? []).filter(
    (r) => r.status === "FAILED"
  ).length

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "-0.015em",
              color: "var(--txt)",
              margin: 0,
            }}
          >
            Reports
          </h1>
          <div style={{ fontSize: 12.5, color: "var(--txt3)", marginTop: 3 }}>
            Generated from live platform data · every generation and download is
            logged
          </div>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => setBuilderOpen((v) => !v)}
            style={{
              marginLeft: "auto",
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
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New report
          </button>
        )}
      </div>

      <div
        style={{
          background: "var(--card)",
          borderRadius: 20,
          padding: 4,
          boxShadow: "var(--shadow-card)",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
        }}
      >
        <Stat label="Ready" value={readyCount} note="downloadable" />
        <Stat
          label="Running"
          value={runningCount}
          note="in flight"
          tone={runningCount > 0 ? "warn" : undefined}
        />
        <Stat
          label="Failed"
          value={failedCount}
          note="reason on the row"
          tone={failedCount > 0 ? "neg" : undefined}
        />
        <Stat
          label="Scheduled"
          value={(schedules ?? []).filter((s) => s.isActive).length}
          note="recurring"
          last
        />
      </div>

      {catalog && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 14,
          }}
        >
          {catalog.templates.map((t) => (
            <TemplateCard
              key={t.key}
              template={t}
              canManage={canManage}
              onUse={() => {
                setSeedTemplate(t.key)
                setBuilderOpen(true)
              }}
            />
          ))}
        </div>
      )}

      {canManage && builderOpen && catalog && (
        <Builder
          templates={catalog.templates}
          formats={catalog.formats}
          seedTemplate={seedTemplate}
          onClose={() => setBuilderOpen(false)}
        />
      )}

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
            gap: 10,
            padding: "16px 24px 0",
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--txt)" }}>
            Generated reports
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--panel)",
              border: "1px solid var(--line-strong)",
              borderRadius: 10,
              padding: "7px 12px",
              width: 230,
              marginLeft: 8,
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--txt4)"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reports…"
              aria-label="Search reports"
              style={{
                flex: 1,
                minWidth: 0,
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: 12.5,
                color: "var(--txt)",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              background: "var(--panel)",
              borderRadius: 10,
              padding: 3,
            }}
          >
            {[
              ["", "All"],
              ["RUNNING", "Running"],
              ["READY", "Ready"],
              ["FAILED", "Failed"],
            ].map(([value, label]) => (
              <Segment
                key={value || "all"}
                label={label}
                active={status === value}
                onClick={() => {
                  setStatus(value)
                  setPage(1)
                }}
              />
            ))}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: RUN_GRID,
            columnGap: 14,
            padding: "14px 24px 10px",
            fontSize: 10.5,
            letterSpacing: ".09em",
            color: "var(--txt4)",
          }}
        >
          <div>REPORT</div>
          <div>SCOPE</div>
          <div>PERIOD</div>
          <div>REQUESTED BY</div>
          <div>WHEN</div>
          <div>FMT</div>
          <div>STATUS</div>
          <div />
        </div>

        {isLoading && (
          <div
            style={{
              padding: "26px 24px",
              borderTop: "1px solid var(--line2)",
              fontSize: 13,
              color: "var(--txt3)",
            }}
          >
            Loading…
          </div>
        )}

        {!isLoading && rows.length === 0 && (
          <div
            style={{
              padding: "26px 24px",
              borderTop: "1px solid var(--line2)",
              fontSize: 13,
              color: "var(--txt3)",
            }}
          >
            No reports match these filters.
          </div>
        )}

        {rows.map((run) => (
          <RunRow key={run.id} run={run} canManage={canManage} />
        ))}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 24px",
            borderTop: "1px solid var(--line2)",
            fontSize: 12.5,
            color: "var(--txt3)",
          }}
        >
          <div>
            {runs?.meta.total ?? 0} report
            {(runs?.meta.total ?? 0) === 1 ? "" : "s"} · kept until their
            retention date
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 12, color: "var(--txt4)" }}>
              Page {runs?.meta.currentPage ?? 1} of {runs?.meta.lastPage ?? 1}
            </div>
            <Pager
              label="Previous"
              disabled={(runs?.meta.currentPage ?? 1) <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            />
            <Pager
              label="Next"
              disabled={
                (runs?.meta.currentPage ?? 1) >= (runs?.meta.lastPage ?? 1)
              }
              onClick={() => setPage((p) => p + 1)}
            />
          </div>
        </div>
      </div>

      {schedules && schedules.length > 0 && (
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
              padding: "16px 24px 4px",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--txt)" }}>
              Scheduled reports
            </div>
            <div
              style={{ marginLeft: "auto", fontSize: 12, color: "var(--txt3)" }}
            >
              Recurring runs land in Generated reports and go to their
              recipients
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: SCHED_GRID,
              columnGap: 14,
              padding: "12px 24px 10px",
              fontSize: 10.5,
              letterSpacing: ".09em",
              color: "var(--txt4)",
            }}
          >
            <div>REPORT</div>
            <div>FREQUENCY</div>
            <div>NEXT RUN</div>
            <div>RECIPIENTS</div>
            <div>FMT</div>
            <div>STATUS</div>
            <div />
          </div>

          {schedules.map((s) => (
            <ScheduleRow key={s.id} schedule={s} canManage={canManage} />
          ))}
        </div>
      )}
    </div>
  )
}

// --- Template card ----------------------------------------------------------

function TemplateCard({
  template,
  canManage,
  onUse,
}: {
  template: ReportTemplate
  canManage: boolean
  onUse: () => void
}) {
  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 18,
        boxShadow: "var(--shadow-card)",
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--txt)" }}>
        {template.title}
      </div>
      <div
        style={{
          fontSize: 12.5,
          color: "var(--txt3)",
          lineHeight: 1.55,
          minHeight: 38,
        }}
      >
        {template.description}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 11.5,
          color: "var(--txt4)",
        }}
      >
        <div>
          {template.sections.length} section
          {template.sections.length === 1 ? "" : "s"}
        </div>
        {canManage && (
          <button
            type="button"
            onClick={onUse}
            style={{
              marginLeft: "auto",
              border: "1px solid var(--line-strong)",
              borderRadius: 9,
              background: "transparent",
              color: "var(--accent)",
              fontSize: 12,
              fontWeight: 500,
              padding: "6px 13px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Use template
          </button>
        )}
      </div>
    </div>
  )
}

// --- Builder ----------------------------------------------------------------

function Builder({
  templates,
  formats,
  seedTemplate,
  onClose,
}: {
  templates: ReportTemplate[]
  formats: ReportFormat[]
  seedTemplate: string | null
  onClose: () => void
}) {
  const generate = useGenerateReport()

  const [templateKey, setTemplateKey] = useState(
    seedTemplate ?? templates[0]?.key ?? ""
  )
  const [excluded, setExcluded] = useState<string[]>([])
  const [format, setFormat] = useState<ReportFormat>(formats[0] ?? "HTML")
  const [periodStart, setPeriodStart] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)

    return d.toISOString().slice(0, 10)
  })
  const [periodEnd, setPeriodEnd] = useState(() =>
    new Date().toISOString().slice(0, 10)
  )

  const template = useMemo(
    () => templates.find((t) => t.key === templateKey),
    [templates, templateKey]
  )

  const included = (template?.sections ?? []).filter(
    (s) => !excluded.includes(s)
  )

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 20,
        boxShadow: "var(--shadow-card)",
        padding: "20px 24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--txt)" }}>
          Build a report
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            marginLeft: "auto",
            fontSize: 12.5,
            color: "var(--txt3)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Close
        </button>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
        {templates.map((t) => (
          <Chip
            key={t.key}
            label={t.title}
            active={templateKey === t.key}
            onClick={() => {
              setTemplateKey(t.key)
              setExcluded([])
            }}
          />
        ))}
      </div>

      {template && (
        <div style={{ marginTop: 14 }}>
          <div
            style={{
              fontSize: 10.5,
              letterSpacing: ".09em",
              color: "var(--txt4)",
            }}
          >
            SECTIONS · {included.length} OF {template.sections.length} INCLUDED
          </div>
          <div
            style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}
          >
            {template.sections.map((s) => {
              const off = excluded.includes(s)

              return (
                <button
                  key={s}
                  type="button"
                  onClick={() =>
                    setExcluded((prev) =>
                      prev.includes(s)
                        ? prev.filter((x) => x !== s)
                        : [...prev, s]
                    )
                  }
                  style={{
                    padding: "6px 13px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 500,
                    border: `1px solid ${off ? "var(--line-strong)" : "var(--accent-brd)"}`,
                    background: off ? "transparent" : "var(--accent-soft)",
                    color: off ? "var(--txt4)" : "var(--accent)",
                    textDecoration: off ? "line-through" : "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginTop: 16,
        }}
      >
        <Field label="PERIOD START">
          <input
            type="date"
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
            style={fieldStyle}
          />
        </Field>
        <Field label="PERIOD END">
          <input
            type="date"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            style={fieldStyle}
          />
        </Field>
        <Field label="FORMAT">
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as ReportFormat)}
            style={fieldStyle}
          >
            {formats.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {format === "HTML" && (
        <p style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 8 }}>
          HTML opens anywhere and prints to PDF from the browser. There is no
          PDF library on this deployment, and offering a format we cannot
          produce would be worse than not offering it.
        </p>
      )}

      {/* The draft's live summary: what will happen, before it does. */}
      <p
        style={{
          fontSize: 12.5,
          color: "var(--txt2)",
          marginTop: 14,
          lineHeight: 1.6,
        }}
      >
        Generating <strong>{template?.title ?? "a report"}</strong> as {format},
        covering {periodStart} to {periodEnd}, with {included.length} of{" "}
        {template?.sections.length ?? 0} sections.
      </p>

      <div
        style={{
          marginTop: 12,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button
          type="button"
          onClick={() =>
            generate.mutate(
              {
                template: templateKey,
                sections: included,
                periodStart,
                periodEnd,
                format,
              },
              { onSuccess: onClose }
            )
          }
          disabled={!templateKey || included.length === 0 || generate.isPending}
          style={{
            background:
              included.length > 0 ? "var(--accent)" : "var(--line-strong)",
            color: included.length > 0 ? "#fff" : "var(--txt4)",
            fontSize: 13,
            fontWeight: 500,
            padding: "11px 18px",
            borderRadius: 11,
            border: "none",
            cursor: included.length > 0 ? "pointer" : "default",
            fontFamily: "inherit",
          }}
        >
          Generate
        </button>
        {included.length === 0 && (
          <span style={{ fontSize: 12, color: "var(--txt4)" }}>
            Include at least one section.
          </span>
        )}
      </div>
    </div>
  )
}

// --- Rows -------------------------------------------------------------------

function RunRow({ run, canManage }: { run: ReportRun; canManage: boolean }) {
  const rerun = useRerunReport()
  const remove = useDeleteReport()
  const [confirming, setConfirming] = useState(false)

  return (
    <div style={{ borderTop: "1px solid var(--line2)" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: RUN_GRID,
          columnGap: 14,
          alignItems: "center",
          padding: "12px 24px",
          fontSize: 13,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 500,
              color: "var(--txt)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {run.title ?? run.reference}
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: "var(--txt4)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {run.template}
          </div>
        </div>

        <div
          style={{
            color: "var(--txt2)",
            fontSize: 12.5,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {run.scope ?? "All institutions"}
        </div>

        <div
          style={{
            fontSize: 12,
            color: "var(--txt3)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {formatPeriod(run.periodStart, run.periodEnd)}
        </div>

        <div
          style={{ fontSize: 12.5, color: "var(--txt2)", whiteSpace: "nowrap" }}
        >
          {run.requestedBy ?? "—"}
        </div>

        <div
          style={{ fontSize: 12, color: "var(--txt3)", whiteSpace: "nowrap" }}
        >
          {run.finishedAt
            ? new Date(run.finishedAt).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
              })
            : "—"}
        </div>

        <div
          className="qhub-mono"
          style={{ fontSize: 11, color: "var(--txt3)" }}
        >
          {run.format}
        </div>

        <div>
          <span
            className="qhub-mono"
            style={{
              fontSize: 9.5,
              letterSpacing: ".05em",
              padding: "4px 8px",
              borderRadius: 7,
              ...statusTone(run.status),
            }}
          >
            {run.status}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
          {run.status === "READY" && (
            <Ghost
              tone="accent"
              onClick={() => {
                void platformReportsService.download(run).catch(() => {
                  toast.error("That file could not be downloaded.")
                })
              }}
            >
              Download
            </Ghost>
          )}

          {canManage && run.status !== "RUNNING" && (
            <Ghost
              onClick={() => rerun.mutate(run.id)}
              disabled={rerun.isPending}
            >
              Re-run
            </Ghost>
          )}

          {canManage &&
            (confirming ? (
              <>
                <Ghost
                  tone="danger"
                  onClick={() => remove.mutate(run.id)}
                  disabled={remove.isPending}
                >
                  Delete the file too
                </Ghost>
                <Ghost onClick={() => setConfirming(false)}>Cancel</Ghost>
              </>
            ) : (
              <Ghost tone="muted" onClick={() => setConfirming(true)}>
                Delete
              </Ghost>
            ))}
        </div>
      </div>

      {/* Inline, not a badge: a failure the reader cannot act on tells them
          nothing. */}
      {run.status === "FAILED" && run.failureReason && (
        <div
          style={{ padding: "0 24px 12px", fontSize: 12, color: "var(--neg)" }}
        >
          {run.failureReason}
        </div>
      )}
    </div>
  )
}

function ScheduleRow({
  schedule,
  canManage,
}: {
  schedule: ReportSchedule
  canManage: boolean
}) {
  const toggle = useToggleSchedule()

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: SCHED_GRID,
        columnGap: 14,
        alignItems: "center",
        padding: "12px 24px",
        fontSize: 13,
        borderTop: "1px solid var(--line2)",
      }}
    >
      <div style={{ fontWeight: 500, color: "var(--txt)" }}>
        {schedule.title ?? schedule.template}
      </div>
      <div style={{ fontSize: 12.5, color: "var(--txt2)" }}>
        {schedule.frequency}
      </div>
      <div style={{ fontSize: 12.5, color: "var(--txt2)" }}>
        {schedule.nextRunAt
          ? new Date(schedule.nextRunAt).toLocaleDateString()
          : "—"}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--txt3)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {schedule.recipients.length > 0
          ? schedule.recipients.join(", ")
          : "no recipients"}
      </div>
      <div className="qhub-mono" style={{ fontSize: 11, color: "var(--txt3)" }}>
        {schedule.format}
      </div>
      <div>
        <span
          className="qhub-mono"
          style={{
            fontSize: 9.5,
            letterSpacing: ".05em",
            padding: "4px 8px",
            borderRadius: 7,
            color: schedule.isActive ? "var(--accent)" : "var(--txt3)",
            background: schedule.isActive
              ? "var(--accent-soft)"
              : "var(--panel)",
          }}
        >
          {schedule.isActive ? "ACTIVE" : "PAUSED"}
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {canManage && (
          <Ghost
            onClick={() =>
              toggle.mutate({ id: schedule.id, isActive: !schedule.isActive })
            }
            disabled={toggle.isPending}
          >
            {schedule.isActive ? "Pause" : "Resume"}
          </Ghost>
        )}
      </div>
    </div>
  )
}

// --- Small pieces -----------------------------------------------------------

const fieldStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "var(--panel)",
  border: "1px solid var(--line-strong)",
  borderRadius: 10,
  padding: "9px 12px",
  fontSize: 13,
  color: "var(--txt)",
  outline: "none",
  fontFamily: "inherit",
}

/**
 * The period, short enough for its column.
 *
 * Full ISO dates overflow the 120px the draft gives this column and collide
 * with the one beside it. A range inside one month collapses to that month; a
 * range inside one year drops the repeated year.
 */
function formatPeriod(start: string | null, end: string | null): string {
  if (!start || !end) return "—"

  const from = new Date(start)
  const to = new Date(end)
  const month = (d: Date) => d.toLocaleDateString(undefined, { month: "short" })

  if (from.getFullYear() === to.getFullYear()) {
    if (from.getMonth() === to.getMonth()) {
      return `${from.getDate()}–${to.getDate()} ${month(to)}`
    }

    return `${from.getDate()} ${month(from)} – ${to.getDate()} ${month(to)}`
  }

  return `${month(from)} ${from.getFullYear()} – ${month(to)} ${to.getFullYear()}`
}

function statusTone(status: ReportRun["status"]) {
  if (status === "READY") {
    return { color: "var(--accent)", background: "var(--accent-soft)" }
  }
  if (status === "FAILED") {
    return { color: "var(--neg)", background: "var(--neg-bg)" }
  }

  return { color: "var(--warn)", background: "var(--warn-bg)" }
}

function Stat({
  label,
  value,
  note,
  tone,
  last,
}: {
  label: string
  value: number | string
  note: string
  tone?: "warn" | "neg"
  last?: boolean
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
          style={{
            fontSize: 23,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color:
              tone === "neg"
                ? "var(--neg)"
                : tone === "warn"
                  ? "var(--warn)"
                  : "var(--txt)",
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--txt4)" }}>
          {note}
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label style={{ display: "block" }}>
      <span
        style={{
          display: "block",
          fontSize: 10.5,
          letterSpacing: ".09em",
          color: "var(--txt4)",
          marginBottom: 6,
        }}
      >
        {label}
      </span>
      {children}
    </label>
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
        padding: "7px 14px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: active ? 600 : 500,
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

function Segment({
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
        fontSize: 12,
        fontWeight: active ? 600 : 500,
        color: active ? "var(--txt)" : "var(--txt3)",
        background: active ? "var(--card)" : "transparent",
        boxShadow: active ? "var(--shadow-sm)" : "none",
        padding: "6px 11px",
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        whiteSpace: "nowrap",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  )
}

function Ghost({
  children,
  onClick,
  disabled,
  tone,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  tone?: "accent" | "danger" | "muted"
}) {
  const color =
    tone === "accent"
      ? "var(--accent)"
      : tone === "danger"
        ? "var(--neg)"
        : tone === "muted"
          ? "var(--txt4)"
          : "var(--txt2)"

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        border: "1px solid var(--line-strong)",
        borderRadius: 8,
        background: "transparent",
        color,
        fontSize: 11.5,
        fontWeight: 500,
        padding: "5px 10px",
        cursor: disabled ? "default" : "pointer",
        whiteSpace: "nowrap",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  )
}

function Pager({
  label,
  disabled,
  onClick,
}: {
  label: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "6px 12px",
        borderRadius: 9,
        background: "var(--panel)",
        border: "none",
        color: disabled ? "var(--txt4)" : "var(--txt2)",
        fontSize: 12.5,
        cursor: disabled ? "default" : "pointer",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  )
}
