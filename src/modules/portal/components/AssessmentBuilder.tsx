"use client"

import { useState } from "react"

import { Modal } from "@/modules/portal/components/Modal"
import {
  missingKey,
  type Assessment,
  type BuilderQuestion,
} from "@/modules/portal/seed"

/**
 * The assessment builder, lifted from the bundle 25 canvas.
 *
 * The rule the whole screen is built around: a choice question with no correct
 * option marked cannot auto-mark, so it is flagged on its own card, counted in
 * a warning, and blocks publishing outright. Discovering that after students
 * have sat the paper is the failure this prevents.
 *
 * The note beside the points chips changes per question type, because "tick
 * the one correct option" and "graded by hand" are different promises about
 * what happens after submission.
 */

const TYPES = ["Multiple choice", "Multi-select", "Short answer", "Essay"]
const WINDOWS = [
  "Now · 30 min",
  "Scheduled · exam week",
  "Draft — no window yet",
]
const TIMERS = ["None", "30 min", "1h", "2h", "3h"]

export function AssessmentBuilder({
  courses,
  initialQuestions,
  onClose,
  onSave,
}: {
  courses: string[]
  /** Questions carried in from an OCR pass. */
  initialQuestions: BuilderQuestion[]
  onClose: () => void
  onSave: (a: Assessment, notice: string) => void
}) {
  const [kind, setKind] = useState<"QUIZ" | "EXAM">("QUIZ")
  const [course, setCourse] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [questions, setQuestions] =
    useState<BuilderQuestion[]>(initialQuestions)
  const [window, setWindow] = useState<string | null>(null)
  const [timer, setTimer] = useState("")

  // The question being composed.
  const [qType, setQType] = useState("Multiple choice")
  const [qPrompt, setQPrompt] = useState("")
  const [qOpts, setQOpts] = useState(["", "", "", ""])
  const [qCorrect, setQCorrect] = useState<Record<number, boolean>>({})
  const [qPts, setQPts] = useState(2)

  const choice = qType === "Multiple choice" || qType === "Multi-select"
  const optsFilled = qOpts.filter((o) => o.trim() !== "").length
  const correctN = Object.values(qCorrect).filter(Boolean).length
  const qReady =
    qPrompt.trim().length > 3 && (!choice || (optsFilled >= 2 && correctN >= 1))

  const noKey = questions.filter(missingKey).length
  const total = questions.reduce((a, q) => a + q.pts, 0)
  const ready =
    title.trim().length > 2 &&
    course !== null &&
    questions.length > 0 &&
    window !== null &&
    noKey === 0

  const addQuestion = () => {
    if (!qReady) return

    setQuestions((all) => [
      ...all,
      {
        type: qType,
        prompt: qPrompt.trim(),
        pts: qPts,
        opts: choice ? qOpts.filter((o) => o.trim() !== "") : [],
        correct: choice ? qCorrect : {},
      },
    ])
    setQPrompt("")
    setQOpts(["", "", "", ""])
    setQCorrect({})
  }

  return (
    <Modal onClose={onClose} width={760} label="Assessment builder">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 17, fontWeight: 600 }}>Assessment builder</div>
        <div
          className="portal-mono"
          style={{
            marginLeft: "auto",
            fontSize: 11.5,
            color: "var(--txt3)",
          }}
        >
          {questions.length} questions · {total} pts total
        </div>
      </div>
      <div
        style={{
          fontSize: 12.5,
          color: "var(--txt3)",
          margin: "4px 0 16px",
        }}
      >
        Choice questions auto-mark on submission · short answers and essays
        queue for you.
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 12,
          alignItems: "center",
        }}
      >
        {(["QUIZ", "EXAM"] as const).map((k) => (
          <Chip
            key={k}
            label={k}
            mono
            active={kind === k}
            onClick={() => setKind(k)}
          />
        ))}
        <div
          style={{ width: 1, height: 20, background: "var(--line-strong)" }}
        />
        {courses.map((c) => (
          <Chip
            key={c}
            label={c}
            mono
            active={course === c}
            onClick={() => setCourse(c)}
          />
        ))}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title — e.g. Week 6 quiz, trees"
          style={{
            flex: 1,
            minWidth: 0,
            background: "var(--panel)",
            border: "1px solid var(--line-strong)",
            borderRadius: 10,
            padding: "9px 13px",
            fontSize: 13,
            color: "var(--txt)",
            fontFamily: "inherit",
            outline: "none",
          }}
        />
      </div>

      {questions.length === 0 && (
        <div
          style={{
            border: "1.5px dashed var(--line-strong)",
            borderRadius: 13,
            padding: 16,
            textAlign: "center",
            fontSize: 12.5,
            color: "var(--txt4)",
            marginBottom: 14,
          }}
        >
          No questions yet — build them below, or bring them in through the OCR
          upload.
        </div>
      )}

      {questions.map((q, i) => (
        <div
          key={i}
          style={{
            border: "1px solid var(--line)",
            borderRadius: 12,
            padding: "12px 14px",
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
            <div
              className="portal-mono"
              style={{ fontSize: 11, color: "var(--txt4)" }}
            >
              {i + 1}.
            </div>
            <span
              className="portal-mono"
              style={{
                fontSize: 9.5,
                letterSpacing: ".06em",
                padding: "2px 8px",
                borderRadius: 999,
                color: "var(--txt3)",
                background: "var(--panel)",
              }}
            >
              {q.type}
            </span>
            {missingKey(q) && (
              <span
                className="portal-mono"
                style={{
                  fontSize: 9,
                  letterSpacing: ".06em",
                  padding: "2px 8px",
                  borderRadius: 999,
                  color: "var(--neg)",
                  background: "var(--neg-bg)",
                  whiteSpace: "nowrap",
                }}
              >
                NO ANSWER KEY — WON&apos;T AUTO-MARK
              </span>
            )}
            <div style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>
              {q.prompt}
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: "var(--txt4)",
                whiteSpace: "nowrap",
              }}
            >
              {q.pts} pts
            </div>
            <button
              type="button"
              aria-label={`Remove question ${i + 1}`}
              onClick={() =>
                setQuestions((all) => all.filter((_, j) => j !== i))
              }
              style={{
                fontSize: 12,
                color: "var(--txt3)",
                cursor: "pointer",
                padding: "2px 6px",
                border: "none",
                background: "transparent",
                fontFamily: "inherit",
              }}
            >
              ✕
            </button>
          </div>

          {q.opts.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginTop: 8,
              }}
            >
              {q.opts.map((o, j) => {
                const on = q.correct[j] === true

                return (
                  <button
                    key={j}
                    type="button"
                    title="Click to mark correct"
                    onClick={() =>
                      setQuestions((all) =>
                        all.map((q2, i2) =>
                          i2 !== i
                            ? q2
                            : {
                                ...q2,
                                // A single-answer question can only have one
                                // key, so marking replaces rather than adds.
                                correct:
                                  q2.type === "Multiple choice"
                                    ? { [j]: true }
                                    : { ...q2.correct, [j]: !q2.correct[j] },
                              }
                        )
                      )
                    }
                    style={{
                      fontSize: 11.5,
                      color: on ? "var(--accent)" : "var(--txt3)",
                      border: "1px solid var(--line)",
                      borderRadius: 8,
                      padding: "4px 10px",
                      cursor: "pointer",
                      background: "transparent",
                      fontFamily: "inherit",
                    }}
                  >
                    {on ? "✓ " : ""}
                    {o}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ))}

      <div
        style={{
          background: "var(--panel)",
          borderRadius: 14,
          padding: "16px 18px",
          margin: "14px 0",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
          Add a question
        </div>

        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginBottom: 10,
          }}
        >
          {TYPES.map((t) => (
            <Chip
              key={t}
              label={t}
              active={qType === t}
              onClick={() => {
                setQType(t)
                setQCorrect({})
              }}
            />
          ))}
        </div>

        <input
          value={qPrompt}
          onChange={(e) => setQPrompt(e.target.value)}
          placeholder="The question, exactly as students read it"
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: "var(--surface-solid)",
            border: "1px solid var(--line-strong)",
            borderRadius: 10,
            padding: "10px 13px",
            fontSize: 13,
            color: "var(--txt)",
            fontFamily: "inherit",
            outline: "none",
            marginBottom: 10,
          }}
        />

        {choice && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginBottom: 8,
            }}
          >
            {qOpts.map((o, i) => {
              const on = qCorrect[i] === true

              return (
                <div
                  key={i}
                  style={{ display: "flex", gap: 8, alignItems: "center" }}
                >
                  <button
                    type="button"
                    title="Mark correct"
                    aria-label={`Mark option ${i + 1} correct`}
                    onClick={() =>
                      setQCorrect((c) =>
                        qType === "Multiple choice"
                          ? { [i]: c[i] !== true }
                          : { ...c, [i]: c[i] !== true }
                      )
                    }
                    style={{
                      width: 24,
                      height: 24,
                      flex: "0 0 24px",
                      borderRadius: 7,
                      border: `1.5px solid ${
                        on ? "var(--accent)" : "var(--line-strong)"
                      }`,
                      background: on ? "var(--accent-soft)" : "transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                  >
                    {on && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth={2.6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 12.5l5 5L20 7" />
                      </svg>
                    )}
                  </button>
                  <input
                    value={o}
                    onChange={(e) =>
                      setQOpts((all) =>
                        all.map((x, j) => (j === i ? e.target.value : x))
                      )
                    }
                    placeholder={`Option ${i + 1}`}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: "var(--surface-solid)",
                      border: "1px solid var(--line-strong)",
                      borderRadius: 9,
                      padding: "8px 12px",
                      fontSize: 12.5,
                      color: "var(--txt)",
                      fontFamily: "inherit",
                      outline: "none",
                    }}
                  />
                </div>
              )
            })}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 11.5, color: "var(--txt4)", flex: 1 }}>
            {qType === "Multiple choice"
              ? "Tick the one correct option"
              : qType === "Multi-select"
                ? "Tick every correct option"
                : qType === "Essay"
                  ? "Graded by hand — lands in your grading queue"
                  : "Auto-marked against your model answer at grading time"}
          </div>
          {[2, 5, 10, 15].map((p) => (
            <Chip
              key={p}
              label={`${p} pts`}
              small
              active={qPts === p}
              onClick={() => setQPts(p)}
            />
          ))}
          <button
            type="button"
            disabled={!qReady}
            onClick={addQuestion}
            style={{
              background: qReady ? "var(--accent)" : "var(--line-strong)",
              color: qReady ? "#fff" : "var(--txt4)",
              fontSize: 12.5,
              fontWeight: 500,
              padding: "9px 16px",
              borderRadius: 10,
              cursor: qReady ? "pointer" : "default",
              border: "none",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            Add question
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div>
          {noKey > 0 && (
            <div
              style={{
                display: "flex",
                gap: 10,
                background: "var(--neg-bg)",
                border: "1px solid var(--line-strong)",
                borderRadius: 11,
                padding: "10px 14px",
                fontSize: 12,
                color: "var(--txt2)",
                marginBottom: 14,
              }}
            >
              {noKey} choice question{noKey > 1 ? "s" : ""} without a marked
              correct answer — click the correct option on each card; publishing
              is blocked until every choice question can auto-mark.
            </div>
          )}
          <Label>Availability</Label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {WINDOWS.map((w) => (
              <Chip
                key={w}
                label={w}
                active={window === w}
                onClick={() => setWindow(w)}
              />
            ))}
          </div>
        </div>

        <div>
          <Label>Timer — optional</Label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {TIMERS.map((t) => (
              <Chip
                key={t}
                label={t}
                mono
                active={(timer === "" ? "None" : timer) === t}
                onClick={() => setTimer(t === "None" ? "" : t)}
              />
            ))}
          </div>
          <div style={{ fontSize: 11, color: "var(--txt4)", marginTop: 6 }}>
            {timer === ""
              ? "No limit — the attempt stays open until the availability window closes"
              : `Hard limit — the attempt auto-submits at ${timer}; students see a countdown from the moment they open it`}
          </div>
        </div>
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

            const draft = window!.startsWith("Draft")
            onSave(
              {
                id: `as${Date.now()}`,
                kind,
                title: title.trim(),
                course: course!,
                q: questions.length,
                pts: total,
                window: window!,
                timer,
                status: draft ? "DRAFT" : "SCHEDULED",
                sub: "—",
                avg: "—",
              },
              `${kind} “${title.trim()}” ${
                draft ? "saved as draft" : `scheduled — ${window}`
              } on ${course}`
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
          Save assessment
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
  small,
}: {
  label: string
  active: boolean
  onClick: () => void
  mono?: boolean
  small?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={mono === true ? "portal-mono" : undefined}
      style={{
        fontSize: small === true ? 11.5 : mono === true ? 11.5 : 12,
        fontWeight: 500,
        padding: small === true ? "6px 11px" : "7px 12px",
        borderRadius: small === true ? 8 : 9,
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
