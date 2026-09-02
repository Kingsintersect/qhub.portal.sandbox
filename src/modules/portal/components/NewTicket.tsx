"use client"

import { useState } from "react"

import { Modal } from "@/modules/portal/components/Modal"

/**
 * Raising a support ticket, lifted from the bundle 25 canvas.
 *
 * The priority chips name their own consequence — outage, degraded, question —
 * rather than leaving P1/P2/P3 to be guessed at, and the subtitle says the SLA
 * clock starts on submit. Both facts belong before the button, not after it.
 */

const PRIORITIES = [
  { key: "P1", label: "P1 — outage" },
  { key: "P2", label: "P2 — degraded" },
  { key: "P3", label: "P3 — question" },
]

export function NewTicket({
  onClose,
  onRaise,
}: {
  onClose: () => void
  onRaise: (t: { subject: string; pri: string; body: string }) => void
}) {
  const [subject, setSubject] = useState("")
  const [pri, setPri] = useState("P3")
  const [body, setBody] = useState("")

  const ready = subject.trim().length > 2 && body.trim().length > 5

  return (
    <Modal onClose={onClose} width={500} label="New support ticket">
      <div style={{ fontSize: 17, fontWeight: 600 }}>New support ticket</div>
      <div
        style={{
          fontSize: 12.5,
          color: "var(--txt3)",
          margin: "4px 0 18px",
        }}
      >
        Goes straight to the Qverse platform queue — the SLA clock starts now.
      </div>

      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Subject"
        style={{ ...FIELD, marginBottom: 12 }}
      />

      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {PRIORITIES.map((p) => {
          const on = pri === p.key

          return (
            <button
              key={p.key}
              type="button"
              onClick={() => setPri(p.key)}
              style={{
                fontSize: 12,
                fontWeight: 500,
                padding: "7px 12px",
                borderRadius: 9,
                cursor: "pointer",
                color: on ? "var(--accent)" : "var(--txt2)",
                background: on ? "var(--accent-soft)" : "transparent",
                border: `1px solid ${
                  on ? "var(--accent-brd)" : "var(--line-strong)"
                }`,
                fontFamily: "inherit",
              }}
            >
              {p.label}
            </button>
          )
        })}
      </div>

      {/* The placeholder asks for the three things the platform team will
          otherwise have to come back and ask for. */}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What is happening, since when, and who it affects"
        rows={4}
        style={{ ...FIELD, resize: "vertical", marginBottom: 16 }}
      />

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
            onRaise({ subject: subject.trim(), pri, body: body.trim() })
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
          Raise ticket
        </button>
      </div>
    </Modal>
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
