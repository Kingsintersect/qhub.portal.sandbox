"use client"

import type { Assessment } from "@/modules/portal/seed"

/**
 * Quizzes and exams, lifted from the bundle 25 canvas.
 *
 * The subtitle sets the expectation the rest of the marking flow depends on:
 * choice questions auto-mark, short answers and essays land in the grading
 * queue. A lecturer who knows that before building a paper builds a different
 * paper.
 */

const GRID = "70px minmax(0,1.8fr) 90px 160px 170px 130px 70px 110px"

const STATUS: Record<Assessment["status"], [string, string]> = {
  SCHEDULED: ["var(--accent)", "var(--accent-soft)"],
  GRADED: ["var(--txt3)", "var(--panel)"],
  GRADING: ["var(--warn)", "var(--warn-bg)"],
  DRAFT: ["var(--series2)", "var(--warn-bg)"],
}

export function Assessments({
  assessments,
  onOcr,
  onNew,
}: {
  assessments: Assessment[]
  onOcr: () => void
  onNew: () => void
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
          <div style={{ fontSize: 15, fontWeight: 600 }}>
            Quizzes &amp; exams
          </div>
          <div style={{ fontSize: 12, color: "var(--txt3)", marginTop: 2 }}>
            Choice questions auto-mark · short answers and essays land in your
            grading queue
          </div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={onOcr}
            style={{
              border: "1px solid var(--line-strong)",
              color: "var(--txt2)",
              fontSize: 12.5,
              fontWeight: 500,
              padding: "9px 16px",
              borderRadius: 10,
              cursor: "pointer",
              background: "transparent",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            Upload typed questions (OCR)
          </button>
          <button
            type="button"
            onClick={onNew}
            style={{
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
            New quiz or exam
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: GRID,
          columnGap: 14,
          padding: "8px 4px",
          borderBottom: "1px solid var(--line-strong)",
          fontSize: 10.5,
          letterSpacing: ".09em",
          color: "var(--txt4)",
          fontWeight: 600,
        }}
      >
        <div>KIND</div>
        <div>TITLE</div>
        <div>COURSE</div>
        <div>QUESTIONS</div>
        <div>WINDOW</div>
        <div>SUBMITTED</div>
        <div>AVG</div>
        <div>STATUS</div>
      </div>

      {assessments.map((a) => {
        const [sTone, sBg] = STATUS[a.status]
        const exam = a.kind === "EXAM"

        return (
          <div
            key={a.id}
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              columnGap: 14,
              alignItems: "center",
              padding: "12px 4px",
              fontSize: 13,
              borderBottom: "1px solid var(--line)",
            }}
          >
            <div>
              {/* An exam reads in the negative tone — it is the one you
                  cannot quietly re-run. */}
              <span
                className="portal-mono"
                style={{
                  fontSize: 9.5,
                  letterSpacing: ".07em",
                  padding: "3px 8px",
                  borderRadius: 999,
                  color: exam ? "var(--neg)" : "var(--accent)",
                  background: exam ? "var(--neg-bg)" : "var(--accent-soft)",
                }}
              >
                {a.kind}
              </span>
            </div>
            <div
              style={{
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {a.title}
            </div>
            <div className="portal-mono" style={{ fontSize: 11.5 }}>
              {a.course}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>
              {a.q} questions · {a.pts} pts
            </div>
            <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>
              {a.window}
              {a.timer !== undefined && a.timer !== "" ? ` · ⏱ ${a.timer}` : ""}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>{a.sub}</div>
            <div style={{ fontSize: 12.5, fontWeight: 500 }}>{a.avg}</div>
            <div>
              <span
                className="portal-mono"
                style={{
                  fontSize: 9.5,
                  letterSpacing: ".07em",
                  padding: "3px 9px",
                  borderRadius: 999,
                  color: sTone,
                  background: sBg,
                }}
              >
                {a.status}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
