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
  ReportTemplate,
} from "@/modules/platform-reports/types"

/**
 * Six templates, a builder, what has been generated, and what runs on a
 * schedule.
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
  const [page, setPage] = useState(1)

  const { data: runs, isLoading } = useReportRuns(status, page)
  const { data: schedules } = useReportSchedules()

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
        Reports
      </h1>
      <p style={{ fontSize: 13, color: "var(--txt3)", marginTop: 5 }}>
        Every generation, download and preview is written to the audit log.
      </p>

      {canManage && catalog && (
        <Builder templates={catalog.templates} formats={catalog.formats} />
      )}

      <section style={{ marginTop: 30 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <h2
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--txt)",
              margin: 0,
            }}
          >
            Generated reports
          </h2>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              ["", "All"],
              ["RUNNING", "Running"],
              ["READY", "Ready"],
              ["FAILED", "Failed"],
            ].map(([value, label]) => (
              <Chip
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

        <div style={{ marginTop: 12 }}>
          {isLoading && (
            <div style={{ fontSize: 13, color: "var(--txt3)" }}>Loading…</div>
          )}

          {!isLoading && (runs?.data.length ?? 0) === 0 && (
            <div
              style={{ fontSize: 13, color: "var(--txt3)", padding: "20px 0" }}
            >
              No reports match these filters.
            </div>
          )}

          {runs?.data.map((run) => (
            <RunRow key={run.id} run={run} canManage={canManage} />
          ))}
        </div>

        {runs && runs.meta.lastPage > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 14,
            }}
          >
            <span style={{ fontSize: 12, color: "var(--txt3)" }}>
              Page {runs.meta.currentPage} of {runs.meta.lastPage}
            </span>
            <span style={{ display: "flex", gap: 8 }}>
              <Chip
                label="Previous"
                active={false}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              />
              <Chip
                label="Next"
                active={false}
                onClick={() =>
                  setPage((p) => Math.min(runs.meta.lastPage, p + 1))
                }
              />
            </span>
          </div>
        )}
      </section>

      {schedules && schedules.length > 0 && (
        <section style={{ marginTop: 30 }}>
          <h2
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--txt)",
              margin: 0,
            }}
          >
            Scheduled reports
          </h2>
          <div style={{ marginTop: 12 }}>
            {schedules.map((s) => (
              <ScheduleRow key={s.id} schedule={s} canManage={canManage} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// --- Builder ----------------------------------------------------------------

function Builder({
  templates,
  formats,
}: {
  templates: ReportTemplate[]
  formats: ReportFormat[]
}) {
  const generate = useGenerateReport()

  const [templateKey, setTemplateKey] = useState(templates[0]?.key ?? "")
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

  const toggleSection = (section: string) =>
    setExcluded((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    )

  return (
    <section
      style={{
        background: "var(--card)",
        boxShadow: "var(--shadow-card)",
        padding: "20px 22px",
        marginTop: 22,
      }}
    >
      <h2
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "var(--txt)",
          margin: 0,
        }}
      >
        Build a report
      </h2>

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
        <>
          <p style={{ fontSize: 12.5, color: "var(--txt3)", marginTop: 10 }}>
            {template.description}
          </p>

          <div style={{ marginTop: 14 }}>
            <div
              style={{
                fontSize: 10.5,
                letterSpacing: ".07em",
                color: "var(--txt4)",
              }}
            >
              SECTIONS · {included.length} OF {template.sections.length}{" "}
              INCLUDED
            </div>
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginTop: 8,
              }}
            >
              {template.sections.map((s) => {
                const off = excluded.includes(s)
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSection(s)}
                    style={{
                      padding: "6px 11px",
                      fontSize: 12,
                      border: "1px solid var(--line-strong)",
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
        </>
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

      {/* The design's live summary sentence: what will happen, before it does. */}
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

      <div style={{ marginTop: 12 }}>
        <Primary
          onClick={() =>
            generate.mutate({
              template: templateKey,
              sections: included,
              periodStart,
              periodEnd,
              format,
            })
          }
          disabled={!templateKey || included.length === 0 || generate.isPending}
        >
          Generate
        </Primary>
        {included.length === 0 && (
          <span style={{ fontSize: 12, color: "var(--txt4)", marginLeft: 10 }}>
            Include at least one section.
          </span>
        )}
      </div>
    </section>
  )
}

// --- Rows -------------------------------------------------------------------

