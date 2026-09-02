"use client"

import { BLOCK_TONE, type Lesson } from "@/modules/portal/seed"

/**
 * A lecturer's lesson content, lifted from the bundle 25 canvas.
 *
 * Grouped by course rather than listed flat, because the question this screen
 * answers is "what does CSC 201 have and what is still missing", not "what did
 * I make most recently".
 *
 * The footer draws the line that stops completion being read as a mark: it
 * counts students who reached the end, and feeds engagement metrics, not the
 * grade.
 */

const GRID = "100px minmax(0,1.8fr) 130px minmax(0,1.2fr) 110px 110px"

export function LessonContent({
  lessons,
  courses,
  onCreate,
}: {
  lessons: Lesson[]
  /** The lecturer's course codes, in nav order. */
  courses: string[]
  onCreate: () => void
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Lesson content</div>
          <div style={{ fontSize: 12, color: "var(--txt3)", marginTop: 2 }}>
            Published to the course&apos;s Moodle page, module by module —
            students work through them in order
          </div>
        </div>
        <button
          type="button"
          onClick={onCreate}
          style={{
            marginLeft: "auto",
            background: "var(--accent)",
            color: "#fff",
            fontSize: 12.5,
            fontWeight: 500,
            padding: "9px 16px",
            borderRadius: 10,
            cursor: "pointer",
            border: "none",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          Create lesson
        </button>
      </div>

      {courses.map((code) => {
        const rows = lessons.filter((l) => l.course === code)
        const published = rows.filter((l) => l.status === "PUBLISHED").length

        return (
          <div key={code} style={{ marginBottom: 6 }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 9,
                padding: "10px 4px 6px",
              }}
            >
              <div
                className="portal-mono"
                style={{
                  fontSize: 11,
                  letterSpacing: ".06em",
                  color: "var(--txt4)",
                }}
              >
                {code}
              </div>
              <div style={{ fontSize: 12, color: "var(--txt3)" }}>
                {rows.length} lessons · {published} published
              </div>
            </div>

            {rows.map((l, i) => (
              <div
                key={`${l.title}-${i}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: GRID,
                  columnGap: 14,
                  alignItems: "center",
                  padding: "11px 4px",
                  fontSize: 13,
                  borderTop: "1px solid var(--line)",
                }}
              >
                <div
                  className="portal-mono"
                  style={{ fontSize: 10.5, color: "var(--txt4)" }}
                >
                  {l.module.toUpperCase()}
                </div>
                <div
                  style={{
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {l.title}
                </div>
                <div>
                  <span
                    className="portal-mono"
                    style={{
                      fontSize: 9.5,
                      letterSpacing: ".06em",
                      padding: "3px 9px",
                      borderRadius: 999,
                      color: "var(--txt3)",
                      background: "var(--panel)",
                    }}
                  >
                    {l.layout}
                  </span>
                </div>

                {/* The blocks are the lesson's shape at a glance — a reading
                    with one TEXT chip reads differently from a mixed lesson. */}
                <div style={{ display: "flex", gap: 6 }}>
                  {l.blocks.map((b) => {
                    const [tone, background] = BLOCK_TONE[b] ?? BLOCK_TONE.TEXT!

                    return (
                      <span
                        key={b}
                        className="portal-mono"
                        style={{
                          fontSize: 9.5,
                          padding: "3px 8px",
                          borderRadius: 999,
                          color: tone,
                          background,
                        }}
                      >
                        {b}
                      </span>
                    )
                  })}
                </div>

                <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>
                  {l.done}
                </div>
                <div>
                  <span
                    className="portal-mono"
                    style={{
                      fontSize: 9.5,
                      letterSpacing: ".07em",
                      padding: "3px 9px",
                      borderRadius: 999,
                      color:
                        l.status === "PUBLISHED"
                          ? "var(--accent)"
                          : "var(--series2)",
                      background:
                        l.status === "PUBLISHED"
                          ? "var(--accent-soft)"
                          : "var(--warn-bg)",
                    }}
                  >
                    {l.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      })}

      <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 10 }}>
        Completion counts students who reached the end of the lesson · it feeds
        the engagement metrics, not the grade.
      </div>
    </div>
  )
}
