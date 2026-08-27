"use client"

import { useState } from "react"

import {
  useInvoices,
  useSubscriptions,
} from "@/modules/billing/hooks/use-billing"
import { formatMinor } from "@/modules/billing/lib/money"
import type { Invoice } from "@/modules/billing/types"

const STATUS_TABS = [
  { key: "", label: "All" },
  { key: "open", label: "Open" },
  { key: "overdue", label: "Overdue" },
  { key: "PAID", label: "Paid" },
] as const

const TYPE_TABS = [
  { key: "all", label: "All types" },
  { key: "run", label: "Billing run" },
  { key: "manual", label: "One-off" },
] as const

/**
 * This institution's billing, lifted from the draft.
 *
 * Scoped to one tenant, so it answers "what does this institution owe us"
 * without the operator having to filter the estate-wide ledger down to them.
 * Money is per-currency and never summed — an institution billed in two
 * currencies gets two totals, because adding them would invent an exchange
 * rate nobody chose.
 */
export function BillingTab({ tenantId }: { tenantId: number }) {
  const [status, setStatus] = useState<string>("")
  const [type, setType] = useState<string>("all")

  const { data: subscriptions } = useSubscriptions({ tenantId })
  const { data: invoices } = useInvoices({
    tenantId,
    ...(status === "" ? {} : { status }),
  })

  const subscription = subscriptions?.[0] ?? null

  const rows = (invoices?.data ?? []).filter((i) =>
    type === "all" ? true : type === "manual" ? i.isManual : !i.isManual
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          background: "var(--card)",
          borderRadius: 18,
          padding: 4,
          boxShadow: "var(--shadow-card)",
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0,1fr))",
        }}
      >
        <Stat
          label="Plan"
          value={subscription?.plan ?? "No subscription"}
          delta={subscription?.inTrial === true ? "in trial" : ""}
        />
        <Stat
          label="Status"
          value={subscription?.status ?? "—"}
          color={
            subscription?.status === "ACTIVE"
              ? "var(--accent)"
              : subscription?.status === "PAST_DUE"
                ? "var(--neg)"
                : subscription?.status === "CANCELLED"
                  ? "var(--txt3)"
                  : "var(--txt)"
          }
        />
        <Stat label="Outstanding" value={outstanding(rows)} />
        <Stat
          label="Invoices"
          value={String(rows.length)}
          delta={`${rows.filter((i) => i.isOverdue).length} overdue`}
          deltaColor={
            rows.some((i) => i.isOverdue) ? "var(--neg)" : "var(--txt3)"
          }
        />
      </div>

      <div
        style={{
          background: "var(--card)",
          borderRadius: 18,
          boxShadow: "var(--shadow-card)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 22px 0",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 600 }}>Invoices</div>
          <div
            style={{ marginLeft: "auto", fontSize: 12, color: "var(--txt3)" }}
          >
            Billed {subscription?.interval?.toLowerCase() ?? "annually"} ·
            payments by transfer
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 22px 0",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              background: "var(--panel)",
              borderRadius: 10,
              padding: 3,
            }}
          >
            {STATUS_TABS.map((t) => (
              <Seg
                key={t.key}
                on={status === t.key}
                onClick={() => setStatus(t.key)}
              >
                {t.label}
              </Seg>
            ))}
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            {TYPE_TABS.map((t) => (
              <Pill
                key={t.key}
                on={type === t.key}
                onClick={() => setType(t.key)}
              >
                {t.label}
              </Pill>
            ))}
          </div>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                fontSize: 11.5,
                color: "var(--txt4)",
                whiteSpace: "nowrap",
              }}
            >
              {rows.length} invoice{rows.length === 1 ? "" : "s"}
            </div>
            <button
              type="button"
              onClick={() => {
                setStatus("")
                setType("all")
              }}
              style={{
                fontSize: 11.5,
                color: "var(--txt4)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                padding: 0,
              }}
            >
              Reset
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "130px minmax(0,1fr) 120px 110px 110px",
            columnGap: 16,
            padding: "14px 22px 8px",
            fontSize: 10.5,
            letterSpacing: ".09em",
            color: "var(--txt4)",
          }}
        >
          <div>INVOICE</div>
          <div>PERIOD</div>
          <div>AMOUNT</div>
          <div>DUE</div>
          <div>STATUS</div>
        </div>

        {rows.map((invoice) => (
          <Row key={invoice.id} invoice={invoice} />
        ))}

        {rows.length === 0 && (
          <div
            style={{
              padding: "26px 22px",
              borderTop: "1px solid var(--line2)",
              fontSize: 13,
              color: "var(--txt3)",
            }}
          >
            No invoices match these filters.
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ invoice }: { invoice: Invoice }) {
  const paid = invoice.status === "PAID"
  const voided = invoice.status === "VOID"

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "130px minmax(0,1fr) 120px 110px 110px",
        columnGap: 16,
        alignItems: "center",
        padding: "12px 22px",
        fontSize: 13,
        borderTop: "1px solid var(--line2)",
      }}
    >
      <div className="qhub-mono" style={{ fontSize: 12, color: "var(--txt2)" }}>
        {invoice.number}
      </div>

      <div style={{ color: "var(--txt2)" }}>
        {invoice.isManual
          ? `ONE-OFF · ${invoice.notes ?? "raised by hand"}`
          : period(invoice)}
      </div>

      <div className="qhub-mono" style={{ fontSize: 12.5, fontWeight: 500 }}>
        {formatMinor(invoice.totalMinor, invoice.currency)}
      </div>

      <div
        style={{
          fontSize: 12.5,
          color: invoice.isOverdue ? "var(--warn)" : "var(--txt3)",
        }}
      >
        {paid
          ? `paid ${stamp(invoice.issuedOn)}`
          : invoice.dueOn === null
            ? "—"
            : stamp(invoice.dueOn)}
      </div>

      <div>
        <span
          className="qhub-mono"
          style={{
            fontSize: 10,
            letterSpacing: ".05em",
            padding: "4px 8px",
            borderRadius: 7,
            color: paid
              ? "var(--accent)"
              : voided
                ? "var(--txt3)"
                : invoice.isOverdue
                  ? "var(--warn)"
                  : "var(--txt2)",
            background: paid
              ? "var(--good-bg)"
              : voided
                ? "var(--panel)"
                : invoice.isOverdue
                  ? "var(--warn-bg)"
                  : "var(--panel)",
          }}
        >
          {/* OVERDUE is derived from the due date, not a stored status — a
              stored one needs a sweep to stay true. */}
          {invoice.isOverdue && !paid ? "OVERDUE" : invoice.status}
        </span>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  delta,
  deltaColor,
  color,
}: {
  label: string
  value: string
  delta?: string
  deltaColor?: string
  color?: string
}) {
  return (
    <div
      style={{
        padding: "16px 18px",
        borderRight: "1px solid var(--line)",
      }}
    >
      <div style={{ fontSize: 12.5, color: "var(--txt3)", marginBottom: 6 }}>
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 7,
          whiteSpace: "nowrap",
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: color ?? "var(--txt)",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {value}
        </div>
        {delta !== undefined && delta !== "" && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: deltaColor ?? "var(--txt3)",
            }}
          >
            {delta}
          </div>
        )}
      </div>
    </div>
  )
}

