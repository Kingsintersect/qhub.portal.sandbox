"use client"

import { useState } from "react"

import { Modal } from "@/modules/portal/components/Modal"

/**
 * Scheduling a live class, lifted from the bundle 25 canvas.
 *
 * The subtitle spells out everything the button sets in motion — a Zoom
 * meeting is created, the join link posts to Moodle, students are reminded 15
 * minutes before, and attendance will come from the participant log. Four
 * consequences from one click is exactly the case for saying them first.
 */

const TIMES = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"]
const LENGTHS = ["30m", "45m", "1h", "2h"]

export function ScheduleLiveClass({
  courses,
  host,
  onClose,
  onSchedule,
}: {
  courses: string[]
  host: string
  onClose: () => void
  onSchedule: (c: {
    course: string
    title: string
    when: string
    dur: string
    host: string
  }) => void
}) {
  const [title, setTitle] = useState("")
  const [course, setCourse] = useState<string | null>(null)
  const [day, setDay] = useState<number | null>(null)
  const [time, setTime] = useState<string | null>(null)
  const [dur, setDur] = useState<string | null>(null)

  const ready =
    title.trim().length > 2 &&
    course !== null &&
    day !== null &&
    time !== null &&
    dur !== null

  const when = `Sep ${day}${time !== null ? ` · ${time}` : ""}`

  return (
    <Modal onClose={onClose} width={500} label="Schedule a live class">
      <div style={{ fontSize: 17, fontWeight: 600 }}>Schedule a live class</div>
      <div
        style={{
          fontSize: 12.5,
          color: "var(--txt3)",
          margin: "4px 0 18px",
        }}
      >
        Creates the meeting through the institution&apos;s Zoom integration —
        the join link posts to the course&apos;s Moodle page, students are
        reminded 15 minutes before, and attendance comes from Zoom&apos;s
        participant log.
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title — e.g. Trees and heaps, live walkthrough"
        style={{ ...FIELD, marginBottom: 12 }}
      />

      <Label>Course</Label>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {courses.map((c) => (
          <Chip
            key={c}
            label={c}
            mono
            active={course === c}
            onClick={() => setCourse(c)}
          />
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 16,
          marginBottom: 12,
        }}
      >
        <div>
          <div
            style={{ display: "flex", alignItems: "baseline", marginBottom: 8 }}
          >
            <div style={{ fontSize: 12, color: "var(--txt3)" }}>Date</div>
            <div
              className="portal-mono"
              style={{
                marginLeft: "auto",
                fontSize: 11,
                color: "var(--txt4)",
              }}
            >
              SEPTEMBER 2026
            </div>
          </div>

          <div
            className="portal-mono"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 2,
              fontSize: 9.5,
              color: "var(--txt4)",
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            {["MO", "TU", "WE", "TH", "FR", "SA", "SU"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 2,
            }}
          >
            {/* September 2026 opens on a Wednesday, so two cells are blank
                before the 1st — the canvas's own offset. */}
            {[0, 1].map((i) => (
              <div key={`pad${i}`} />
            ))}
            {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => {
              const on = day === d

              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDay(d)}
                  style={{
                    textAlign: "center",
                    fontSize: 11.5,
                    fontWeight: on ? 600 : 400,
                    padding: "6px 0",
                    borderRadius: 7,
                    cursor: "pointer",
                    color: on ? "#fff" : "var(--txt2)",
                    background: on ? "var(--accent)" : "transparent",
                    border: "none",
                    fontFamily: "inherit",
                  }}
                >
                  {d}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <Label>Time · WAT</Label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 6,
            }}
          >
            {TIMES.map((t) => (
              <Chip
                key={t}
                label={t}
                mono
                center
                active={time === t}
                onClick={() => setTime(t)}
              />
            ))}
          </div>
        </div>
      </div>

      <Label>Length</Label>
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {LENGTHS.map((d) => (
          <Chip
            key={d}
            label={d}
            active={dur === d}
            onClick={() => setDur(d)}
          />
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            fontSize: 13,
            color: "var(--txt2)",
            padding: "10px 6px",
            cursor: "pointer",
            border: "none",
            background: "transparent",
            fontFamily: "inherit",
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => {
            if (!ready) return
            onSchedule({
              course: course!,
              title: title.trim(),
              when,
              dur: dur!,
              host,
            })
          }}
          style={{
            marginLeft: "auto",
            background: ready ? "var(--accent)" : "var(--line-strong)",
            color: ready ? "#fff" : "var(--txt4)",
            fontSize: 13,
            fontWeight: 500,
            padding: "11px 20px",
            borderRadius: 11,
            cursor: ready ? "pointer" : "default",
            border: "none",
            fontFamily: "inherit",
          }}
        >
          Schedule &amp; notify students
        </button>
      </div>
    </Modal>
  )
}

function Chip({
  label,
  active,
  onClick,
  mono,
  center,
}: {
  label: string
  active: boolean
  onClick: () => void
  mono?: boolean
  center?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={mono === true ? "portal-mono" : undefined}
      style={{
        fontSize: mono === true ? 11.5 : 12,
        fontWeight: 500,
        padding: center === true ? "8px 0" : "7px 12px",
        textAlign: center === true ? "center" : undefined,
        borderRadius: 9,
        cursor: "pointer",
        color: active ? "var(--accent)" : "var(--txt2)",
        background: active ? "var(--accent-soft)" : "transparent",
        border: `1px solid ${
          active ? "var(--accent-brd)" : "var(--line-strong)"
        }`,
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, color: "var(--txt3)", marginBottom: 6 }}>
      {children}
    </div>
  )
}

const FIELD: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "var(--panel)",
  border: "1px solid var(--line-strong)",
  borderRadius: 10,
  padding: "10px 13px",
  fontSize: 13,
  color: "var(--txt)",
  fontFamily: "inherit",
  outline: "none",
}
