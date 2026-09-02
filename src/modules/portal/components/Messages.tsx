"use client"

import { useState } from "react"

import {
  initialsOf,
  type MessageThread,
  type StudentMessage,
} from "@/modules/portal/seed"

/**
 * Messages from students, lifted from the bundle 25 canvas.
 *
 * The footer sets the expectation in both directions: students are told
 * replies come within two working days, and nothing here pages the lecturer.
 * An inbox that looks urgent but is not, or is urgent and does not say so, is
 * how office hours stop meaning anything.
 *
 * Opening a thread marks it read — the dot is about what needs attention, and
 * a thread you have just read does not.
 */

export function Messages({
  threads,
  onReply,
}: {
  threads: MessageThread[]
  onReply: (student: string) => void
}) {
  const [open, setOpen] = useState<string | null>(null)
  const [read, setRead] = useState<Record<string, boolean>>({})
  const [sent, setSent] = useState<Record<string, StudentMessage[]>>({})
  const [draft, setDraft] = useState("")

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 20,
        boxShadow: "var(--shadow-card)",
        padding: "20px 22px",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 600 }}>Messages</div>
      <div style={{ fontSize: 12, color: "var(--txt3)", margin: "2px 0 14px" }}>
        Students on your courses message you from the student app — replies land
        back there instantly · conversations stay inside the platform
      </div>

      {threads.map((t) => {
        const isOpen = open === t.id
        const unread = t.unread && read[t.id] !== true
        const all = [...t.msgs, ...(sent[t.id] ?? [])]
        const last = all[all.length - 1]

        const send = () => {
          const text = draft.trim()
          if (text === "") return

          setSent((s) => ({
            ...s,
            [t.id]: [...(s[t.id] ?? []), { who: "me", when: "Just now", text }],
          }))
          setDraft("")
          onReply(t.student)
        }

        return (
          <div
            key={t.id}
            style={{
              padding: "13px 4px",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <div
              role="button"
              tabIndex={0}
              aria-expanded={isOpen}
              onClick={() => {
                setOpen(isOpen ? null : t.id)
                setDraft("")
                setRead((r) => ({ ...r, [t.id]: true }))
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setOpen(isOpen ? null : t.id)
                  setDraft("")
                  setRead((r) => ({ ...r, [t.id]: true }))
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
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 999,
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10.5,
                  fontWeight: 600,
                  flex: "0 0 30px",
                }}
              >
                {initialsOf(t.student)}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{ display: "flex", alignItems: "baseline", gap: 9 }}
                >
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>
                    {t.student}
                  </div>
                  <div
                    className="portal-mono"
                    style={{ fontSize: 10, color: "var(--txt4)" }}
                  >
                    {t.matric}
                  </div>
                  <div
                    className="portal-mono"
                    style={{ fontSize: 10.5, color: "var(--txt3)" }}
                  >
                    {t.course}
                  </div>
                  {unread && (
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 999,
                        background: "var(--series2)",
                      }}
                    />
                  )}
                </div>

                {/* The preview is the newest message, so the list reads as
                    where each conversation currently stands. */}
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--txt4)",
                    marginTop: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {last?.text}
                </div>
              </div>

              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--txt4)",
                  whiteSpace: "nowrap",
                }}
              >
                {t.when}
              </div>
            </div>

            {isOpen && (
              <div
                style={{
                  margin: "12px 0 0 40px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {all.map((m, i) => {
                  const mine = m.who === "me"

                  return (
                    <div
                      key={i}
                      style={{
                        alignSelf: mine ? "flex-end" : "flex-start",
                        maxWidth: "70%",
                        background: mine
                          ? "var(--accent-soft)"
                          : "var(--panel)",
                        border: mine
                          ? "1px solid var(--accent-brd)"
                          : undefined,
                        borderRadius: mine
                          ? "12px 12px 4px 12px"
                          : "12px 12px 12px 4px",
                        padding: "9px 13px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12.5,
                          color: mine ? "var(--txt)" : "var(--txt2)",
                          lineHeight: 1.55,
                        }}
                      >
                        {m.text}
                      </div>
                      <div
                        style={{
                          fontSize: 10.5,
                          color: "var(--txt4)",
                          marginTop: 4,
                        }}
                      >
                        {mine ? "You" : t.student} · {m.when}
                      </div>
                    </div>
                  )
                })}

                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    // The row above toggles the thread shut on any click
                    // inside it, the input included.
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      e.stopPropagation()
                      if (e.key === "Enter") send()
                    }}
                    placeholder="Reply — lands in their student app"
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
      })}

      <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 12 }}>
        Office-hours boundary: students are told replies come within 2 working
        days — nothing here pages you.
      </div>
    </div>
  )
}
