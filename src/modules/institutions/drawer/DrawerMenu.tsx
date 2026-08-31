"use client"

import { useTicketQueue } from "@/modules/tickets/hooks/use-tickets"

export type DrawerTab =
  | "overview"
  | "students"
  | "lecturers"
  | "billing"
  | "tickets"
  | "features"
  | "maint"
  | "import"
  | "infra"
  | "media"
  | "audit"

/** The draft's items, with its own icon paths. */
const ITEMS: Array<{
  key: DrawerTab
  label: string
  d: string
  warn?: boolean
}> = [
  {
    key: "overview",
    label: "Overview",
    d: "M4 11l8-6.5 8 6.5v7.5a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 18.5z",
  },
  {
    key: "students",
    label: "Students",
    d: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  },
  {
    key: "lecturers",
    label: "Lecturers",
    d: "M22 9L12 4 2 9l10 5 10-5zM6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5",
  },
  {
    key: "billing",
    label: "Billing & invoices",
    d: "M5 4.5h14v15l-2.3-1.5-2.3 1.5-2.4-1.5-2.4 1.5-2.3-1.5L5 19.5zM8.5 9h7M8.5 12.5h5",
    warn: true,
  },
  {
    key: "tickets",
    label: "Tickets",
    d: "M4 6.5h16v4a2 2 0 000 4v4H4v-4a2 2 0 000-4z",
  },
  {
    key: "features",
    label: "Feature flags",
    d: "M6 3v18M6 4h12l-2.5 4L18 12H6",
  },
  {
    key: "maint",
    label: "Maintenance",
    d: "M14.5 6.5a4.5 4.5 0 00-6 6L3 18l3 3 5.5-5.5a4.5 4.5 0 006-6L14 13l-3-3z",
  },
  {
    key: "import",
    label: "Bulk import",
    d: "M12 3v12M7 10l5 5 5-5M4 21h16",
  },
  {
    key: "infra",
    label: "Infrastructure",
    d: "M4 5h16v5H4zM4 14h16v5H4zM7 7.5h.01M7 16.5h.01",
  },
  {
    key: "media",
    label: "Media",
    d: "M3 5h18v14H3zM10 9.5l5 2.5-5 2.5z",
  },
  {
    key: "audit",
    label: "Audit log",
    d: "M12 8v4l2.5 1.5M20 12a8 8 0 11-16 0 8 8 0 0116 0z",
  },
]

export function DrawerMenu({
  tab,
  onTab,
  tenantId,
}: {
  tab: DrawerTab
  onTab: (tab: DrawerTab) => void
  tenantId: number
}) {
  // Only the ticket count is knowable without opening a tab, so only it
  // carries a badge — an invented number beside a menu item is worse than no
  // number.
  const { data: tickets } = useTicketQueue({ status: "active" })

  const openTickets = (tickets?.data ?? []).filter(
    (t) => t.tenantId === tenantId
  ).length

  return (
    <nav
      style={{
        flex: "0 0 236px",
        borderRight: "1px solid var(--line-strong)",
        background: "var(--card)",
        padding: "16px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
      aria-label="Institution sections"
    >
      {ITEMS.map((item) => {
        const on = tab === item.key
        const count = item.key === "tickets" ? openTickets : 0

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onTab(item.key)}
            aria-current={on ? "page" : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 11,
              fontSize: 13,
              fontWeight: on ? 600 : 500,
              color: on ? "var(--txt)" : "var(--txt2)",
              background: on ? "var(--panel)" : "transparent",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "inherit",
            }}
          >
            <svg
              style={{ stroke: on ? "var(--accent)" : "var(--icon)" }}
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={item.d} />
            </svg>
            {item.label}
            {count > 0 && (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: item.warn ? "var(--neg)" : "var(--txt3)",
                  background: item.warn ? "var(--neg-bg)" : "var(--panel)",
                  padding: "2px 7px",
                  borderRadius: 999,
                }}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}

      <div
        style={{
          marginTop: "auto",
          fontSize: 10.5,
          color: "var(--txt4)",
          padding: "0 12px",
          lineHeight: 1.5,
        }}
      >
        Everything here is scoped to this tenant only.
      </div>
    </nav>
  )
}
