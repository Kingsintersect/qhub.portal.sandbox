"use client"

import { useState } from "react"

import type { Course } from "@/modules/portal/seed"

/**
 * The course catalogue, lifted from the bundle 25 canvas.
 *
 * Both roles read the same table, but only a lecturer can open a row, and only
 * on a course that is theirs. The expansion is where teaching starts — create
 * a lesson, schedule a class, open the gradebook — so an admin, who does none
 * of those, gets no expander rather than an expander full of refusals.
 *
 * The footer says where rows come from: the SIS or a bulk import, never typed
 * in here. An admin hunting for an "add course" button should find that
 * sentence instead.
 */

const GRID =
  "100px minmax(0,1.8fr) minmax(0,1.2fr) 90px minmax(0,1.2fr) 90px 70px"

export type CourseAction = { label: string; run: () => void }

export function CourseCatalogue({
  courses,
  title,
  sub,
  footer,
  isAdmin,
  myCodes,
  onImport,
  actionsFor,
}: {
  courses: Course[]
  title: string
  sub: string
  footer: string
  isAdmin: boolean
  /** The codes this lecturer teaches; empty for an admin. */
  myCodes: string[]
  onImport: () => void
  actionsFor: (course: Course) => CourseAction[]
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState<string | null>(null)

  const q = query.trim().toLowerCase()
  const shown = courses.filter(
    (c) =>
      q === "" || `${c.code} ${c.title} ${c.dept}`.toLowerCase().includes(q)
  )

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
          <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
          <div style={{ fontSize: 12, color: "var(--txt3)", marginTop: 2 }}>
            {sub}
          </div>
        </div>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search code or title…"
            style={{
              width: 230,
              background: "var(--panel)",
              border: "1px solid var(--line-strong)",
              borderRadius: 10,
              padding: "8px 12px",
              fontSize: 12.5,
              color: "var(--txt)",
              fontFamily: "inherit",
              outline: "none",
            }}
          />
          {isAdmin && (
            <button
              type="button"
              onClick={onImport}
              style={{
                border: "1px solid var(--line-strong)",
                color: "var(--txt2)",
                fontSize: 12.5,
                fontWeight: 500,
                padding: "9px 16px",
                borderRadius: 10,
                cursor: "pointer",
                whiteSpace: "nowrap",
                background: "transparent",
                fontFamily: "inherit",
              }}
            >
              Import courses (CSV)
            </button>
          )}
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
        <div>CODE</div>
        <div>TITLE</div>
        <div>DEPARTMENT</div>
        <div>LEVEL</div>
        <div>LECTURER</div>
        <div>STUDENTS</div>
        <div>MEDIA</div>
      </div>

      {shown.map((c) => {
        const mine = myCodes.includes(c.code)
        const expandable = !isAdmin && mine
        const isOpen = expandable && open === c.code

        const row = (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              columnGap: 14,
              alignItems: "center",
              padding: "11px 4px",
              fontSize: 13,
              borderBottom: "1px solid var(--line)",
              cursor: expandable ? "pointer" : "default",
            }}
          >
            <div
              className="portal-mono"
              style={{ fontSize: 11.5, fontWeight: 500 }}
            >
              {c.code}
            </div>
            <div
              style={{
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {c.title}
            </div>
            <div
              style={{
                color: "var(--txt2)",
                fontSize: 12.5,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {c.dept}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>
              {c.level}
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: "var(--txt2)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {c.lect}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>
              {c.students.toLocaleString()}
            </div>
            {/* No media is an em-dash, not a zero — nothing has been counted
                wrong, there is simply nothing there yet. */}
            <div
              style={{
                fontSize: 12.5,
                color: c.media === 0 ? "var(--txt4)" : "var(--txt2)",
              }}
            >
              {c.media === 0 ? "—" : String(c.media)}
            </div>
          </div>
        )

        return (
          <div key={c.code}>
            {expandable ? (
              <div
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : c.code)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setOpen(isOpen ? null : c.code)
                  }
                }}
              >
                {row}
              </div>
            ) : (
              row
            )}

            {isOpen && (
              <div
                style={{
                  borderBottom: "1px solid var(--line)",
                  background: "var(--row-hover)",
                  padding: "16px 4px 18px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(6, 1fr)",
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  {[
                    { k: "Enrolled", v: c.students.toLocaleString() },
                    {
                      k: "Engagement",
                      v: c.code === "CSC 201" ? "78%" : "64%",
                    },
                    {
                      k: "Lessons",
                      v: c.code === "CSC 201" ? "3 published" : "1 + 1 draft",
                    },
                    { k: "Media", v: String(c.media) },
                    { k: "Open discussions", v: "1" },
                    {
                      k: "Next assessment",
                      v: c.code === "CSC 201" ? "Quiz · Sep 3" : "Exam · draft",
                    },
                  ].map((k) => (
                    <div
                      key={k.k}
                      style={{
                        background: "var(--card)",
                        border: "1px solid var(--line)",
                        borderRadius: 11,
                        padding: "11px 13px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--txt4)",
                          marginBottom: 4,
                        }}
                      >
                        {k.k}
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                        {k.v}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {actionsFor(c).map((a) => (
                    <button
                      key={a.label}
                      type="button"
                      onClick={(e) => {
                        // Without this the row's own handler collapses the
                        // expansion the moment an action inside it is clicked.
                        e.stopPropagation()
                        a.run()
                      }}
                      style={{
                        fontSize: 12.5,
                        fontWeight: 500,
                        color: "var(--accent)",
                        background: "var(--accent-soft)",
                        padding: "9px 15px",
                        borderRadius: 10,
                        cursor: "pointer",
                        border: "none",
                        fontFamily: "inherit",
                      }}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}

      <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 12 }}>
        {footer}
      </div>
    </div>
  )
}
