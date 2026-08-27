"use client"

import { useState } from "react"
import { Loader2, Lock, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { TicketStatusBadge } from "@/modules/tickets/components/TicketBadges"
import { TicketQueueTable } from "@/modules/tickets/components/TicketQueueTable"
import { TicketThread } from "@/modules/tickets/components/TicketThread"
import {
  usePlatformTicket,
  useReplyToTicket,
  useUpdateTicket,
} from "@/modules/tickets/hooks/use-tickets"

/**
 * The support queue, with the selected ticket's thread beside it.
 *
 * Two panes rather than separate pages: working a queue means reading one
 * ticket and moving to the next, and a round trip through a list page between
 * each is friction an operator feels all day.
 */
export function PlatformTicketQueue() {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <TicketQueueTable onOpen={setSelectedId} selectedId={selectedId} />

      {selectedId !== null && (
        <div
          style={{
            background: "var(--card)",
            borderRadius: 20,
            boxShadow: "var(--shadow-card)",
            overflow: "hidden",
          }}
        >
          <TicketDetail ticketId={selectedId} />
        </div>
      )}
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