function RunRow({ run, canManage }: { run: ReportRun; canManage: boolean }) {
  const rerun = useRerunReport()
  const remove = useDeleteReport()
  const [confirming, setConfirming] = useState(false)

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
          <span
            className="qhub-mono"
            style={{ fontSize: 11, color: "var(--txt4)" }}
          >
            {run.reference}
          </span>
          <StatusPill status={run.status} />
          <span
            className="qhub-mono"
            style={{ fontSize: 10.5, color: "var(--txt4)" }}
          >
            {run.format}
          </span>
        </div>

        <div style={{ fontSize: 13, color: "var(--txt)", marginTop: 4 }}>
          {run.title ?? run.template}
        </div>

        <div
          className="qhub-mono"
          style={{ fontSize: 11, color: "var(--txt4)", marginTop: 3 }}
        >
          {run.periodStart} → {run.periodEnd}
          {run.requestedBy ? ` · ${run.requestedBy}` : ""}
        </div>

        {/* Inline, not a badge: a failure nobody can act on is just red. */}
        {run.status === "FAILED" && run.failureReason && (
          <div
            style={{
              fontSize: 12,
              color: "var(--neg)",
              background: "var(--neg-bg)",
              padding: "8px 11px",
              marginTop: 8,
              lineHeight: 1.5,
            }}
          >
            {run.failureReason}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          whiteSpace: "nowrap",
        }}
      >
        {run.status === "READY" && (
          <LinkButton
            onClick={() => {
              void platformReportsService.download(run).catch(() => {
                toast.error("That file could not be downloaded.")
              })
            }}
          >
            Download
          </LinkButton>
        )}

        {canManage && (
          <>
            <LinkButton
              onClick={() => rerun.mutate(run.id)}
              disabled={rerun.isPending}
            >
              Re-run
            </LinkButton>

            {!confirming ? (
              <LinkButton tone="danger" onClick={() => setConfirming(true)}>
                Delete
              </LinkButton>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11.5, color: "var(--txt3)" }}>
                  Delete the file too?
                </span>
                <LinkButton
                  tone="danger"
                  onClick={() => remove.mutate(run.id)}
                  disabled={remove.isPending}
                >
                  Yes, delete
                </LinkButton>
                <LinkButton onClick={() => setConfirming(false)}>
                  Cancel
                </LinkButton>
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ScheduleRow({
  schedule,
  canManage,
}: {
  schedule: {
    id: number
    template: string
    title: string | null
    frequency: string
    format: string
    recipients: string[]
    isActive: boolean
    nextRunAt: string | null
  }
  canManage: boolean
}) {
  const toggle = useToggleSchedule()

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        padding: "11px 0",
        borderBottom: "1px solid var(--line2)",
      }}
    >
      <div>
        <div style={{ fontSize: 13, color: "var(--txt)" }}>
          {schedule.title ?? schedule.template}
        </div>
        <div
          className="qhub-mono"
          style={{ fontSize: 11, color: "var(--txt4)", marginTop: 3 }}
        >
          {schedule.frequency} · {schedule.format}
          {schedule.nextRunAt
            ? ` · next ${new Date(schedule.nextRunAt).toLocaleDateString()}`
            : ""}
          {schedule.recipients.length > 0
            ? ` · ${schedule.recipients.length} recipient${schedule.recipients.length === 1 ? "" : "s"}`
            : ""}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          className="qhub-mono"
          style={{
            fontSize: 9.5,
            letterSpacing: ".06em",
            color: schedule.isActive ? "var(--accent)" : "var(--txt3)",
            background: schedule.isActive
              ? "var(--accent-soft)"
              : "var(--panel)",
            padding: "3px 6px",
          }}
        >
          {schedule.isActive ? "ACTIVE" : "PAUSED"}
        </span>

        {canManage && (
          <LinkButton
            onClick={() =>
              toggle.mutate({ id: schedule.id, isActive: !schedule.isActive })
            }
            disabled={toggle.isPending}
          >
            {schedule.isActive ? "Pause" : "Resume"}
          </LinkButton>
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
  padding: "9px 11px",
  fontSize: 13,
  color: "var(--txt)",
  outline: "none",
  fontFamily: "inherit",
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
          letterSpacing: ".07em",
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

function StatusPill({ status }: { status: ReportRun["status"] }) {
  const tone =
    status === "READY"
      ? { c: "var(--accent)", bg: "var(--accent-soft)" }
      : status === "FAILED"
        ? { c: "var(--neg)", bg: "var(--neg-bg)" }
        : { c: "var(--warn)", bg: "var(--warn-bg)" }

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
      {status}
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

function LinkButton({
  children,
  onClick,
  disabled,
  tone,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  tone?: "danger"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        fontSize: 12,
        color: tone === "danger" ? "var(--neg)" : "var(--accent)",
        background: "none",
        border: "none",
        padding: 0,
        cursor: disabled ? "default" : "pointer",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  )
}

function Primary({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "var(--line-strong)" : "var(--accent)",
        color: disabled ? "var(--txt4)" : "#fff",
        fontSize: 13,
        fontWeight: 500,
        padding: "10px 18px",
        border: "none",
        cursor: disabled ? "default" : "pointer",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  )
}
