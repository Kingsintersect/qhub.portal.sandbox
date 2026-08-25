"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  institutionSupportService,
  platformTicketsService,
  ticketKeys,
} from "@/modules/tickets/services/tickets.service"

function errorMessage(error: unknown, fallback: string): string {
  const response = (error as { response?: { data?: { message?: string } } })
    ?.response
  return response?.data?.message ?? fallback
}

export function useTicketQueue(
  params: { status?: string; search?: string } = {}
) {
  return useQuery({
    queryKey: ticketKeys.queue(params),
    queryFn: () => platformTicketsService.queue(params),
    // A support queue is only useful if it is current.
    refetchInterval: 60_000,
  })
}

export function usePlatformTicket(id: number) {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => platformTicketsService.show(id),
    enabled: Number.isFinite(id) && id > 0,
  })
}

export function useReplyToTicket(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ body, isInternal }: { body: string; isInternal: boolean }) =>
      platformTicketsService.reply(id, body, isInternal),
    onSuccess: (_ticket, variables) => {
      toast.success(variables.isInternal ? "Note added" : "Reply sent")
      queryClient.invalidateQueries({ queryKey: ticketKeys.all })
    },
    onError: (error) =>
      toast.error("Could not send that", {
        description: errorMessage(error, "Try again."),
      }),
  })
}

export function useUpdateTicket(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: {
      status?: string
      priority?: string
      assignedTo?: number | null
    }) => platformTicketsService.update(id, payload),
    onSuccess: () => {
      toast.success("Ticket updated")
      queryClient.invalidateQueries({ queryKey: ticketKeys.all })
    },
    onError: (error) =>
      toast.error("Could not update the ticket", {
        description: errorMessage(error, "The change was not applied."),
      }),
  })
}

// --- Institution side -------------------------------------------------------

export function useMyTickets() {
  return useQuery({
    queryKey: ticketKeys.mine(),
    queryFn: () => institutionSupportService.list(),
  })
}

export function useMyTicket(id: number) {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => institutionSupportService.show(id),
    enabled: Number.isFinite(id) && id > 0,
  })
}

export function useRaiseTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: {
      subject: string
      category: string
      body: string
    }) => institutionSupportService.raise(payload),
    onSuccess: (ticket) => {
      toast.success(`Ticket ${ticket.reference} raised`, {
        description: "Our team will respond here.",
      })
      queryClient.invalidateQueries({ queryKey: ticketKeys.all })
    },
    onError: (error) =>
      toast.error("Could not raise that ticket", {
        description: errorMessage(error, "Try again."),
      }),
  })
}

export function useReplyToMyTicket(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: string) => institutionSupportService.reply(id, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ticketKeys.all }),
    onError: (error) =>
      toast.error("Could not send that reply", {
        description: errorMessage(error, "Try again."),
      }),
  })
}
