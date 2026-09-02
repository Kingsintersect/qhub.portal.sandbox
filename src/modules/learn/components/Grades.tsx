"use client"

/**
 * The gradebook as the student sees it, lifted from the bundle 25 canvas.
 *
 * A course grade appears only once every component is graded. Until then the
 * total is an em-dash, not a running average — a partial average read as a
 * final mark is how somebody concludes they have failed a course they have
 * not sat the exam for.
 */

export type GradeStat = {
  label: string
  value: string
  delta: string
  tone: "txt" | "warn"
}

export type GradeRow = {
  code: string
  title: string
  attendance: string
  discussions: string
  quizzes: string
  /** An em-dash until it exists. */
  exam: string
  total: string
  grade: string
}

const GRID = "90px minmax(0,1.6fr) 110px 110px 90px 80px 80px 70px"

export function Grades({
  stats,
  rows,
  term,
}: {
  stats: GradeStat[]
  rows: GradeRow[]
  /** "Grades — 2026/2027 · 1st semester" */
  term: string
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
              padding: "16px 20px",
              borderRight:
                i === stats.length - 1 ? "none" : "1px solid var(--line)",
            }}
          >
            <div
              style={{
                fontSize: 12.5,
                color: "var(--txt3)",
                marginBottom: 6,
              }}
            >
              {k.label}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <div
                style={{
                  fontSize: 21,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  color: k.tone === "warn" ? "var(--warn)" : "var(--txt)",
                }}
              >
                {k.value}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--txt4)" }}>
                {k.delta}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "var(--card)",
          borderRadius: 20,
          boxShadow: "var(--shadow-card)",
          padding: "20px 22px",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600 }}>{term}</div>
        {/* The weights and the rule, above the table rather than under it. */}
        <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 3 }}>
          Attendance 10% · Discussions 15% · Quizzes 25% · Exam 50% · a course
          grade appears only when every component is graded
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: GRID,
            columnGap: 14,
            padding: "16px 0 10px",
            fontSize: 10.5,
            letterSpacing: ".09em",
            color: "var(--txt4)",
          }}
        >
          <div>CODE</div>
          <div>COURSE</div>
          <div>ATTENDANCE</div>
          <div>DISCUSSIONS</div>
          <div>QUIZZES</div>
          <div>EXAM</div>
          <div>TOTAL</div>
          <div>GRADE</div>
        </div>

        {rows.map((r) => {
          const complete = r.grade !== "—"

          return (
            <div
              key={r.code}
              style={{
                display: "grid",
                gridTemplateColumns: GRID,
                columnGap: 14,
                alignItems: "center",
                padding: "12px 0",
                borderTop: "1px solid var(--line2)",
                fontSize: 12.5,
              }}
            >
              <div className="learn-mono" style={{ fontSize: 11.5 }}>
                {r.code}
              </div>
              <div
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {r.title}
              </div>
              <div style={{ color: "var(--txt2)" }}>{r.attendance}</div>
              <div style={{ color: "var(--txt2)" }}>{r.discussions}</div>
              <div style={{ color: "var(--txt2)" }}>{r.quizzes}</div>
              <div style={{ color: "var(--txt2)" }}>{r.exam}</div>
              <div style={{ fontWeight: complete ? 600 : 400 }}>{r.total}</div>
              <div>
                <span
                  className="learn-mono"
                  style={{
                    fontSize: 10.5,
                    letterSpacing: ".05em",
                    padding: "4px 9px",
                    borderRadius: 999,
                    color: complete ? "var(--accent)" : "var(--txt4)",
                    background: complete
                      ? "var(--accent-soft)"
                      : "var(--panel)",
                  }}
                >
                  {r.grade}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
