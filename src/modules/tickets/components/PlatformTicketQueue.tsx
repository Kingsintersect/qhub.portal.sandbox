"use client"

import { useState } from "react"

import { LogTicketDialog } from "@/modules/tickets/components/LogTicketDialog"
import { TicketQueueTable } from "@/modules/tickets/components/TicketQueueTable"
import { TicketDrawer } from "@/modules/tickets/components/TicketDrawer"

/**
 * The support queue, with the selected ticket in a drawer over it.
 *
 * A drawer rather than a second page: working a queue means reading one
 * ticket and moving to the next, and closing should put the operator back on
 * the same row they left.
 */
export function PlatformTicketQueue() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [logging, setLogging] = useState(false)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Support hears about most problems by phone or in a meeting, not
          through the portal — and the thread still has to exist somewhere the
          school can see it. The endpoint was built; nothing offered it. */}
      <div style={{ display: "flex" }}>
        <button
          type="button"
          onClick={() => setLogging(true)}
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 9,
            background: "var(--accent)",
            color: "#fff",
            fontSize: 13.5,
            fontWeight: 500,
            fontFamily: "inherit",
            border: "none",
            padding: "11px 18px",
            borderRadius: 11,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Log ticket for a tenant
        </button>
      </div>

      {logging && <LogTicketDialog onClose={() => setLogging(false)} />}

      <TicketQueueTable onOpen={setSelectedId} selectedId={selectedId} />

      {selectedId !== null && (
        <TicketDrawer
          ticketId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
