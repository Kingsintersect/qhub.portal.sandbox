"use client"

import { useEffect, useRef, useState } from "react"

/**
 * A timed attempt, lifted from the bundle 25 canvas.
 *
 * The timer is the whole point of this screen, and it is hard: at 00:00 the
 * attempt submits itself with whatever is answered. That is stated on the
 * screen before it happens, because a student who loses an attempt to a clock
 * nobody warned them about has lost marks to the interface rather than to the
 * question.
 *
 * This countdown is a display. A real attempt is timed by the server against
 * its own record of when it started — a clock in the browser is a clock the
 * student controls, and this component should never be the thing deciding
 * whether a submission was in time.
 */

export type QuizQuestion = {
  prompt: string
  options: string[]
  points: number
}

export function QuizRunner({
  title,
  courseMeta,
  questions,
  seconds,
  onSubmit,
}: {
  title: string
  /** "CSC 201 · 12 questions · 24 pts · one attempt" */
  courseMeta: string
  questions: QuizQuestion[]
  seconds: number
  /** Called on submit, and on the timer reaching zero. */
  onSubmit: (answers: Record<number, number>, auto: boolean) => void
}) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [flags, setFlags] = useState<Record<number, boolean>>({})
  const [left, setLeft] = useState(seconds)

  /*
   * Held in a ref so the interval can read them without depending on them.
   * A caller passing an inline arrow gives a new identity every render, and an
   * effect depending on that tears the interval down and rebuilds it on every
   * tick.
   */
  const latest = useRef({ answers, submitted: false, onSubmit })

  useEffect(() => {
    latest.current.answers = answers
    latest.current.onSubmit = onSubmit
  }, [answers, onSubmit])

  /*
   * Counted from a deadline, not by decrementing.
   *
   * A counter that subtracts one per tick loses time whenever a tick is late —
   * a throttled background tab, a busy main thread — and the error
   * accumulates. Over a two-hour exam that is minutes of drift in the
   * student's favour or against, and either is wrong. Reading the clock
   * against a fixed deadline self-corrects: a late tick simply reports the
   * true remaining time.
   */
  const deadline = useRef<number | null>(null)

  useEffect(() => {
    // Set on mount rather than during render: Date.now() in a render body is
    // an impure read, and the attempt starts when the screen appears anyway.
    deadline.current = Date.now() + seconds * 1000

    const tick = () => {
      if (deadline.current === null) return

      const remaining = Math.max(
        0,
        Math.round((deadline.current - Date.now()) / 1000)
      )

      setLeft(remaining)

      if (remaining === 0 && !latest.current.submitted) {
        latest.current.submitted = true
        // Called from the interval, never from inside a state updater: an
        // updater must be pure, and setting state on the parent from one is
        // how you get "cannot update a component while rendering another".
        latest.current.onSubmit(latest.current.answers, true)
      }
    }

    const id = setInterval(tick, 250)

    return () => clearInterval(id)
    // seconds is read once, on mount: an attempt's length does not change
    // half way through, and re-running this would restart the clock.
  }, [seconds])

  const count = questions.length
  const q = questions[index]!
  const answered = Object.keys(answers).length

  // The draft's threshold: five minutes.
  const urgent = left < 300

  const mm = String(Math.floor(left / 60)).padStart(2, "0")
  const ss = String(left % 60).padStart(2, "0")

  const submit = () => {
    if (answered === 0 || latest.current.submitted) return

    latest.current.submitted = true
    onSubmit(answers, false)
  }

  return (
    <div style={{ display: "flex", gap: 22, alignItems: "start" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            background: "var(--card)",
            borderRadius: 20,
            boxShadow: "var(--shadow-card)",
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              paddingBottom: 14,
              borderBottom: "1px solid var(--line)",
            }}
          >
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
              <div style={{ fontSize: 12, color: "var(--txt3)", marginTop: 2 }}>
                {courseMeta}
              </div>
            </div>

            <div
              aria-live="polite"
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: urgent ? "var(--neg-bg)" : "var(--panel)",
                border: "1px solid var(--line-strong)",
                borderRadius: 11,
                padding: "8px 14px",
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke={urgent ? "var(--neg)" : "var(--txt2)"}
                strokeWidth={2}
                strokeLinecap="round"
              >
                <circle cx="12" cy="13" r="8" />
                <path d="M12 9v4l2.5 2.5M9 2h6" />
              </svg>
              <span
                className="learn-mono"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: urgent ? "var(--neg)" : "var(--txt2)",
                }}
              >
                {mm}:{ss}
              </span>
            </div>
          </div>

          <div style={{ padding: "18px 0 4px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <div
                className="learn-mono"
                style={{ fontSize: 11, color: "var(--txt4)" }}
              >
                Q{index + 1} OF {count}
              </div>
              <div
                className="learn-mono"
                style={{
                  fontSize: 11,
                  color: "var(--txt4)",
                  marginLeft: "auto",
                }}
              >
                {q.points} PTS
              </div>
            </div>

            <div
              style={{
                fontSize: 14.5,
                fontWeight: 500,
                lineHeight: 1.6,
                marginTop: 10,
              }}
            >
              {q.prompt}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginTop: 16,
              }}
            >
              {q.options.map((label, i) => {
                const on = answers[index] === i

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAnswers({ ...answers, [index]: i })}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      border: `1px solid ${on ? "var(--accent-brd)" : "var(--line-strong)"}`,
                      background: on ? "var(--accent-soft)" : "transparent",
                      borderRadius: 12,
                      padding: "12px 15px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 999,
                        border: `1.5px solid ${on ? "var(--accent)" : "var(--line-strong)"}`,
                        background: on ? "var(--accent)" : "transparent",
                        flex: "0 0 20px",
                      }}
                    />
                    <div
                      style={{
                        fontSize: 13.5,
                        color: on ? "var(--txt)" : "var(--txt2)",
                      }}
                    >
                      {label}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 18,
              paddingTop: 16,
              borderTop: "1px solid var(--line)",
            }}
          >
            <button
              type="button"
              onClick={() => setIndex(Math.max(0, index - 1))}
              disabled={index === 0}
              style={{
                border: "1px solid var(--line-strong)",
                background: "transparent",
                color: index === 0 ? "var(--txt4)" : "var(--txt2)",
                fontSize: 12.5,
                fontWeight: 500,
                fontFamily: "inherit",
                padding: "9px 16px",
                borderRadius: 10,
                cursor: index === 0 ? "default" : "pointer",
              }}
            >
              Previous
            </button>

            <button
              type="button"
              onClick={() => setFlags({ ...flags, [index]: !flags[index] })}
              style={{
                fontSize: 12.5,
                color: flags[index] === true ? "var(--warn)" : "var(--txt3)",
                background: "transparent",
                border: "none",
                fontFamily: "inherit",
                padding: "9px 10px",
                cursor: "pointer",
              }}
            >
              {flags[index] === true ? "Unflag" : "Flag for review"}
            </button>

            <button
              type="button"
              onClick={() => setIndex(Math.min(count - 1, index + 1))}
              style={{
                marginLeft: "auto",
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
              {index >= count - 1 ? "Review" : "Next"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ width: 260, flex: "0 0 260px" }}>
        <div
          style={{
            background: "var(--card)",
            borderRadius: 20,
            boxShadow: "var(--shadow-card)",
            padding: "16px 18px",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
            Questions
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: 6,
            }}
          >
            {questions.map((_, i) => {
              const isAnswered = answers[i] !== undefined
              const isFlagged = flags[i] === true

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className="learn-mono"
                  style={{
                    textAlign: "center",
                    fontSize: 11.5,
                    fontWeight: 500,
                    padding: "8px 0",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    // Flagged beats answered: a question you marked to come
                    // back to is one you are not finished with, whatever is
                    // currently ticked.
                    color: isFlagged
                      ? "var(--warn)"
                      : isAnswered
                        ? "#fff"
                        : "var(--txt3)",
                    background: isFlagged
                      ? "var(--warn-bg)"
                      : isAnswered
                        ? "var(--accent)"
                        : "transparent",
                    border: `1.5px solid ${
                      isFlagged
                        ? "var(--warn)"
                        : isAnswered
                          ? "var(--accent)"
                          : "var(--line-strong)"
                    }`,
                  }}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              marginTop: 12,
              fontSize: 11,
              color: "var(--txt4)",
            }}
          >
            <Key background="var(--accent)">Answered</Key>
            <Key background="var(--warn-bg)" border="var(--warn)">
              Flagged for review
            </Key>
            <Key border="var(--line-strong)">Not answered</Key>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={answered === 0}
            style={{
              width: "100%",
              background: answered === 0 ? "var(--panel)" : "var(--accent)",
              color: answered === 0 ? "var(--txt4)" : "#fff",
              border: "none",
              textAlign: "center",
              fontSize: 12.5,
              fontWeight: 500,
              fontFamily: "inherit",
              padding: "10px 0",
              borderRadius: 10,
              cursor: answered === 0 ? "default" : "pointer",
              marginTop: 14,
            }}
          >
            Submit attempt
          </button>

          {/* Said before it happens, not after. */}
          <div
            style={{
              fontSize: 11,
              color: "var(--txt4)",
              marginTop: 8,
              lineHeight: 1.5,
            }}
          >
            {answered} of {count} answered · unanswered questions score 0 · the
            timer submits for you at 00:00
          </div>
        </div>
      </div>
    </div>
  )
}

function Key({
  background,
  border,
  children,
}: {
  background?: string
  border?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: 3,
          background: background ?? "transparent",
          border: border === undefined ? undefined : `1.5px solid ${border}`,
        }}
      />
      {children}
    </div>
  )
}
