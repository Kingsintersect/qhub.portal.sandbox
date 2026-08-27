"use client"

import { OffboardingTracker } from "@/modules/institutions/drawer/OffboardingTracker"
import {
  useInstitutionActivity,
  useInstitutionObservability,
} from "@/modules/platform-observability/hooks/use-observability"
import type {
  HealthCheck,
  MetricPoint,
} from "@/modules/platform-observability/types"
import type { Institution } from "@/modules/institutions/types"

/**
 * The drawer's Overview, lifted from the draft.
 *
 * Offboarding tracker, the six-up stat strip, then a 2.1fr/1fr grid: charts
 * on the left, the standing state of the institution on the right. The
 * lifecycle controls are NOT here — they live in the drawer's footer bar,
 * where the draft puts them.
 */
export function OverviewTab({ institution }: { institution: Institution }) {
  const { data: detail } = useInstitutionObservability(institution.id)
  const { data: activity } = useInstitutionActivity(institution.id)

  const metrics = detail?.current
  const series = detail?.series ?? []

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <OffboardingTracker tenantId={institution.id} />

      <div
        style={{
          background: "var(--card)",
          borderRadius: 18,
          padding: 4,
          boxShadow: "var(--shadow-card)",
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
        }}
      >
        <Stat label="Students" value={metrics?.students ?? 0} />
        <Stat label="Lecturers" value={metrics?.lecturers ?? 0} />
        <Stat label="Programmes" value={metrics?.programs ?? 0} />
        <Stat label="Courses" value={metrics?.courses ?? 0} />
        <Stat label="Staff" value={metrics?.staff ?? 0} />
        <Stat label="Users" value={metrics?.users ?? 0} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,2.1fr) minmax(0,1fr)",
          gap: 16,
          alignItems: "start",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            minWidth: 0,
          }}
        >
          <HealthAndUsage series={series} />
          <LearnerGrowth series={series} />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            minWidth: 0,
          }}
        >
          <OpenIssues checks={detail?.checks ?? []} />
          <Integrations checks={detail?.checks ?? []} />
          <RecentActivity
            entries={(activity ?? []).slice(0, 6).map((a) => ({
              id: a.id,
              what: `${a.action}${a.actor ? ` · ${a.actor}` : ""}`,
              when: relative(a.createdAt),
            }))}
          />
        </div>
      </div>
    </div>
  )
}

/* ── left column ─────────────────────────────────────────────────────── */

/**
 * Health, sign-ins and activity over the captured window.
 *
 * The draft's third series is "Video minutes". QHub has no video subsystem to
 * measure, and bundle 13's rule is that only measured figures are shown — the
 * same call it made turning "API p95" into "Failed jobs · 24h". So the series
 * is activity events, which is real.
 */
