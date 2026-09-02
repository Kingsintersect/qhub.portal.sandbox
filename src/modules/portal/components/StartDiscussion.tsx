"use client"

import { useState } from "react"

import { Modal } from "@/modules/portal/components/Modal"
import type { Discussion } from "@/modules/portal/seed"

/**
 * Starting a discussion, lifted from the bundle 25 canvas.
 *
 * Grading is a choice made here, before anyone posts, because it changes what
 * the discussion is: the note under the chips switches between "counts N pts
 * toward the grade" and "participation is tracked but nothing lands in the
 * gradebook". Deciding that afterwards would move the goalposts on students
 * who have already written.
 *
 * The date note counts the window from today rather than showing a bare date,
 * since "Sep 5" and "5 days" answer different questions.
 */

export function StartDiscussion({
  courses,
  onClose,
  onStart,
}: {
  courses: string[]
  onClose: () => void
  onStart: (d: Discussion, notice: string) => void
}) {
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [course, setCourse] = useState<string | null>(null)
  const [due, setDue] = useState<string | null>(null)
  const [graded, setGraded] = useState("Ungraded")
  const [pts, setPts] = useState(10)

  const isGraded = graded === "Graded"
  const ready =
    title.trim().length > 2 &&
    prompt.trim().length > 5 &&
    course !== null &&
    due !== null

  // Today is Aug 31 in the canvas, so Sep <n> is n days away.
  const days = due !== null ? parseInt(due.slice(4), 10) : 0

  return (
    <Modal onClose={onClose} width={520} label="Start a discussion">
      <div style={{ fontSize: 17, fontWeight: 600 }}>Start a discussion</div>
      <div
        style={{
          fontSize: 12.5,
          color: "var(--txt3)",
          margin: "4px 0 18px",
        }}
      >
        Students post under their real names · you can pin, close, and grade at
        the deadline.
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        style={{ ...FIELD, marginBottom: 10 }}
      />
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="The prompt — what should they argue, compare or explain?"
        rows={3}
        style={{ ...FIELD, resize: "vertical", marginBottom: 12 }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 12,
        }}
      >
        <div>
          <Label>Course</Label>
          <div style={{ display: "flex", gap: 6 }}>
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
        </div>

        <div>
          <div
            style={{ display: "flex", alignItems: "baseline", marginBottom: 6 }}
          >
            <div style={{ fontSize: 12, color: "var(--txt3)" }}>Closes on</div>
            <div
              className="portal-mono"
              style={{
                marginLeft: "auto",
                fontSize: 10,
                color: "var(--txt4)",
              }}
            >
              SEP 2026
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 2,
            }}
          >
            {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => {
              const on = due === `Sep ${d}`

              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDue(`Sep ${d}`)}
                  style={{
                    textAlign: "center",
                    fontSize: 11,
                    fontWeight: on ? 600 : 400,
                    padding: "5px 0",
                    borderRadius: 6,
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

          <div style={{ fontSize: 11, color: "var(--txt4)", marginTop: 6 }}>
            {due === null
              ? "Pick the closing date — the window is calculated from today"
              : `Closes ${due} · ${days} day${days === 1 ? "" : "s"} from today — grading collects automatically at close`}
          </div>
        </div>
      </div>

      <Label>Grading</Label>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {["Ungraded", "Graded"].map((g) => (
          <Chip
            key={g}
            label={g}
            active={graded === g}
            onClick={() => setGraded(g)}
          />
        ))}
        {/* The points chips only exist once grading is on — an unreachable
            points choice beside "Ungraded" would read as a contradiction. */}
        {isGraded &&
          [5, 10, 20].map((p) => (
            <Chip
              key={p}
              label={`${p} pts`}
              active={pts === p}
              onClick={() => setPts(p)}
            />
          ))}
      </div>

      <div style={{ fontSize: 11.5, color: "var(--txt4)", marginBottom: 16 }}>
        {isGraded
          ? `Counts ${pts} pts toward the discussion component of the grade — posts are auto-collected at the deadline`
          : "Participation is tracked but nothing lands in the gradebook"}
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

            onStart(
              {
                title: title.trim(),
                course: course!,
                graded: isGraded,
                pts: isGraded ? pts : 0,
                posts: "0",
                inv: 0,
                due: due!,
                status: "OPEN",
                prompt: prompt.trim(),
                postList: [],
              },
              `Discussion opened on ${course}${
                isGraded ? ` — graded, ${pts} pts` : " — ungraded"
              }`
            )
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
          Open discussion
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
}: {
  label: string
  active: boolean
  onClick: () => void
  mono?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={mono === true ? "portal-mono" : undefined}
      style={{
        fontSize: mono === true ? 11.5 : 12,
        fontWeight: 500,
        padding: "7px 12px",
        borderRadius: 9,
        cursor: "pointer",
        color: active ? "var(--accent)" : "var(--txt2)",
        background: active ? "var(--accent-soft)" : "transparent",
        border: `1px solid ${
          active ? "var(--accent-brd)" : "var(--line-strong)"
        }`,
        fontFamily: "inherit",
        whiteSpace: "nowrap",
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
