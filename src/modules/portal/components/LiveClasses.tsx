"use client"

import type { LiveClass } from "@/modules/portal/seed"

/**
 * A lecturer's live classes, lifted from the bundle 25 canvas.
 *
 * Both notes on this screen are about where attendance comes from: Zoom's
 * participant log, present after ten minutes in the room, never edited by
 * hand. It feeds a graded component, so a lecturer asked to "just mark them
 * present" needs the screen to be the one saying no.
 */

const GRID = "90px minmax(0,1.8fr) 150px 70px 110px 170px"

const STATUS: Record<LiveClass["status"], [string, string]> = {
  SCHEDULED: ["var(--accent)", "var(--accent-soft)"],
  LIVE: ["var(--neg)", "var(--neg-bg)"],
  ENDED: ["var(--txt3)", "var(--panel)"],
}

export function LiveClasses({
  classes,
  onSchedule,
}: {
  classes: LiveClass[]
  onSchedule: () => void
}) {
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
          <div style={{ fontSize: 15, fontWeight: 600 }}>Live classes</div>
          <div style={{ fontSize: 12, color: "var(--txt3)", marginTop: 2 }}>
            Meetings run on the institution&apos;s Zoom integration · attendance
            comes from Zoom&apos;s participant log — present after 10 minutes in
            the room
          </div>
        </div>
        <button
          type="button"
          onClick={onSchedule}
          style={{
            marginLeft: "auto",
            background: "var(--accent)",
            color: "#fff",
            fontSize: 12.5,
            fontWeight: 500,
            padding: "9px 16px",
            borderRadius: 10,
            cursor: "pointer",
            border: "none",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          Schedule live class
        </button>
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
        <div>COURSE</div>
        <div>TITLE</div>
        <div>WHEN</div>
        <div>LENGTH</div>
        <div>STATUS</div>
        <div>ATTENDANCE</div>
      </div>

      {classes.map((l, i) => {
        const [sTone, sBg] = STATUS[l.status]
        // Three bands rather than a single accent: 75 and up reads as fine,
        // the sixties as worth a look, below that as a problem.
        const tone =
          l.att === null
            ? "var(--txt4)"
            : l.att >= 75
              ? "var(--accent)"
              : l.att >= 60
                ? "var(--series2)"
                : "var(--neg)"

        return (
          <div
            key={`${l.title}-${i}`}
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
              className="portal-mono"
              style={{ fontSize: 11.5, fontWeight: 500 }}
            >
              {l.course}
            </div>
            <div
              style={{
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {l.title}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>{l.when}</div>
            <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>{l.dur}</div>
            <div>
              <span
                className="portal-mono"
                style={{
                  fontSize: 9.5,
                  letterSpacing: ".07em",
                  padding: "3px 9px",
                  borderRadius: 999,
                  color: sTone,
                  background: sBg,
                }}
              >
                {l.status}
              </span>
            </div>

            <div>
              {/* A class that has not happened has no attendance — the cell
                  stays empty rather than showing a 0% nobody earned. */}
              {l.att !== null && (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 8,
                      fontSize: 12.5,
                    }}
                  >
                    <span style={{ fontWeight: 600, color: tone }}>
                      {l.att}%
                    </span>
                    <span style={{ fontSize: 11, color: "var(--txt4)" }}>
                      {l.present}
                    </span>
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
                        width: `${l.att}%`,
                        background: tone,
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )
      })}

      <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 12 }}>
        Attendance feeds the gradebook&apos;s attendance component and the
        estate&apos;s engagement metrics — it is never edited by hand.
      </div>
    </div>
  )
}