function HealthAndUsage({ series }: { series: MetricPoint[] }) {
  const health = series.map((p) => p.healthScore ?? 0)
  const logins = series.map((p) => p.logins24h)
  const events = series.map((p) => p.activity24h)

  const healthNow = health.length > 0 ? health[health.length - 1] : null
  const healthDelta = delta(health)

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 18,
        padding: "20px 22px 10px",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 15.5, fontWeight: 600 }}>
          Health &amp; usage — 30 days
        </div>
        <div style={{ color: "var(--dots)", fontSize: 17, letterSpacing: 1 }}>
          ···
        </div>
        <div
          style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--txt4)" }}
        >
          vs fleet median
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 20,
          margin: "12px 0 2px",
          flexWrap: "wrap",
        }}
      >
        <Legend
          color="var(--accent)"
          label="Health"
          value={healthNow === null ? "—" : `${healthNow}%`}
          delta={healthDelta === null ? "" : `${signed(healthDelta)}%`}
          deltaColor={
            healthDelta !== null && healthDelta < 0
              ? "var(--neg)"
              : "var(--accent)"
          }
        />
        <Legend
          color="var(--series2)"
          label="Sign-ins"
          value={compact(sum(logins))}
          delta={pct(delta(logins))}
          deltaColor="var(--accent)"
        />
        <Legend
          color="var(--series3)"
          label="Activity events"
          value={compact(sum(events))}
          delta={pct(delta(events))}
          deltaColor="var(--accent)"
        />
      </div>

      <svg
        viewBox="0 0 1000 230"
        preserveAspectRatio="none"
        style={{
          width: "100%",
          height: 172,
          display: "block",
          overflow: "visible",
          marginTop: 6,
        }}
        aria-hidden="true"
      >
        <line
          style={{ stroke: "var(--grid-line)" }}
          x1="0"
          y1="115"
          x2="1000"
          y2="115"
          strokeWidth="1"
        />
        <line
          style={{ stroke: "var(--grid-line2)" }}
          x1="333"
          y1="0"
          x2="333"
          y2="230"
          strokeWidth="1"
        />
        <line
          style={{ stroke: "var(--grid-line2)" }}
          x1="666"
          y1="0"
          x2="666"
          y2="230"
          strokeWidth="1"
        />
        {/* Health 80% — below this the institution is in warning territory. */}
        <path
          style={{ stroke: "var(--warn)" }}
          d="M0 60 L1000 60"
          strokeWidth="1"
          strokeDasharray="4 5"
          fill="none"
        />
        <path
          style={{ stroke: "var(--series3)" }}
          d={line(events, 230)}
          fill="none"
          strokeWidth="1.6"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
        <path
          style={{ stroke: "var(--series2)" }}
          d={line(logins, 230)}
          fill="none"
          strokeWidth="1.8"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
        <path
          style={{ stroke: "var(--accent)" }}
          d={fixedScale(health, 230, 100)}
          fill="none"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      </svg>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          letterSpacing: ".08em",
          color: "var(--txt4)",
          padding: "6px 2px 10px",
        }}
      >
        {axis(series).map((label, i) => (
          <span key={`${label}-${i}`}>{label}</span>
        ))}
      </div>
    </div>
  )
}

