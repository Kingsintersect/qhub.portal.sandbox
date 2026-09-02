"use client"

import { useState } from "react"

import { KIND_ICON, KIND_TONE, type ContentKind } from "@/modules/learn/types"

/**
 * Everything delivered to this student's level, lifted from the bundle 25
 * canvas.
 *
 * Resume state is carried per item — "watched to 48:20", "page 21 of 34" —
 * because the question somebody opens this page with is where they got to,
 * not what exists.
 */

export type MediaItem = {
  kind: ContentKind
  type: "Video" | "Audio" | "PDF"
  course: string
  title: string
  /** "1h 42m · Dr. F. Adeyemi · Week 6" */
  meta: string
  /** Where you got to: "watched to 48:20", "not started", "page 12 of 12". */
  progress: string
  when: string
}

const TYPES = ["All", "Video", "Audio", "PDF"] as const

export function MediaLibrary({
  items,
  courses,
}: {
  items: MediaItem[]
  courses: string[]
}) {
  const [course, setCourse] = useState("All courses")
  const [type, setType] = useState<(typeof TYPES)[number]>("All")
  const [grid, setGrid] = useState(false)

  const shown = items.filter(
    (m) =>
      (course === "All courses" || m.course === course) &&
      (type === "All" || m.type === type)
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
          gap: 12,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Media library</div>
          {/* That opening an item is logged is said here rather than
              discovered — it is a fact about being watched, and the person
              being watched should be the one told. */}
          <div style={{ fontSize: 12, color: "var(--txt3)", marginTop: 2 }}>
            Everything delivered to your level — video, audio and documents ·
            opening an item is logged
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
          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line-strong)",
              borderRadius: 10,
              padding: "8px 12px",
              fontSize: 12.5,
              color: "var(--txt)",
              fontFamily: "inherit",
              outline: "none",
            }}
          >
            {["All courses", ...courses].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div style={{ display: "flex", gap: 6 }}>
            {TYPES.map((t) => {
              const on = type === t

              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    padding: "7px 12px",
                    borderRadius: 9,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    color: on ? "var(--accent)" : "var(--txt3)",
                    background: on ? "var(--accent-soft)" : "transparent",
                    border: `1px solid ${on ? "var(--accent-brd)" : "var(--line-strong)"}`,
                  }}
                >
                  {t}
                </button>
              )
            })}
          </div>

          <div
            style={{
              display: "flex",
              border: "1px solid var(--line-strong)",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <ViewButton on={!grid} onClick={() => setGrid(false)} label="List">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </ViewButton>
            <ViewButton
              on={grid}
              onClick={() => setGrid(true)}
              label="Grid"
              bordered
            >
              <rect x="4" y="4" width="6.5" height="6.5" />
              <rect x="13.5" y="4" width="6.5" height="6.5" />
              <rect x="4" y="13.5" width="6.5" height="6.5" />
              <rect x="13.5" y="13.5" width="6.5" height="6.5" />
            </ViewButton>
          </div>
        </div>
      </div>

      {shown.length === 0 && (
        <div
          style={{
            fontSize: 12.5,
            color: "var(--txt3)",
            padding: "20px 0",
          }}
        >
          Nothing here for that course and type.
        </div>
      )}

      {!grid &&
        shown.map((m, i) => {
          const [tileBg, tileTone] = KIND_TONE[m.kind]

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 13,
                padding: "12px 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <Tile background={tileBg} stroke={tileTone} kind={m.kind} />

              <div style={{ minWidth: 0, flex: 1 }}>
                <button
                  type="button"
                  style={{
                    fontSize: 13.5,
                    fontWeight: 500,
                    color: "var(--accent)",
                    cursor: "pointer",
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    fontFamily: "inherit",
                    textAlign: "left",
                  }}
                >
                  {m.title}
                </button>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--txt4)",
                    marginTop: 2,
                  }}
                >
                  {m.meta}
                </div>
              </div>

              <div
                className="learn-mono"
                style={{ fontSize: 11, color: "var(--txt4)" }}
              >
                {m.course}
              </div>
              <div style={{ fontSize: 11.5, color: tileTone, width: 54 }}>
                {m.type}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--txt3)", width: 130 }}>
                {m.progress}
              </div>
              <div style={{ fontSize: 11, color: "var(--txt4)", width: 54 }}>
                {m.when}
              </div>
            </div>
          )
        })}

      {grid && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
          }}
        >
          {shown.map((m, i) => {
            const [tileBg, tileTone] = KIND_TONE[m.kind]

            return (
              <div
                key={i}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: 96,
                    background: tileBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={tileTone}
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={KIND_ICON[m.kind]} />
                  </svg>
                </div>
                <div style={{ padding: "11px 13px" }}>
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: "var(--accent)",
                    }}
                  >
                    {m.title}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--txt4)",
                      marginTop: 3,
                    }}
                  >
                    {m.course} · {m.progress}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Tile({
  background,
  stroke,
  kind,
}: {
  background: string
  stroke: string
  kind: ContentKind
}) {
  return (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "0 0 34px",
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={KIND_ICON[kind]} />
      </svg>
    </div>
  )
}

function ViewButton({
  on,
  onClick,
  label,
  bordered,
  children,
}: {
  on: boolean
  onClick: () => void
  label: string
  bordered?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 500,
        padding: "7px 12px",
        cursor: "pointer",
        fontFamily: "inherit",
        border: "none",
        borderLeft:
          bordered === true ? "1px solid var(--line-strong)" : undefined,
        color: on ? "var(--accent)" : "var(--txt3)",
        background: on ? "var(--accent-soft)" : "transparent",
      }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      >
        {children}
      </svg>
      {label}
    </button>
  )
}
