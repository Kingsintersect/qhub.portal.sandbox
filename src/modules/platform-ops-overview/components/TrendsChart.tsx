"use client"

import { Fragment, useMemo, useState } from "react"

import type { TrendPoint } from "@/modules/platform-observability/types"

type SeriesKey = "activity" | "logins" | "errorRate"

const SERIES: Array<{
  key: SeriesKey
  label: string
  /*
   * The draft labels the legend and the crosshair card differently: the
   * legend reads "Active Learners" and "Error Rate", the card reads
   * "Learners" and "Errors". The card is a floating box a few characters
   * wide over the plot, and the long forms push it over the lines it is
   * describing.
   */
  short: string
  stroke: string
  width: number
}> = [
  {
    key: "activity",
    label: "Traffic",
    short: "Traffic",
    stroke: "var(--accent)",
    width: 1.9,
  },
  {
    key: "logins",
    label: "Active Learners",
    short: "Learners",
    stroke: "var(--series2)",
    width: 1.8,
  },
  {
    key: "errorRate",
    label: "Error Rate",
    short: "Errors",
    stroke: "var(--series3)",
    width: 1.6,
  },
]

/*
 * The draft's ranges, with its labels and its default.
 *
 * Shipped as 7d/30d/90d/1y, which is the same idea written differently — but
 * the console is read beside the draft and a label that does not match is a
 * question every time somebody checks one against the other.
 */
const RANGES = [
  { days: 7, label: "7D" },
  { days: 30, label: "1M" },
  { days: 90, label: "3M" },
  { days: 365, label: "1Y" },
] as const

/**
 * The estate's shape over time.
 *
 * Drawn as a plain SVG rather than pulled through a charting library: three
 * lines on a shared axis is a polyline, and the draft's exact stroke weights,
 * grid lines and marker treatment are easier to honour directly than to
 * argue a library into.
 *
 * Each series is scaled to its OWN maximum. Learner counts are orders of
 * magnitude larger than sign-ins, so a shared scale would flatten two of the
 * three lines into the axis and hide exactly what the chart is for.
 */
