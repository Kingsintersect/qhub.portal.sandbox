"use client"

import { useState } from "react"

import { initialsOf, type Student } from "@/modules/portal/seed"

/**
 * The student roll, lifted from the bundle 25 canvas.
 *
 * The subtitle carries the rule that matters: status is derived from
 * enrolment, never set by hand. Somebody looking at a SUSPENDED row needs to
 * know there is no button here that would change it — the fix is upstream, in
 * the enrolment record.
 */

const GRID = "150px minmax(0,1.5fr) minmax(0,1.3fr) 90px 110px 110px"

const STATUS: Record<Student["status"], [string, string]> = {
  ACTIVE: ["var(--accent)", "var(--accent-soft)"],
  SUSPENDED: ["var(--warn)", "var(--warn-bg)"],
  WITHDRAWN: ["var(--txt4)", "var(--panel)"],
}

export function StudentRoll({
  students,
  title,
  sub,
  levels,
  loading = false,
}: {
  students: Student[]
  title: string
  sub: string
  /** The levels actually present, so a chip never matches nothing. */
  levels: string[]
  loading?: boolean
}) {
  const [query, setQuery] = useState("")
  const [level, setLevel] = useState("All")
  const [page, setPage] = useState(0)

  const q = query.trim().toLowerCase()
  const shown = students.filter(
    (s) =>
      (level === "All" || s.level === level) &&
      (q === "" || `${s.matric} ${s.name} ${s.prog}`.toLowerCase().includes(q))
  )

  const size = 10
  const pages = Math.max(1, Math.ceil(shown.length / size))
  // Clamped rather than reset: narrowing the filter while on page 6 should
  // land on the last page that exists, not silently show nothing.
  const p = Math.min(page, pages - 1)
  const rows = shown.slice(p * size, p * size + size)

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
          flexWrap: "wrap",
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
            flexWrap: "wrap",
          }}
        >
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(0)
            }}
            placeholder="Search name, matric no…"
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

          <div
            style={{
              display: "flex",
              background: "var(--panel)",
              borderRadius: 10,
              padding: 3,
            }}
          >
            {["All", ...levels].map((lv) => {
              const on = level === lv

              return (
                <button
                  key={lv}
                  type="button"
                  onClick={() => {
                    setLevel(lv)
                    setPage(0)
                  }}
                  style={{
                    fontSize: 12,
                    fontWeight: on ? 600 : 400,
                    color: on ? "var(--txt)" : "var(--txt3)",
                    background: on ? "var(--card)" : "transparent",
                    boxShadow: on ? "var(--shadow-sm)" : "none",
                    padding: "6px 11px",
                    borderRadius: 8,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    border: "none",
                    fontFamily: "inherit",
                  }}
                >
                  {lv}
                </button>
              )
            })}
          </div>
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
        <div>MATRIC NO</div>
        <div>NAME</div>
        <div>PROGRAMME</div>
        <div>LEVEL</div>
        <div>STATUS</div>
        <div>LAST ACTIVE</div>
      </div>

      {rows.map((s) => {
        const [tone, background] = STATUS[s.status]

        return (
          <div
            key={s.matric}
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              columnGap: 14,
              alignItems: "center",
              padding: "11px 4px",
              fontSize: 13,
              borderBottom: "1px solid var(--line)",
            }}
          >
            <div
              className="portal-mono"
              style={{ fontSize: 11.5, color: "var(--txt3)" }}
            >
              {s.matric}
            </div>

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
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10.5,
                  fontWeight: 600,
                  flex: "0 0 28px",
                }}
              >
                {initialsOf(s.name)}
              </div>
              <div
                style={{
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {s.name}
              </div>
            </div>

            <div
              style={{
                color: "var(--txt2)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {s.prog}
            </div>

            <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>
              {s.level}
            </div>

            <div>
              <span
                className="portal-mono"
                style={{
                  fontSize: 9.5,
                  letterSpacing: ".07em",
                  padding: "3px 9px",
                  borderRadius: 999,
                  color: tone,
                  background,
                }}
              >
                {s.status}
              </span>
            </div>

            <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>{s.last}</div>
          </div>
        )
      })}

      {/* Nothing is drawn while loading. The canvas has no loading treatment
          for any table — one is requested from Design — and rather than
          invent copy, the rows simply are not there yet. What must not happen
          is the empty state showing during a fetch: "no students match" is a
          different and wrong statement from "not loaded yet". */}
      {!loading && shown.length === 0 && (
        <div
          style={{
            padding: "26px 4px",
            fontSize: 13,
            color: "var(--txt4)",
            textAlign: "center",
          }}
        >
          No students match these filters.
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          paddingTop: 12,
        }}
      >
        {/* That the full roll paginates server-side is said here, so nobody
            reads "96" as the size of the institution. */}
        <div style={{ fontSize: 12, color: "var(--txt4)" }}>
          Page {p + 1} of {pages} · {shown.length.toLocaleString()} students
          shown · full roll paginates server-side
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <PageButton
            enabled={p > 0}
            onClick={() => setPage(p - 1)}
            label="Prev"
          />
          <PageButton
            enabled={p < pages - 1}
            onClick={() => setPage(p + 1)}
            label="Next"
          />
        </div>
      </div>
    </div>
  )
}

function PageButton({
  enabled,
  onClick,
  label,
}: {
  enabled: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      disabled={!enabled}
      onClick={onClick}
      style={{
        fontSize: 12.5,
        fontWeight: 500,
        padding: "7px 14px",
        borderRadius: 9,
        border: "1px solid var(--line-strong)",
        cursor: enabled ? "pointer" : "default",
        color: enabled ? "var(--txt2)" : "var(--txt4)",
        background: "transparent",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  )
}
