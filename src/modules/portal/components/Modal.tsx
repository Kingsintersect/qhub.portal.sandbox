"use client"

import type { ReactNode } from "react"

/**
 * The portal's modal shell, from the bundle 25 canvas.
 *
 * Every modal in the canvas repeats the same scrim, the same panel and the
 * same click-outside-to-close with a stopPropagation on the panel. That is one
 * component, not eight copies — and it means a fix to the dismissal behaviour
 * lands everywhere at once.
 */
export function Modal({
  onClose,
  width,
  label,
  children,
}: {
  onClose: () => void
  width: number
  /** Names the dialog for screen readers; the canvas has no equivalent. */
  label: string
  children: ReactNode
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        background: "rgba(10,14,20,.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        role="dialog"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        style={{
          width,
          maxWidth: "94vw",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--surface-solid)",
          borderRadius: 20,
          boxShadow: "var(--shadow-pop)",
          padding: "26px 28px",
          color: "var(--txt)",
        }}
      >
        {children}
      </div>
    </div>
  )
}
