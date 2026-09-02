"use client"

import { useMemo, useState } from "react"

import { usePlatformPermissions } from "@/lib/auth/platform-permissions"
import { SubscriptionsTable } from "@/modules/billing/components/SubscriptionsTable"
import { formatMinor } from "@/modules/billing/lib/money"
import {
  useInvoices,
  usePlans,
  useRecordPayment,
  useRunBilling,
  useSendReminder,
} from "@/modules/billing/hooks/use-billing"
import type { Invoice, RevenueRow } from "@/modules/billing/types"

const GRID =
  "128px minmax(0,1.4fr) minmax(0,1.5fr) 120px 100px 110px 100px 210px"

type View = "invoices" | "plans"

/**
 * Billing, lifted from the draft.
 *
 * Revenue is reported PER CURRENCY and never summed across them. There is no
 * FX in this system, so one combined total spanning NGN and USD would be
 * arithmetic on incompatible units dressed up as a number somebody might act
 * on.
 */
export function BillingLedger() {
  const { can } = usePlatformPermissions()
  const canManage = can("billing.manage")

  const [view, setView] = useState<View>("invoices")
  const [status, setStatus] = useState("")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)

  const { data, isPending } = useInvoices(status ? { status } : {})
  const run = useRunBilling()

  const invoices = useMemo(() => {
    const all = data?.data ?? []
    if (!query.trim()) return all

    const q = query.toLowerCase()

    return all.filter(
      (i) =>
        i.number.toLowerCase().includes(q) ||
        (i.institution ?? "").toLowerCase().includes(q)
    )
  }, [data, query])

  const perPage = 10
  const lastPage = Math.max(1, Math.ceil(invoices.length / perPage))
  const rows = invoices.slice((page - 1) * perPage, page * perPage)

  const revenue = data?.meta.revenue ?? []
  const overdue = (data?.data ?? []).filter((i) => i.isOverdue)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "-0.015em",
              color: "var(--txt)",
              margin: 0,
            }}
          >
            Billing &amp; invoices
          </h1>
          <div style={{ fontSize: 12.5, color: "var(--txt3)", marginTop: 3 }}>
            What institutions owe QHub — separate from the fees their students
            owe them
          </div>
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
              display: "flex",
              background: "var(--panel)",
              borderRadius: 11,
              padding: 3,
            }}
          >
            <Segment
              label="Invoices"
              active={view === "invoices"}
              onClick={() => setView("invoices")}
            />
            <Segment
              label="Plans & subscriptions"
              active={view === "plans"}
              onClick={() => setView("plans")}
            />
          </div>

          {canManage && (
            <button
              type="button"
              onClick={() => run.mutate()}
              disabled={run.isPending}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                background: "var(--accent)",
                color: "#fff",
                fontSize: 13.5,
                fontWeight: 500,
                padding: "11px 18px",
                borderRadius: 11,
                border: "none",
                cursor: run.isPending ? "default" : "pointer",
                whiteSpace: "nowrap",
                fontFamily: "inherit",
              }}
            >
              {run.isPending ? "Running…" : "Run billing"}
            </button>
          )}
        </div>
      </div>

      {view === "plans" ? (
        <>
          <PlansView revenue={revenue} />
          <SubscriptionsTable />
        </>
      ) : (
        <>
          <div
            style={{
              background: "var(--card)",
              borderRadius: 20,
              padding: 4,
              boxShadow: "var(--shadow-card)",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
            }}
          >
            <Stat
              label="Invoices"
              value={String(data?.data.length ?? 0)}
              note="on record"
            />
            <Stat
              label="Overdue"
              value={String(overdue.length)}
              note="past due date"
              tone={overdue.length > 0 ? "neg" : undefined}
            />
            <Stat
              label="Outstanding"
              value={perCurrency(revenue, "outstandingMinor")}
              note="per currency"
              tone="warn"
            />
            <Stat
              label="Collected"
              value={perCurrency(revenue, "paidMinor")}
              note="per currency"
              last
            />
          </div>

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
                gap: 10,
                padding: "16px 24px 0",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "var(--panel)",
                  border: "1px solid var(--line-strong)",
                  borderRadius: 10,
                  padding: "8px 12px",
                  width: 250,
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--txt4)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setPage(1)
                  }}
                  placeholder="Search invoice or institution…"
                  aria-label="Search invoices"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    fontSize: 12.5,
                    color: "var(--txt)",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  background: "var(--panel)",
                  borderRadius: 10,
                  padding: 3,
                }}
              >
                {[
                  ["", "All"],
                  ["ISSUED", "Open"],
                  ["PAID", "Paid"],
                  ["VOID", "Void"],
                ].map(([value, label]) => (
                  <Segment
                    key={value || "all"}
                    label={label}
                    small
                    active={status === value}
                    onClick={() => {
                      setStatus(value)
                      setPage(1)
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: GRID,
                  columnGap: 16,
                  padding: "16px 24px 10px",
                  fontSize: 10.5,
                  letterSpacing: ".09em",
                  color: "var(--txt4)",
                  minWidth: 1100,
                  boxSizing: "border-box",
                }}
              >
                <div>REF</div>
                <div>INSTITUTION</div>
                <div>PERIOD</div>
                <div>AMOUNT</div>
                <div>ISSUED</div>
                <div>DUE</div>
                <div>STATUS</div>
                <div />
              </div>

              {isPending && <Empty>Loading…</Empty>}

              {!isPending && rows.length === 0 && (
                <Empty>No invoices match these filters.</Empty>
              )}

              {rows.map((invoice) => (
                <InvoiceRow
                  key={invoice.id}
                  invoice={invoice}
                  canManage={canManage}
                />
              ))}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 24px",
                borderTop: "1px solid var(--line2)",
                fontSize: 12.5,
                color: "var(--txt3)",
              }}
            >
              <div>
                {invoices.length} invoice{invoices.length === 1 ? "" : "s"} ·
                amounts are per currency and never summed across them
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 12, color: "var(--txt4)" }}>
                  Page {page} of {lastPage}
                </div>
                <Pager
                  label="Previous"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                />
                <Pager
                  label="Next"
                  disabled={page >= lastPage}
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function InvoiceRow({
  invoice: i,
  canManage,
}: {
  invoice: Invoice
  canManage: boolean
}) {
  const remind = useSendReminder()
  const pay = useRecordPayment(i.id)

  const remindedToday =
    i.remindedAt !== null &&
    new Date(i.remindedAt).toDateString() === new Date().toDateString()

  const open = i.status === "ISSUED"

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: GRID,
        columnGap: 16,
        alignItems: "center",
        padding: "13px 24px",
        fontSize: 13,
        borderTop: "1px solid var(--line2)",
        minWidth: 1100,
        boxSizing: "border-box",
      }}
    >
      <div
        className="qhub-mono"
        style={{ fontSize: 11.5, color: "var(--txt2)" }}
      >
        {i.number}
      </div>

      <div
        style={{
          color: "var(--txt)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {i.institution ?? "—"}
      </div>

      <div
        style={{
          minWidth: 0,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {/* A one-off has no period. The draft puts the chip and description
            here rather than leaving the cell blank, because blank reads as
            missing data. */}
        {i.isManual ? (
          <>
            <span
              style={{
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: ".06em",
                color: "var(--series2)",
                background: "var(--warn-bg)",
                padding: "2px 7px",
                borderRadius: 6,
                marginRight: 7,
              }}
            >
              ONE-OFF
            </span>
            <span style={{ color: "var(--txt2)" }}>
              {i.notes ?? "raised by hand"}
            </span>
          </>
        ) : (
          <span style={{ color: "var(--txt2)" }}>
            {i.periodStart && i.periodEnd
              ? `${i.periodStart} → ${i.periodEnd}`
              : "—"}
          </span>
        )}
      </div>

      <div
        className="qhub-mono"
        style={{ fontSize: 12.5, fontWeight: 500, color: "var(--txt)" }}
      >
        {formatMinor(i.totalMinor, i.currency)}
      </div>

      <div style={{ fontSize: 12, color: "var(--txt3)" }}>
        {i.issuedOn ?? "—"}
      </div>

      <div
        style={{
          fontSize: 12,
          color: i.isOverdue ? "var(--neg)" : "var(--txt3)",
          whiteSpace: "nowrap",
        }}
      >
        {i.dueOn ?? "—"}
      </div>

      <div>
        <span
          className="qhub-mono"
          style={{
            fontSize: 10,
            letterSpacing: ".05em",
            padding: "4px 8px",
            borderRadius: 7,
            ...invoiceTone(i),
          }}
        >
          {i.isOverdue ? "OVERDUE" : i.status}
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
        {canManage && open && (
          <>
            <Ghost
              onClick={() => remind.mutate(i.id)}
              disabled={remindedToday || remind.isPending}
              tone={remindedToday ? "muted" : undefined}
            >
              {remindedToday ? "Reminded today" : "Send reminder"}
            </Ghost>
            <Ghost
              tone="accent"
              onClick={() =>
                pay.mutate({
                  amountMinor: i.outstandingMinor,
                  method: "BANK_TRANSFER",
                })
              }
              disabled={pay.isPending}
            >
              Mark paid
            </Ghost>
          </>
        )}
      </div>
    </div>
  )
}

// --- Plans view -------------------------------------------------------------

function PlansView({ revenue }: { revenue: RevenueRow[] }) {
  const { data: plans } = usePlans()

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 14,
        }}
      >
        {revenue.map((r) => (
          <div
            key={r.currency}
            style={{
              background: "var(--card)",
              borderRadius: 18,
              boxShadow: "var(--shadow-card)",
              padding: "18px 20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <div
                className="qhub-mono"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--accent)",
                }}
              >
                {r.currency}
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px 14px",
                marginTop: 12,
                fontSize: 12,
                color: "var(--txt3)",
              }}
            >
              <div>
                MRR
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "var(--txt)",
                    marginTop: 2,
                  }}
                >
                  {formatMinor(r.mrrMinor, r.currency)}
                </div>
              </div>
              <div>
                Collected 30d
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "var(--txt)",
                    marginTop: 2,
                  }}
                >
                  {formatMinor(r.paidMinor, r.currency)}
                </div>
              </div>
              <div>
                Outstanding
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--warn)",
                    marginTop: 2,
                  }}
                >
                  {formatMinor(r.outstandingMinor, r.currency)}
                </div>
              </div>
              <div>
                Overdue
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--neg)",
                    marginTop: 2,
                  }}
                >
                  {formatMinor(r.overdueMinor, r.currency)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, color: "var(--txt4)" }}>
        Reported per currency and never combined — there is no FX in this
        system, so a single total spanning them would be arithmetic on
        incompatible units.
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 14,
        }}
      >
        {(plans ?? []).map((p) => (
          <div
            key={p.id}
            style={{
              background: "var(--card)",
              borderRadius: 18,
              boxShadow: "var(--shadow-card)",
              padding: "20px 22px",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--txt)" }}>
              {p.name}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--txt2)", marginTop: 4 }}>
              {p.includedStudents.toLocaleString()} learners included ·{" "}
              {formatMinor(p.perStudentMinor, p.currency)} per extra
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10,
                fontSize: 12.5,
                marginTop: 12,
              }}
            >
              <span
                className="qhub-mono"
                style={{ fontSize: 10.5, color: "var(--txt4)", width: 30 }}
              >
                {p.currency}
              </span>
              <span style={{ fontWeight: 600, color: "var(--txt)" }}>
                {formatMinor(p.basePriceMinor, p.currency)}
              </span>
              <span style={{ color: "var(--txt4)", fontSize: 11.5 }}>
                per {p.interval.toLowerCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// --- Small pieces -----------------------------------------------------------

/** Per currency, joined — never added together. */
function perCurrency(
  revenue: RevenueRow[],
  key: "outstandingMinor" | "paidMinor"
): string {
  if (revenue.length === 0) return "—"

  return (
    revenue
      .filter((r) => r[key] > 0)
      .map((r) => formatMinor(r[key], r.currency))
      .join(" · ") || formatMinor(0, revenue[0].currency)
  )
}

function invoiceTone(i: Invoice) {
  if (i.isOverdue) return { color: "var(--neg)", background: "var(--neg-bg)" }
  if (i.status === "PAID") {
    return { color: "var(--accent)", background: "var(--accent-soft)" }
  }
  if (i.status === "VOID") {
    return { color: "var(--txt4)", background: "var(--panel)" }
  }

  return { color: "var(--warn)", background: "var(--warn-bg)" }
}

function Stat({
  label,
  value,
  note,
  tone,
  last,
}: {
  label: string
  value: string
  note: string
  tone?: "neg" | "warn"
  last?: boolean
}) {
  return (
    <div
      style={{
        padding: "18px 20px",
        borderRight: last ? "none" : "1px solid var(--line)",
      }}
    >
      <div style={{ fontSize: 13, color: "var(--txt3)", marginBottom: 7 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <div
          className="qhub-mono"
          style={{
            fontSize: value.length > 12 ? 15 : 23,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color:
              tone === "neg"
                ? "var(--neg)"
                : tone === "warn"
                  ? "var(--warn)"
                  : "var(--txt)",
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--txt4)" }}>
          {note}
        </div>
      </div>
    </div>
  )
}

function Segment({
  label,
  active,
  onClick,
  small,
}: {
  label: string
  active: boolean
  onClick: () => void
  small?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontSize: small ? 12 : 12.5,
        fontWeight: active ? 600 : 500,
        color: active ? "var(--txt)" : "var(--txt3)",
        background: active ? "var(--card)" : "transparent",
        boxShadow: active ? "var(--shadow-sm)" : "none",
        padding: small ? "6px 11px" : "8px 15px",
        borderRadius: small ? 8 : 9,
        border: "none",
        cursor: "pointer",
        whiteSpace: "nowrap",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  )
}

function Ghost({
  children,
  onClick,
  disabled,
  tone,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  tone?: "accent" | "muted"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        border: "1px solid var(--line-strong)",
        borderRadius: 9,
        background: "transparent",
        color:
          tone === "accent"
            ? "var(--accent)"
            : tone === "muted"
              ? "var(--txt4)"
              : "var(--txt2)",
        fontSize: 11.5,
        fontWeight: 500,
        padding: "6px 11px",
        cursor: disabled ? "default" : "pointer",
        whiteSpace: "nowrap",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "26px 24px",
        borderTop: "1px solid var(--line2)",
        fontSize: 13,
        color: "var(--txt3)",
      }}
    >
      {children}
    </div>
  )
}

function Pager({
  label,
  disabled,
  onClick,
}: {
  label: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "6px 12px",
        borderRadius: 9,
        background: "var(--panel)",
        border: "none",
        color: disabled ? "var(--txt4)" : "var(--txt2)",
        fontSize: 12.5,
        cursor: disabled ? "default" : "pointer",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  )
}
