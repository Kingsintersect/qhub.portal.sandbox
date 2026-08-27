"use client"

import { useMemo, useState } from "react"

import type { TrendPoint } from "@/modules/platform-observability/types"

type SeriesKey = "activity" | "logins" | "students"

const SERIES: Array<{
  key: SeriesKey
  label: string
  stroke: string
  width: number
}> = [
  { key: "activity", label: "Activity", stroke: "var(--accent)", width: 1.9 },
  { key: "logins", label: "Sign-ins", stroke: "var(--series2)", width: 1.8 },
  { key: "students", label: "Learners", stroke: "var(--series3)", width: 1.6 },
]

const RANGES = [7, 30, 90, 365] as const

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

  const paths = useMemo(() => {
    if (points.length === 0) return null

    const width = 1000
    const height = 230
    const pad = 14

    const x = (i: number) =>
      points.length === 1 ? width / 2 : (i / (points.length - 1)) * width

    const build = (key: SeriesKey) => {
      const values = points.map((p) => p[key])
      const max = Math.max(...values, 1)

      return values
        .map((v, i) => {
          const y = height - pad - (v / max) * (height - pad * 2)

          return `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y.toFixed(1)}`
        })
        .join(" ")
    }

    return SERIES.reduce<Record<SeriesKey, string>>(
      (acc, s) => ({ ...acc, [s.key]: build(s.key) }),
      {} as Record<SeriesKey, string>
    )
  }, [points])

  const latest = points.at(-1)

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
              key={r}
              type="button"
              onClick={() => onDaysChange(r)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: 12.5,
                fontWeight: 500,
                cursor: "pointer",
                border: "none",
                color: days === r ? "var(--txt)" : "var(--txt3)",
                background: days === r ? "var(--card)" : "transparent",
                boxShadow: days === r ? "var(--shadow-sm)" : "none",
                fontFamily: "inherit",
              }}
            >
              {r === 365 ? "1y" : `${r}d`}
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
              {latest && !off && (
                <span
                  className="qhub-mono"
                  style={{ color: "var(--txt4)", fontSize: 11.5 }}
                >
                  {latest[s.key].toLocaleString()}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div style={{ position: "relative" }}>
        {points.length === 0 ? (
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
              : "Nothing collected yet. The metrics collector runs every fifteen minutes — if this stays empty, check that the scheduler is running."}
          </div>
        ) : (
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
          >
            <line
              style={{ stroke: "var(--grid-line)" }}
              x1="0"
              y1="115"
              x2="1000"
              y2="115"
              strokeWidth="1"
            />
            {[150, 480, 810].map((x) => (
              <line
                key={x}
                style={{ stroke: "var(--grid-line2)" }}
                x1={x}
                y1="0"
                x2={x}
                y2="230"
                strokeWidth="1"
              />
            ))}

            {/* Drawn back to front so the accent series sits on top, as the
                draft layers them. */}
            {[...SERIES]
              .reverse()
              .map((s) =>
                hidden.includes(s.key) || !paths ? null : (
                  <path
                    key={s.key}
                    style={{ stroke: s.stroke }}
                    d={paths[s.key]}
                    fill="none"
                    strokeWidth={s.width}
                    vectorEffect="non-scaling-stroke"
                    strokeLinejoin="round"
                  />
                )
              )}
          </svg>
        )}

        {points.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              letterSpacing: ".08em",
              color: "var(--txt4)",
              marginTop: 6,
            }}
          >
            <span>{formatDay(points[0]?.day)}</span>
            <span>{formatDay(points.at(-1)?.day)}</span>
          </div>
        )}
      </div>

      <div style={{ height: 12 }} />
    </div>
  )
}

function formatDay(day?: string): string {
  if (!day) return ""

  return new Date(day)
    .toLocaleDateString(undefined, { day: "numeric", month: "short" })
    .toUpperCase()
}
