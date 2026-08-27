import apiClient from "@/lib/clients/apiClient"
import type { Ticket, TicketQueue } from "@/modules/tickets/types"

const AUTH = { access_token: true } as const

/** The platform team's queue across every institution. */
export const platformTicketsService = {
  queue: (
    params: { status?: string; tenantId?: number; search?: string } = {}
  ) => apiClient.get<TicketQueue>("/platform/tickets", { ...AUTH, params }),

  show: async (id: number): Promise<Ticket> =>
    (await apiClient.get<{ data: Ticket }>(`/platform/tickets/${id}`, AUTH))
      .data,

  reply: async (
    id: number,
    body: string,
    isInternal: boolean
  ): Promise<Ticket> =>
    (
      await apiClient.post<
        { data: Ticket },
        { body: string; isInternal: boolean }
      >(`/platform/tickets/${id}/reply`, { body, isInternal }, AUTH)
    ).data,

  /**
   * Log a ticket against an institution on their behalf.
   *
   * For issues staff spot before the institution reports them. Recorded as
   * channel PLATFORM so the queue can tell "they asked us" from "we noticed".
   */
  logForTenant: async (payload: {
    tenantId: number
    subject: string
    body: string
    priority?: string
    category?: string
  }): Promise<Ticket> =>
    (
      await apiClient.post<{ data: Ticket }, typeof payload>(
        "/platform/tickets/log",
        payload,
        AUTH
      )
    ).data,

  /**
   * Act on a selection at once.
   *
   * Reports partial success rather than failing the batch — one ticket
   * someone else already resolved should not stop the other nineteen.
   */
  bulk: async (
    ticketIds: number[],
    action: "assign_to_me" | "resolve"
  ): Promise<{ updated: number; skipped: number }> =>
    (
      await apiClient.post<
        { data: { updated: number; skipped: number } },
        { ticketIds: number[]; action: string }
      >("/platform/tickets/bulk", { ticketIds, action }, AUTH)
    ).data,

  /** Take a ticket on. tickets.read is enough — accepting is not managing. */
  accept: async (id: number): Promise<Ticket> =>
    (
      await apiClient.post<{ data: Ticket }, Record<string, never>>(
        `/platform/tickets/${id}/accept`,
        {},
        AUTH
      )
    ).data,

  update: async (
    id: number,
    payload: { status?: string; priority?: string; assignedTo?: number | null }
  ): Promise<Ticket> =>
    (
      await apiClient.patch<{ data: Ticket }, typeof payload>(
        `/platform/tickets/${id}`,
        payload,
        AUTH
      )
    ).data,
}

/**
 * Support as an institution sees it. Served from the institution's own host, so
 * no tenant is named — the API resolves it from the request.
 */
export const institutionSupportService = {
  list: async (): Promise<Ticket[]> =>
    (await apiClient.get<{ data: Ticket[] }>("/support/tickets", AUTH)).data,

  show: async (id: number): Promise<Ticket> =>
    (await apiClient.get<{ data: Ticket }>(`/support/tickets/${id}`, AUTH))
      .data,

  raise: async (payload: {
    subject: string
    category: string
    body: string
  }): Promise<Ticket> =>
    (
      await apiClient.post<{ data: Ticket }, typeof payload>(
        "/support/tickets",
        payload,
        AUTH
      )
    ).data,

  reply: async (id: number, body: string): Promise<Ticket> =>
    (
      await apiClient.post<{ data: Ticket }, { body: string }>(
        `/support/tickets/${id}/reply`,
        { body },
        AUTH
      )
    ).data,
}

export const ticketKeys = {
  all: ["tickets"] as const,
  queue: (params: object) => [...ticketKeys.all, "queue", params] as const,
  detail: (id: number) => [...ticketKeys.all, "detail", id] as const,
  mine: () => [...ticketKeys.all, "mine"] as const,
}
