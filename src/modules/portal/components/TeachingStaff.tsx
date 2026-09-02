"use client"

import { useState } from "react"

import { FACULTY, initialsOf, type Lecturer } from "@/modules/portal/seed"

/**
 * The institution's teaching staff, lifted from the bundle 25 canvas.
 *
 * Two sentences on this screen do real work. The subtitle says a lecturer sees
 * only their own courses and students, so an admin knows what inviting one
 * actually grants. The footer says removing a lecturer keeps their courses and
 * media — without it, an admin cleaning up leavers has to guess whether they
 * are about to take a course offline mid-semester.
 */

const GRID = "minmax(0,1.5fr) minmax(0,1.2fr) minmax(0,1.2fr) 110px 100px 120px"

export function TeachingStaff({
  lecturers,
  onInvite,
}: {
  lecturers: Lecturer[]
  onInvite: () => void
}) {
  const [query, setQuery] = useState("")

  const q = query.trim().toLowerCase()
  const shown = lecturers.filter(
    (l) =>
      q === "" || `${l.name} ${l.dept} ${l.email}`.toLowerCase().includes(q)
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
          <div style={{ fontSize: 15, fontWeight: 600 }}>Teaching staff</div>
          <div style={{ fontSize: 12, color: "var(--txt3)", marginTop: 2 }}>
            Accounts your institution controls · lecturers see only their own
            courses and students
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
            placeholder="Search name, department…"
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
          <button
            type="button"
            onClick={onInvite}
            style={{
              background: "var(--accent)",
              color: "#fff",
              fontSize: 12.5,
              fontWeight: 500,
              padding: "9px 16px",
              borderRadius: 10,
              cursor: "pointer",
              whiteSpace: "nowrap",
              border: "none",
              fontFamily: "inherit",
            }}
          >
            Invite lecturer
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
        <div>NAME</div>
        <div>DEPARTMENT</div>
        <div>TEACHING</div>
        <div>STUDENTS</div>
        <div>STATUS</div>
        <div>LAST ACTIVE</div>
      </div>

      {shown.map((l) => {
        const active = l.status === "ACTIVE"

        return (
          <div
            key={l.email}
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
                {initialsOf(l.name)}
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
                  {l.name}
                </div>
                <div
                  className="portal-mono"
                  style={{ fontSize: 10.5, color: "var(--txt4)" }}
                >
                  {l.email}
                </div>
              </div>
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  color: "var(--txt2)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {l.dept}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--txt4)",
                  marginTop: 2,
                }}
              >
                {FACULTY[l.dept] ?? `Faculty of ${l.dept.split(" ")[0]}`}
              </div>
            </div>

            <div
              className="portal-mono"
              style={{
                fontSize: 11,
                color: "var(--txt3)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {l.codes.length > 0 ? l.codes.join(" · ") : "—"}
            </div>

            <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>
              {l.students > 0 ? l.students.toLocaleString() : "—"}
            </div>

            <div>
              <span
                className="portal-mono"
                style={{
                  fontSize: 9.5,
                  letterSpacing: ".07em",
                  padding: "3px 9px",
                  borderRadius: 999,
                  color: active ? "var(--accent)" : "var(--warn)",
                  background: active ? "var(--accent-soft)" : "var(--warn-bg)",
                }}
              >
                {l.status}
              </span>
            </div>

            <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>{l.last}</div>
          </div>
        )
      })}

      <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 12 }}>
        Removing a lecturer keeps their courses and media — ownership transfers
        to the department, nothing students rely on disappears.
      </div>
    </div>
  )
}
