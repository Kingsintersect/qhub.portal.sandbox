"use client"

import { useState } from "react"

/**
 * Announcements reaching this student, lifted from the bundle 25 canvas.
 *
 * Three sources sit in one list — the registry, the platform, and a lecturer —
 * and the kind chip says which, because "planned maintenance" from Qverse and
 * "registration closes Friday" from the registry need different reactions.
 */

export type Announcement = {
  kind: "GENERAL" | "MAINTENANCE" | "COURSE"
  title: string
  when: string
  /** "Registry · University of Lagos · to Year 1, Year 2" */
  from: string
  /** The line shown in the list. */
  body: string
  /** The rest, shown when opened. */
  more: string
}

const TONE: Record<Announcement["kind"], [string, string]> = {
  GENERAL: ["var(--accent)", "var(--accent-soft)"],
  MAINTENANCE: ["var(--warn)", "var(--warn-bg)"],
  COURSE: ["var(--series2)", "var(--warn-bg)"],
}

export function Announcements({ items }: { items: Announcement[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <>
      <div
        style={{
          background: "var(--card)",
          borderRadius: 20,
          boxShadow: "var(--shadow-card)",
          padding: "20px 22px",
        }}
      >
        {items.map((a, i) => {
          const [tone, background] = TONE[a.kind]

          return (
            <button
              key={i}
              type="button"
              onClick={() => setOpen(i)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 13,
                padding: "14px 0",
                borderBottom: "1px solid var(--line)",
                width: "100%",
                border: "none",
                borderBottomWidth: 1,
                borderBottomStyle: "solid",
                borderBottomColor: "var(--line)",
                background: "transparent",
                textAlign: "left",
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              <span
                className="learn-mono"
                style={{
                  fontSize: 9.5,
                  letterSpacing: ".07em",
                  padding: "4px 9px",
                  borderRadius: 999,
                  color: tone,
                  background,
                  flex: "0 0 auto",
                  marginTop: 2,
                }}
              >
                {a.kind}
              </span>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{a.title}</div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--txt4)",
                    marginTop: 2,
                  }}
                >
                  {a.from}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--txt2)",
                    lineHeight: 1.55,
                    marginTop: 6,
                  }}
                >
                  {a.body}
                </div>
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: "var(--txt4)",
                  flex: "0 0 auto",
                }}
              >
                {a.when}
              </div>
            </button>
          )
        })}
      </div>

      {open !== null && (
        <Modal item={items[open]!} onClose={() => setOpen(null)} />
      )}
    </>
  )
}

function Modal({ item, onClose }: { item: Announcement; onClose: () => void }) {
  const [tone, background] = TONE[item.kind]

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(8,12,18,.45)",
        }}
      />
      <div
        role="dialog"
        aria-label={item.title}
        style={{
          position: "relative",
          width: 560,
          maxWidth: "94vw",
          maxHeight: "86vh",
          overflow: "auto",
          background: "var(--surface-solid)",
          border: "1px solid var(--line-strong)",
          borderRadius: 18,
          boxShadow: "0 30px 80px rgba(8,12,18,.35)",
          padding: 24,
          color: "var(--txt)",
        }}
      >
        <span
          className="learn-mono"
          style={{
            fontSize: 9.5,
            letterSpacing: ".07em",
            padding: "4px 9px",
            borderRadius: 999,
            color: tone,
            background,
          }}
        >
          {item.kind}
        </span>

        <div style={{ fontSize: 17, fontWeight: 600, marginTop: 12 }}>
          {item.title}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 4 }}>
          {item.from} · {item.when}
        </div>

        <div
          style={{
            fontSize: 13,
            color: "var(--txt2)",
            lineHeight: 1.65,
            marginTop: 14,
            whiteSpace: "pre-line",
          }}
        >
          {item.body}
          {"\n\n"}
          {item.more}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 20,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "inherit",
              padding: "10px 22px",
              borderRadius: 11,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
