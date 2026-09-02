"use client"

import { useState } from "react"

import type { Announcement } from "@/modules/portal/seed"

/**
 * Announcements, lifted from the bundle 25 canvas.
 *
 * The list and the composer sit side by side because sending one is usually
 * prompted by reading another. Two rules are on the screen rather than in a
 * confirmation: nothing goes institution-wide unless a level is picked, and
 * delivery is in-app — no student email leaves the platform.
 */

const KIND_TONE: Record<Announcement["kind"], [string, string]> = {
  MAINTENANCE: ["var(--warn)", "var(--warn-bg)"],
  FEATURE: ["var(--accent)", "var(--accent-soft)"],
  GENERAL: ["var(--accent)", "var(--accent-soft)"],
}

export function Announcements({
  items,
  sub,
  composeSub,
  audiences,
  onSend,
}: {
  items: Announcement[]
  sub: string
  composeSub: string
  /** Levels for an admin, course codes for a lecturer. */
  audiences: string[]
  onSend: (a: { title: string; body: string; audience: string[] }) => void
}) {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [picked, setPicked] = useState<Record<string, boolean>>({})

  const on = audiences.filter((a) => picked[a] === true)
  const ready =
    title.trim().length > 2 && body.trim().length > 5 && on.length > 0

  const send = () => {
    if (!ready) return

    onSend({ title: title.trim(), body: body.trim(), audience: on })
    setTitle("")
    setBody("")
    setPicked({})
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.5fr 1fr",
        gap: 16,
        alignItems: "start",
      }}
    >
      <div
        style={{
          background: "var(--card)",
          borderRadius: 20,
          boxShadow: "var(--shadow-card)",
          padding: "20px 22px",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>
          Announcements
        </div>
        <div style={{ fontSize: 12, color: "var(--txt3)", marginBottom: 14 }}>
          {sub}
        </div>

        {items.map((a, i) => {
          const [tone, background] = KIND_TONE[a.kind]

          return (
            <div
              key={`${a.title}-${i}`}
              style={{
                padding: "13px 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span
                  className="portal-mono"
                  style={{
                    fontSize: 9.5,
                    letterSpacing: ".07em",
                    padding: "3px 9px",
                    borderRadius: 999,
                    color: tone,
                    background,
                    flex: "0 0 auto",
                  }}
                >
                  {a.kind}
                </span>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{a.title}</div>
                <div
                  style={{
                    marginLeft: "auto",
                    fontSize: 11.5,
                    color: "var(--txt4)",
                  }}
                >
                  {a.when}
                </div>
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: "var(--txt2)",
                  marginTop: 6,
                  lineHeight: 1.55,
                }}
              >
                {a.body}
              </div>
              {/* Who sent it, who got it, and how many read it — the three
                  things somebody checks before sending another. */}
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--txt4)",
                  marginTop: 5,
                }}
              >
                {a.meta}
              </div>
            </div>
          )
        })}
      </div>

      <div
        style={{
          background: "var(--card)",
          borderRadius: 20,
          boxShadow: "var(--shadow-card)",
          padding: "20px 22px",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>
          New announcement
        </div>
        <div style={{ fontSize: 12, color: "var(--txt3)", marginBottom: 14 }}>
          {composeSub}
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          style={{ ...FIELD, marginBottom: 10 }}
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Message — students see this exactly as written"
          rows={4}
          style={{ ...FIELD, resize: "vertical", marginBottom: 12 }}
        />

        <div style={{ fontSize: 12, color: "var(--txt3)", marginBottom: 7 }}>
          Audience
        </div>
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginBottom: 10,
          }}
        >
          {audiences.map((a) => {
            const active = picked[a] === true

            return (
              <button
                key={a}
                type="button"
                aria-pressed={active}
                onClick={() => setPicked((v) => ({ ...v, [a]: v[a] !== true }))}
                style={{
                  fontSize: 12,
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
                }}
              >
                {a}
              </button>
            )
          })}
        </div>

        {/* The audience line reads back what was chosen, so the send is made
            against a sentence rather than against a row of chips. */}
        <div
          style={{
            fontSize: 11.5,
            color: "var(--txt4)",
            marginBottom: 14,
          }}
        >
          {on.length === 0
            ? "Pick at least one — nothing goes institution-wide by accident"
            : `Goes to ${on.join(", ")} · delivery is logged`}
        </div>

        <button
          type="button"
          disabled={!ready}
          onClick={send}
          style={{
            width: "100%",
            background: ready ? "var(--accent)" : "var(--line-strong)",
            color: ready ? "#fff" : "var(--txt4)",
            textAlign: "center",
            fontSize: 13,
            fontWeight: 500,
            padding: "11px 0",
            borderRadius: 10,
            cursor: ready ? "pointer" : "default",
            border: "none",
            fontFamily: "inherit",
          }}
        >
          Send now
        </button>
      </div>
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
