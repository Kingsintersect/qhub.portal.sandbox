"use client"

import { useState, type ReactNode } from "react"
import { useTheme } from "next-themes"

import "./portal-tokens.css"
import {
  NAV_ADMIN,
  NAV_LECTURER,
  type PortalNotice,
  type PortalRole,
  type PortalView,
} from "@/modules/portal/types"

/**
 * The institution portal's frame, lifted from the bundle 25 canvas.
 *
 * One shell, two roles. The nav set, the role tag and the crumb all come from
 * the role rather than from a permission check inside each screen, so a
 * lecturer is never shown a door that then refuses them.
 */

export function PortalShell({
  role,
  view,
  onNavigate,
  identity,
  notices,
  badges,
  onSignOut,
  children,
}: {
  role: PortalRole
  view: PortalView
  onNavigate: (view: PortalView) => void
  identity: {
    school: string
    host: string
    /** Two letters, as the canvas draws them — never a cropped photo. */
    schoolInitials: string
    name: string
  }
  notices: PortalNotice[]
  /** Per-nav counts. A key absent means no badge, not a zero. */
  badges: Partial<Record<PortalView, number>>
  onSignOut: () => void
  children: ReactNode
}) {
  // next-themes rather than local state: the app already runs it, and it
  // writes the class before first paint, so nothing flashes the wrong theme.
  const { setTheme } = useTheme()
  const [bellOpen, setBellOpen] = useState(false)
  const [read, setRead] = useState(false)

  const nav = role === "admin" ? NAV_ADMIN : NAV_LECTURER
  const here = nav.find((n) => n.view === view) ?? nav[0]!
  const initials = identity.name
    .split(" ")
    .map((x) => x[0])
    .join("")
    .replace(".", "")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="qhub-portal"
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--txt)",
        display: "flex",
        gap: 22,
        padding: 22,
        // The canvas's own floor. This is a desktop console: below it the
        // tables stop being readable, so it scrolls rather than reflows.
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
              flex: "0 0 38px",
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
              className="portal-mono"
              style={{ fontSize: 10.5, color: "var(--txt3)" }}
            >
              {identity.host}
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: 10.5,
            letterSpacing: ".1em",
            color: "var(--txt4)",
            padding: "18px 14px 8px",
          }}
        >
          {role === "admin" ? "INSTITUTION ADMIN" : "LECTURER"}
        </div>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflowY: "auto",
          }}
        >
          {nav.map((n) => {
            const on = view === n.view
            const badge = badges[n.view]

            return (
              <button
                key={n.view}
                type="button"
                onClick={() => onNavigate(n.view)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  padding: "11px 14px",
                  borderRadius: 13,
                  background: on ? "var(--card)" : "transparent",
                  boxShadow: on ? "var(--shadow-nav)" : "none",
                  fontSize: 14,
                  fontWeight: on ? 600 : 400,
                  color: on ? "var(--txt)" : "var(--txt2)",
                  cursor: "pointer",
                  border: "none",
                  fontFamily: "inherit",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={on ? "var(--accent)" : "var(--icon)"}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flex: "0 0 16px" }}
                >
                  <path d={n.d} />
                </svg>
                {n.label}
                {badge !== undefined && badge > 0 && (
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
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

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
            {/* Both files are in the markup and CSS picks, so the wrong
                lockup never paints for a frame. */}
            {/* eslint-disable-next-line @next/next/no-img-element -- supplied GIF artwork, used verbatim */}
            <img
              src="/brand/qverse-lockup-color-dark.gif"
              alt="Qverse"
              className="portal-lockup-light"
              style={{ height: 14, width: "auto", opacity: 0.8 }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element -- supplied GIF artwork, used verbatim */}
            <img
              src="/brand/qverse-lockup-color-white.gif"
              alt="Qverse"
              className="portal-lockup-dark"
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
              {/* Both render identically and CSS lights the active one. A
                  toggle that reads resolvedTheme during render is light-active
                  on the server and dark-active on the client — a hydration
                  mismatch, and a visible flash of the wrong state. */}
              <ThemeButton
                variant="light"
                onClick={() => setTheme("light")}
                label="Light theme"
              >
                <circle cx="12" cy="12" r="3.6" />
                <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" />
              </ThemeButton>
              <ThemeButton
                variant="dark"
                onClick={() => setTheme("dark")}
                label="Dark theme"
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
          <div style={{ fontSize: 13, color: "var(--txt3)" }}>
            {identity.school} · {here.label}
          </div>

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
                  background: "var(--card)",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  position: "relative",
                  border: "none",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--icon)"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" />
                </svg>
                {!read && (
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
                  {notices.slice(0, 6).map((b, i) => (
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
                      width: "100%",
                      textAlign: "center",
                      fontSize: 12,
                      color: "var(--accent)",
                      padding: "9px 0 5px",
                      cursor: "pointer",
                      border: "none",
                      background: "transparent",
                      fontFamily: "inherit",
                    }}
                  >
                    Mark all read
                  </button>
                </div>
              )}
            </div>

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
                  flex: "0 0 26px",
                }}
              >
                {initials}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--txt)",
                  }}
                >
                  {identity.name}
                </div>
                <div style={{ fontSize: 10.5, color: "var(--txt4)" }}>
                  {role === "admin" ? "Institution admin" : "Computer Science"}
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

function ThemeButton({
  variant,
  onClick,
  label,
  children,
}: {
  variant: "light" | "dark"
  onClick: () => void
  label: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={
        variant === "light" ? "portal-theme-light" : "portal-theme-dark"
      }
      style={{
        width: 34,
        height: 34,
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        border: "none",
      }}
    >
      <svg
        width="16"
        height="16"
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
