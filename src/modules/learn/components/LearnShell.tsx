"use client"

import { useTheme } from "next-themes"
import { useState, type ReactNode } from "react"

import "@/modules/learn/components/learn-tokens.css"

/**
 * The student app's shell, lifted from the bundle 24 canvas.
 *
 * Sidebar and top bar are one component because the canvas draws them as one
 * layout: a sticky 236px rail beside a fluid column, both inside a 22px gutter.
 * Splitting them would mean two components agreeing about that gutter forever.
 *
 * Drawn at 100%. The console carries a 0.8 zoom; this does not, so nothing
 * here divides by `--zoom`.
 */

export type LearnView =
  | "home"
  // A single course, opened from the rail: its own header and tab strip,
  // rather than the section heading the other views carry.
  | "course"
  | "lessons"
  | "live"
  | "disc"
  | "assess"
  | "medialib"
  | "grades"
  | "announce"
  | "msgs"

/** The nav, in the canvas's order, with its icon paths taken verbatim. */
const NAV: { key: LearnView; label: string; d: string }[] = [
  { key: "home", label: "Home", d: "M4 11l8-7 8 7M6 9v11h12V9" },
  {
    key: "lessons",
    label: "Courses",
    d: "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z",
  },
  {
    key: "live",
    label: "Live classes",
    d: "M23 7l-7 5 7 5V7zM14 5H3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z",
  },
  {
    key: "disc",
    label: "Discussions",
    d: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z",
  },
  {
    key: "assess",
    label: "Quizzes & exams",
    d: "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  },
  {
    key: "medialib",
    label: "Media library",
    d: "M3 5h18v14H3zM10 9.5l5 2.5-5 2.5z",
  },
  {
    key: "grades",
    label: "Grades",
    d: "M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z",
  },
  {
    key: "announce",
    label: "Announcements",
    d: "M3 11l18-8-4 16-6-4-3 4-1-6-4-2z",
  },
  {
    key: "msgs",
    label: "Messages",
    d: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10zM8 9h8M8 13h5",
  },
]

export type LearnCourse = {
  code: string
  percent: number
  /** The rail's colour dot — one per course, from the course itself. */
  dot: string
}

export type LearnNotice = { text: string; when: string }

export type LearnIdentity = {
  school: string
  host: string
  /** Two letters, as the canvas draws them — never a cropped photo. */
  schoolInitials: string
  name: string
  initials: string
  matric: string
  year: string
}

export function LearnShell({
  view,
  onNavigate,
  crumb,
  identity,
  courses,
  courseCode,
  onCourse,
  notices,
  badges,
  onSignOut,
  children,
}: {
  view: LearnView
  onNavigate: (view: LearnView) => void
  crumb: string
  identity: LearnIdentity
  courses: LearnCourse[]
  courseCode: string | null
  onCourse: (code: string) => void
  notices: LearnNotice[]
  /** Per-nav unread counts. A key absent means no badge, not a zero. */
  badges: Partial<Record<LearnView, number>>
  onSignOut: () => void
  children: ReactNode
}) {
  // next-themes rather than local state: the app already runs it, and it
  // writes the class before first paint, so nothing flashes the wrong theme.
  const { setTheme } = useTheme()
  const [bellOpen, setBellOpen] = useState(false)
  const [read, setRead] = useState(false)

  return (
    <div
      className="qhub-learn"
      style={{
        minHeight: "100vh",
        display: "flex",
        gap: 22,
        padding: 22,
        minWidth: 1400,
      }}
    >
      <aside
        style={{
          width: 236,
          flex: "0 0 236px",
          position: "sticky",
          top: 22,
          height: "calc(100vh - 44px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            padding: "6px 10px",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: "#0E2A55",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {identity.schoolInitials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 14.5,
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {identity.school}
            </div>
            <div
              className="learn-mono"
              style={{ fontSize: 10.5, color: "var(--txt3)" }}
            >
              {identity.host}
            </div>
          </div>
        </div>

        <RailLabel>STUDENT</RailLabel>

        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map((item) => {
            const on = view === item.key
            const n = badges[item.key]

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  padding: "11px 14px",
                  borderRadius: 13,
                  border: "none",
                  textAlign: "left",
                  width: "100%",
                  background: on ? "var(--card)" : "transparent",
                  boxShadow: on ? "var(--shadow-nav)" : "none",
                  fontSize: 14,
                  fontFamily: "inherit",
                  fontWeight: on ? 600 : 500,
                  color: on ? "var(--txt)" : "var(--txt2)",
                  cursor: "pointer",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ stroke: on ? "var(--accent)" : "var(--icon)" }}
                >
                  <path d={item.d} />
                </svg>
                {item.label}
                {/* A count only when there is something to count. Zero is not
                    news, and a badge showing 0 trains people to ignore it. */}
                {n !== undefined && n > 0 && (
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 10.5,
                      fontWeight: 600,
                      color: "var(--accent)",
                      background: "var(--accent-soft)",
                      padding: "2px 8px",
                      borderRadius: 999,
                    }}
                  >
                    {n}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <RailLabel>MY COURSES</RailLabel>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {courses.map((c) => {
            const on = courseCode === c.code

            return (
              <button
                key={c.code}
                type="button"
                onClick={() => onCourse(c.code)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 14px",
                  borderRadius: 13,
                  border: "none",
                  width: "100%",
                  textAlign: "left",
                  fontFamily: "inherit",
                  background: on ? "var(--card)" : "transparent",
                  boxShadow: on ? "var(--shadow-nav)" : "none",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 3,
                    background: c.dot,
                    flex: "0 0 8px",
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: on ? 600 : 500,
                      color: on ? "var(--txt)" : "var(--txt2)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {c.code}
                  </div>
                </div>
                <span
                  className="learn-mono"
                  style={{
                    marginLeft: "auto",
                    fontSize: 10,
                    color: "var(--txt4)",
                  }}
                >
                  {c.percent}%
                </span>
              </button>
            )
          })}
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "0 10px",
              fontSize: 10.5,
              color: "var(--txt4)",
            }}
          >
            Powered by
            {/* Both files rendered, CSS picks — see learn-tokens.css. */}
            {/* eslint-disable-next-line @next/next/no-img-element -- supplied GIF artwork, used verbatim */}
            <img
              src="/brand/qverse-lockup-color-dark.gif"
              alt="Qverse"
              className="learn-lockup-light"
              style={{ height: 14, width: "auto", opacity: 0.8 }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element -- supplied GIF artwork, used verbatim */}
            <img
              src="/brand/qverse-lockup-color-white.gif"
              alt="Qverse"
              className="learn-lockup-dark"
              style={{ height: 14, width: "auto", opacity: 0.8 }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 8px",
            }}
          >
            <div
              style={{
                display: "flex",
                padding: 4,
                background: "var(--card)",
                borderRadius: 999,
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <ThemeButton
                variant="light"
                label="Light theme"
                onClick={() => setTheme("light")}
              >
                <circle cx="12" cy="12" r="3.6" />
                <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" />
              </ThemeButton>
              <ThemeButton
                variant="dark"
                label="Dark theme"
                onClick={() => setTheme("dark")}
              >
                <path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z" />
              </ThemeButton>
            </div>
          </div>
        </div>
      </aside>

      <main
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: "1px solid var(--line-strong)",
            paddingBottom: 14,
          }}
        >
          <div style={{ fontSize: 13, color: "var(--txt3)" }}>{crumb}</div>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ position: "relative" }}>
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => setBellOpen((v) => !v)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  border: "none",
                  background: "var(--card)",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ stroke: "var(--icon)" }}
                >
                  <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" />
                </svg>
                {notices.length > 0 && !read && (
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: 7,
                      height: 7,
                      borderRadius: 999,
                      background: "var(--series2)",
                    }}
                  />
                )}
              </button>

              {bellOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    zIndex: 60,
                    width: 340,
                    background: "var(--surface-solid)",
                    border: "1px solid var(--line-strong)",
                    borderRadius: 14,
                    boxShadow: "var(--shadow-pop)",
                    padding: 8,
                  }}
                >
                  {/* The canvas designs no empty state for the bell. Rather
                      than invent copy for it, an empty list simply shows no
                      rows. Requested from Design. */}
                  {notices.length === 0
                    ? null
                    : notices.map((b, i) => (
                        <div
                          key={i}
                          style={{
                            padding: "10px 12px",
                            borderBottom: "1px solid var(--line)",
                            fontSize: 12.5,
                            lineHeight: 1.5,
                          }}
                        >
                          <div style={{ color: "var(--txt2)" }}>{b.text}</div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--txt4)",
                              marginTop: 3,
                            }}
                          >
                            {b.when}
                          </div>
                        </div>
                      ))}
                  <button
                    type="button"
                    onClick={() => {
                      setRead(true)
                      setBellOpen(false)
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      border: "none",
                      background: "transparent",
                      textAlign: "center",
                      fontSize: 12,
                      fontFamily: "inherit",
                      color: "var(--accent)",
                      padding: "9px 0 5px",
                      cursor: "pointer",
                    }}
                  >
                    Mark all read
                  </button>
                </div>
              )}
            </div>

            {/* The identity chip is the sign-out control, as in the canvas —
                there is nowhere else in the app to leave from. */}
            <button
              type="button"
              onClick={onSignOut}
              title="Sign out"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                background: "var(--card)",
                boxShadow: "var(--shadow-sm)",
                borderRadius: 11,
                padding: "6px 12px 6px 6px",
                cursor: "pointer",
                border: "none",
                fontFamily: "inherit",
                textAlign: "left",
                color: "var(--txt)",
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10.5,
                  fontWeight: 600,
                }}
              >
                {identity.initials}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500 }}>
                  {identity.name}
                </div>
                <div style={{ fontSize: 10.5, color: "var(--txt4)" }}>
                  {identity.matric} · {identity.year}
                </div>
              </div>
            </button>
          </div>
        </div>

        {children}
      </main>
    </div>
  )
}

function RailLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10.5,
        letterSpacing: ".1em",
        color: "var(--txt4)",
        padding: "18px 14px 8px",
      }}
    >
      {children}
    </div>
  )
}

function ThemeButton({
  variant,
  label,
  onClick,
  children,
}: {
  variant: "light" | "dark"
  label: string
  onClick: () => void
  children: ReactNode
}) {
  /*
   * No `on` prop, and no colour decided here.
   *
   * Which button is lit depends on the theme, and the theme is not known on
   * the server — so deriving it in the component means rendering one state
   * server-side and the other on the client. That is a hydration mismatch and
   * a visible flash. The class is stable in both places and CSS lights the
   * right one; see learn-tokens.css.
   */
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={variant === "light" ? "learn-theme-light" : "learn-theme-dark"}
      style={{
        width: 34,
        height: 34,
        borderRadius: 999,
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        padding: 0,
      }}
    >
      <svg
        width={variant === "light" ? 16 : 15}
        height={variant === "light" ? 16 : 15}
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </button>
  )
}
