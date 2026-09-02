"use client"

import { useState } from "react"

import {
  GRADE_SCALE,
  GRADE_WEIGHTS,
  initialsOf,
  type GradebookRow,
  type PendingGrade,
} from "@/modules/portal/seed"

/**
 * Grading, lifted from the bundle 25 canvas.
 *
 * Two sentences carry the screen. A grade only exists once every component
 * does — so a student who has not sat the exam shows an em-dash and not a
 * partial average somebody could mistake for a fail. And grades reach students
 * only when released, deliberately and logged, never automatically.
 *
 * The manual queue sits above the gradebook because it is work, not reference,
 * and the auto-marker's suggestion is labelled as a suggestion: it says verify
 * before it lands, next to the button that lands it.
 */

const GRID = "minmax(0,1.6fr) 90px 100px 100px 90px 80px 80px 70px 100px"

export function Grading({
  pending,
  gradebook,
  onAccept,
}: {
  pending: PendingGrade[]
  gradebook: GradebookRow[]
  onAccept: (g: PendingGrade) => void
}) {
  const [course, setCourse] = useState("All")

  const shown = gradebook.filter((g) => course === "All" || g.course === course)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            display: "flex",
            background: "var(--panel)",
            borderRadius: 10,
            padding: 3,
          }}
        >
          {["All", "CSC 201", "CSC 305"].map((c) => {
            const on = course === c

            return (
              <button
                key={c}
                type="button"
                onClick={() => setCourse(c)}
                style={{
                  fontSize: 12,
                  fontWeight: on ? 600 : 400,
                  color: on ? "var(--txt)" : "var(--txt3)",
                  background: on ? "var(--card)" : "transparent",
                  boxShadow: on ? "var(--shadow-sm)" : "none",
                  padding: "6px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                  border: "none",
                  fontFamily: "inherit",
                }}
              >
                {c}
              </button>
            )
          })}
        </div>

        {/* The weights and the scale, in the header — the arithmetic behind
            every number below is stated rather than implied. */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: 16,
            alignItems: "center",
          }}
        >
          {GRADE_WEIGHTS.map((w) => (
            <div key={w.k} style={{ fontSize: 12, color: "var(--txt3)" }}>
              {w.k}{" "}
              <span style={{ fontWeight: 600, color: "var(--txt)" }}>
                {w.v}
              </span>
            </div>
          ))}
          <div
            className="portal-mono"
            style={{ fontSize: 10.5, color: "var(--txt4)" }}
          >
            {GRADE_SCALE}
          </div>
        </div>
      </div>

      {pending.length > 0 && (
        <div
          style={{
            background: "var(--card)",
            borderRadius: 20,
            boxShadow: "var(--shadow-card)",
            padding: "18px 22px",
            borderLeft: "3px solid var(--series2)",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
            {pending.length} submissions await manual grading
          </div>

          {pending.map((g) => (
            <div
              key={g.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "10px 0",
                borderBottom: "1px solid var(--line)",
                fontSize: 12.5,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 500 }}>
                  {g.student}{" "}
                  <span
                    className="portal-mono"
                    style={{ fontSize: 10.5, color: "var(--txt4)" }}
                  >
                    {g.matric}
                  </span>
                </div>
                <div style={{ color: "var(--txt3)", marginTop: 2 }}>
                  {g.assess} · submitted {g.submitted}
                </div>
              </div>

              <div
                style={{
                  marginLeft: "auto",
                  fontSize: 11.5,
                  color: "var(--txt4)",
                }}
              >
                Suggested {g.suggested}/{g.max} — auto-marker, verify before it
                lands
              </div>

              <button
                type="button"
                onClick={() => onAccept(g)}
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "8px 14px",
                  borderRadius: 9,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  border: "none",
                  fontFamily: "inherit",
                }}
              >
                Accept &amp; write to gradebook
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          background: "var(--card)",
          borderRadius: 20,
          boxShadow: "var(--shadow-card)",
          padding: "20px 22px",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>
          Gradebook
        </div>
        <div style={{ fontSize: 12, color: "var(--txt3)", marginBottom: 14 }}>
          Composite of attendance, discussions, quizzes and the exam · a grade
          only exists once every component does
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: GRID,
            columnGap: 12,
            padding: "8px 4px",
            borderBottom: "1px solid var(--line-strong)",
            fontSize: 10.5,
            letterSpacing: ".09em",
            color: "var(--txt4)",
            fontWeight: 600,
          }}
        >
          <div>STUDENT</div>
          <div>COURSE</div>
          <div>ATTENDANCE</div>
          <div>DISCUSSIONS</div>
          <div>QUIZZES</div>
          <div>EXAM</div>
          <div>TOTAL</div>
          <div>GRADE</div>
          <div>STATUS</div>
        </div>

        {shown.map((g, i) => {
          const graded = g.status === "GRADED"

          return (
            <div
              key={`${g.matric}-${i}`}
              style={{
                display: "grid",
                gridTemplateColumns: GRID,
                columnGap: 12,
                alignItems: "center",
                padding: "11px 4px",
                fontSize: 13,
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 999,
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 600,
                    flex: "0 0 26px",
                  }}
                >
                  {initialsOf(g.name)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {g.name}
                  </div>
                  <div
                    className="portal-mono"
                    style={{ fontSize: 10, color: "var(--txt4)" }}
                  >
                    {g.matric}
                  </div>
                </div>
              </div>

              <div className="portal-mono" style={{ fontSize: 11.5 }}>
                {g.course}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>
                {g.att}%
              </div>
              <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>
                {g.disc}/15
              </div>
              <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>
                {g.quiz}%
              </div>
              <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>
                {g.exam === null ? "—" : `${g.exam}%`}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>
                {g.exam === null ? "—" : `${g.total}%`}
              </div>
              <div>
                <span
                  className="portal-mono"
                  style={{
                    fontSize: 10.5,
                    fontWeight: 500,
                    padding: "3px 10px",
                    borderRadius: 999,
                    color:
                      g.grade === "A"
                        ? "var(--accent)"
                        : g.grade === "F"
                          ? "var(--neg)"
                          : g.grade === "—"
                            ? "var(--txt4)"
                            : "var(--txt2)",
                    background:
                      g.grade === "A"
                        ? "var(--accent-soft)"
                        : g.grade === "F"
                          ? "var(--neg-bg)"
                          : "var(--panel)",
                  }}
                >
                  {g.grade}
                </span>
              </div>
              <div>
                <span
                  className="portal-mono"
                  style={{
                    fontSize: 9,
                    letterSpacing: ".07em",
                    padding: "3px 8px",
                    borderRadius: 999,
                    color: graded ? "var(--accent)" : "var(--warn)",
                    background: graded
                      ? "var(--accent-soft)"
                      : "var(--warn-bg)",
                  }}
                >
                  {g.status}
                </span>
              </div>
            </div>
          )
        })}

        <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 12 }}>
          Grades publish to students only when you release them — releasing is
          deliberate and logged, never automatic.
        </div>
      </div>
    </div>
  )
}
