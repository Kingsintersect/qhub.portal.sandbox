export type TicketStatus = "OPEN" | "PENDING" | "RESOLVED" | "CLOSED"
export type TicketPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT"

export type TicketMessage = {
  id: number
  side: "INSTITUTION" | "PLATFORM"
  author: string | null
  body: string
  /** Platform-only note. Never present in an institution's response. */
  isInternal: boolean
  createdAt: string | null
}

export type Ticket = {
  id: number
  reference: string
  subject: string
  category: string
  priority: TicketPriority
  status: TicketStatus
  raisedBy: string | null
  createdAt: string | null
  lastActivityAt: string | null
  messages?: TicketMessage[]
  // Platform-only fields
  institution?: string | null
  tenantId?: number
  assignedTo?: string | null
  assignedToId?: number | null
  raisedByEmail?: string | null
  firstRespondedAt?: string | null
  resolvedAt?: string | null

  /** How it reached us: the institution asked, or we noticed. */
  channel?: string | null

  /**
   * Assigned to a bare address with no staff account. Rendered in mono with
   * "by email · no staff account", because a name and an address are
   * different kinds of assignment.
   */
  assignedEmail?: string | null
  assignedAt?: string | null
  acceptedAt?: string | null

  /** Assigned but nobody has taken it on — the amber state. */
  awaitingAcceptance?: boolean

  /**
   * All derived from the clock. A stored breach flag needs a sweep to stay
   * true, and a sweep that stops leaves the queue claiming it is healthy.
   */
  slaBreached?: boolean
  slaMinutesRemaining?: number | null
  responseDueAt?: string | null
}

export type TicketQueue = {
  data: Ticket[]
  meta: {
    total: number
    currentPage: number
    lastPage: number
    openCount: number
    unassignedCount: number
  }
}

export const TICKET_CATEGORIES = [
  "GENERAL",
  "ACCESS",
  "BILLING",
  "DATA",
  "INTEGRATION",
  "BUG",
  "FEATURE_REQUEST",
] as const
