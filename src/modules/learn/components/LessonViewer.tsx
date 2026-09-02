"use client"

import { useState } from "react"

import { KIND_ICON, KIND_TONE, type ContentKind } from "@/modules/learn/types"

/**
 * One lesson, one page at a time, lifted from the bundle 25 canvas.
 *
 * The rule this screen exists to enforce: a lesson counts complete only once
 * every page has been read, and you cannot jump ahead to the last one to tick
 * it. Pages open one at a time — the next is reachable, the rest are not.
 *
 * That is stated on the screen rather than discovered. Somebody who skips to
 * the end and finds the lesson still incomplete should already know why.
 */

export type LessonPage = {
  kind: ContentKind
  /** "Lecture video", "Reading — AVL invariants" */
  label: string
  body: string
}

export function LessonViewer({
  title,
  pages,
  onBack,
  onComplete,
}: {
  title: string
  pages: LessonPage[]
  onBack: () => void
  onComplete: () => void
}) {
  const [page, setPage] = useState(0)
  // The first page is read by arriving on it.
  const [seen, setSeen] = useState<Record<number, boolean>>({ 0: true })

  const furthest = Math.max(...Object.keys(seen).map(Number))
  const current = pages[page]!
  const last = page >= pages.length - 1
  const [tileBg, tileTone] = KIND_TONE[current.kind]

  const go = (to: number) => {
    setPage(to)
    setSeen((s) => ({ ...s, [to]: true }))
  }

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 20,
        boxShadow: "var(--shadow-card)",
        padding: "20px 24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            border: "1px solid var(--line-strong)",
            background: "transparent",
            color: "var(--txt2)",
            fontSize: 12.5,
            fontFamily: "inherit",
            padding: "7px 13px",
            borderRadius: 9,
            cursor: "pointer",
          }}
        >
          Back
        </button>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
      </div>

      {/* The rule, before the pages rather than after the surprise. */}
      <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 8 }}>
        {Object.keys(seen).length} of {pages.length} pages read — all pages must
        be read before the lesson counts complete
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
        {pages.map((_, i) => {
          const isSeen = seen[i] === true
          // Reachable: already read, or the very next one. Everything beyond
          // that stays shut, which is the whole point of the sequence.
          const reachable = isSeen || i <= furthest + 1
          const isCurrent = i === page

          return (
            <button
              key={i}
              type="button"
              disabled={!reachable}
              onClick={() => go(i)}
              className="learn-mono"
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                fontSize: 11.5,
                fontWeight: 500,
                fontFamily: "inherit",
                cursor: reachable ? "pointer" : "default",
                color: isCurrent
                  ? "#fff"
                  : isSeen
                    ? "var(--accent)"
                    : "var(--txt4)",
                background: isCurrent
                  ? "var(--accent)"
                  : isSeen
                    ? "var(--accent-soft)"
                    : "transparent",
                border: `1.5px solid ${
                  isCurrent || isSeen ? "var(--accent)" : "var(--line-strong)"
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
          alignItems: "center",
          gap: 12,
          marginTop: 18,
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
            <path d={KIND_ICON[current.kind]} />
          </svg>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{current.label}</div>

        {/* Video carries its own rule: where "read" begins. */}
        {current.kind === "video" && (
          <div
            style={{
              marginLeft: "auto",
              fontSize: 11,
              color: "var(--txt4)",
            }}
          >
            position kept · counts read at 90%
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: 13,
          color: "var(--txt2)",
          lineHeight: 1.7,
          marginTop: 12,
          background: "var(--panel)",
          borderRadius: 13,
          padding: "16px 18px",
        }}
      >
        {current.body}
      </div>

      {current.kind === "pdf" && (
        <button
          type="button"
          style={{
            border: "1px solid var(--line-strong)",
            background: "transparent",
            color: "var(--txt2)",
            fontSize: 12.5,
            fontWeight: 500,
            fontFamily: "inherit",
            padding: "9px 16px",
            borderRadius: 10,
            cursor: "pointer",
            marginTop: 12,
          }}
        >
          Download PDF
        </button>
      )}

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
          disabled={page === 0}
          onClick={() => go(page - 1)}
          style={{
            border: "1px solid var(--line-strong)",
            background: "transparent",
            color: page === 0 ? "var(--txt4)" : "var(--txt2)",
            fontSize: 12.5,
            fontWeight: 500,
            fontFamily: "inherit",
            padding: "9px 16px",
            borderRadius: 10,
            cursor: page === 0 ? "default" : "pointer",
          }}
        >
          Previous page
        </button>

        <button
          type="button"
          onClick={() => (last ? onComplete() : go(page + 1))}
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
          {last ? "Finish — mark lesson complete" : "Next page"}
        </button>
      </div>
    </div>
  )
}
