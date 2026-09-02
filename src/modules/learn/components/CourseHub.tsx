"use client"

import { useState } from "react"

import {
  KIND_ICON,
  KIND_TONE,
  type Course,
  type CourseModule,
  type ModuleItem,
} from "@/modules/learn/types"

/**
 * The course hub: the rail of courses on the left, the selected course's
 * modules on the right.
 *
 * The canvas serves Courses, Live classes, Discussions and Quizzes from this
 * one layout with the right pane swapped, rather than four pages that each
 * rebuild the rail. This component is the Courses pane; the others will hang
 * off the same hub.
 */

export function CourseHub({
  courses,
  selected,
  onSelect,
  onOpenModule,
  onOpenItem,
}: {
  courses: Course[]
  selected: Course
  onSelect: (code: string) => void
  onOpenModule: (module: CourseModule) => void
  onOpenItem: (item: ModuleItem) => void
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "270px 1fr",
        gap: 16,
        alignItems: "start",
      }}
    >
      <div
        style={{
          background: "var(--card)",
          borderRadius: 20,
          boxShadow: "var(--shadow-card)",
          padding: 12,
        }}
      >
        <div
          style={{
            fontSize: 10.5,
            letterSpacing: ".1em",
            color: "var(--txt4)",
            padding: "6px 10px 8px",
          }}
        >
          MY COURSES
        </div>
        {courses.map((c) => {
          const on = c.code === selected.code

          return (
            <button
              key={c.code}
              type="button"
              onClick={() => onSelect(c.code)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "11px 12px",
                borderRadius: 13,
                width: "100%",
                textAlign: "left",
                fontFamily: "inherit",
                background: on ? "var(--accent-soft)" : "transparent",
                border: `1px solid ${on ? "var(--accent-brd)" : "transparent"}`,
                cursor: "pointer",
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 3,
                  background: c.dot,
                  flex: "0 0 9px",
                }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: on ? 600 : 500,
                    color: on ? "var(--accent)" : "var(--txt)",
                  }}
                >
                  {c.code}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--txt4)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {c.title}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 3,
                }}
              >
                <span
                  className="learn-mono"
                  style={{ fontSize: 10, color: "var(--txt4)" }}
                >
                  {c.percent}%
                </span>
                <Bar width={44} height={4} percent={c.percent} />
              </div>
            </button>
          )
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            background: "var(--card)",
            borderRadius: 20,
            boxShadow: "var(--shadow-card)",
            padding: "16px 20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {selected.title}
            </div>
            <div style={{ fontSize: 12, color: "var(--txt3)" }}>
              {selected.meta}
            </div>
            <div
              className="learn-mono"
              style={{
                marginLeft: "auto",
                fontSize: 15,
                fontWeight: 600,
                color: "var(--accent)",
              }}
            >
              {selected.percent}%
            </div>
          </div>
          <div
            style={{
              height: 7,
              borderRadius: 999,
              background: "var(--panel)",
              overflow: "hidden",
              marginTop: 10,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${selected.percent}%`,
                background:
                  "linear-gradient(90deg, var(--accent), var(--series2))",
                transition: "width .3s",
              }}
            />
          </div>
          {/* What is left, in words. A bar says how far; this says what. */}
          <div style={{ fontSize: 11, color: "var(--txt4)", marginTop: 6 }}>
            {selected.note}
          </div>
        </div>

        {selected.modules.map((m) => (
          <ModuleRow
            key={m.n}
            module={m}
            onOpenModule={() => onOpenModule(m)}
            onOpenItem={onOpenItem}
          />
        ))}
      </div>
    </div>
  )
}

function ModuleRow({
  module,
  onOpenModule,
  onOpenItem,
}: {
  module: CourseModule
  onOpenModule: () => void
  onOpenItem: (item: ModuleItem) => void
}) {
  // The first module with work left opens by default, which is where somebody
  // returning to a course is nearly always going.
  const [open, setOpen] = useState(module.percent > 0 && module.percent < 100)

  const complete = module.percent === 100

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 20,
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 13,
          padding: "15px 22px",
        }}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 13,
            flex: 1,
            minWidth: 0,
            border: "none",
            background: "transparent",
            padding: 0,
            fontFamily: "inherit",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          <div
            className="learn-mono"
            style={{
              width: 30,
              height: 30,
              borderRadius: 999,
              background: complete ? "var(--accent)" : "var(--panel)",
              color: complete ? "#fff" : "var(--txt3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10.5,
              fontWeight: 600,
              flex: "0 0 30px",
            }}
          >
            {module.n}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            {/* The title opens the module's own page; the row opens the
                accordion. Two different things, so two different targets. */}
            <span
              role="link"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                onOpenModule()
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  e.stopPropagation()
                  onOpenModule()
                }
              }}
              style={{
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {module.title}
            </span>
            <div
              style={{
                fontSize: 11.5,
                color: "var(--txt4)",
                marginTop: 2,
              }}
            >
              {module.meta}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: 140,
            }}
          >
            <Bar percent={module.percent} height={4} grow />
            <span
              className="learn-mono"
              style={{ fontSize: 10, color: "var(--txt4)" }}
            >
              {module.percent}%
            </span>
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--txt4)"
            strokeWidth={2}
            strokeLinecap="round"
            style={{
              transform: `rotate(${open ? 180 : 0}deg)`,
              transition: "transform .2s",
            }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      {open && (
        <div
          style={{
            borderTop: "1px solid var(--line)",
            padding: "6px 22px 12px",
          }}
        >
          {module.items.map((a, i) => {
            const [tileBg, tileTone] = KIND_TONE[a.kind]

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 13,
                  padding: "11px 0",
                  borderBottom:
                    i === module.items.length - 1
                      ? "none"
                      : "1px solid var(--line2)",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: tileBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "0 0 32px",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={tileTone}
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={KIND_ICON[a.kind]} />
                  </svg>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <button
                    type="button"
                    onClick={() => onOpenItem(a)}
                    style={{
                      fontSize: 13,
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
                    {a.title}
                  </button>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--txt4)",
                      marginTop: 2,
                    }}
                  >
                    {a.meta}
                  </div>
                </div>
                {a.badge && (
                  <span
                    className="learn-mono"
                    style={{
                      fontSize: 9.5,
                      letterSpacing: ".07em",
                      padding: "3px 9px",
                      borderRadius: 999,
                      color: a.badge.tone,
                      background: a.badge.background,
                    }}
                  >
                    {a.badge.text}
                  </span>
                )}
                {/* Done is a filled tick; not-done is an empty ring, never a
                    cross — nothing here has been failed. */}
                {a.done ? (
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 999,
                      background: "var(--accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: "0 0 18px",
                    }}
                  >
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 12.5l5 5L20 7" />
                    </svg>
                  </div>
                ) : (
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 999,
                      border: "1.5px solid var(--line-strong)",
                      flex: "0 0 18px",
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Bar({
  percent,
  height,
  width,
  grow,
}: {
  percent: number
  height: number
  width?: number
  grow?: boolean
}) {
  return (
    <div
      style={{
        width,
        flex: grow ? 1 : undefined,
        height,
        borderRadius: 999,
        background: "var(--panel)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.min(100, Math.max(0, percent))}%`,
          background: "var(--accent)",
        }}
      />
    </div>
  )
}
