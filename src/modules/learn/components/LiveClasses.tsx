"use client"

import { useState } from "react"

import { KIND_ICON, KIND_TONE } from "@/modules/learn/types"

/**
 * Live classes, lifted from the bundle 25 canvas.
 *
 * Four states in one list, and the distinctions carry weight: a recording is
 * not attendance, and a class you can see is not always one you can join yet.
 */

export type LiveClass = {
  title: string
  meta: string
  badge: "LIVE NOW" | "UPCOMING" | "PRESENT" | "ABSENT"
  /** Present when there is a join, even if it is not open yet. */
  join?: { label: string; open: boolean }
  /** A past class with a recording to watch. */
  recording?: boolean
}

const BADGE_TONE: Record<LiveClass["badge"], [string, string]> = {
  "LIVE NOW": ["var(--neg)", "var(--neg-bg)"],
  UPCOMING: ["var(--accent)", "var(--accent-soft)"],
  PRESENT: ["var(--accent)", "var(--accent-soft)"],
  ABSENT: ["var(--neg)", "var(--neg-bg)"],
}

export function LiveClasses({
  classes,
  attendancePercent,
  attendanceNote,
}: {
  classes: LiveClass[]
  attendancePercent: number
  /** "9 of 11 classes · counts 10% of your grade" */
  attendanceNote: string
}) {
  const [joining, setJoining] = useState<string | null>(null)

  const [tileBg, tileTone] = KIND_TONE.live

  return (
    <>
      <div
        style={{
          background: "var(--card)",
          borderRadius: 20,
          boxShadow: "var(--shadow-card)",
          padding: "20px 22px",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
          Live classes
        </div>
        {/* The two rules that decide whether a class counts, said before the
            list rather than discovered afterwards. */}
        <div style={{ fontSize: 11.5, color: "var(--txt4)", marginBottom: 12 }}>
          Zoom · the join link appears 15 minutes before · you count present
          after 10 minutes in the room
        </div>

        {classes.map((l, i) => {
          const [tone, background] = BADGE_TONE[l.badge]

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
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: tileBg,
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
                  stroke={tileTone}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={KIND_ICON.live} />
                </svg>
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{l.title}</div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--txt4)",
                    marginTop: 2,
                  }}
                >
                  {l.meta}
                </div>
              </div>

              {/* A join that is not open yet is shown, not hidden: knowing it
                  opens at 09:45 is the answer to "can I get in?". */}
              {l.join !== undefined &&
                (l.join.open ? (
                  <button
                    type="button"
                    onClick={() => setJoining(l.title)}
                    style={{
                      background: "var(--accent)",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 500,
                      fontFamily: "inherit",
                      border: "none",
                      padding: "8px 15px",
                      borderRadius: 9,
                      cursor: "pointer",
                    }}
                  >
                    {l.join.label}
                  </button>
                ) : (
                  <div
                    style={{
                      border: "1px solid var(--line-strong)",
                      color: "var(--txt4)",
                      fontSize: 12,
                      fontWeight: 500,
                      padding: "8px 15px",
                      borderRadius: 9,
                    }}
                  >
                    {l.join.label}
                  </div>
                ))}

              {l.recording === true && (
                <button
                  type="button"
                  style={{
                    border: "1px solid var(--line-strong)",
                    background: "transparent",
                    color: "var(--txt2)",
                    fontSize: 12,
                    fontWeight: 500,
                    fontFamily: "inherit",
                    padding: "8px 15px",
                    borderRadius: 9,
                    cursor: "pointer",
                  }}
                >
                  Watch recording
                </button>
              )}

              <span
                className="learn-mono"
                style={{
                  fontSize: 9.5,
                  letterSpacing: ".07em",
                  padding: "4px 10px",
                  borderRadius: 999,
                  color: tone,
                  background,
                }}
              >
                {l.badge}
              </span>
            </div>
          )
        })}

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            marginTop: 14,
            background: "var(--panel)",
            borderRadius: 12,
            padding: "12px 16px",
          }}
        >
          <div style={{ fontSize: 12.5, color: "var(--txt2)" }}>
            Your attendance this semester
          </div>
          <div
            className="learn-mono"
            style={{
              marginLeft: "auto",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--accent)",
            }}
          >
            {attendancePercent}%
          </div>
          <div style={{ fontSize: 11, color: "var(--txt4)" }}>
            {attendanceNote}
          </div>
        </div>
      </div>

      {joining !== null && (
        <JoinDialog title={joining} onClose={() => setJoining(null)} />
      )}
    </>
  )
}

/**
 * What joining commits you to.
 *
 * The rules are stated before the click rather than after: renaming yourself
 * in the room is how attendance gets lost, and ten minutes is the threshold
 * somebody leaving early needs to know about beforehand.
 */
function JoinDialog({
  title,
  onClose,
}: {
  title: string
  onClose: () => void
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(8,12,18,.45)",
        }}
      />
      <div
        role="dialog"
        aria-label="Join live class"
        style={{
          position: "relative",
          width: 460,
          maxWidth: "94vw",
          background: "var(--surface-solid)",
          border: "1px solid var(--line-strong)",
          borderRadius: 18,
          boxShadow: "0 30px 80px rgba(8,12,18,.35)",
          padding: 24,
          color: "var(--txt)",
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
        <div
          style={{
            fontSize: 12.5,
            color: "var(--txt3)",
            marginTop: 8,
            lineHeight: 1.6,
          }}
        >
          Join under your matric number — no renaming. You are marked present
          after 10 minutes in the room.
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 20,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "1px solid var(--line-strong)",
              background: "transparent",
              color: "var(--txt2)",
              fontSize: 12.5,
              fontFamily: "inherit",
              padding: "9px 16px",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              fontSize: 12.5,
              fontWeight: 500,
              fontFamily: "inherit",
              padding: "9px 18px",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            Join on Zoom
          </button>
        </div>
      </div>
    </div>
  )
}
