"use client"

/**
 * What the institution owes Qverse, lifted from the bundle 25 canvas.
 *
 * This is the platform billing the institution — not student fees, which are
 * a different ledger entirely. The subtitle says how the charge is computed
 * and how it is paid, and the footer sends invoice queries through Support
 * with the reference, because the platform team reads the same ledger and a
 * reference is the whole difference between a fast answer and a slow one.
 */

const GRID = "130px minmax(0,1.6fr) 130px 110px 110px 110px"

const STATS = [
  { label: "Outstanding", value: "₦184.2M", delta: "1 invoice" },
  // Zero overdue is worth its own tile: the absence is the reassurance.
  { label: "Overdue", value: "₦0", delta: "—" },
  { label: "Paid this session", value: "₦178.9M", delta: "1 invoice" },
  { label: "Negotiated rate", value: "₦1,000", delta: "per student · session" },
]

const INVOICES = [
  {
    ref: "INV-2027-001",
    desc: "2026/2027 session · 184,206 students @ ₦1,000",
    amount: "₦184,206,000",
    issued: "Aug 20",
    due: "Sep 19",
    status: "UNPAID" as const,
  },
  {
    ref: "INV-2026-014",
    desc: "2025/2026 session · 178,911 students @ ₦1,000",
    amount: "₦178,911,000",
    issued: "Oct 2, 2025",
    due: "Paid Oct 28",
    status: "PAID" as const,
  },
  {
    ref: "INV-2026-002",
    desc: "Storage quota extension · one-off",
    amount: "₦450,000",
    issued: "Aug 21",
    due: "Paid Aug 23",
    status: "PAID" as const,
  },
]

export function Billing() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
        {STATS.map((k, i) => (
          <div
            key={k.label}
            style={{
              padding: "18px 20px",
              borderRight:
                i === STATS.length - 1 ? "none" : "1px solid var(--line)",
            }}
          >
            <div
              style={{ fontSize: 13, color: "var(--txt3)", marginBottom: 7 }}
            >
              {k.label}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <div
                style={{
                  fontSize: 23,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  color: "var(--txt)",
                }}
              >
                {k.value}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--txt4)" }}>
                {k.delta}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "var(--card)",
          borderRadius: 20,
          boxShadow: "var(--shadow-card)",
          padding: "20px 22px",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>
          Invoices from Qverse
        </div>
        <div style={{ fontSize: 12, color: "var(--txt3)", marginBottom: 14 }}>
          Billed per student per academic session at your negotiated rate ·
          payment by bank transfer, reconciled within a day
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: GRID,
            columnGap: 14,
            padding: "8px 4px",
            borderBottom: "1px solid var(--line-strong)",
            fontSize: 10.5,
            letterSpacing: ".09em",
            color: "var(--txt4)",
            fontWeight: 600,
          }}
        >
          <div>REF</div>
          <div>DESCRIPTION</div>
          <div>AMOUNT</div>
          <div>ISSUED</div>
          <div>DUE</div>
          <div style={{ textAlign: "right" }}>STATUS</div>
        </div>

        {INVOICES.map((b) => {
          const paid = b.status === "PAID"

          return (
            <div
              key={b.ref}
              style={{
                display: "grid",
                gridTemplateColumns: GRID,
                columnGap: 14,
                alignItems: "center",
                padding: "12px 4px",
                fontSize: 13,
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div
                className="portal-mono"
                style={{ fontSize: 11.5, color: "var(--txt3)" }}
              >
                {b.ref}
              </div>
              <div
                style={{
                  color: "var(--txt2)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {b.desc}
              </div>
              <div
                className="portal-mono"
                style={{ fontSize: 12.5, fontWeight: 500 }}
              >
                {b.amount}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>
                {b.issued}
              </div>
              {/* A settled invoice's date recedes; one still owed stays
                  readable, because only that one is a deadline. */}
              <div
                style={{
                  fontSize: 12.5,
                  color: paid ? "var(--txt4)" : "var(--txt3)",
                }}
              >
                {b.due}
              </div>
              <div style={{ textAlign: "right" }}>
                <span
                  className="portal-mono"
                  style={{
                    fontSize: 9.5,
                    letterSpacing: ".07em",
                    padding: "3px 9px",
                    borderRadius: 999,
                    color: paid ? "var(--accent)" : "var(--warn)",
                    background: paid ? "var(--accent-soft)" : "var(--warn-bg)",
                  }}
                >
                  {b.status}
                </span>
              </div>
            </div>
          )
        })}

        <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 12 }}>
          Queries about an invoice go through Support — reference the invoice
          number and the platform team sees the same ledger.
        </div>
      </div>
    </div>
  )
}
