"use client"

import { useEffect, useState } from "react"

import {
  useAcceptTicket,
  usePlatformTicket,
  useReplyToTicket,
  useUpdateTicket,
} from "@/modules/tickets/hooks/use-tickets"
import type { Ticket, TicketMessage } from "@/modules/tickets/types"

/**
 * One ticket, lifted from the draft.
 *
 * 88vw and sliding, with the thread on the left and the ticket's standing
 * facts on the right. Reply and internal note share one composer with a mode
 * toggle rather than sitting in separate places — the mistake to design
 * against is writing a note into the tenant's view, so the two must look
 * different at the moment of typing.
 */
export function TicketDrawer({
  ticketId,
  onClose,
  onOpenTenant,
}: {
  ticketId: number
  onClose: () => void
  onOpenTenant?: (tenantId: number) => void
}) {
  const { data: ticket } = usePlatformTicket(ticketId)

  const reply = useReplyToTicket(ticketId)
  const update = useUpdateTicket(ticketId)
  const accept = useAcceptTicket(ticketId)

  const [shown, setShown] = useState(false)
  const [internal, setInternal] = useState(false)
  const [draft, setDraft] = useState("")

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true))

    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKey)

    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  const resolved = ticket?.status === "RESOLVED" || ticket?.status === "CLOSED"

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100 }}>
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(8,12,18,.45)",
          opacity: shown ? 1 : 0,
          transition: "opacity .34s",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "88vw",
          background: "var(--bg)",
          borderLeft: "1px solid var(--drawer-edge)",
          boxShadow: "-30px 0 70px rgba(8,12,18,.3)",
          transform: shown ? "translateX(0)" : "translateX(100%)",
          transition: "transform .4s cubic-bezier(.32,.72,.28,1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "16px 26px",
            borderBottom: "1px solid var(--line-strong)",
            background: "var(--card)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Back to the queue"
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: "var(--panel)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg
              style={{ stroke: "var(--icon-strong)" }}
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                className="qhub-mono"
                style={{ fontSize: 12, color: "var(--txt3)" }}
              >
                {ticket?.reference ?? "—"}
              </span>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  letterSpacing: "-0.015em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {ticket?.subject ?? "Loading…"}
              </div>
              {ticket && (
                <>
                  <Chip
                    label={ticket.priority}
                    tone={
                      ticket.priority === "URGENT" || ticket.priority === "HIGH"
                        ? "neg"
                        : "quiet"
                    }
                  />
                  <Chip
                    label={ticket.status}
                    tone={resolved ? "accent" : "quiet"}
                  />
                </>
              )}
            </div>
            <div style={{ fontSize: 12, color: "var(--txt3)", marginTop: 2 }}>
              {ticket?.institution ?? "—"} · {ticket?.category ?? "—"} · raised
              by {ticket?.raisedBy ?? "—"}
            </div>
          </div>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: 9,
              alignItems: "center",
            }}
          >
            {ticket?.awaitingAcceptance === true && (
              <button
                type="button"
                onClick={() => accept.mutate()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "inherit",
                }}
              >
                Accept this ticket
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                update.mutate({
                  status: resolved ? "OPEN" : "RESOLVED",
                })
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: resolved ? "var(--panel)" : "var(--accent)",
                color: resolved ? "var(--txt2)" : "#fff",
                fontSize: 13,
                fontWeight: 500,
                padding: "10px 16px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontFamily: "inherit",
              }}
            >
              {resolved ? "Reopen" : "Resolve"}
            </button>

            <div
              style={{
                width: 1,
                height: 22,
                background: "var(--divider)",
                margin: "0 2px",
              }}
            />

            <button
              type="button"
              onClick={onClose}
              title="Close ticket drawer"
              aria-label="Close ticket drawer"
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                border: "1px solid var(--line-strong)",
                background: "var(--panel)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <svg
                style={{ stroke: "var(--icon-strong)" }}
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2.2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </header>

        <div
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            display: "grid",
            gridTemplateColumns: "1.55fr 1fr",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
              borderRight: "1px solid var(--line-strong)",
            }}
          >
            <div
              style={{
                flex: "1 1 auto",
                overflowY: "auto",
                padding: "20px 26px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {(ticket?.messages ?? []).map((m) => (
                <Message key={m.id} message={m} />
              ))}
            </div>

            <div
              style={{
                flex: "0 0 auto",
                borderTop: "1px solid var(--line-strong)",
                background: "var(--card)",
                padding: "14px 26px 16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  background: "var(--panel)",
                  borderRadius: 999,
                  padding: 3,
                  width: "fit-content",
                  marginBottom: 10,
                }}
              >
                <Mode on={!internal} onClick={() => setInternal(false)}>
                  Reply to tenant
                </Mode>
                <Mode on={internal} warn onClick={() => setInternal(true)}>
                  Internal note
                </Mode>
              </div>

              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                aria-label={internal ? "Internal note" : "Reply to tenant"}
                placeholder={
                  internal
                    ? "Only the platform team sees this. The institution never does."
                    : "The institution reads this in their own support page."
                }
                style={{
                  width: "100%",
                  minHeight: 64,
                  resize: "vertical",
                  border: `1px solid ${internal ? "var(--warn)" : "var(--line-strong)"}`,
                  borderRadius: 12,
                  background: internal ? "var(--warn-bg)" : "var(--panel)",
                  padding: "11px 14px",
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  color: "var(--txt)",
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginTop: 9,
                }}
              >
                <div style={{ fontSize: 11.5, color: "var(--txt4)" }}>
                  {internal
                    ? "Internal — never delivered to the institution."
                    : "Sent to the institution and shown in their support page."}
                </div>

                <button
                  type="button"
                  disabled={draft.trim().length === 0 || reply.isPending}
                  onClick={() =>
                    reply.mutate(
                      { body: draft.trim(), isInternal: internal },
                      { onSuccess: () => setDraft("") }
                    )
                  }
                  style={{
                    marginLeft: "auto",
                    background:
                      draft.trim().length === 0
                        ? "var(--panel)"
                        : internal
                          ? "var(--warn)"
                          : "var(--accent)",
                    color: draft.trim().length === 0 ? "var(--txt4)" : "#fff",
                    fontSize: 13,
                    fontWeight: 500,
                    padding: "9px 18px",
                    borderRadius: 10,
                    border: "none",
                    cursor: draft.trim().length === 0 ? "default" : "pointer",
                    whiteSpace: "nowrap",
                    fontFamily: "inherit",
                  }}
                >
                  {internal ? "Add note" : "Send reply"}
                </button>
              </div>
            </div>
          </div>

          <div
            style={{
              overflowY: "auto",
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              background: "var(--panel)",
            }}
          >
            <Panel title="Properties">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "92px 1fr",
                  gap: "9px 12px",
                  fontSize: 12.5,
                  alignItems: "center",
                }}
              >
                <Field label="Institution" value={ticket?.institution ?? "—"} />
                <Field
                  label="Channel"
                  value={
                    ticket?.channel === "PLATFORM"
                      ? "We noticed it"
                      : "They asked us"
                  }
                />
                <Field label="Opened" value={stamp(ticket?.createdAt)} />
                <Field
                  label="Assignee"
                  value={
                    ticket?.assignedTo ?? ticket?.assignedEmail ?? "Nobody yet"
                  }
                  tone={
                    ticket?.awaitingAcceptance === true
                      ? "var(--warn)"
                      : undefined
                  }
                />
              </div>
            </Panel>

            <SlaPanel ticket={ticket} />

            <Panel title="Linked tenant">
              <div
                style={{
                  fontSize: 12.5,
                  color: "var(--txt2)",
                  lineHeight: 1.6,
                }}
              >
                {ticket?.institution ?? "—"} raised this from their own portal.
                Their health, audit trail and lifecycle all sit on the
                institution profile.
              </div>

              {ticket?.tenantId !== undefined && onOpenTenant && (
                <button
                  type="button"
                  onClick={() => onOpenTenant(ticket.tenantId as number)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    marginTop: 10,
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: "var(--accent)",
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Open institution profile
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M7 17L17 7M9 7h8v8" />
                  </svg>
                </button>
              )}
            </Panel>

            <Panel title="Timeline">
              {timeline(ticket).map((e, i) => (
                <div
                  key={`${e.what}-${i}`}
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: "6px 0",
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 999,
                      background: e.dot,
                      flex: "0 0 7px",
                      marginTop: 4,
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: "var(--txt)", lineHeight: 1.45 }}>
                      {e.what}
                    </div>
                    <div
                      style={{
                        fontSize: 10.5,
                        color: "var(--txt4)",
                        marginTop: 1,
                      }}
                    >
                      {e.when}
                    </div>
                  </div>
                </div>
              ))}
            </Panel>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── pieces ──────────────────────────────────────────────────────────── */

