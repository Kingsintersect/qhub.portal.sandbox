"use client"

import { useState } from "react"

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
