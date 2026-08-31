"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { operationsService } from "@/modules/platform-operations/services/operations.service"
import type { DirectoryPerson } from "@/modules/platform-operations/types"

const STUDENT_GRID =
  "140px minmax(0,1.4fr) minmax(0,1.2fr) 70px 70px 100px 110px"
// Staff ID · name · department+faculty · teaching · load · media · last active
const LECTURER_GRID =
  "120px minmax(0,1.3fr) minmax(0,1.3fr) minmax(0,1.1fr) 130px 80px 110px"

/**
 * The drawer's Students and Lecturers tabs, lifted from the draft.
 *
 * Both are read-only and say so: the institution owns its records, and the
 * console is looking at them, not editing them.
 *
 * The lecturer table shows platform facts only — staff number, department and
 * when they were last seen. No employment status, because the platform does
 * not manage institution staff and a column implying otherwise would invite
 * somebody to try.
 */
export function PeopleTab({
  tenantId,
  kind,
}: {
  tenantId: number
  kind: "students" | "lecturers"
}) {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")

  const { data, isPending } = useQuery({
    queryKey: ["platform", "directory", tenantId, kind, search],
    queryFn: () =>
      operationsService.directory(tenantId, {
        kind,
        ...(search.trim() ? { search: search.trim() } : {}),
        limit: 200,
      }),
    placeholderData: (previous) => previous,
  })

  const rows = (data?.data ?? []).filter(
    (p) => !status || (p.status ?? "").toUpperCase() === status
  )

  const statuses = Array.from(
    new Set((data?.data ?? []).map((p) => (p.status ?? "").toUpperCase()))
  ).filter(Boolean)

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 18,
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 22px 0",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--txt)" }}>
          {kind === "students" ? "Student roll" : "Lecturers"}
        </div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--txt3)" }}>
          Read-only — the institution owns its records
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 22px 0",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--panel)",
            border: "1px solid var(--line-strong)",
            borderRadius: 10,
            padding: "8px 12px",
            width: 240,
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--txt4)"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              kind === "students"
                ? "Search name, matric no, programme…"
                : "Search name, staff no, department…"
            }
            aria-label="Search"
            style={{
              flex: 1,
              minWidth: 0,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 12.5,
              color: "var(--txt)",
              fontFamily: "inherit",
            }}
          />
        </div>

        {kind === "students" && statuses.length > 0 && (
          <div
            style={{
              display: "flex",
              background: "var(--panel)",
              borderRadius: 10,
              padding: 3,
            }}
          >
            {["", ...statuses].map((s) => (
              <button
                key={s || "all"}
                type="button"
                onClick={() => setStatus(s)}
                style={{
                  fontSize: 12,
                  fontWeight: status === s ? 600 : 500,
                  color: status === s ? "var(--txt)" : "var(--txt3)",
                  background: status === s ? "var(--card)" : "transparent",
                  boxShadow: status === s ? "var(--shadow-sm)" : "none",
                  padding: "6px 11px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "inherit",
                }}
              >
                {s || "All"}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ overflowX: "auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              kind === "students" ? STUDENT_GRID : LECTURER_GRID,
            columnGap: 16,
            padding: "14px 22px 8px",
            fontSize: 10.5,
            letterSpacing: ".09em",
            color: "var(--txt4)",
            minWidth: kind === "students" ? 900 : 1040,
            boxSizing: "border-box",
          }}
        >
          {kind === "students" ? (
            <>
              <div>MATRIC NO</div>
              <div>NAME</div>
              <div>PROGRAMME</div>
              <div>LEVEL</div>
              <div>CGPA</div>
              <div>LAST ACTIVE</div>
              <div>STATUS</div>
            </>
          ) : (
            <>
              <div>STAFF ID</div>
              <div>NAME</div>
              <div>DEPARTMENT</div>
              <div>TEACHING</div>
              <div>STUDENT LOAD</div>
              <div>MEDIA</div>
              <div>LAST ACTIVE</div>
            </>
          )}
        </div>

        {data?.error && (
          <Empty tone="neg">
            This institution&apos;s database could not be read: {data.error}
          </Empty>
        )}

        {isPending && <Empty>Loading…</Empty>}

        {!isPending && !data?.error && rows.length === 0 && (
          <Empty>
            No {kind === "students" ? "students" : "lecturers"} match these
            filters.
          </Empty>
        )}

        {rows.map((p) => (
          <Row key={p.id} person={p} kind={kind} />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "11px 22px",
          borderTop: "1px solid var(--line2)",
          fontSize: 12,
          color: "var(--txt3)",
        }}
      >
        <div>
          {rows.length} shown
          {data && data.total > rows.length ? ` of ${data.total}` : ""}
        </div>
      </div>
    </div>
  )
}

function Row({
  person: p,
  kind,
}: {
  person: DirectoryPerson
  kind: "students" | "lecturers"
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: kind === "students" ? STUDENT_GRID : LECTURER_GRID,
        columnGap: 16,
        alignItems: "center",
        padding: "11px 22px",
        fontSize: 13,
        borderTop: "1px solid var(--line2)",
        minWidth: kind === "students" ? 900 : 1040,
        boxSizing: "border-box",
      }}
    >
      <div
        className="qhub-mono"
        style={{ fontSize: 11.5, color: "var(--txt3)" }}
      >
        {p.identifier ?? "—"}
      </div>

      <div
        style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}
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
          {initials(p.name)}
        </div>
        <div
          style={{
            fontWeight: 500,
            color: "var(--txt)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {p.name}
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
        {p.affiliation ?? "—"}
        {/* Faculty sits under the department, muted — a department name alone
            is ambiguous across a university of any size. */}
        {kind === "lecturers" && p.faculty !== null && (
          <div
            style={{
              fontSize: 11,
              color: "var(--txt4)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {p.faculty}
          </div>
        )}
      </div>

      {kind === "lecturers" && (
        <>
          <div style={{ minWidth: 0 }}>
            {p.teachingCount === null || p.teachingCount === 0 ? (
              <span style={{ color: "var(--txt4)" }}>—</span>
            ) : (
              <>
                <div style={{ fontSize: 12.5, color: "var(--txt2)" }}>
                  {p.teachingCount} course{p.teachingCount === 1 ? "" : "s"}
                </div>
                <div
                  className="qhub-mono"
                  style={{
                    fontSize: 11,
                    color: "var(--txt4)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {(p.teachingCodes ?? []).slice(0, 3).join(" · ")}
                  {(p.teachingCodes?.length ?? 0) > 3
                    ? ` +${(p.teachingCodes?.length ?? 0) - 3}`
                    : ""}
                </div>
              </>
            )}
          </div>

          <StudentLoad load={p.studentLoad} />

          <div
            className="qhub-mono"
            style={{
              fontSize: 12,
              color:
                p.mediaCount !== null && p.mediaCount > 0
                  ? "var(--txt2)"
                  : "var(--txt4)",
            }}
          >
            {p.mediaCount === null || p.mediaCount === 0 ? "—" : p.mediaCount}
          </div>
        </>
      )}

      {kind === "students" && (
        <>
          <div
            className="qhub-mono"
            style={{ fontSize: 11.5, color: "var(--txt3)" }}
          >
            {p.level ?? "—"}
          </div>
          <div
            className="qhub-mono"
            style={{ fontSize: 11.5, color: "var(--txt2)" }}
          >
            {p.cgpa === null ? "—" : p.cgpa.toFixed(2)}
          </div>
        </>
      )}

      <div style={{ fontSize: 12, color: "var(--txt3)" }}>
        {p.lastActive
          ? new Date(p.lastActive).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
            })
          : "never"}
      </div>

      {kind === "students" && (
        <div>
          {p.status && (
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 500,
                padding: "4px 9px",
                borderRadius: 7,
                ...statusTone(p.status),
              }}
            >
              {p.status}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return "—"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function statusTone(status: string) {
  const s = status.toUpperCase()

  if (s === "ACTIVE" || s === "ENROLLED") {
    return { color: "var(--accent)", background: "var(--accent-soft)" }
  }
  if (s === "GRADUATED") {
    return { color: "var(--txt3)", background: "var(--panel)" }
  }

  return { color: "var(--warn)", background: "var(--warn-bg)" }
}

function Empty({
  children,
  tone,
}: {
  children: React.ReactNode
  tone?: "neg"
}) {
  return (
    <div
      style={{
        padding: "26px 22px",
        borderTop: "1px solid var(--line2)",
        fontSize: 13,
        color: tone === "neg" ? "var(--neg)" : "var(--txt3)",
      }}
    >
      {children}
    </div>
  )
}

/**
 * How many students are in front of this lecturer.
 *
 * The bar is scaled against a ceiling rather than the biggest value on the
 * page: a relative bar makes the busiest person look saturated even when the
 * whole department is quiet, which is the opposite of what it is for.
 */
function StudentLoad({ load }: { load: number | null }) {
  if (load === null) {
    return <span style={{ color: "var(--txt4)" }}>—</span>
  }

  const CEILING = 2400
  const HEAVY = 1800

  const pct = Math.min(100, Math.round((load / CEILING) * 100))
  const heavy = load >= HEAVY

  return (
    <div style={{ minWidth: 0 }}>
      <div
        className="qhub-mono"
        style={{
          fontSize: 12,
          color: heavy ? "var(--series2)" : "var(--txt2)",
        }}
      >
        {load.toLocaleString()}
      </div>
      <div
        style={{
          height: 4,
          borderRadius: 999,
          background: "var(--panel)",
          marginTop: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: heavy ? "var(--series2)" : "var(--accent)",
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  )
}
