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
 * That is stated in the header rather than discovered. Somebody who skips to
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
  context,
  pages,
  onBack,
  onComplete,
}: {
  title: string
  /** "CSC 201 · Module 2" — the course and module this lesson sits in. */
  context: string
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
  // Video and audio get the player; everything else is read on the page.
  const media = current.kind === "video" || current.kind === "audio"

  const go = (to: number) => {
    setPage(to)
    setSeen((s) => ({ ...s, [to]: true }))
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        maxWidth: 900,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            fontSize: 12.5,
            color: "var(--txt2)",
            cursor: "pointer",
            border: "1px solid var(--line-strong)",
            borderRadius: 10,
            padding: "8px 14px",
            background: "transparent",
            fontFamily: "inherit",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Courses
        </button>

        <div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
          {/* The rule rides in the subline, where the reader already is. */}
          <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 2 }}>
            {context} · {Object.keys(seen).length} of {pages.length} pages read
            — all pages must be read before the lesson counts complete
          </div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
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
                  borderRadius: 9,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
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
      </div>

      <div
        style={{
          background: "var(--card)",
          borderRadius: 20,
          boxShadow: "var(--shadow-card)",
          overflow: "hidden",
        }}
      >
        {media && (
          <div
            style={{
              height: 320,
              background: "linear-gradient(120deg, #0E2A55, #174C99)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 999,
                background: "rgba(255,255,255,.94)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 12px 40px rgba(8,12,18,.4)",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#1D5FBF">
                <path d="M8 5l12 7-12 7z" />
              </svg>
            </div>

            <span
              className="learn-mono"
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                fontSize: 9.5,
                letterSpacing: ".07em",
                color: "#fff",
                background: "rgba(255,255,255,.16)",
                padding: "3px 9px",
                borderRadius: 999,
              }}
            >
              {current.kind.toUpperCase()}
            </span>

            {/* Where "read" begins, said on the player itself. */}
            <span
              className="learn-mono"
              style={{
                position: "absolute",
                bottom: 14,
                right: 14,
                fontSize: 10.5,
                color: "rgba(255,255,255,.85)",
              }}
            >
              position kept · counts read at 90%
            </span>
          </div>
        )}

        <div style={{ padding: "20px 26px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                background: tileBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "0 0 30px",
              }}
            >
              <svg
                width="13"
                height="13"
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
            <div style={{ fontSize: 15, fontWeight: 600 }}>{current.label}</div>

            {/* The canvas draws this with cursor:pointer and wires nothing to
                it, so nothing is wired here either — an action nobody designed
                would be an invention. It is not a <button>, though, because a
                button announces an action to assistive tech that does not
                exist. Raised with Design as a dead control. */}
            {current.kind === "pdf" && (
              <div
                style={{
                  marginLeft: "auto",
                  border: "1px solid var(--line-strong)",
                  color: "var(--txt2)",
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "7px 14px",
                  borderRadius: 9,
                  cursor: "pointer",
                }}
              >
                Download PDF
              </div>
            )}
          </div>

          <div
            style={{
              fontSize: 13.5,
              color: "var(--txt2)",
              lineHeight: 1.7,
              marginTop: 12,
              textWrap: "pretty",
            }}
          >
            {current.body}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          type="button"
          disabled={page === 0}
          onClick={() => go(page - 1)}
          style={{
            border: "1px solid var(--line-strong)",
            color: page === 0 ? "var(--txt4)" : "var(--txt2)",
            fontSize: 12.5,
            fontWeight: 500,
            padding: "10px 18px",
            borderRadius: 10,
            cursor: page === 0 ? "default" : "pointer",
            background: "transparent",
            fontFamily: "inherit",
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
            fontSize: 12.5,
            fontWeight: 500,
            padding: "10px 20px",
            borderRadius: 10,
            cursor: "pointer",
            border: "none",
            fontFamily: "inherit",
          }}
        >
          {last ? "Finish — mark lesson complete" : "Next page"}
        </button>
      </div>
    </div>
  )
}
