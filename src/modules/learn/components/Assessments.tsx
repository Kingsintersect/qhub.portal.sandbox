"use client"

/**
 * Every quiz and exam on the course, lifted from the bundle 25 canvas.
 *
 * Attempts are stated per row — "1 of 2 attempts used · best kept" — because
 * how many tries remain, and which one counts, is the question somebody asks
 * before starting, not after.
 */

export type Assessment = {
  kind: "QUIZ" | "EXAM"
  title: string
  meta: string
  /** "1 of 2 attempts used · best kept" */
  attempts: string
  /** "13/20 · 65%", or an em-dash when nothing is marked yet. */
  mark: string
  marked: boolean
  /** Present only when the attempt can actually be started now. */
  cta?: string
  badge?: { text: string; tone: "accent" | "warn" }
}

export function Assessments({
  rows,
  onStart,
}: {
  rows: Assessment[]
  onStart: (row: Assessment) => void
}) {
  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 20,
        boxShadow: "var(--shadow-card)",
        padding: "20px 22px",
      }}
    >
      {rows.map((a, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 13,
            padding: "13px 0",
            borderBottom: "1px solid var(--line)",
          }}
        >
          {/* An exam is marked in the negative tone, not because it is bad but
              because it is the one you cannot retake. */}
          <span
            className="learn-mono"
            style={{
              fontSize: 9.5,
              letterSpacing: ".07em",
              padding: "4px 9px",
              borderRadius: 999,
              flex: "0 0 auto",
              color: a.kind === "EXAM" ? "var(--neg)" : "var(--accent)",
              background:
                a.kind === "EXAM" ? "var(--neg-bg)" : "var(--accent-soft)",
            }}
          >
            {a.kind}
          </span>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>{a.title}</div>
            <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 2 }}>
              {a.meta}
            </div>
          </div>

          <div
            className="learn-mono"
            style={{ fontSize: 10.5, color: "var(--txt3)", flex: "0 0 auto" }}
          >
            {a.attempts}
          </div>

          <div
            className="learn-mono"
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: a.marked ? "var(--txt)" : "var(--txt4)",
            }}
          >
            {a.mark}
          </div>

          {a.cta !== undefined && (
            <button
              type="button"
              onClick={() => onStart(a)}
              style={{
                background: "var(--accent)",
                color: "#fff",
                border: "none",
                fontSize: 12,
                fontWeight: 500,
                fontFamily: "inherit",
                padding: "8px 15px",
                borderRadius: 9,
                cursor: "pointer",
              }}
            >
              {a.cta}
            </button>
          )}

          {a.badge !== undefined && (
            <span
              className="learn-mono"
              style={{
                fontSize: 9.5,
                letterSpacing: ".07em",
                padding: "4px 10px",
                borderRadius: 999,
                color:
                  a.badge.tone === "warn" ? "var(--warn)" : "var(--accent)",
                background:
                  a.badge.tone === "warn"
                    ? "var(--warn-bg)"
                    : "var(--accent-soft)",
              }}
            >
              {a.badge.text}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
