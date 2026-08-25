"use client"

import { Lock } from "lucide-react"

import { cn } from "@/lib/utils"
import type { TicketMessage } from "@/modules/tickets/types"

/**
 * A ticket conversation, used by both consoles.
 *
 * Internal notes are visually unmistakable. The API already filters them out of
 * anything an institution receives, so this styling is not the control — it is
 * there so a platform operator can never mistake a private note for something
 * the client has read.
 */
export function TicketThread({ messages }: { messages: TicketMessage[] }) {
  if (messages.length === 0) {
    return <p className="text-sm text-muted-foreground">No messages yet.</p>
  }

  return (
    <ol className="space-y-3">
      {messages.map((message) => {
        const fromPlatform = message.side === "PLATFORM"

        return (
          <li
            key={message.id}
            className={cn(
              "rounded-lg border px-3 py-2.5",
              message.isInternal
                ? "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40"
                : fromPlatform
                  ? "border-border bg-muted/40"
                  : "border-border"
            )}
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <span className="font-medium text-foreground">
                {message.author ?? (fromPlatform ? "Support" : "Institution")}
              </span>
              <span className="text-muted-foreground">
                {fromPlatform ? "Support team" : "Institution"}
              </span>

              {message.isInternal && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-400 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                  <Lock className="size-2.5" aria-hidden="true" />
                  Internal — not visible to the institution
                </span>
              )}

              <span className="ml-auto text-muted-foreground">
                {message.createdAt
                  ? new Date(message.createdAt).toLocaleString()
                  : ""}
              </span>
            </div>

            {/* Plain text, preserved as typed. Never rendered as markup: this
                content comes from another organisation's users. */}
            <p className="mt-1.5 text-sm whitespace-pre-wrap text-foreground">
              {message.body}
            </p>
          </li>
        )
      })}
    </ol>
  )
}
