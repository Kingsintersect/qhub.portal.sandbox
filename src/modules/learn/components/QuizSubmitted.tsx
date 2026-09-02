"use client"

/**
 * The screen a student lands on after submitting an attempt, lifted from the
 * bundle 25 canvas.
 *
 * It exists to answer the question the moment creates: is that it, and where
 * does the mark appear? Choice questions are already marked, written answers
 * are not, and saying so here is what stops somebody refreshing Grades for a
 * mark no machine is going to produce.
 */

export function QuizSubmitted({
  courseCode,
  onBackToCourse,
  onViewGrades,
}: {
  courseCode: string
  onBackToCourse: () => void
  onViewGrades: () => void
}) {
  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 20,
        boxShadow: "var(--shadow-card)",
        padding: 26,
        maxWidth: 560,
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 999,
          background: "var(--good-bg)",
          margin: "0 auto 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12.5l5 5L20 7" />
        </svg>
      </div>

      <div style={{ fontSize: 17, fontWeight: 600 }}>Attempt submitted</div>

      <div
        style={{
          fontSize: 12.5,
          color: "var(--txt3)",
          margin: "8px auto 0",
          maxWidth: 380,
          lineHeight: 1.55,
        }}
      >
        Choice questions are marked already; anything written by hand is graded
        by your lecturer. Your mark appears in the course&apos;s Grades tab —
        you&apos;ll be notified.
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          marginTop: 18,
        }}
      >
        <button
          type="button"
          onClick={onBackToCourse}
          style={{
            border: "1px solid var(--line-strong)",
            color: "var(--txt2)",
            fontSize: 13,
            fontWeight: 500,
            padding: "10px 18px",
            borderRadius: 11,
            cursor: "pointer",
            background: "transparent",
            fontFamily: "inherit",
          }}
        >
          Back to {courseCode}
        </button>
        <button
          type="button"
          onClick={onViewGrades}
          style={{
            background: "var(--accent)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 500,
            padding: "10px 18px",
            borderRadius: 11,
            cursor: "pointer",
            border: "none",
            fontFamily: "inherit",
          }}
        >
          View grades
        </button>
      </div>
    </div>
  )
}