function Message({ message }: { message: TicketMessage }) {
  const note = message.isInternal
  const platform = message.side === "PLATFORM"

  return (
    <div
      style={{
        border: `1px solid ${note ? "var(--warn)" : "var(--line-strong)"}`,
        borderLeft: `3px solid ${note ? "var(--warn)" : platform ? "var(--accent)" : "var(--line-strong)"}`,
        borderRadius: 14,
        background: note ? "var(--warn-bg)" : "var(--card)",
        padding: "14px 17px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          marginBottom: 7,
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 999,
            background: "var(--avatar)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 600,
            color: "var(--txt2)",
          }}
        >
          {initials(message.author)}
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 600 }}>
          {message.author ?? "Unknown"}
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: note ? "var(--warn)" : "var(--txt4)",
          }}
        >
          {note ? "INTERNAL NOTE" : platform ? "Platform team" : "Institution"}
        </div>
        <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--txt4)" }}>
          {stamp(message.createdAt)}
        </div>
      </div>

      <div
        style={{
          fontSize: 13.5,
          lineHeight: 1.55,
          color: "var(--txt)",
          textWrap: "pretty",
          whiteSpace: "pre-wrap",
        }}
      >
        {message.body}
      </div>
    </div>
  )
}

/**
 * The first-response clock.
 *
 * Every figure is derived from `responseDueAt` on the wire — a stored
 * "breached" flag needs a sweep to stay true, and a sweep that stops leaves
 * the panel claiming the ticket is fine.
 */
