"use client"

import { useState } from "react"

import { ChangePlanDialog } from "@/modules/billing/components/ChangePlanDialog"
import { RaisePerHeadBillDialog } from "@/modules/billing/components/RaisePerHeadBillDialog"
import { RateEditorDialog } from "@/modules/billing/components/RateEditorDialog"
import {
  useCancelSubscription,
  useSubscriptions,
} from "@/modules/billing/hooks/use-billing"
import { formatMinor } from "@/modules/billing/lib/money"
import { useConfirm } from "@/modules/platform-shared/ConfirmProvider"
import type { Subscription } from "@/modules/billing/types"

const GRID =
  "minmax(0,1.4fr) 90px 100px 130px minmax(0,1fr) 110px minmax(0,1.5fr) 230px"

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
  const [pricing, setPricing] = useState<Subscription | null>(null)
  const [billing, setBilling] = useState<Subscription | null>(null)

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
          <div>INTERVAL</div>
          <div>RATE / STUDENT</div>
          <div>VALUE</div>
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
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  color: "var(--txt3)",
                }}
              >
                {s.interval === null || s.interval === undefined
                  ? "—"
                  : s.interval.toLowerCase()}

                {s.billedOnDemand && (
                  <span
                    title="Session plans are skipped by the scheduled run — a bill is raised by hand"
                    style={{
                      fontSize: 8.5,
                      fontWeight: 600,
                      letterSpacing: ".06em",
                      color: "var(--series2)",
                      background: "var(--warn-bg)",
                      padding: "2px 6px",
                      borderRadius: 5,
                      whiteSpace: "nowrap",
                    }}
                  >
                    ON DEMAND
                  </span>
                )}
              </div>

              <div>
                {hasRate(s) && s.currency !== null ? (
                  <button
                    type="button"
                    onClick={() => setPricing(s)}
                    style={{
                      display: "block",
                      textAlign: "left",
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <div
                      className="qhub-mono"
                      style={{ fontSize: 12, fontWeight: 600 }}
                    >
                      {formatMinor(s.perStudentMinor ?? 0, s.currency)}
                    </div>
                    <span
                      style={{
                        fontSize: 8.5,
                        fontWeight: 600,
                        letterSpacing: ".06em",
                        ...rateTone(s.rateSource),
                        padding: "2px 6px",
                        borderRadius: 5,
                      }}
                    >
                      {s.rateSource}
                    </span>
                  </button>
                ) : (
                  <div style={{ color: "var(--txt4)" }}>—</div>
                )}
              </div>

              <div
                className="qhub-mono"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {value(s)}
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
                {live && s.billedOnDemand && (
                  <Action tone="filled" onClick={() => setBilling(s)}>
                    Raise bill…
                  </Action>
                )}

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

      {pricing !== null && (
        <RateEditorDialog
          subscription={pricing}
          onClose={() => setPricing(null)}
        />
      )}

      {billing !== null && (
        <RaisePerHeadBillDialog
          subscription={billing}
          onClose={() => setBilling(null)}
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
  tone?: "muted" | "accent" | "filled"
}) {
  const filled = tone === "filled"

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: filled
          ? "1px solid var(--accent)"
          : `1px solid ${tone === "accent" ? "var(--accent)" : "var(--line-strong)"}`,
        color: filled
          ? "#fff"
          : tone === "accent"
            ? "var(--accent)"
            : tone === "muted"
              ? "var(--txt4)"
              : "var(--txt2)",
        background: filled ? "var(--accent)" : "transparent",
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

  // Said before anything about invoicing history: on a session plan there is
  // no scheduled run to be up to date with, and a row reading "invoiced
  // through" would imply one is coming.
  if (s.billedOnDemand) {
    return s.rateSource === "NEGOTIATED" && s.perStudentMinor === 0
      ? "free pilot — negotiated zero, not unset"
      : "billed on demand — no scheduled run"
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

/**
 * Whether this row is a per-head deal at all.
 *
 * A negotiated rate always shows, zero included — a free pilot is a decision
 * someone made and must never read as "not set". A plan rate of zero is the
 * opposite: an ordinary base-price plan with no per-head component, which has
 * no rate to show.
 */
function hasRate(s: Subscription): boolean {
  if (s.perStudentMinor === null) return false

  return s.rateSource === "NEGOTIATED" || s.perStudentMinor > 0
}

function rateTone(source: Subscription["rateSource"]): {
  color: string
  background: string
} {
  return source === "NEGOTIATED"
    ? { color: "var(--accent)", background: "var(--accent-soft)" }
    : { color: "var(--txt3)", background: "var(--panel)" }
}

/**
 * What this subscription is worth, in the only unit that is honest for it.
 *
 * Monthly-family plans normalise to a month. Session plans have no month count
 * to divide by, so they report the whole contract at today's roll and say so —
 * the two figures must never be read as the same kind of number.
 */
function value(s: Subscription): string {
  if (s.currency === null) return "—"

  if (s.billedOnDemand) {
    return s.contractValueMinor === null
      ? "—"
      : `${formatMinor(s.contractValueMinor, s.currency)} / session`
  }

  return s.mrrMinor === null
    ? "—"
    : `${formatMinor(s.mrrMinor, s.currency)} / month`
}
