"use client"

import { useState } from "react"

import {
  useClearMaintenance,
  useScheduleMaintenance,
} from "@/modules/platform-controls/hooks/use-controls"
import { useConfirm } from "@/modules/platform-shared/ConfirmProvider"
import type { Institution } from "@/modules/institutions/types"

/**
 * Maintenance windows, lifted from the draft.
 *
 * Two states that are easy to conflate and must not be: ANNOUNCED shows a
 * banner in their portal while it keeps working, PORTAL CLOSED shows the
 * branded page to everyone. The closed page is previewed inline so nobody
 * schedules one without seeing what their learners will see.
 */
export function MaintenanceTab({ institution }: { institution: Institution }) {
  const confirm = useConfirm()
  const schedule = useScheduleMaintenance(institution.id)
  const clear = useClearMaintenance(institution.id)

  const [message, setMessage] = useState("")
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")

  const window = institution.maintenance ?? null
  const live = window?.active === true
  const announced = window !== null && !live

  const ready = message.trim().length > 0 && startsAt.length > 0

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 20,
        boxShadow: "var(--shadow-card)",
        padding: "18px 22px",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--txt)" }}>
        Maintenance windows
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--txt3)",
          marginTop: 3,
          lineHeight: 1.55,
        }}
      >
        Announced maintenance shows a banner in the tenant portal; closing the
        portal shows the branded maintenance page to everyone.
      </div>

      {window ? (
        <div
          style={{
            border: "1px solid var(--line-strong)",
            borderRadius: 14,
            padding: "16px 18px",
            marginTop: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              className="qhub-mono"
              style={{
                fontSize: 9.5,
                letterSpacing: ".05em",
                padding: "4px 9px",
                borderRadius: 7,
                color: live ? "var(--neg)" : "var(--warn)",
                background: live ? "var(--neg-bg)" : "var(--warn-bg)",
              }}
            >
              {live ? "PORTAL CLOSED" : "ANNOUNCED"}
            </span>
            <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>
              {formatWhen(window.startsAt)} → {formatWhen(window.endsAt)}
            </div>
          </div>

          <div
            style={{
              fontSize: 13,
              color: "var(--txt2)",
              marginTop: 10,
              lineHeight: 1.55,
            }}
          >
            &quot;{window.message ?? "No message set."}&quot;
          </div>

          {/* What their learners and staff actually see. */}
          <div
            style={{
              border: "1px solid var(--line2)",
              borderRadius: 12,
              background: "var(--panel)",
              padding: 22,
              marginTop: 14,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "var(--warn-bg)",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--warn)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14.5 6.5a4.5 4.5 0 00-6 6L3 18l3 3 5.5-5.5a4.5 4.5 0 006-6L14 13l-3-3z" />
              </svg>
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                marginTop: 10,
                color: "var(--txt)",
              }}
            >
              We&apos;re back at {formatWhen(window.endsAt)}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--txt3)",
                marginTop: 5,
                maxWidth: 400,
                marginLeft: "auto",
                marginRight: "auto",
                lineHeight: 1.55,
              }}
            >
              {window.message}
            </div>
            <div
              style={{ fontSize: 10.5, color: "var(--txt4)", marginTop: 10 }}
            >
              ↑ what learners and staff see on the closed portal
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            {announced && (
              <>
                <Outline
                  tone="neg"
                  onClick={async () => {
                    const ok = await confirm({
                      title: `Close ${institution.name}'s portal now?`,
                      body: "Every learner and staff member sees the maintenance page immediately, instead of when the window was due to start.",
                      label: "Close the portal now",
                      danger: true,
                    })

                    if (ok) {
                      schedule.mutate({
                        message: window.message ?? "Scheduled maintenance.",
                        startsAt: new Date().toISOString(),
                        endsAt: window.endsAt,
                      })
                    }
                  }}
                >
                  Close portal now
                </Outline>

                <Outline onClick={() => clear.mutate()}>Cancel window</Outline>
              </>
            )}

            {live && (
              <Outline
                tone="accent"
                onClick={async () => {
                  const ok = await confirm({
                    title: `Reopen ${institution.name}'s portal?`,
                    body: "The maintenance page comes down and the portal serves again on the next request.",
                    label: "Reopen now",
                  })

                  if (ok) clear.mutate()
                }}
              >
                Reopen now
              </Outline>
            )}
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 170px 170px",
              gap: 10,
              marginTop: 16,
            }}
          >
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message the tenant sees — what's happening and why"
              aria-label="Maintenance message"
              style={field}
            />
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              aria-label="Starts at"
              style={{ ...field, fontSize: 12.5 }}
            />
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              aria-label="Ends at"
              style={{ ...field, fontSize: 12.5 }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 12,
            }}
          >
            <div
              style={{ fontSize: 11.5, color: "var(--txt4)", lineHeight: 1.5 }}
            >
              Scheduling announces it in the tenant&apos;s portal immediately;
              the portal only closes when the window starts (or when you close
              it by hand).
            </div>
            <button
              type="button"
              disabled={!ready || schedule.isPending}
              onClick={() =>
                schedule.mutate({
                  message: message.trim(),
                  startsAt: new Date(startsAt).toISOString(),
                  endsAt: endsAt ? new Date(endsAt).toISOString() : null,
                  openEnded: !endsAt,
                })
              }
              style={{
                marginLeft: "auto",
                background: ready ? "var(--accent)" : "var(--line-strong)",
                color: ready ? "#fff" : "var(--txt4)",
                fontSize: 12.5,
                fontWeight: 500,
                padding: "9px 16px",
                borderRadius: 10,
                border: "none",
                cursor: ready ? "pointer" : "default",
                whiteSpace: "nowrap",
                fontFamily: "inherit",
              }}
            >
              Schedule window
            </button>
          </div>
        </>
      )}
    </div>
  )
}

const field: React.CSSProperties = {
  background: "var(--panel)",
  border: "1px solid var(--line-strong)",
  borderRadius: 10,
  padding: "10px 13px",
  fontSize: 13,
  color: "var(--txt)",
  outline: "none",
  fontFamily: "inherit",
}

function formatWhen(value: string | null | undefined): string {
  if (!value) return "open-ended"

  return new Date(value).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function Outline({
  children,
  onClick,
  tone,
}: {
  children: React.ReactNode
  onClick: () => void
  tone?: "neg" | "accent"
}) {
  const colour =
    tone === "neg"
      ? "var(--neg)"
      : tone === "accent"
        ? "var(--accent)"
        : "var(--txt2)"

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: `1px solid ${tone ? colour : "var(--line-strong)"}`,
        borderRadius: 9,
        background: "transparent",
        color: colour,
        fontSize: 12,
        fontWeight: 500,
        padding: "8px 14px",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  )
}
