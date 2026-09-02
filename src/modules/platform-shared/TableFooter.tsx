"use client"

import { useState } from "react"

/**
 * The footer under every table in the console, lifted from the draft.
 *
 * A sentence about the whole set on the left, the paging controls on the
 * right. The sentence matters as much as the controls: "Page 1 of 2" tells
 * you where you are, and "8 of 118 institutions" tells you what you are
 * looking at a slice of — without it a table of six reads as an estate of six.
 */

export function useTablePage<T>(rows: T[], initialSize = 6) {
  const [size, setSize] = useState(initialSize)
  const [page, setPage] = useState(0)

  const pages = Math.max(1, Math.ceil(rows.length / size))

  // Clamped rather than stored: deleting the last row of the last page would
  // otherwise leave you on a page that no longer exists, looking at nothing.
  const current = Math.min(page, pages - 1)

  return {
    rows: rows.slice(current * size, (current + 1) * size),
    footer: {
      label: `Page ${current + 1} of ${pages}`,
      canPrev: current > 0,
      canNext: current < pages - 1,
      prev: () => setPage(Math.max(0, current - 1)),
      next: () => setPage(Math.min(pages - 1, current + 1)),
      size,
      sizes: [initialSize, initialSize * 2, initialSize * 4],
      // Back to the first page: staying on page 4 while the page size
      // quadruples lands you somewhere you did not ask to be.
      setSize: (n: number) => {
        setSize(n)
        setPage(0)
      },
    },
  }
}

export type TableFooterProps = ReturnType<
  typeof useTablePage<unknown>
>["footer"] & { summary: string }

export function TableFooter({
  summary,
  label,
  canPrev,
  canNext,
  prev,
  next,
  size,
  sizes,
  setSize,
}: TableFooterProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 24px",
        borderTop: "1px solid var(--line2)",
        fontSize: 12.5,
        color: "var(--txt3)",
      }}
    >
      <div>{summary}</div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: 11.5, color: "var(--txt4)" }}>Rows:</div>

        {sizes.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setSize(n)}
            style={{
              fontSize: 12,
              fontWeight: n === size ? 600 : 400,
              color: n === size ? "var(--accent)" : "var(--txt4)",
              padding: "4px 6px",
              cursor: "pointer",
              border: "none",
              background: "transparent",
              fontFamily: "inherit",
            }}
          >
            {n}
          </button>
        ))}

        <div style={{ width: 1, height: 16, background: "var(--divider)" }} />

        <div style={{ fontSize: 12, color: "var(--txt4)" }}>{label}</div>

        {/* Greyed rather than hidden at the ends: a control that disappears
            moves everything beside it, and the row jumps as you page. */}
        <button
          type="button"
          onClick={prev}
          disabled={!canPrev}
          style={{
            padding: "6px 12px",
            borderRadius: 9,
            background: "var(--panel)",
            border: "none",
            fontSize: 12.5,
            fontFamily: "inherit",
            cursor: canPrev ? "pointer" : "default",
            color: canPrev ? "var(--txt2)" : "var(--txt4)",
          }}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!canNext}
          style={{
            padding: "6px 12px",
            borderRadius: 9,
            background: "var(--panel)",
            border: "none",
            fontSize: 12.5,
            fontFamily: "inherit",
            cursor: canNext ? "pointer" : "default",
            color: canNext ? "var(--txt2)" : "var(--txt4)",
          }}
        >
          Next
        </button>
      </div>
    </div>
  )
}
