"use client"

import { useState } from "react"

import { useEstateOverview } from "@/modules/platform-observability/hooks/use-observability"
import { useLogTicketForTenant } from "@/modules/tickets/hooks/use-tickets"

/**
 * Raising a ticket on a school's behalf, lifted from the draft.
 *
 * Support hears about a problem by phone or in a meeting far more often than
 * through the portal, and the thread has to exist somewhere the school can
 * see it. The endpoint and the hook for this were already built; nothing
 * called them, so the queue could only ever show tickets a school raised
 * itself.
 */

const PRIORITIES = ["P1", "P2", "P3"] as const

export function LogTicketDialog({ onClose }: { onClose: () => void }) {
  const { data: estate } = useEstateOverview()
  const log = useLogTicketForTenant()

  const [tenantId, setTenantId] = useState<number | null>(null)
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>("P2")

  const institutions = estate?.institutions ?? []

  // The draft's own gate: a tenant, and enough of a subject and body to be
  // worth somebody reading.
  const ready =
    tenantId !== null && subject.trim().length > 2 && body.trim().length > 2

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
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
          background: "rgba(8,12,18,.45)",
        }}
      />

      <div
        role="dialog"
        aria-label="Log ticket for a tenant"
        style={{
          position: "relative",
          width: 600,
          maxWidth: "calc(94vw / var(--zoom))",
          maxHeight: "calc(88vh / var(--zoom))",
          overflow: "auto",
          background: "var(--surface-solid)",
          border: "1px solid var(--line-strong)",
          borderRadius: 18,
          boxShadow: "0 30px 80px rgba(8,12,18,.35)",
          padding: 26,
          color: "var(--txt)",
        }}
      >
        <div
          style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em" }}
        >
          Log ticket for a tenant
        </div>
        <div style={{ fontSize: 12.5, color: "var(--txt3)", marginTop: 4 }}>
          The school sees this thread in their own portal, so write it as
          something they will read.
        </div>

        <Label>TENANT</Label>
        <select
          value={tenantId ?? ""}
          onChange={(e) =>
            setTenantId(e.target.value === "" ? null : Number(e.target.value))
          }
          style={field}
        >
          <option value="">Choose an institution…</option>
          {institutions.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>

        <Label>TICKET</Label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject — what is broken, and for whom"
          style={field}
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What you observed, when it started, and what the tenant has been told so far…"
          rows={5}
          style={{ ...field, marginTop: 8, resize: "vertical" }}
        />

        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          {PRIORITIES.map((p) => {
            const on = priority === p

            return (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className="qhub-mono"
                style={{
                  fontSize: 11.5,
                  color: on ? "var(--accent)" : "var(--txt3)",
                  border: `1px solid ${on ? "var(--accent-brd)" : "var(--line-strong)"}`,
                  background: on ? "var(--accent-soft)" : "transparent",
                  padding: "6px 12px",
                  borderRadius: 999,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {p}
              </button>
            )
          })}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 20,
            paddingTop: 14,
            borderTop: "1px solid var(--line)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "1px solid var(--line-strong)",
              background: "transparent",
              color: "var(--txt2)",
              fontSize: 12.5,
              fontFamily: "inherit",
              padding: "9px 16px",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!ready || log.isPending}
            onClick={() =>
              log.mutate(
                {
                  tenantId: tenantId as number,
                  subject: subject.trim(),
                  body: body.trim(),
                  priority,
                },
                { onSuccess: () => onClose() }
              )
            }
            style={{
              border: "1px solid var(--accent)",
              background: ready ? "var(--accent)" : "var(--panel)",
              color: ready ? "#fff" : "var(--txt4)",
              borderColor: ready ? "var(--accent)" : "var(--line-strong)",
              fontSize: 12.5,
              fontWeight: 500,
              fontFamily: "inherit",
              padding: "9px 18px",
              borderRadius: 10,
              cursor: ready ? "pointer" : "default",
            }}
          >
            {log.isPending ? "Creating…" : "Create ticket"}
          </button>
        </div>
      </div>
    </div>
  )
}

const field: React.CSSProperties = {
  width: "100%",
  background: "var(--card)",
  border: "1px solid var(--line-strong)",
  borderRadius: 10,
  padding: "10px 13px",
  fontSize: 13.5,
  color: "var(--txt)",
  outline: "none",
  fontFamily: "inherit",
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        letterSpacing: ".07em",
        color: "var(--txt4)",
        marginTop: 20,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  )
}
