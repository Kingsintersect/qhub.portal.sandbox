"use client"

/**
 * The join confirmation for a live class, lifted from the bundle 25 canvas.
 *
 * It exists to say two things before Zoom opens rather than after: you join
 * under your matric number and must not rename yourself, and attendance counts
 * only after ten minutes in the room. Both are the difference between being
 * marked present and not, and neither is recoverable once the class has ended.
 */
export function JoinLiveClass({
  title,
  onClose,
}: {
  title: string
  onClose: () => void
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
        aria-label="Joining the live class"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 460,
          maxWidth: "94vw",
          background: "var(--surface-solid)",
          borderRadius: 20,
          boxShadow: "var(--shadow-pop)",
          padding: "26px 28px",
          color: "var(--txt)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 999,
            background: "var(--accent-soft)",
            margin: "0 auto 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 7l-7 5 7 5V7zM14 5H3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z" />
          </svg>
        </div>

        <div style={{ fontSize: 16, fontWeight: 600 }}>
          Opening Zoom — {title}
        </div>

        <div
          style={{
            fontSize: 12.5,
            color: "var(--txt3)",
            margin: "10px auto 0",
            maxWidth: 340,
            lineHeight: 1.6,
          }}
        >
          You join under your matric number — no renaming. Attendance counts
          after <b>10 minutes in the room</b> and feeds the attendance component
          of your grade automatically.
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            display: "inline-block",
            background: "var(--accent)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 500,
            padding: "10px 22px",
            borderRadius: 11,
            cursor: "pointer",
            marginTop: 18,
            border: "none",
            fontFamily: "inherit",
          }}
        >
          Continue to Zoom
        </button>
      </div>
    </div>
  )
}