function LearnerGrowth({ series }: { series: MetricPoint[] }) {
  const students = series.map((p) => p.students)
  const now = students.length > 0 ? students[students.length - 1] : 0

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 18,
        padding: "18px 22px 12px",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 14.5, fontWeight: 600 }}>
          Learner growth since onboarding
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
          <span className="qhub-mono" style={{ fontSize: 17, fontWeight: 600 }}>
            {now.toLocaleString()}
          </span>
          <span style={{ fontSize: 11.5, color: "var(--txt3)" }}>
            cumulative
          </span>
        </div>
      </div>

      <svg
        viewBox="0 0 1000 120"
        preserveAspectRatio="none"
        style={{
          width: "100%",
          height: 92,
          display: "block",
          overflow: "visible",
          marginTop: 12,
        }}
        aria-hidden="true"
      >
        <line
          style={{ stroke: "var(--grid-line)" }}
          x1="0"
          y1="60"
          x2="1000"
          y2="60"
          strokeWidth="1"
        />
        <path
          style={{ fill: "var(--accent-soft)" }}
          d={area(students, 120)}
          stroke="none"
        />
        <path
          style={{ stroke: "var(--accent)" }}
          d={line(students, 120)}
          fill="none"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {students.length > 1 && (
          <circle
            cx="1000"
            cy={endY(students, 120)}
            r="4.5"
            style={{ stroke: "var(--accent)", fill: "var(--marker-fill)" }}
            strokeWidth="2.4"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      <div
        style={{
          display: "flex",
          gap: 7,
          marginTop: 8,
          paddingBottom: 6,
        }}
      >
        {months(series).map((m, i) => (
          <div
            key={`${m}-${i}`}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 10,
              color: "var(--txt4)",
            }}
          >
            {m}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── right column ────────────────────────────────────────────────────── */

function OpenIssues({ checks }: { checks: HealthCheck[] }) {
  const issues = checks.filter((c) => c.status !== "OK")

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 18,
        padding: "18px 20px",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 10 }}>
        Open issues
      </div>

      {issues.length === 0 && (
        <div
          style={{
            fontSize: 12.5,
            color: "var(--txt3)",
            paddingTop: 9,
            borderTop: "1px solid var(--line2)",
          }}
        >
          Every check passing as of the last capture.
        </div>
      )}

      {issues.map((issue) => (
        <div
          key={issue.key}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "9px 0",
            borderTop: "1px solid var(--line2)",
            fontSize: 13,
          }}
        >
          <span
            className="qhub-mono"
            style={{
              fontSize: 10,
              letterSpacing: ".05em",
              padding: "3px 7px",
              borderRadius: 6,
              color: issue.status === "FAIL" ? "var(--neg)" : "var(--warn)",
              background:
                issue.status === "FAIL" ? "var(--neg-bg)" : "var(--warn-bg)",
              whiteSpace: "nowrap",
              marginTop: 1,
            }}
          >
            {issue.status === "FAIL" ? "CRITICAL" : "WARN"}
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 500, lineHeight: 1.4 }}>
              {issue.summary ?? issue.key}
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: "var(--txt3)",
                marginTop: 2,
              }}
            >
              {issue.key}
              {issue.failingSince
                ? ` · failing since ${relative(issue.failingSince)}`
                : ""}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * The institution's integrations.
 *
 * The draft names SIS sync, SSO/SAML, Webhooks and Video CDN. QHub's actual
 * integration checks are the ones the collector runs, so those are what this
 * reads — an integration row invented to fill a slot would report a health it
 * never measured.
 */
function Integrations({ checks }: { checks: HealthCheck[] }) {
  const rows: Array<{ label: string; key: string }> = [
    { label: "Moodle / LMS bridge", key: "moodle" },
    { label: "Payment gateway", key: "payments" },
    { label: "Database", key: "database" },
    { label: "Migrations", key: "migrations" },
  ]

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 18,
        padding: "18px 20px",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 10 }}>
        Integrations
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "9px 0",
          fontSize: 13,
        }}
      >
        {rows.map((row) => {
          const check = checks.find((c) => c.key === row.key)
          const status = check?.status ?? null

          return (
            <Row
              key={row.key}
              label={row.label}
              value={
                status === "OK"
                  ? "Healthy"
                  : status === "WARN"
                    ? "Degraded"
                    : status === "FAIL"
                      ? "Failing"
                      : "Not measured"
              }
              color={
                status === "OK"
                  ? "var(--accent)"
                  : status === "WARN"
                    ? "var(--warn)"
                    : status === "FAIL"
                      ? "var(--neg)"
                      : "var(--txt4)"
              }
            />
          )
        })}
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: string
}) {
  return (
    <>
      <div style={{ color: "var(--txt2)" }}>{label}</div>
      <div style={{ fontWeight: 500, color }}>{value}</div>
    </>
  )
}

