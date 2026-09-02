"use client"

import { useState } from "react"

/**
 * Messages between a student and their lecturers, lifted from the bundle 25
 * canvas.
 *
 * The rule that only a lecturer on a registered course can be messaged is
 * enforced by the shape of the composer rather than by a validation message:
 * you pick from a list that contains nobody else. A field you can type any
 * name into, which then refuses, teaches people the system is unhelpful.
 */

export type Message = {
  who: string
  mine: boolean
  when: string
  text: string
}

export type MessageThread = {
  id: string
  name: string
  course: string
  when: string
  unread: boolean
  messages: Message[]
}

export type Recipient = { name: string; sub: string }

export function Messages({
  threads,
  recipients,
}: {
  threads: MessageThread[]
  recipients: Recipient[]
}) {
  const [openId, setOpenId] = useState(threads[0]?.id ?? null)
  const [composing, setComposing] = useState(false)

  const thread = threads.find((t) => t.id === openId) ?? null

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        <div
          style={{
            background: "var(--card)",
            borderRadius: 20,
            boxShadow: "var(--shadow-card)",
            padding: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "6px 10px 10px",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600 }}>Messages</div>
            <button
              type="button"
              onClick={() => setComposing(true)}
              style={{
                marginLeft: "auto",
                background: "var(--accent)",
                color: "#fff",
                border: "none",
                fontSize: 12.5,
                fontWeight: 500,
                fontFamily: "inherit",
                padding: "9px 16px",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              New message
            </button>
          </div>

          {threads.map((t) => {
            const on = t.id === openId

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setOpenId(t.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "11px 12px",
                  borderRadius: 13,
                  border: "none",
                  background: on ? "var(--accent-soft)" : "transparent",
                  textAlign: "left",
                  fontFamily: "inherit",
                  cursor: "pointer",
                  marginBottom: 2,
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: t.unread ? 600 : 500,
                      color: on ? "var(--accent)" : "var(--txt)",
                    }}
                  >
                    {t.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--txt4)" }}>
                    {t.course} · {t.when}
                  </div>
                </div>
                {t.unread && (
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 999,
                      background: "var(--accent)",
                      flex: "0 0 7px",
                    }}
                  />
                )}
              </button>
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
          {thread === null ? (
            <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>
              Pick a conversation.
            </div>
          ) : (
            <>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>
                {thread.name}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--txt4)",
                  marginTop: 2,
                  marginBottom: 14,
                }}
              >
                {thread.course} · replies within 2 working days
              </div>

              {thread.messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: m.mine ? "flex-end" : "flex-start",
                    marginBottom: 10,
                  }}
                >
                  <div style={{ maxWidth: "76%" }}>
                    <div
                      style={{
                        fontSize: 10.5,
                        color: "var(--txt4)",
                        marginBottom: 3,
                        textAlign: m.mine ? "right" : "left",
                      }}
                    >
                      {m.who} · {m.when}
                    </div>
                    <div
                      style={{
                        background: m.mine
                          ? "var(--accent-soft)"
                          : "var(--panel)",
                        borderRadius: 13,
                        padding: "11px 14px",
                        fontSize: 12.5,
                        color: "var(--txt2)",
                        lineHeight: 1.55,
                      }}
                    >
                      {m.text}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {composing && (
        <Composer recipients={recipients} onClose={() => setComposing(false)} />
      )}
    </>
  )
}

function Composer({
  recipients,
  onClose,
}: {
  recipients: Recipient[]
  onClose: () => void
}) {
  const [to, setTo] = useState<string | null>(null)
  const [text, setText] = useState("")

  const ready = to !== null && text.trim().length > 5

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
        aria-label="New message"
        style={{
          position: "relative",
          width: 560,
          maxWidth: "94vw",
          background: "var(--surface-solid)",
          border: "1px solid var(--line-strong)",
          borderRadius: 18,
          boxShadow: "0 30px 80px rgba(8,12,18,.35)",
          padding: 24,
          color: "var(--txt)",
        }}
      >
        <div style={{ fontSize: 17, fontWeight: 600 }}>New message</div>
        <div
          style={{
            fontSize: 12.5,
            color: "var(--txt3)",
            margin: "4px 0 16px",
          }}
        >
          Only lecturers on your registered courses can be messaged — they reply
          within 2 working days.
        </div>

        <div style={{ fontSize: 12, color: "var(--txt3)", marginBottom: 7 }}>
          To
        </div>
        {/* Chips, not a free-text field. The rule above is then a description
            of what you can see rather than a refusal you discover on send. */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginBottom: 14,
          }}
        >
          {recipients.map((r) => {
            const on = to === r.name

            return (
              <button
                key={r.name}
                type="button"
                onClick={() => setTo(r.name)}
                style={{
                  border: `1px solid ${on ? "var(--accent-brd)" : "var(--line-strong)"}`,
                  background: on ? "var(--accent-soft)" : "transparent",
                  borderRadius: 11,
                  padding: "10px 13px",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: on ? "var(--accent)" : "var(--txt)",
                  }}
                >
                  {r.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--txt4)",
                    marginTop: 2,
                  }}
                >
                  {r.sub}
                </div>
              </button>
            )
          })}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Your message — be specific: course, week, and what you need"
          rows={4}
          style={{
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
            resize: "vertical",
            marginBottom: 14,
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              fontSize: 13,
              color: "var(--txt2)",
              background: "transparent",
              border: "none",
              fontFamily: "inherit",
              padding: "10px 6px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!ready}
            onClick={onClose}
            style={{
              marginLeft: "auto",
              background: ready ? "var(--accent)" : "var(--line-strong)",
              color: ready ? "#fff" : "var(--txt4)",
              border: "none",
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "inherit",
              padding: "11px 20px",
              borderRadius: 11,
              cursor: ready ? "pointer" : "default",
            }}
          >
            Send message
          </button>
        </div>
      </div>
    </div>
  )
}
