"use client"

import { useState } from "react"

import type { Ticket, TicketMessage } from "@/modules/portal/seed"

/**
 * Support tickets to the Qverse platform team, lifted from the bundle 25
 * canvas.
 *
 * The subtitle says where a ticket goes and what P1 does — it pages an on-call
 * engineer. Somebody choosing a priority at 2am should know that before they
 * choose, not after.
 */

const PRIORITY: Record<string, [string, string]> = {
  P1: ["var(--neg)", "var(--neg-bg)"],
  P2: ["var(--warn)", "var(--warn-bg)"],
  P3: ["var(--txt3)", "var(--panel)"],
}

export function Support({
  tickets,
  onNew,
  onReply,
}: {
  tickets: Ticket[]
  onNew: () => void
  onReply: (ref: string, text: string) => void
}) {
  const [open, setOpen] = useState<string | null>(null)
  const [reply, setReply] = useState("")

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 20,
        boxShadow: "var(--shadow-card)",
        padding: "20px 22px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Support</div>
          <div style={{ fontSize: 12, color: "var(--txt3)", marginTop: 2 }}>
            Tickets go to the Qverse platform team · P1 pages the on-call
            engineer
          </div>
        </div>
        <button
          type="button"
          onClick={onNew}
          style={{
            marginLeft: "auto",
            background: "var(--accent)",
            color: "#fff",
            fontSize: 12.5,
            fontWeight: 500,
            padding: "9px 16px",
            borderRadius: 10,
            cursor: "pointer",
            border: "none",
            fontFamily: "inherit",
          }}
        >
          New ticket
        </button>
      </div>

      {tickets.map((t) => {
        const isOpen = open === t.ref
        const [pTone, pBg] = PRIORITY[t.pri] ?? PRIORITY.P3!
        const live = t.status === "OPEN"

        return (
          <div
            key={t.ref}
            style={{
              padding: "13px 4px",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <div
              role="button"
              tabIndex={0}
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : t.ref)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setOpen(isOpen ? null : t.ref)
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
              }}
            >
              <div
                className="portal-mono"
                style={{ fontSize: 11, color: "var(--txt3)" }}
              >
                {t.ref}
              </div>
              <span
                className="portal-mono"
                style={{
                  fontSize: 9.5,
                  letterSpacing: ".07em",
                  padding: "3px 8px",
                  borderRadius: 999,
                  color: pTone,
                  background: pBg,
                }}
              >
                {t.pri}
              </span>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{t.subject}</div>
              <span
                className="portal-mono"
                style={{
                  marginLeft: "auto",
                  fontSize: 9.5,
                  letterSpacing: ".07em",
                  padding: "3px 9px",
                  borderRadius: 999,
                  color: live ? "var(--warn)" : "var(--accent)",
                  background: live ? "var(--warn-bg)" : "var(--accent-soft)",
                }}
              >
                {t.status}
              </span>
            </div>

            {isOpen && (
              <div
                style={{
                  marginTop: 12,
                  borderLeft: "2px solid var(--line-strong)",
                  paddingLeft: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {t.thread.map((m, i) => (
                  <Message key={i} message={m} />
                ))}

                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") send()
                    }}
                    placeholder="Reply to the platform team…"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: "var(--panel)",
                      border: "1px solid var(--line-strong)",
                      borderRadius: 10,
                      padding: "9px 13px",
                      fontSize: 12.5,
                      color: "var(--txt)",
                      fontFamily: "inherit",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      // The row above toggles the thread shut on any click
                      // inside it, this one included, without this.
                      e.stopPropagation()
                      send()
                    }}
                    style={{
                      background: "var(--accent)",
                      color: "#fff",
                      fontSize: 12.5,
                      fontWeight: 500,
                      padding: "9px 16px",
                      borderRadius: 10,
                      cursor: "pointer",
                      border: "none",
                      fontFamily: "inherit",
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        )

        function send() {
          const text = reply.trim()
          if (text === "") return

          onReply(t.ref, text)
          setReply("")
        }
      })}
    </div>
  )
}

function Message({ message }: { message: TicketMessage }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--txt4)", marginBottom: 3 }}>
        {message.who} · {message.when}
      </div>
      <div
        style={{
          fontSize: 12.5,
          color: "var(--txt2)",
          lineHeight: 1.55,
        }}
      >
        {message.text}
      </div>
    </div>
  )
}
