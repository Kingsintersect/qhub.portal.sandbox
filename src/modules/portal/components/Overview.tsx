"use client"

import { useState } from "react"

import { walkPoints } from "@/modules/portal/walk-points"

/**
 * The portal's landing screen, lifted from the bundle 25 canvas.
 *
 * The same layout serves both roles with different content: an admin sees the
 * institution, a lecturer sees their own two courses. Nothing here is a
 * permission-filtered view of the other — the figures are different figures,
 * which is why the labels change rather than just the numbers.
 */

export type OverviewStat = {
  label: string
  value: string
  delta: string
  /** The value's colour — storage over budget reads as a warning. */
  tone?: "warn"
  deltaTone?: "accent"
}

export type SideRow = { k: string; v: string; tone?: "accent" | "warn" }
export type QuickAction = { label: string; onClick: () => void }
export type EngagementCard = {
  title: string
  sub: string
  rows: { k: string; v: string; pct: number }[]
}

export function Overview({
  notice,
  onDismissNotice,
  stats,
  chartTitle,
  chartSeed,
  sideTitle,
  sideRows,
  quickActions,
  engagement,
}: {
  notice: string | null
  onDismissNotice: () => void
  stats: OverviewStat[]
  chartTitle: string
  /** [sign-ins, activity] — seeds, so the line is stable across renders. */
  chartSeed: [number, number]
  sideTitle: string
  sideRows: SideRow[]
  quickActions: QuickAction[]
  engagement: EngagementCard[]
}) {
  const signIns = walkPoints(chartSeed[0], 12, 2.2, 96)
  const activity = walkPoints(chartSeed[1], 12, 1.8, 128)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {notice !== null && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "var(--warn-bg)",
            border: "1px solid var(--line-strong)",
            borderRadius: 14,
            padding: "13px 18px",
          }}
        >
          <span
            className="portal-mono"
            style={{
              fontSize: 10,
              letterSpacing: ".08em",
              color: "var(--warn)",
              flex: "0 0 auto",
            }}
          >
            PLATFORM NOTICE
          </span>
          <div style={{ fontSize: 12.5, color: "var(--txt2)" }}>{notice}</div>
          <button
            type="button"
            onClick={onDismissNotice}
            style={{
              marginLeft: "auto",
              fontSize: 12,
              color: "var(--txt3)",
              cursor: "pointer",
              border: "none",
              background: "transparent",
              fontFamily: "inherit",
              flex: "0 0 auto",
            }}
          >
            Dismiss
          </button>
        </div>
      )}

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
        {stats.map((k, i) => (
          <div
            key={k.label}
            style={{
              padding: "18px 20px",
              borderRight:
                i === stats.length - 1 ? "none" : "1px solid var(--line)",
            }}
          >
            <div
              style={{ fontSize: 13, color: "var(--txt3)", marginBottom: 7 }}
            >
              {k.label}
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
                  color: k.tone === "warn" ? "var(--warn)" : "var(--txt)",
                }}
              >
                {k.value}
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  color:
                    k.deltaTone === "accent" ? "var(--accent)" : "var(--txt4)",
                }}
              >
                {k.delta}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        <div
          style={{
            background: "var(--card)",
            borderRadius: 20,
            boxShadow: "var(--shadow-card)",
            padding: "20px 22px",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 6 }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{chartTitle}</div>
              {/* When the numbers are from says whether today is in them. */}
              <div style={{ fontSize: 12, color: "var(--txt3)", marginTop: 2 }}>
                Weekly · last 12 weeks · counts update nightly
              </div>
            </div>
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                gap: 14,
                fontSize: 11.5,
                color: "var(--txt3)",
              }}
            >
              <Key color="var(--accent)">Sign-ins</Key>
              <Key color="var(--series2)">Activity events</Key>
            </div>
          </div>

          <svg
            viewBox="0 0 640 200"
            style={{ width: "100%", display: "block" }}
          >
            {[50, 100, 150].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="640"
                y2={y}
                stroke="var(--grid-line)"
                strokeWidth={1}
              />
            ))}
            <polyline
              points={signIns}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
            <polyline
              points={activity}
              fill="none"
              stroke="var(--series2)"
              strokeWidth={2}
              strokeLinejoin="round"
            />
          </svg>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 10.5,
              color: "var(--txt4)",
              marginTop: 6,
            }}
          >
            <div>Jun</div>
            <div>Jul</div>
            <div>Aug</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              background: "var(--card)",
              borderRadius: 20,
              boxShadow: "var(--shadow-card)",
              padding: "18px 20px",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              {sideTitle}
            </div>
            {sideRows.map((r) => (
              <div
                key={r.k}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 10,
                  padding: "8px 0",
                  borderBottom: "1px solid var(--line)",
                  fontSize: 12.5,
                }}
              >
                <div
                  style={{
                    color: "var(--txt2)",
                    flex: 1,
                    minWidth: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {r.k}
                </div>
                <div
                  style={{
                    fontWeight: 500,
                    color:
                      r.tone === "accent"
                        ? "var(--accent)"
                        : r.tone === "warn"
                          ? "var(--warn)"
                          : "var(--txt)",
                  }}
                >
                  {r.v}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              background: "var(--card)",
              borderRadius: 20,
              boxShadow: "var(--shadow-card)",
              padding: "18px 20px",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
              Quick actions
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {quickActions.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={q.onClick}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: "var(--accent)",
                    background: "var(--accent-soft)",
                    padding: "10px 14px",
                    borderRadius: 10,
                    cursor: "pointer",
                    border: "none",
                    fontFamily: "inherit",
                    textAlign: "left",
                  }}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        {engagement.map((e) => (
          <div
            key={e.title}
            style={{
              background: "var(--card)",
              borderRadius: 20,
              boxShadow: "var(--shadow-card)",
              padding: "18px 20px",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600 }}>{e.title}</div>
            <div
              style={{
                fontSize: 11.5,
                color: "var(--txt4)",
                margin: "2px 0 12px",
              }}
            >
              {e.sub}
            </div>
            {e.rows.map((r) => (
              <div key={r.k} style={{ padding: "7px 0" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 10,
                    fontSize: 12.5,
                  }}
                >
                  <div
                    style={{
                      color: "var(--txt2)",
                      flex: 1,
                      minWidth: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {r.k}
                  </div>
                  <div style={{ fontWeight: 500 }}>{r.v}</div>
                </div>
                <div
                  style={{
                    height: 4,
                    borderRadius: 999,
                    background: "var(--panel)",
                    marginTop: 5,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${r.pct}%`,
                      background: "var(--accent)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function Key({ color, children }: { color: string; children: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div
        style={{ width: 14, height: 2.5, background: color, borderRadius: 2 }}
      />
      {children}
    </div>
  )
}

/** The dismissable platform notice, kept per session as the canvas does. */
export function useNotice(text: string) {
  const [gone, setGone] = useState(false)
  return { notice: gone ? null : text, dismiss: () => setGone(true) }
}
