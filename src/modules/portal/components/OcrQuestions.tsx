"use client"

import { useEffect, useRef, useState } from "react"

import { Modal } from "@/modules/portal/components/Modal"
import { OCR_FOUND, type BuilderQuestion } from "@/modules/portal/seed"

/**
 * Extracting questions from a scanned sheet, lifted from the bundle 25 canvas.
 *
 * Two honesties make this usable. Each extraction carries its confidence, and
 * anything below 85% is marked REVIEW rather than quietly accepted — the AVL
 * question at 61% is exactly the one worth reading before it reaches students.
 * And OCR never guesses the answer key: choice questions arrive with no
 * correct option marked, which the builder then refuses to publish.
 */

export function OcrQuestions({
  onClose,
  onAccept,
}: {
  onClose: () => void
  onAccept: (questions: BuilderQuestion[], notice: string) => void
}) {
  const [phase, setPhase] = useState<"pick" | "busy" | "done">("pick")
  const [pct, setPct] = useState(0)
  const [keep, setKeep] = useState<Record<number, boolean>>(
    Object.fromEntries(OCR_FOUND.map((_, i) => [i, true]))
  )

  // Progress lives in a ref as well as state: a setState updater must stay
  // pure, so the phase change fires from the interval body instead.
  const pctRef = useRef(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(
    () => () => {
      if (timer.current !== null) clearInterval(timer.current)
    },
    []
  )

  const scan = () => {
    setPhase("busy")
    pctRef.current = 0
    setPct(0)

    timer.current = setInterval(() => {
      const next = Math.min(
        100,
        pctRef.current + Math.floor(Math.random() * 12) + 6
      )
      pctRef.current = next
      setPct(next)

      if (next < 100) return

      if (timer.current !== null) {
        clearInterval(timer.current)
        timer.current = null
      }
      setPhase("done")
    }, 160)
  }

  const kept = OCR_FOUND.filter((_, i) => keep[i] === true)

  return (
    <Modal onClose={onClose} width={600} label="Upload typed questions">
      {phase === "pick" && (
        <>
          <div style={{ fontSize: 17, fontWeight: 600 }}>
            Upload typed questions
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "var(--txt3)",
              margin: "4px 0 18px",
            }}
          >
            A scanned sheet, a photo, or a PDF of typed questions — OCR extracts
            them into the builder where every one stays editable.
          </div>
          <button
            type="button"
            onClick={scan}
            style={{
              width: "100%",
              border: "1.5px dashed var(--line-strong)",
              borderRadius: 13,
              padding: 26,
              textAlign: "center",
              cursor: "pointer",
              background: "transparent",
              fontFamily: "inherit",
            }}
          >
            <div
              style={{ fontSize: 13, color: "var(--txt2)", fontWeight: 500 }}
            >
              Choose a file to scan
            </div>
            <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 4 }}>
              PDF, JPG or PNG · typed text reads best; handwriting is flagged
              for review
            </div>
          </button>
        </>
      )}

      {phase === "busy" && (
        <>
          <div style={{ fontSize: 17, fontWeight: 600 }}>
            Recognising questions…
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "var(--txt3)",
              margin: "4px 0 18px",
            }}
          >
            week6-questions.pdf · finding question boundaries, options and point
            values
          </div>
          <div
            style={{
              height: 8,
              borderRadius: 999,
              background: "var(--panel)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background:
                  "linear-gradient(90deg, var(--accent), var(--series2))",
                transition: "width .16s linear",
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: "var(--txt4)", marginTop: 10 }}>
            {pct}%
          </div>
        </>
      )}

      {phase === "done" && (
        <>
          <div style={{ fontSize: 17, fontWeight: 600 }}>
            {OCR_FOUND.length} questions found
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "var(--txt3)",
              margin: "4px 0 14px",
            }}
          >
            Untick anything misread · low-confidence extractions are flagged and
            worth a look before publishing.
          </div>

          {OCR_FOUND.map((q, i) => {
            const on = keep[i] === true
            // 85 is the canvas's line between accepted and worth a look.
            const sure = q.conf >= 85

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 11,
                  alignItems: "flex-start",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  aria-label={`Keep question ${i + 1}`}
                  onClick={() =>
                    setKeep((all) => ({ ...all, [i]: all[i] !== true }))
                  }
                  style={{
                    width: 22,
                    height: 22,
                    flex: "0 0 22px",
                    borderRadius: 7,
                    border: `1.5px solid ${
                      on ? "var(--accent)" : "var(--txt4)"
                    }`,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 1,
                    background: "transparent",
                    padding: 0,
                  }}
                >
                  {on && (
                    <svg
                      width="11"
                      height="11"
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

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                    {q.prompt}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--txt4)",
                      marginTop: 3,
                    }}
                  >
                    {q.type} · {q.pts} pts
                  </div>
                </div>

                <span
                  className="portal-mono"
                  style={{
                    fontSize: 9.5,
                    letterSpacing: ".06em",
                    padding: "3px 8px",
                    borderRadius: 999,
                    color: sure ? "var(--accent)" : "var(--warn)",
                    background: sure ? "var(--accent-soft)" : "var(--warn-bg)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {sure ? `${q.conf}%` : `${q.conf}% · REVIEW`}
                </span>
              </div>
            )
          })}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 16,
            }}
          >
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
              Discard
            </button>
            <button
              type="button"
              onClick={() => {
                const questions: BuilderQuestion[] = kept.map((q) => ({
                  type: q.type,
                  prompt: q.prompt,
                  pts: q.pts,
                  opts: q.opts ?? [],
                  // Deliberately empty: the key is the lecturer's to set.
                  correct: {},
                }))
                const choices = questions.filter(
                  (q) =>
                    q.type === "Multiple choice" || q.type === "Multi-select"
                ).length

                onAccept(
                  questions,
                  `${questions.length} OCR questions added${
                    choices > 0
                      ? ` — ${choices} choice question${choices > 1 ? "s" : ""} need${choices > 1 ? "" : "s"} the correct answer marked; OCR never guesses the key`
                      : ""
                  }`
                )
              }}
              style={{
                marginLeft: "auto",
                background: "var(--accent)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                padding: "11px 20px",
                borderRadius: 11,
                cursor: "pointer",
                border: "none",
                fontFamily: "inherit",
              }}
            >
              Add {kept.length} questions to the draft
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}