export function TrendsChart({
  points,
  days,
  onDaysChange,
  isLoading,
}: {
  points: TrendPoint[]
  days: number
  onDaysChange: (days: number) => void
  isLoading: boolean
}) {
  const [hidden, setHidden] = useState<SeriesKey[]>([])
  const [hover, setHover] = useState<number | null>(null)

  /**
   * Each series as percent change from its own first point.
   *
   * The draft's axis is labelled 10% … −10%, so this chart is about MOVEMENT,
   * not absolute counts — which is also the only way three series of wildly
   * different magnitude can share one axis honestly.
   */
  const chart = useMemo(() => {
    if (points.length < 2) return null

    const width = 1000
    const height = 212

    const pct = (key: SeriesKey) => {
      /*
       * A day that served nothing has no error rate, and the API sends null
       * rather than a zero for it. Read as 0 here because this axis is
       * movement and a gap cannot be plotted — but that is a display choice,
       * not a claim that no traffic means no errors.
       */
      const at = (p: TrendPoint) => p[key] ?? 0

      const base = at(points[0]) || 1

      return points.map((p) => ((at(p) - base) / base) * 100)
    }

    const series = SERIES.map((s) => ({ ...s, values: pct(s.key) }))

    // One shared scale across all three, so the lines are comparable.
    const spread = Math.max(
      10,
      ...series.flatMap((s) => s.values.map((v) => Math.abs(v)))
    )

    const x = (i: number) => (i / (points.length - 1)) * width
    const y = (v: number) => height / 2 - (v / spread) * (height / 2 - 10)

    return {
      spread,
      x,
      y,
      series: series.map((s) => ({
        ...s,
        d: s.values
          .map(
            (v, i) =>
              `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`
          )
          .join(" "),
      })),
    }
  }, [points])

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 20,
        padding: "22px 24px 12px",
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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              fontSize: 17,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: "var(--txt)",
            }}
          >
            Trends
          </div>
          <div style={{ color: "var(--dots)", fontSize: 17, letterSpacing: 1 }}>
            ···
          </div>
          {isLoading && (
            <div style={{ fontSize: 11.5, color: "var(--txt4)" }}>
              updating…
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: 4,
            background: "var(--panel)",
            borderRadius: 999,
            padding: 3,
          }}
        >
          {RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              onClick={() => onDaysChange(r.days)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: 12.5,
                fontWeight: 500,
                cursor: "pointer",
                border: "none",
                color: days === r.days ? "var(--txt)" : "var(--txt3)",
                background: days === r.days ? "var(--card)" : "transparent",
                boxShadow: days === r.days ? "var(--shadow-sm)" : "none",
                fontFamily: "inherit",
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 22,
          margin: "14px 0 6px",
          flexWrap: "wrap",
        }}
      >
        {SERIES.map((s) => {
          const off = hidden.includes(s.key)

          return (
            <button
              key={s.key}
              type="button"
              onClick={() =>
                setHidden((prev) =>
                  prev.includes(s.key)
                    ? prev.filter((k) => k !== s.key)
                    : [...prev, s.key]
                )
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: off ? "var(--txt4)" : "var(--txt2)",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  border: `3.5px solid ${off ? "var(--line-strong)" : s.stroke}`,
                  background: "var(--marker-fill)",
                  boxSizing: "border-box",
                }}
              />
              {s.label}
              {chart && !off && (
                <span
                  className="qhub-mono"
                  style={{
                    fontSize: 11.5,
                    color:
                      seriesLatest(chart, s.key) < 0
                        ? "var(--neg)"
                        : "var(--txt4)",
                  }}
                >
                  {seriesLatest(chart, s.key) >= 0 ? "+" : "−"}
                  {Math.abs(seriesLatest(chart, s.key)).toFixed(1)}%
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* 52px reserved on the right for the axis, as the draft does. */}
      <div style={{ position: "relative", paddingRight: 52 }}>
        {!chart ? (
          <div
            style={{
              height: 232,
              display: "grid",
              placeItems: "center",
              fontSize: 13,
              color: "var(--txt3)",
              textAlign: "center",
              padding: "0 20px",
            }}
          >
            {isLoading
              ? "Loading…"
              : points.length === 1
                ? "Only one capture so far — a trend needs at least two."
                : "Nothing collected yet. The metrics collector runs every fifteen minutes — if this stays empty, check that the scheduler is running."}
          </div>
        ) : (
          <>
            <svg
              viewBox="0 0 1000 230"
              preserveAspectRatio="none"
              style={{
                width: "100%",
                height: 232,
                display: "block",
                overflow: "visible",
              }}
              role="img"
              aria-label={`Estate trends over the last ${days} days`}
              onMouseLeave={() => setHover(null)}
              onMouseMove={(e) => {
                const box = e.currentTarget.getBoundingClientRect()
                const ratio = (e.clientX - box.left) / box.width
                const i = Math.round(ratio * (points.length - 1))

                setHover(Math.max(0, Math.min(points.length - 1, i)))
              }}
            >
              <line
                style={{ stroke: "var(--grid-line)" }}
                x1="0"
                y1="106"
                x2="1000"
                y2="106"
                strokeWidth="1"
              />
              {[150, 480, 810].map((x) => (
                <line
                  key={x}
                  style={{ stroke: "var(--grid-line2)" }}
                  x1={x}
                  y1="0"
                  x2={x}
                  y2="212"
                  strokeWidth="1"
                />
              ))}

              {/* Back to front, so the accent series sits on top. */}
              {[...chart.series]
                .reverse()
                .map((s) =>
                  hidden.includes(s.key) ? null : (
                    <path
                      key={s.key}
                      style={{ stroke: s.stroke }}
                      d={s.d}
                      fill="none"
                      strokeWidth={s.width}
                      vectorEffect="non-scaling-stroke"
                      strokeLinejoin="round"
                    />
                  )
                )}

              {/* The draft's crosshair and markers. */}
              {hover !== null && (
                <>
                  <line
                    style={{ stroke: "var(--crosshair)" }}
                    x1={chart.x(hover)}
                    y1="0"
                    x2={chart.x(hover)}
                    y2="212"
                    strokeWidth="1"
                    strokeDasharray="3 4"
                  />
                  {chart.series.map((s) =>
                    hidden.includes(s.key) ? null : (
                      <circle
                        key={s.key}
                        cx={chart.x(hover)}
                        cy={chart.y(s.values[hover])}
                        r="5"
                        style={{ stroke: s.stroke, fill: "var(--marker-fill)" }}
                        strokeWidth="2.4"
                        vectorEffect="non-scaling-stroke"
                      />
                    )
                  )}
                </>
              )}
            </svg>

            {/* The readout card. Follows the crosshair, flipping side near the
                right edge so it never leaves the chart. */}
            {hover !== null && (
              <div
                style={{
                  position: "absolute",
                  top: 2,
                  left: `${(hover / (points.length - 1)) * 100}%`,
                  transform:
                    hover / (points.length - 1) > 0.62
                      ? "translateX(calc(-100% - 14px))"
                      : "translateX(14px)",
                  background: "var(--card)",
                  borderRadius: 12,
                  padding: "10px 12px",
                  boxShadow: "var(--shadow-pop)",
                  fontSize: 12,
                  display: "grid",
                  gridTemplateColumns: "auto auto",
                  gap: "6px 18px",
                  alignItems: "center",
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {chart.series.map((s) =>
                  hidden.includes(s.key) ? null : (
                    <Fragment key={s.key}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          color: "var(--txt2)",
                        }}
                      >
                        <span
                          style={{
                            width: 3,
                            height: 12,
                            borderRadius: 2,
                            background: s.stroke,
                          }}
                        />
                        {s.short}
                      </div>
                      <div
                        className="qhub-mono"
                        style={{
                          textAlign: "right",
                          fontWeight: 500,
                          color:
                            s.values[hover] < 0 ? "var(--neg)" : "var(--txt)",
                        }}
                      >
                        {s.values[hover] >= 0 ? "+" : "−"}
                        {Math.abs(s.values[hover]).toFixed(1)}%
                      </div>
                    </Fragment>
                  )
                )}
              </div>
            )}

            {/* Date pill under the crosshair. */}
            {hover !== null && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: `${(hover / (points.length - 1)) * 100}%`,
                  transform: "translateX(-50%)",
                  background: "var(--accent)",
                  color: "#fff",
                  fontSize: 11.5,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 999,
                  pointerEvents: "none",
                }}
              >
                {new Date(points[hover].day).getDate()}
              </div>
            )}

            {/* Month labels along the bottom. */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 52,
                bottom: 6,
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                letterSpacing: ".08em",
                color: "var(--txt4)",
              }}
            >
              <span>{monthLabel(points[0]?.day)}</span>
              <span>
                {monthLabel(points[Math.floor(points.length / 2)]?.day)}
              </span>
              <span>{monthLabel(points.at(-1)?.day)}</span>
            </div>

            {/* The percent axis, as the draft has it. */}
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                height: 212,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                fontSize: 11,
                color: "var(--txt4)",
                textAlign: "right",
                width: 44,
              }}
            >
              {[1, 0.5, 0, -0.5, -1].map((f) => (
                <span key={f}>
                  {f > 0 ? "" : f < 0 ? "−" : ""}
                  {Math.abs(chart.spread * f).toFixed(0)}%
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={{ height: 12 }} />
    </div>
  )
}

/** The most recent percent change for one series. */
function seriesLatest(
  chart: { series: Array<{ key: SeriesKey; values: number[] }> },
  key: SeriesKey
): number {
  return chart.series.find((s) => s.key === key)?.values.at(-1) ?? 0
}

function monthLabel(day?: string): string {
  if (!day) return ""

  return new Date(day)
    .toLocaleDateString(undefined, { month: "short" })
    .toUpperCase()
}
