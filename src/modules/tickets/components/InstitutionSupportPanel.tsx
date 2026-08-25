"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Loader2, Plus, Send } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { TicketStatusBadge } from "@/modules/tickets/components/TicketBadges"
import { TicketThread } from "@/modules/tickets/components/TicketThread"
import {
  useMyTicket,
  useMyTickets,
  useRaiseTicket,
  useReplyToMyTicket,
} from "@/modules/tickets/hooks/use-tickets"
import { TICKET_CATEGORIES } from "@/modules/tickets/types"

const raiseSchema = z.object({
  subject: z.string().min(4, "Give it a short subject").max(200),
  category: z.enum(TICKET_CATEGORIES),
  body: z.string().min(10, "Describe what is happening").max(10000),
})

type RaiseValues = z.infer<typeof raiseSchema>

/**
 * Support, from an institution's side.
 *
 * Shows only this institution's tickets and only the messages meant for them —
 * both enforced by the API, which resolves the institution from the request
 * host rather than from anything this page sends.
 */
export function InstitutionSupportPanel() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const tickets = useMyTickets()

  const list = tickets.data ?? []
  const activeId = selectedId ?? list[0]?.id ?? null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Support
          </h1>
          <p className="text-sm text-muted-foreground">
            Raise an issue with the QHub team and follow it here.
          </p>
        </div>

        <RaiseTicketDialog onRaised={(id) => setSelectedId(id)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
        <div className="space-y-2">
          {tickets.isPending &&
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}

          {!tickets.isPending && list.length === 0 && (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No tickets yet.
            </p>
          )}

          {list.map((ticket) => (
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
              <span className="font-mono text-[11px] text-muted-foreground">
                {ticket.reference}
              </span>
              <span className="mt-1 block text-sm font-medium text-foreground">
                {ticket.subject}
              </span>
              <span className="mt-1 block">
                <TicketStatusBadge status={ticket.status} />
              </span>
            </button>
          ))}
        </div>

        {activeId ? (
          <MyTicketDetail ticketId={activeId} />
        ) : (
          <div className="grid place-items-center rounded-lg border border-dashed border-border p-10 text-sm text-muted-foreground">
            Select a ticket, or raise a new one.
          </div>
        )}
      </div>
    </div>
  )
}

function MyTicketDetail({ ticketId }: { ticketId: number }) {
  const { data: ticket, isPending } = useMyTicket(ticketId)
  const reply = useReplyToMyTicket(ticketId)
  const [body, setBody] = useState("")

  if (isPending || !ticket) {
    return <Skeleton className="h-80 w-full" />
  }

  const send = async () => {
    if (!body.trim()) return

    await reply.mutateAsync(body.trim())
    setBody("")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{ticket.subject}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {ticket.reference} · raised{" "}
              {ticket.createdAt
                ? new Date(ticket.createdAt).toLocaleDateString()
                : ""}
            </p>
          </div>
          <TicketStatusBadge status={ticket.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <TicketThread messages={ticket.messages ?? []} />

        {ticket.status === "CLOSED" ? (
          <p className="border-t border-border pt-4 text-sm text-muted-foreground">
            This ticket is closed. Raise a new one if you still need help.
          </p>
        ) : (
          <div className="space-y-2 border-t border-border pt-4">
            <Textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={3}
              placeholder="Add to this ticket…"
              aria-label="Reply"
            />
            <Button onClick={send} disabled={!body.trim() || reply.isPending}>
              {reply.isPending ? (
                <Loader2
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Send className="mr-2 size-4" aria-hidden="true" />
              )}
              Send
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RaiseTicketDialog({ onRaised }: { onRaised: (id: number) => void }) {
  const [open, setOpen] = useState(false)
  const raise = useRaiseTicket()

  const form = useForm<RaiseValues>({
    resolver: zodResolver(raiseSchema),
    defaultValues: { subject: "", category: "GENERAL", body: "" },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    const ticket = await raise.mutateAsync(values).catch(() => null)

    if (ticket) {
      form.reset()
      setOpen(false)
      onRaised(ticket.id)
    }
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" aria-hidden="true" />
          Raise a ticket
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Raise a ticket</DialogTitle>
          <DialogDescription>
            Describe what is happening and what you expected. The team replies
            in this thread.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" {...form.register("subject")} />
            {form.formState.errors.subject && (
              <p role="alert" className="text-xs font-medium text-destructive">
                {form.formState.errors.subject.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Controller
              control={form.control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.replace("_", " ").toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="body">What is happening?</Label>
            <Textarea id="body" rows={5} {...form.register("body")} />
            {form.formState.errors.body && (
              <p role="alert" className="text-xs font-medium text-destructive">
                {form.formState.errors.body.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={raise.isPending}>
              {raise.isPending && (
                <Loader2
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Raise ticket
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
