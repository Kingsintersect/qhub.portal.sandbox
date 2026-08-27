"use client"

import { useState } from "react"

import {
  useLogTicketForTenant,
  useTicketQueue,
} from "@/modules/tickets/hooks/use-tickets"
import { TicketDrawer } from "@/modules/tickets/components/TicketDrawer"
import type { Ticket } from "@/modules/tickets/types"

const PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const

const STATUS_TABS = [
  { key: "open", label: "Open" },
  { key: "", label: "All" },
  { key: "RESOLVED", label: "Resolved" },
] as const

const PRIORITY_PILLS = [
  { key: "all", label: "Any priority" },
  { key: "URGENT", label: "Urgent" },
  { key: "HIGH", label: "High" },
  { key: "NORMAL", label: "Normal" },
] as const

/**
 * This institution's tickets, lifted from the draft.
 *
 * "New ticket" logs one on the institution's behalf — for issues staff spot
 * before the institution reports them. The API records those as channel
 * PLATFORM, so the queue can tell "they asked us" from "we noticed", which
 * are different facts about the same institution.
 */
export function TicketsTab({
  tenantId,
  institution,
}: {
  tenantId: number
  institution: string
}) {
  const [status, setStatus] = useState<string>("open")
  const [priority, setPriority] = useState<string>("all")
  const [openId, setOpenId] = useState<number | null>(null)

  const [composing, setComposing] = useState(false)
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [newPriority, setNewPriority] = useState<string>("NORMAL")

  const log = useLogTicketForTenant()

  const { data: queue } = useTicketQueue({
    tenantId,
    ...(status === "" ? {} : { status }),
  })

  const rows = (queue?.data ?? []).filter((t) =>
    priority === "all" ? true : t.priority === priority
  )

  const unresolved = rows.filter(
    (t) => t.status !== "RESOLVED" && t.status !== "CLOSED"
  ).length

  const ready = subject.trim().length > 0 && body.trim().length > 0

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 18,
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 22px 0",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600 }}>
          Tickets raised by this tenant
        </div>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div style={{ fontSize: 12, color: "var(--txt3)" }}>
            {unresolved} open · {rows.length} shown
          </div>

          <button
            type="button"
            onClick={() => setComposing((c) => !c)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: "var(--accent)",
              color: "#fff",
              fontSize: 12.5,
              fontWeight: 500,
              padding: "8px 14px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New ticket
          </button>
        </div>
      </div>

      {composing && (
        <div
          style={{
            margin: "14px 22px 4px",
            border: "1px solid var(--line-strong)",
            borderRadius: 14,
            background: "var(--panel)",
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject — what is broken, and for whom"
              aria-label="Subject"
              style={{
                flex: 1,
                minWidth: 0,
                background: "var(--card)",
                border: "1px solid var(--line-strong)",
                borderRadius: 10,
                padding: "10px 13px",
                fontSize: 13.5,
                color: "var(--txt)",
                outline: "none",
                fontFamily: "inherit",
              }}
            />

            <div style={{ display: "flex", gap: 6 }}>
              {PRIORITIES.map((p) => {
                const on = newPriority === p

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setNewPriority(p)}
                    className="qhub-mono"
                    style={{
                      fontSize: 11,
                      letterSpacing: ".05em",
                      padding: "9px 12px",
                      borderRadius: 9,
                      border: `1px solid ${on ? "var(--accent)" : "var(--line-strong)"}`,
                      color: on ? "var(--accent)" : "var(--txt3)",
                      background: on ? "var(--accent-soft)" : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    {p}
                  </button>
                )
              })}
            </div>
          </div>

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="What you observed, when it started, and what the tenant has been told so far…"
            aria-label="Description"
            style={{
              resize: "vertical",
              background: "var(--card)",
              border: "1px solid var(--line-strong)",
              borderRadius: 10,
              padding: "11px 13px",
              fontSize: 13,
              lineHeight: 1.55,
              color: "var(--txt)",
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 11.5, color: "var(--txt4)" }}>
              Logged against {institution} as raised by us, not by them.
            </div>

            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => setComposing(false)}
                style={{
                  border: "1px solid var(--line-strong)",
                  color: "var(--txt2)",
                  background: "transparent",
                  fontSize: 12.5,
                  fontWeight: 500,
                  padding: "8px 14px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!ready || log.isPending}
                onClick={() =>
                  log.mutate(
                    {
                      tenantId,
                      subject: subject.trim(),
                      body: body.trim(),
                      priority: newPriority,
                    },
                    {
                      onSuccess: () => {
                        setSubject("")
                        setBody("")
                        setNewPriority("NORMAL")
                        setComposing(false)
                      },
                    }
                  )
                }
                style={{
                  background: ready ? "var(--accent)" : "var(--panel)",
                  color: ready ? "#fff" : "var(--txt4)",
                  border: "none",
                  fontSize: 12.5,
                  fontWeight: 500,
                  padding: "8px 16px",
                  borderRadius: 10,
                  cursor: ready ? "pointer" : "default",
                  fontFamily: "inherit",
                }}
              >
                {log.isPending ? "Creating…" : "Create ticket"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 22px 0",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            background: "var(--panel)",
            borderRadius: 10,
            padding: 3,
          }}
        >
          {STATUS_TABS.map((t) => {
            const on = status === t.key

            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setStatus(t.key)}
                style={{
                  fontSize: 12,
                  fontWeight: on ? 600 : 400,
                  color: on ? "var(--txt)" : "var(--txt3)",
                  background: on ? "var(--card)" : "transparent",
                  boxShadow: on ? "var(--shadow-sm)" : "none",
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        <div style={{ width: 1, height: 18, background: "var(--divider)" }} />

        <div style={{ display: "flex", gap: 6 }}>
          {PRIORITY_PILLS.map((p) => {
            const on = priority === p.key

            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setPriority(p.key)}
                style={{
                  fontSize: 11.5,
                  fontWeight: 500,
                  color: on ? "var(--accent)" : "var(--txt2)",
                  border: `1px solid ${on ? "var(--accent)" : "var(--line-strong)"}`,
                  background: on ? "var(--accent-soft)" : "transparent",
                  padding: "5px 11px",
                  borderRadius: 999,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "inherit",
                }}
              >
                {p.label}
              </button>
            )
          })}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "104px minmax(0,1fr) 84px 130px 140px 40px",
          columnGap: 16,
          padding: "14px 22px 8px",
          fontSize: 10.5,
          letterSpacing: ".09em",
          color: "var(--txt4)",
        }}
      >
        <div>REF</div>
        <div>SUBJECT</div>
        <div>PRIORITY</div>
        <div>ASSIGNEE</div>
        <div>SLA</div>
        <div />
      </div>

      {rows.map((ticket) => (
        <Row
          key={ticket.id}
          ticket={ticket}
          onOpen={() => setOpenId(ticket.id)}
        />
      ))}

      {rows.length === 0 && (
        <div
          style={{
            padding: "26px 22px",
            borderTop: "1px solid var(--line2)",
            fontSize: 13,
            color: "var(--txt3)",
          }}
        >
          No tickets match these filters.
        </div>
      )}

      {openId !== null && (
        <TicketDrawer ticketId={openId} onClose={() => setOpenId(null)} />
      )}
    </div>
  )
}

function Row({ ticket, onOpen }: { ticket: Ticket; onOpen: () => void }) {
  const hot = ticket.priority === "URGENT" || ticket.priority === "HIGH"

  return (
    <div
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen()
      }}
      style={{
        display: "grid",
        gridTemplateColumns: "104px minmax(0,1fr) 84px 130px 140px 40px",
        columnGap: 16,
        alignItems: "center",
        padding: "12px 22px",
        fontSize: 13,
        borderTop: "1px solid var(--line2)",
        cursor: "pointer",
      }}
    >
      <div className="qhub-mono" style={{ fontSize: 12, color: "var(--txt2)" }}>
        {ticket.reference}
      </div>

      <div
        style={{
          fontWeight: 500,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {ticket.subject}
      </div>

      <div>
        <span
          className="qhub-mono"
          style={{
            fontSize: 10,
            letterSpacing: ".05em",
            padding: "4px 8px",
            borderRadius: 7,
            color: hot ? "var(--neg)" : "var(--txt3)",
            background: hot ? "var(--neg-bg)" : "var(--panel)",
          }}
        >
          {ticket.priority}
        </span>
      </div>

      <div
        style={{
          fontSize: 12,
          color:
            ticket.awaitingAcceptance === true
              ? "var(--warn)"
              : ticket.assignedTo || ticket.assignedEmail
                ? "var(--txt2)"
                : "var(--txt4)",
        }}
      >
        {ticket.assignedTo ?? ticket.assignedEmail ?? "Unassigned"}
      </div>

      <div
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: sla(ticket).color,
        }}
      >
        {sla(ticket).label}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          color: "var(--txt4)",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </div>
    </div>
  )
}

/** All derived from the clock — a stored breach flag needs a sweep to stay true. */
function sla(ticket: Ticket): { label: string; color: string } {
  if (ticket.firstRespondedAt != null)
    return { label: "Met", color: "var(--accent)" }

  if (ticket.slaBreached === true)
    return { label: "Breached", color: "var(--neg)" }

  const remaining = ticket.slaMinutesRemaining ?? null

  if (remaining === null) return { label: "—", color: "var(--txt4)" }

  return {
    label:
      remaining >= 60
        ? `${Math.round(remaining / 60)}h left`
        : `${remaining}m left`,
    color: remaining < 60 ? "var(--warn)" : "var(--txt2)",
  }
}
