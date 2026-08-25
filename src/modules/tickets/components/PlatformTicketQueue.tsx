"use client"

import { useState } from "react"
import { Loader2, Lock, Search, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { usePlatformPermissions } from "@/lib/auth/platform-permissions"
import {
  TicketPriorityLabel,
  TicketStatusBadge,
} from "@/modules/tickets/components/TicketBadges"
import { TicketThread } from "@/modules/tickets/components/TicketThread"
import {
  usePlatformTicket,
  useReplyToTicket,
  useTicketQueue,
  useUpdateTicket,
} from "@/modules/tickets/hooks/use-tickets"

const FILTERS = [
  { label: "Active", value: "active" },
  { label: "Open", value: "OPEN" },
  { label: "Awaiting institution", value: "PENDING" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed", value: "CLOSED" },
]

/**
 * The support queue, with the selected ticket's thread beside it.
 *
 * Two panes rather than separate pages: working a queue means reading one
 * ticket and moving to the next, and a round trip through a list page between
 * each is friction an operator feels all day.
 */
export function PlatformTicketQueue() {
  const [status, setStatus] = useState("active")
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const queue = useTicketQueue({
    status,
    ...(search.trim() ? { search: search.trim() } : {}),
  })

  const tickets = queue.data?.data ?? []
  const activeId = selectedId ?? tickets[0]?.id ?? null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Support
        </h1>
        <p className="text-sm text-muted-foreground">
          {queue.data
            ? `${queue.data.meta.openCount} open · ${queue.data.meta.unassignedCount} unassigned`
            : "Tickets raised by institutions."}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex flex-wrap gap-1"
          role="group"
          aria-label="Filter by status"
        >
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              aria-pressed={status === filter.value}
              onClick={() => {
                setStatus(filter.value)
                setSelectedId(null)
              }}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                status === filter.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Subject or reference"
            aria-label="Search tickets"
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
        <div className="space-y-2">
          {queue.isPending &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}

          {!queue.isPending && tickets.length === 0 && (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nothing here.
            </p>
          )}

          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              type="button"
              onClick={() => setSelectedId(ticket.id)}
              aria-current={activeId === ticket.id ? "true" : undefined}
              className={cn(
                "w-full rounded-lg border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
                activeId === ticket.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50"
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-muted-foreground">
                  {ticket.reference}
                </span>
                <TicketPriorityLabel priority={ticket.priority} />
              </span>
              <span className="mt-1 block text-sm font-medium text-foreground">
                {ticket.subject}
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{ticket.institution}</span>
                <TicketStatusBadge status={ticket.status} />
              </span>
            </button>
          ))}
        </div>

        {activeId ? (
          <TicketDetail ticketId={activeId} />
        ) : (
          <div className="grid place-items-center rounded-lg border border-dashed border-border p-10 text-sm text-muted-foreground">
            Select a ticket.
          </div>
        )}
      </div>
    </div>
  )
}

function TicketDetail({ ticketId }: { ticketId: number }) {
  const { can } = usePlatformPermissions()
  const { data: ticket, isPending } = usePlatformTicket(ticketId)
  const reply = useReplyToTicket(ticketId)
  const update = useUpdateTicket(ticketId)

  const [body, setBody] = useState("")
  const [internal, setInternal] = useState(false)

  const canManage = can("tickets.manage")

  if (isPending || !ticket) {
    return <Skeleton className="h-96 w-full" />
  }

  const send = async () => {
    if (!body.trim()) return

    await reply.mutateAsync({ body: body.trim(), isInternal: internal })
    setBody("")
    setInternal(false)
  }

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{ticket.subject}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {ticket.reference} · {ticket.institution} · raised by{" "}
              {ticket.raisedBy}
            </p>
          </div>
          <TicketStatusBadge status={ticket.status} />
        </div>

        {canManage && (
          <div className="flex flex-wrap gap-2">
            <Select
              value={ticket.status}
              onValueChange={(value) => update.mutate({ status: value })}
            >
              <SelectTrigger className="h-8 w-44 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="PENDING">Awaiting institution</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={ticket.priority}
              onValueChange={(value) => update.mutate({ priority: value })}
            >
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <TicketThread messages={ticket.messages ?? []} />

        {canManage && ticket.status !== "CLOSED" && (
          <div className="space-y-2 border-t border-border pt-4">
            <Textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={3}
              placeholder={
                internal
                  ? "A note only the platform team can see…"
                  : "Reply to the institution…"
              }
              aria-label={internal ? "Internal note" : "Reply"}
              className={cn(internal && "border-amber-400")}
            />

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={send} disabled={!body.trim() || reply.isPending}>
                {reply.isPending ? (
                  <Loader2
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Send className="mr-2 size-4" aria-hidden="true" />
                )}
                {internal ? "Add note" : "Send reply"}
              </Button>

              {/* A toggle rather than a second button: the same text goes to
                  very different audiences, and the composer above changes
                  appearance so the choice is visible while typing. */}
              <Button
                type="button"
                variant={internal ? "default" : "outline"}
                onClick={() => setInternal((value) => !value)}
                aria-pressed={internal}
              >
                <Lock className="mr-2 size-4" aria-hidden="true" />
                Internal note
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