function RecentActivity({
  entries,
}: {
  entries: Array<{ id: number; what: string; when: string }>
}) {
  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 18,
        padding: "18px 20px",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 10 }}>
        Recent activity
      </div>

      {entries.length === 0 && (
        <div
          style={{
            fontSize: 12.5,
            color: "var(--txt3)",
            paddingTop: 8,
            borderTop: "1px solid var(--line2)",
          }}
        >
          Nothing in this institution&rsquo;s audit log yet.
        </div>
      )}

      {entries.map((a) => (
        <div
          key={a.id}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "8px 0",
            borderTop: "1px solid var(--line2)",
            fontSize: 12.5,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              background: "var(--accent)",
              flex: "0 0 7px",
              marginTop: 5,
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ lineHeight: 1.4, color: "var(--txt)" }}>{a.what}</div>
            <div style={{ fontSize: 11, color: "var(--txt3)", marginTop: 1 }}>
              {a.when}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── pieces ──────────────────────────────────────────────────────────── */

function Legend({
  color,
  label,
  value,
  delta,
  deltaColor,
}: {
  color: string
  label: string
  value: string
  delta: string
  deltaColor: string
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 12.5,
        color: "var(--txt2)",
      }}
    >
      <span
        style={{
          width: 11,
          height: 11,
          borderRadius: 999,
          border: `3.5px solid ${color}`,
          background: "var(--marker-fill)",
          boxSizing: "border-box",
        }}
      />
      {label}
      <b style={{ fontWeight: 600, color: "var(--txt)" }}>{value}</b>
      <span style={{ fontSize: 11.5, color: deltaColor, fontWeight: 500 }}>
        {delta}
      </span>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        padding: "16px 18px",
        borderRight: "1px solid var(--line)",
      }}
    >
      <div style={{ fontSize: 12.5, color: "var(--txt3)", marginBottom: 6 }}>
        {label}
      </div>
      <div
        className="qhub-mono"
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 7,
          whiteSpace: "nowrap",
          fontSize: 21,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: "var(--txt)",
        }}
      >
        {value.toLocaleString()}
      </div>
    </div>
  )
}

/* ── maths ───────────────────────────────────────────────────────────── */

/** A path scaled to the series' own range, so flat data still reads as flat. */
function line(values: number[], height: number): string {
  if (values.length < 2) return ""

  const top = Math.max(...values)
  const bottom = Math.min(...values)
  const span = top - bottom || 1

  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 1000
      const y = height - 12 - ((v - bottom) / span) * (height - 30)

      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(" ")
}

/** A path on a fixed 0–max scale, so the dashed threshold line means something. */
function fixedScale(values: number[], height: number, max: number): string {
  if (values.length < 2) return ""

  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 1000
      const y = height - (Math.min(v, max) / max) * height

      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(" ")
}

function area(values: number[], height: number): string {
  const path = line(values, height)

  return path === "" ? "" : `${path} L1000 ${height} L0 ${height} Z`
}

function endY(values: number[], height: number): number {
  const top = Math.max(...values)
  const bottom = Math.min(...values)
  const span = top - bottom || 1
  const last = values[values.length - 1]

  return height - 12 - ((last - bottom) / span) * (height - 30)
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0)
}

/** Last value against first, as a percentage. Null when there is no window. */
function delta(values: number[]): number | null {
  if (values.length < 2) return null

  const first = values[0]
  const last = values[values.length - 1]

  if (first === 0) return null

  return Math.round(((last - first) / first) * 100)
}

function pct(value: number | null): string {
  return value === null ? "" : `${signed(value)}%`
}

function signed(value: number): string {
  return value > 0 ? `+${value}` : `${value}`
}

function compact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`

  return value.toLocaleString()
}

/** Four evenly-spaced dates across the captured window. */
function axis(series: MetricPoint[]): string[] {
  if (series.length === 0) return ["", "", "", ""]

  return [0, 1, 2, 3].map((i) => {
    const point = series[Math.round((i / 3) * (series.length - 1))]

    if (!point?.capturedAt) return ""

    return new Date(point.capturedAt)
      .toLocaleDateString("en-GB", { month: "short", day: "numeric" })
      .toUpperCase()
  })
}

/** One label per distinct month in the window. */
function months(series: MetricPoint[]): string[] {
  const seen: string[] = []

  for (const point of series) {
    if (!point.capturedAt) continue

    const label = new Date(point.capturedAt).toLocaleDateString("en-GB", {
      month: "short",
    })

    if (seen[seen.length - 1] !== label) seen.push(label)
  }

  return seen
}

function relative(iso: string | null): string {
  if (iso === null) return "—"

  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}
