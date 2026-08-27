"use client"

import { useMemo, useState } from "react"

import { useTicketQueue } from "@/modules/tickets/hooks/use-tickets"
import type { Ticket, TicketPriority } from "@/modules/tickets/types"

const GRID =
  "26px 104px minmax(0,1.7fr) minmax(0,1.1fr) 84px 130px 140px 120px 40px"

type Tab = "active" | "OPEN" | "PENDING" | "RESOLVED" | ""

/**
 * The support queue, lifted from the draft.
 *
 * The SLA column has three states, not two: on time, breached, and NO TARGET
 * for tickets opened before response targets existed. The draft is explicit
 * that no-target must never render as healthy — an untracked ticket and a
 * comfortable one look nothing alike to somebody deciding what to pick up.
 */
export function TicketQueueTable({
  onOpen,
  selectedId,
}: {
  onOpen: (id: number) => void
  selectedId: number | null
}) {
  const [tab, setTab] = useState<Tab>("active")
  const [selected, setSelected] = useState<number[]>([])

  const queue = useTicketQueue({ status: tab })
  const tickets = useMemo(() => queue.data?.data ?? [], [queue.data])

  const meta = queue.data?.meta
  const breached = tickets.filter((t) => t.slaBreached).length
  const awaiting = tickets.filter((t) => t.awaitingAcceptance).length

  const toggle = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )

  const tabs: Array<[Tab, string, number | undefined]> = [
    ["active", "Active", meta?.openCount],
    ["OPEN", "Open", undefined],
    ["PENDING", "Awaiting institution", undefined],
    ["RESOLVED", "Resolved", undefined],
    ["", "All", meta?.total],
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "-0.015em",
            color: "var(--txt)",
            margin: 0,
          }}
        >
          Tickets
        </h1>
        <div style={{ fontSize: 12.5, color: "var(--txt3)", marginTop: 3 }}>
          Raised by institutions and logged by staff · SLA clocks are derived
          from the response target, never a stored flag
        </div>
      </div>

      <div
        style={{
          background: "var(--card)",
          borderRadius: 20,
          padding: 4,
          boxShadow: "var(--shadow-card)",
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
        }}
      >
        <Stat label="Open" value={meta?.openCount ?? 0} note="unresolved" />
        <Stat
          label="Unassigned"
          value={meta?.unassignedCount ?? 0}
          note="nobody has it"
          tone={(meta?.unassignedCount ?? 0) > 0 ? "warn" : undefined}
        />
        <Stat
          label="Breached"
          value={breached}
          note="past response target"
          tone={breached > 0 ? "neg" : undefined}
        />
        <Stat
          label="Not accepted"
          value={awaiting}
          note="assigned, not taken on"
          tone={awaiting > 0 ? "warn" : undefined}
        />
        <Stat label="On this page" value={tickets.length} note="shown" />
        <Stat label="Total" value={meta?.total ?? 0} note="all time" last />
      </div>

      <div
        style={{
          background: "var(--card)",
          borderRadius: 20,
          boxShadow: "var(--shadow-card)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "14px 18px 0",
            flexWrap: "wrap",
          }}
        >
          {tabs.map(([value, label, count]) => (
            <TabPill
              key={value || "all"}
              label={label}
              count={count}
              active={tab === value}
              onClick={() => {
                setTab(value)
                setSelected([])
              }}
            />
          ))}
        </div>

        {selected.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              margin: "12px 18px 0",
              background: "var(--accent-soft)",
              border: "1px solid var(--accent-brd)",
              borderRadius: 12,
              padding: "9px 16px",
            }}
          >
            <div
              style={{ fontSize: 12.5, fontWeight: 500, color: "var(--txt)" }}
            >
              {selected.length} selected
            </div>
            <button
              type="button"
              onClick={() => setSelected([])}
              style={{
                marginLeft: "auto",
                fontSize: 11.5,
                color: "var(--txt3)",
                background: "none",
                border: "none",
                padding: "6px 8px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Clear
            </button>
          </div>
        )}

        <div style={{ overflowX: "auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              columnGap: 16,
              padding: "16px 24px 10px",
              fontSize: 10.5,
              letterSpacing: ".09em",
              color: "var(--txt4)",
              minWidth: 1040,
              boxSizing: "border-box",
            }}
          >
            <div />
            <div>REF</div>
            <div>SUBJECT</div>
            <div>INSTITUTION</div>
            <div>PRIORITY</div>
            <div>ASSIGNEE</div>
            <div>SLA</div>
            <div>UPDATED</div>
            <div />
          </div>

          {queue.isPending && <Empty>Loading…</Empty>}

          {!queue.isPending && tickets.length === 0 && (
            <Empty>No tickets match these filters.</Empty>
          )}

          {tickets.map((t) => (
            <Row
              key={t.id}
              ticket={t}
              active={selectedId === t.id}
              checked={selected.includes(t.id)}
              onCheck={() => toggle(t.id)}
              onOpen={() => onOpen(t.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function Row({
  ticket: t,
  active,
  checked,
  onCheck,
  onOpen,
}: {
  ticket: Ticket
  active: boolean
  checked: boolean
  onCheck: () => void
  onOpen: () => void
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: GRID,
        columnGap: 16,
        alignItems: "center",
        padding: "13px 24px",
        fontSize: 13.5,
        borderTop: "1px solid var(--line2)",
        background: active ? "var(--row-open)" : "transparent",
        minWidth: 1040,
        boxSizing: "border-box",
      }}
    >
      <button
        type="button"
        onClick={onCheck}
        aria-label={`Select ${t.reference}`}
        aria-pressed={checked}
        style={{
          width: 17,
          height: 17,
          boxSizing: "border-box",
          borderRadius: 5,
          border: `1.5px solid ${checked ? "var(--accent)" : "var(--line-strong)"}`,
          background: checked ? "var(--accent)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: 0,
        }}
      >
        {checked && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 12l5 5L20 6" />
          </svg>
        )}
      </button>

      <button
        type="button"
        onClick={onOpen}
        className="qhub-mono"
        style={{
          fontSize: 12,
          color: "var(--txt2)",
          background: "none",
          border: "none",
          padding: 0,
          textAlign: "left",
          cursor: "pointer",
          fontFamily: "var(--font-mono), monospace",
        }}
      >
        {t.reference}
      </button>

      <button
        type="button"
        onClick={onOpen}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          minWidth: 0,
          background: "none",
          border: "none",
          padding: 0,
          textAlign: "left",
          cursor: "pointer",
          fontFamily: "inherit",
          color: "var(--txt)",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: statusDot(t),
            flex: "0 0 6px",
          }}
        />
        <span
          style={{
            fontWeight: t.status === "OPEN" ? 500 : 400,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {t.subject}
        </span>
      </button>

      <div
        style={{
          color: "var(--txt2)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {t.institution ?? "—"}
      </div>

      <div>
        <span
          className="qhub-mono"
          style={{
            fontSize: 10.5,
            letterSpacing: ".05em",
            padding: "4px 8px",
            borderRadius: 7,
            ...priorityTone(t.priority),
          }}
        >
          {t.priority}
        </span>
      </div>

      <div style={{ minWidth: 0 }}>
        {t.assignedEmail ? (
          <>
            <div
              className="qhub-mono"
              style={{
                fontSize: 11,
                color: "var(--txt2)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {t.assignedEmail}
            </div>
            <div style={{ fontSize: 10, color: "var(--txt4)", marginTop: 2 }}>
              by email · no staff account
            </div>
          </>
        ) : (
          <div
            style={{
              color: t.assignedTo ? "var(--txt2)" : "var(--txt4)",
              fontSize: 12.5,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {t.assignedTo ?? "unassigned"}
          </div>
        )}

        {t.awaitingAcceptance && (
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: ".05em",
              color: "var(--warn)",
              marginTop: 2,
            }}
          >
            NOT ACCEPTED YET
          </div>
        )}
      </div>

      <SlaCell ticket={t} />

      <div style={{ color: "var(--txt3)", fontSize: 12.5 }}>
        {t.lastActivityAt
          ? new Date(t.lastActivityAt).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
            })
          : "—"}
      </div>

      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${t.reference}`}
        style={{
          display: "flex",
          justifyContent: "flex-end",
          color: "var(--txt4)",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  )
}

/**
 * The three SLA states.
 *
 * No target is its own chip with no bar. Drawing a full green bar for a
 * ticket nothing is measuring would be a lie in the most reassuring possible
 * direction.
 */
function SlaCell({ ticket: t }: { ticket: Ticket }) {
  if (!t.responseDueAt) {
    return (
      <div style={{ minWidth: 0 }}>
        <span
          className="qhub-mono"
          style={{
            fontSize: 9.5,
            letterSpacing: ".05em",
            padding: "3px 8px",
            borderRadius: 7,
            color: "var(--txt3)",
            background: "var(--panel)",
          }}
        >
          NO TARGET
        </span>
        <div style={{ fontSize: 10, color: "var(--txt4)", marginTop: 3 }}>
          opened before SLA targets
        </div>
      </div>
    )
  }

  const mins = t.slaMinutesRemaining ?? 0
  const breached = t.slaBreached === true
  const colour = breached
    ? "var(--neg)"
    : mins < 120
      ? "var(--warn)"
      : "var(--accent)"

  // Proportion of a nominal 24h target still left, clamped so a very old
  // ticket does not render a negative-width bar.
  const pct = breached ? 100 : Math.max(4, Math.min(100, (mins / 1440) * 100))

  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 12, color: colour, fontWeight: 500 }}>
        {breached
          ? "Breached"
          : t.firstRespondedAt
            ? "Answered"
            : `${formatMinutes(mins)} left`}
      </div>
      <div
        style={{
          height: 3,
          borderRadius: 999,
          background: "var(--line2)",
          marginTop: 4,
        }}
      >
        <div
          style={{
            height: 3,
            borderRadius: 999,
            background: colour,
            width: `${pct}%`,
          }}
        />
      </div>
    </div>
  )
}

// --- Small pieces -----------------------------------------------------------

function formatMinutes(m: number): string {
  if (m <= 0) return "0m"
  if (m < 60) return `${m}m`
  if (m < 1440) return `${Math.round(m / 60)}h`

  return `${Math.round(m / 1440)}d`
}

function statusDot(t: Ticket): string {
  if (t.slaBreached) return "var(--neg)"
  if (t.status === "OPEN") return "var(--accent)"
  if (t.status === "PENDING") return "var(--warn)"

  return "var(--txt4)"
}

function priorityTone(priority: TicketPriority) {
  if (priority === "URGENT") {
    return { color: "var(--neg)", background: "var(--neg-bg)" }
  }
  if (priority === "HIGH") {
    return { color: "var(--warn)", background: "var(--warn-bg)" }
  }

  return { color: "var(--txt3)", background: "var(--panel)" }
}

function Stat({
  label,
  value,
  note,
  tone,
  last,
}: {
  label: string
  value: number
  note: string
  tone?: "neg" | "warn"
  last?: boolean
}) {
  return (
    <div
      style={{
        padding: "18px 20px",
        borderRight: last ? "none" : "1px solid var(--line)",
      }}
    >
      <div style={{ fontSize: 13, color: "var(--txt3)", marginBottom: 7 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <div
          className="qhub-mono"
          style={{
            fontSize: 23,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color:
              tone === "neg"
                ? "var(--neg)"
                : tone === "warn"
                  ? "var(--warn)"
                  : "var(--txt)",
          }}
        >
          {value.toLocaleString()}
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--txt4)" }}>
          {note}
        </div>
      </div>
    </div>
  )
}

function TabPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count?: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "9px 15px",
        borderRadius: 999,
        fontSize: 12.5,
        fontWeight: active ? 600 : 500,
        color: active ? "var(--accent)" : "var(--txt3)",
        background: active ? "var(--accent-soft)" : "transparent",
        border: "none",
        cursor: "pointer",
        whiteSpace: "nowrap",
        fontFamily: "inherit",
      }}
    >
      {label}
      {typeof count === "number" && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: active ? "var(--accent)" : "var(--txt4)",
          }}
        >
          {count}
        </span>
      )}
    </button>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "26px 24px",
        borderTop: "1px solid var(--line2)",
        fontSize: 13,
        color: "var(--txt3)",
      }}
    >
      {children}
    </div>
  )
}