function Seg({
  on,
  onClick,
  children,
}: {
  on: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontSize: 12,
        fontWeight: on ? 600 : 400,
        color: on ? "var(--txt)" : "var(--txt3)",
        background: on ? "var(--card)" : "transparent",
        boxShadow: on ? "var(--shadow-sm)" : "none",
        padding: "6px 11px",
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        whiteSpace: "nowrap",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  )
}

function Pill({
  on,
  onClick,
  children,
}: {
  on: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontSize: 11.5,
        fontWeight: 500,
        color: on ? "var(--accent)" : "var(--txt2)",
        border: `1px solid ${on ? "var(--accent)" : "var(--line-strong)"}`,
        background: on ? "var(--accent-soft)" : "transparent",
        padding: "5px 11px",
        borderRadius: 999,
        cursor: "pointer",
        whiteSpace: "nowrap",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  )
}

/**
 * Outstanding across the shown invoices.
 *
 * Per-currency, never summed. An institution billed in two currencies gets
 * both totals side by side — adding them would invent an exchange rate
 * nobody chose.
 */
function outstanding(invoices: Invoice[]): string {
  const byCurrency = new Map<string, number>()

  for (const invoice of invoices) {
    if (invoice.outstandingMinor <= 0) continue

    byCurrency.set(
      invoice.currency,
      (byCurrency.get(invoice.currency) ?? 0) + invoice.outstandingMinor
    )
  }

  if (byCurrency.size === 0) return "Nothing due"

  return [...byCurrency.entries()]
    .map(([currency, minor]) => formatMinor(minor, currency))
    .join(" · ")
}

function period(invoice: Invoice): string {
  if (!invoice.periodStart || !invoice.periodEnd) return "—"

  return `${stamp(invoice.periodStart)} – ${stamp(invoice.periodEnd)}`
}

function stamp(iso: string | null): string {
  if (!iso) return "—"

  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
