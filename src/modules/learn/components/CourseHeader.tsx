"use client"

import type { Course } from "@/modules/learn/types"

/**
 * The course view's header and tab strip, lifted from the bundle 25 canvas.
 *
 * Opening a course from the rail is a different thing from browsing Lessons:
 * the section heading gives way to the course itself, and the tabs scope
 * Lessons, Media and My grades to that one course. The canvas swaps them —
 * `crsHeadOn` is `view === "course"`, `secHeadOn` is everything else — so only
 * one of the two ever shows.
 *
 * The lecturer's name carries a Message link, because the question a course
 * page provokes is usually for them.
 */

export type CourseTab = "lessons" | "media" | "grades"

const TABS: [CourseTab, string][] = [
  ["lessons", "Lessons"],
  ["media", "Media"],
  ["grades", "My grades"],
]

export function CourseHeader({
  course,
  tab,
  onTab,
  onMessageLecturer,
}: {
  course: Course
  tab: CourseTab
  onTab: (tab: CourseTab) => void
  onMessageLecturer: () => void
}) {
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
          height: 88,
          background: "linear-gradient(120deg, #174C99, #4A84D6)",
          padding: "18px 24px",
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <div>
          <span
            className="learn-mono"
            style={{
              fontSize: 10,
              letterSpacing: ".07em",
              color: "#fff",
              background: "rgba(255,255,255,.18)",
              padding: "3px 9px",
              borderRadius: 999,
            }}
          >
            {course.code}
          </span>
          <div
            style={{
              fontSize: 19,
              fontWeight: 600,
              color: "#fff",
              marginTop: 6,
              textShadow: "0 1px 8px rgba(8,12,18,.3)",
            }}
          >
            {course.title}
          </div>
        </div>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "rgba(255,255,255,.9)",
            fontSize: 12,
          }}
        >
          {course.lecturer} ·{" "}
          <button
            type="button"
            onClick={onMessageLecturer}
            style={{
              textDecoration: "underline",
              cursor: "pointer",
              border: "none",
              background: "transparent",
              color: "inherit",
              fontFamily: "inherit",
              fontSize: 12,
              padding: 0,
            }}
          >
            Message
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "8px 16px",
          borderTop: "1px solid var(--line)",
        }}
      >
        {TABS.map(([key, label]) => {
          const on = tab === key

          return (
            <button
              key={key}
              type="button"
              onClick={() => onTab(key)}
              style={{
                fontSize: 13,
                fontWeight: on ? 600 : 400,
                color: on ? "var(--txt)" : "var(--txt3)",
                background: on ? "var(--panel)" : "transparent",
                padding: "8px 15px",
                borderRadius: 10,
                cursor: "pointer",
                border: "none",
                fontFamily: "inherit",
              }}
            >
              {label}
            </button>
          )
        })}

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: 180,
          }}
        >
          <div
            style={{
              flex: 1,
              height: 5,
              borderRadius: 999,
              background: "var(--panel)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${course.percent}%`,
                background: "var(--accent)",
              }}
            />
          </div>
          <span
            className="learn-mono"
            style={{ fontSize: 10.5, color: "var(--txt3)" }}
          >
            {course.percent}%
          </span>
        </div>
      </div>
    </div>
  )
}
