"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import apiClient from "@/lib/clients/apiClient"

/**
 * An internal note against one institution, lifted from the draft.
 *
 * The placeholder asks for what the next person needs to know rather than
 * "add a note" — these are read by whoever picks the institution up next,
 * usually weeks later, and a note that only makes sense to its author is the
 * failure mode worth writing against.
 */
export function NoteDialog({
  tenantId,
  institution,
  onClose,
}: {
  tenantId: number
  institution: string
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [body, setBody] = useState("")

  const save = useMutation({
    mutationFn: async () =>
      apiClient.post(
        `/platform/tenants/${tenantId}/notes`,
        { body: body.trim() },
        { access_token: true }
      ),
    onSuccess: () => {
      toast.success("Note saved")
      void queryClient.invalidateQueries({ queryKey: ["platform"] })
      onClose()
    },
    onError: () => toast.error("The note was not saved"),
  })

  const ready = body.trim().length > 0

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(8,12,18,.5)",
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`New note for ${institution}`}
        style={{
          position: "relative",
          width: 480,
          maxWidth: "calc(94vw / var(--zoom))",
          background: "var(--surface-solid)",
          border: "1px solid var(--line-strong)",
          borderRadius: 18,
          boxShadow: "0 30px 80px rgba(8,12,18,.4)",
          padding: 24,
          color: "var(--txt)",
        }}
      >
        <div
          style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.015em" }}
        >
          New note — {institution}
        </div>
        <div style={{ fontSize: 12, color: "var(--txt3)", marginTop: 4 }}>
          Notes are internal, visible to all QHub staff, and timestamped.
        </div>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          autoFocus
          aria-label="Note"
          placeholder="What happened, what was decided, and what the next person needs to know…"
          style={{
            width: "100%",
            boxSizing: "border-box",
            marginTop: 14,
            resize: "vertical",
            background: "var(--card)",
            border: "1px solid var(--line-strong)",
            borderRadius: 10,
            padding: "11px 13px",
            fontSize: 13,
            lineHeight: 1.55,
            color: "var(--txt)",
            outline: "none",
            fontFamily: "inherit",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 16,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "1px solid var(--line-strong)",
              color: "var(--txt2)",
              background: "transparent",
              fontSize: 12.5,
              fontWeight: 500,
              padding: "9px 16px",
              borderRadius: 10,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!ready || save.isPending}
            onClick={() => save.mutate()}
            style={{
              background: ready ? "var(--accent)" : "var(--panel)",
              color: ready ? "#fff" : "var(--txt4)",
              border: "none",
              fontSize: 12.5,
              fontWeight: 500,
              padding: "9px 18px",
              borderRadius: 10,
              cursor: ready ? "pointer" : "default",
              fontFamily: "inherit",
            }}
          >
            {save.isPending ? "Saving…" : "Save note"}
          </button>
        </div>
      </div>
    </div>
  )
}
