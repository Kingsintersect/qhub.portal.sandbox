"use client"

import { useState } from "react"

import { ChangePlanDialog } from "@/modules/billing/components/ChangePlanDialog"
import {
  useCancelSubscription,
  useSubscriptions,
} from "@/modules/billing/hooks/use-billing"
import { formatMinor } from "@/modules/billing/lib/money"
import { useConfirm } from "@/modules/platform-shared/ConfirmProvider"
import type { Subscription } from "@/modules/billing/types"

const GRID = "minmax(0,1.5fr) 110px 60px 90px 110px 110px minmax(0,1.6fr) 190px"

/**
 * Who is on what plan, lifted from the draft.
 *
 * MRR is shown per row in the subscription's own currency and never totalled
 * across rows — the revenue cards above do the same, for the same reason:
 * summing currencies would invent an exchange rate nobody chose.
 */
export function SubscriptionsTable() {
  const confirm = useConfirm()
  const { data: subscriptions } = useSubscriptions()
  const cancel = useCancelSubscription()

  const [changing, setChanging] = useState<Subscription | null>(null)

  const rows = subscriptions ?? []

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 20,
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 24px 4px",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600 }}>Subscriptions</div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--txt3)" }}>
          A lapsed trial leaves the portal read-only — nothing is deleted
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: GRID,
            columnGap: 14,
            padding: "12px 24px 10px",
            fontSize: 10.5,
            letterSpacing: ".09em",
            color: "var(--txt4)",
            minWidth: 1040,
            boxSizing: "border-box",
          }}
        >
          <div>INSTITUTION</div>
          <div>PLAN</div>
          <div>CUR</div>
          <div>INTERVAL</div>
          <div>MRR</div>
          <div>STATUS</div>
          <div>NOTE</div>
          <div />
        </div>

        {rows.length === 0 && (
          <div
            style={{
              padding: "26px 24px",
              borderTop: "1px solid var(--line2)",
              fontSize: 13,
              color: "var(--txt3)",
            }}
          >
            Nobody is subscribed yet.
          </div>
        )}

        {rows.map((s) => {
          const live = s.status === "ACTIVE" || s.status === "TRIALING"

          return (
            <div
              key={s.id}
              style={{
                display: "grid",
                gridTemplateColumns: GRID,
                columnGap: 14,
                alignItems: "center",
                padding: "12px 24px",
                fontSize: 13,
                borderTop: "1px solid var(--line2)",
                minWidth: 1040,
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {s.institution ?? "—"}
              </div>

              <div style={{ color: "var(--txt2)" }}>{s.plan ?? "—"}</div>

              <div
                className="qhub-mono"
                style={{ fontSize: 11, color: "var(--txt3)" }}
              >
                {s.currency ?? "—"}
              </div>

              <div style={{ fontSize: 12, color: "var(--txt3)" }}>
                {s.interval === null || s.interval === undefined
                  ? "—"
                  : s.interval.toLowerCase()}
              </div>

              <div
                className="qhub-mono"
                style={{ fontSize: 12, fontWeight: 500 }}
              >
                {s.mrrMinor !== null && s.currency !== null
                  ? formatMinor(s.mrrMinor, s.currency)
                  : "—"}
              </div>

              <div>
                <span
                  className="qhub-mono"
                  style={{
                    fontSize: 9.5,
                    letterSpacing: ".05em",
                    padding: "4px 8px",
                    borderRadius: 7,
                    ...statusTone(s.status),
                  }}
                >
                  {s.status}
                </span>
              </div>

              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--txt4)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {note(s)}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 6,
                }}
              >
                {live ? (
                  <>
                    <Action onClick={() => setChanging(s)}>Change plan</Action>

                    <Action
                      tone="muted"
                      onClick={async () => {
                        const ok = await confirm({
                          title: `Cancel ${s.institution ?? "this subscription"}?`,
                          body: "Their portal goes read-only at the end of the cycle. Nothing is deleted and every record is kept — subscribing again puts it straight back.",
                          label: "Cancel subscription",
                          danger: true,
                        })

                        if (ok) cancel.mutate(s.id)
                      }}
                    >
                      Cancel
                    </Action>
                  </>
                ) : (
                  <Action tone="accent" onClick={() => setChanging(s)}>
                    Subscribe
                  </Action>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {changing !== null && (
        <ChangePlanDialog
          subscription={changing}
          onClose={() => setChanging(null)}
        />
      )}
    </div>
  )
}

function Action({
  children,
  onClick,
  tone,
}: {
  children: React.ReactNode
  onClick: () => void
  tone?: "muted" | "accent"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: `1px solid ${tone === "accent" ? "var(--accent)" : "var(--line-strong)"}`,
        color:
          tone === "accent"
            ? "var(--accent)"
            : tone === "muted"
              ? "var(--txt4)"
              : "var(--txt2)",
        background: "transparent",
        fontSize: 11.5,
        fontWeight: 500,
        padding: "5px 10px",
        borderRadius: 8,
        cursor: "pointer",
        whiteSpace: "nowrap",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  )
}

function statusTone(status: string): {
  color: string
  background: string
} {
  switch (status) {
    case "ACTIVE":
      return { color: "var(--accent)", background: "var(--good-bg)" }
    case "TRIALING":
      return { color: "var(--warn)", background: "var(--warn-bg)" }
    case "PAST_DUE":
      return { color: "var(--neg)", background: "var(--neg-bg)" }
    default:
      return { color: "var(--txt3)", background: "var(--panel)" }
  }
}

/** The one thing about this row worth reading at a glance. */
function note(s: Subscription): string {
  if (s.status === "CANCELLED") {
    return s.cancelledOn === null
      ? "Cancelled"
      : `Cancelled ${date(s.cancelledOn)}`
  }

  if (s.inTrial) {
    return s.trialEndsOn === null
      ? "In trial"
      : `Trial ends ${date(s.trialEndsOn)}`
  }

  if (s.invoicedThrough !== null) {
    return `Invoiced through ${date(s.invoicedThrough)}`
  }

  return s.startedOn === null ? "" : `Started ${date(s.startedOn)}`
}

function date(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