function SlaPanel({ ticket }: { ticket: Ticket | undefined }) {
  const responded = ticket?.firstRespondedAt != null
  const breached = ticket?.slaBreached === true
  const remaining = ticket?.slaMinutesRemaining ?? null

  const color = responded
    ? "var(--accent)"
    : breached
      ? "var(--neg)"
      : remaining !== null && remaining < 60
        ? "var(--warn)"
        : "var(--accent)"

  const value = responded
    ? "Met"
    : breached
      ? "Breached"
      : remaining === null
        ? "—"
        : remaining >= 60
          ? `${Math.round(remaining / 60)}h left`
          : `${remaining}m left`

  // Full bar once the clock has stopped, either way — a half-drawn bar on a
  // ticket that has already been answered reads as still running.
  const pct = responded || breached ? 100 : remaining === null ? 0 : 60

  return (
    <Panel
      title="First-response SLA"
      right={
        <span style={{ fontSize: 12, fontWeight: 600, color }}>{value}</span>
      }
    >
      <div
        style={{
          height: 5,
          borderRadius: 999,
          background: "var(--line2)",
        }}
      >
        <div
          style={{
            height: 5,
            borderRadius: 999,
            background: color,
            width: `${pct}%`,
          }}
        />
      </div>
      <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 7 }}>
        {responded
          ? `First answered ${stamp(ticket?.firstRespondedAt ?? null)}.`
          : breached
            ? `Due ${stamp(ticket?.responseDueAt ?? null)} and still unanswered.`
            : `Due ${stamp(ticket?.responseDueAt ?? null)}.`}
      </div>
    </Panel>
  )
}

function Panel({
  title,
  right,
  children,
}: {
  title: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 16,
        padding: "16px 18px",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: right ? 8 : 10,
        }}
      >
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{title}</div>
        {right}
      </div>
      {children}
    </div>
  )
}

function Field({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: string
}) {
  return (
    <>
      <div style={{ color: "var(--txt3)" }}>{label}</div>
      <div style={{ fontWeight: 500, color: tone }}>{value}</div>
    </>
  )
}

function Chip({
  label,
  tone,
}: {
  label: string
  tone: "neg" | "accent" | "quiet"
}) {
  return (
    <span
      className="qhub-mono"
      style={{
        fontSize: 10.5,
        letterSpacing: ".05em",
        padding: "4px 8px",
        borderRadius: 7,
        color:
          tone === "neg"
            ? "var(--neg)"
            : tone === "accent"
              ? "var(--accent)"
              : "var(--txt3)",
        background:
          tone === "neg"
            ? "var(--neg-bg)"
            : tone === "accent"
              ? "var(--accent-soft)"
              : "var(--panel)",
      }}
    >
      {label}
    </span>
  )
}

function Mode({
  on,
  warn,
  onClick,
  children,
}: {
  on: boolean
  warn?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        border: "none",
        fontFamily: "inherit",
        color: on ? (warn ? "var(--warn)" : "var(--txt)") : "var(--txt3)",
        background: on ? "var(--card)" : "transparent",
        boxShadow: on ? "var(--shadow-sm)" : "none",
      }}
    >
      {children}
    </button>
  )
}

/* ── derivations ─────────────────────────────────────────────────────── */

function timeline(
  ticket: Ticket | undefined
): Array<{ what: string; when: string; dot: string }> {
  if (!ticket) return []

  const events: Array<{ what: string; when: string; dot: string }> = [
    {
      what:
        ticket.channel === "PLATFORM"
          ? "Logged by the platform team"
          : `Raised by ${ticket.raisedBy ?? "the institution"}`,
      when: stamp(ticket.createdAt),
      dot: "var(--txt4)",
    },
  ]

  if (ticket.assignedAt)
    events.push({
      what: `Assigned to ${ticket.assignedTo ?? ticket.assignedEmail ?? "someone"}`,
      when: stamp(ticket.assignedAt),
      dot: "var(--accent)",
    })

  if (ticket.acceptedAt)
    events.push({
      what: "Accepted",
      when: stamp(ticket.acceptedAt),
      dot: "var(--accent)",
    })

  if (ticket.firstRespondedAt)
    events.push({
      what: "First response sent",
      when: stamp(ticket.firstRespondedAt),
      dot: "var(--accent)",
    })

  if (ticket.resolvedAt)
    events.push({
      what: "Resolved",
      when: stamp(ticket.resolvedAt),
      dot: "var(--accent)",
    })

  return events
}

function stamp(iso: string | null | undefined): string {
  if (!iso) return "—"

  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function initials(name: string | null): string {
  if (!name) return "?"

  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
}
