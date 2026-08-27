"use client"

import { useState } from "react"
import Link from "next/link"

import { useRail } from "@/modules/platform-rail/use-rail"

const RANGES = [7, 30] as const

/**
 * The console's right rail, lifted from the draft.
 *
 * Sits on every screen at a fixed 330px. Support at a glance, the newest
 * institutions, and what the platform itself is carrying.
 */
export function ConsoleRail({ enabled }: { enabled: boolean }) {
  const [days, setDays] = useState<number>(7)
  const { data } = useRail(days, enabled)

  const t = data?.tickets
  const load = data?.load

  return (
    <aside
      style={{
        width: 330,
        flex: "0 0 330px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
      aria-label="Support and platform load"
    >
      <Panel
        title="Support Tickets"
        days={days}
        onDays={setDays}
        footer={
          <>
            <Divider />
            <div
              style={{
                fontSize: 14.5,
                fontWeight: 600,
                marginBottom: 11,
                color: "var(--txt)",
              }}
            >
              Newest Tenants
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 8,
              }}
            >
              {(data?.newestTenants ?? []).map((tenant) => (
                <Link
                  key={tenant.id}
                  href={`/platform/${tenant.id}`}
                  title={tenant.name}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      aspectRatio: "3/4",
                      borderRadius: 11,
                      background: "var(--img-ph)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {tenant.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={tenant.logoUrl}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--dots)",
                        }}
                      >
                        {tenant.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 10.5,
                      letterSpacing: ".07em",
                      color: "var(--txt4)",
                      marginTop: 6,
                      textAlign: "center",
                    }}
                  >
                    {tenant.onboardedAt
                      ? new Date(tenant.onboardedAt)
                          .toLocaleDateString(undefined, {
                            month: "short",
                            day: "2-digit",
                          })
                          .toUpperCase()
                      : "—"}
                  </div>
                </Link>
              ))}

              {(data?.newestTenants ?? []).length === 0 && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    fontSize: 12,
                    color: "var(--txt4)",
                  }}
                >
                  No institutions yet.
                </div>
              )}
            </div>
          </>
        }
      >
        <Tile
          label="Open across all tenants"
          value={t?.open ?? 0}
          delta={t?.openedToday ? `+${t.openedToday} today` : undefined}
          deltaTone="neg"
        />

        <div
          style={{
            background: "var(--panel)",
            borderRadius: 14,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div>
            <div
              style={{ fontSize: 12.5, color: "var(--txt3)", marginBottom: 5 }}
            >
              Breaching SLA
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  color: (t?.breaching ?? 0) > 0 ? "var(--neg)" : "var(--txt)",
                }}
              >
                {t?.breaching ?? 0}
              </span>
              {(t?.breaching ?? 0) > 0 && (
                <span
                  style={{
                    fontSize: 12.5,
                    color: "var(--neg)",
                    fontWeight: 500,
                  }}
                >
                  act now
                </span>
              )}
            </div>
          </div>

          <Donut breaching={t?.breaching ?? 0} open={t?.open ?? 0} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "11px 0",
            fontSize: 13.5,
            padding: "0 2px",
          }}
        >
          <Line label="P1 · Critical" value={t?.p1 ?? 0} />
          <Line label="P2 · High" value={t?.p2 ?? 0} />
          <Line label="Awaiting tenant reply" value={t?.awaitingTenant ?? 0} />
          <Line label="Resolved today" value={t?.resolvedToday ?? 0} />
        </div>
      </Panel>

      <Panel title="Platform Load" days={days} onDays={setDays}>
        {/*
          The draft asks for "concurrent learners now". Nothing here measures
          sessions in flight, and printing a 24-hour count under that label
          would overstate live load by orders of magnitude — so it carries the
          name of what it actually is.
        */}
        <Tile
          label="Sign-ins · last 24h"
          value={load?.signIns24h ?? 0}
          delta="across the estate"
        />

        <div
          style={{
            background: "var(--panel)",
            borderRadius: 14,
            padding: "16px 14px 10px",
          }}
        >
          <Bars bars={load?.bars ?? []} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "11px 14px",
            fontSize: 13.5,
            padding: "14px 2px 0",
            alignItems: "center",
          }}
        >
          <Line label="Audited events · 24h" value={load?.activity24h ?? 0} />
          <Line label="Job queue depth" value={load?.queueDepth ?? 0} />
          <Line
            label="Failed jobs"
            value={load?.failedJobs ?? 0}
            tone={(load?.failedJobs ?? 0) > 0 ? "neg" : undefined}
          />
        </div>
      </Panel>
    </aside>
  )
}

// --- Pieces -----------------------------------------------------------------

function Panel({
  title,
  days,
  onDays,
  children,
  footer,
}: {
  title: string
  days: number
  onDays: (d: number) => void
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 20,
        padding: 18,
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ fontSize: 15.5, fontWeight: 600, color: "var(--txt)" }}>
            {title}
          </div>
          <div style={{ color: "var(--dots)", letterSpacing: 1 }}>···</div>
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onDays(r)}
              style={{
                fontSize: 12,
                color: days === r ? "var(--txt2)" : "var(--txt4)",
                fontWeight: days === r ? 600 : 500,
                background: "none",
                border: "none",
                padding: "0 2px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {r}D
            </button>
          ))}
        </div>
      </div>

      {children}
      {footer}
    </div>
  )
}

function Tile({
  label,
  value,
  delta,
  deltaTone,
}: {
  label: string
  value: number
  delta?: string
  deltaTone?: "neg"
}) {
  return (
    <div
      style={{
        background: "var(--panel)",
        borderRadius: 14,
        padding: "14px 16px",
        marginBottom: 10,
      }}
    >
      <div style={{ fontSize: 12.5, color: "var(--txt3)", marginBottom: 5 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span
          className="qhub-mono"
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--txt)",
          }}
        >
          {value.toLocaleString()}
        </span>
        {delta && (
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 500,
              color: deltaTone === "neg" ? "var(--neg)" : "var(--txt4)",
            }}
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  )
}

function Line({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: "neg"
}) {
  return (
    <>
      <div style={{ color: "var(--txt2)" }}>{label}</div>
      <div
        className="qhub-mono"
        style={{
          fontWeight: 500,
          color: tone === "neg" ? "var(--neg)" : "var(--txt)",
        }}
      >
        {value.toLocaleString()}
      </div>
    </>
  )
}

/**
 * The draft's two-arc donut.
 *
 * Arc lengths are computed from the real ratio rather than fixed, so the ring
 * actually says something: how much of the open queue is breaching.
 */
function Donut({ breaching, open }: { breaching: number; open: number }) {
  const circumference = 2 * Math.PI * 22
  const ratio = open > 0 ? Math.min(1, breaching / open) : 0
  const breachArc = circumference * ratio
  const healthyArc = circumference * (1 - ratio)

  return (
    <svg width="54" height="54" viewBox="0 0 54 54" aria-hidden="true">
      <circle
        style={{ stroke: "var(--accent)" }}
        cx="27"
        cy="27"
        r="22"
        fill="none"
        strokeWidth="5"
        strokeDasharray={`${healthyArc} ${circumference}`}
        transform="rotate(-90 27 27)"
        strokeLinecap="round"
      />
      {breachArc > 0 && (
        <circle
          style={{ stroke: "var(--neg)" }}
          cx="27"
          cy="27"
          r="22"
          fill="none"
          strokeWidth="5"
          strokeDasharray={`${breachArc} ${circumference}`}
          transform={`rotate(${-90 + (1 - ratio) * 360} 27 27)`}
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

function Bars({ bars }: { bars: Array<{ day: string; value: number }> }) {
  const max = Math.max(...bars.map((b) => b.value), 1)
  const peak = bars.reduce(
    (best, b) => (b.value > best ? b.value : best),
    Number.NEGATIVE_INFINITY
  )

  if (bars.length === 0) {
    return (
      <div
        style={{
          height: 110,
          display: "grid",
          placeItems: "center",
          fontSize: 11.5,
          color: "var(--txt4)",
          textAlign: "center",
        }}
      >
        Nothing collected yet
      </div>
    )
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 8,
          height: 110,
        }}
      >
        {bars.map((b) => (
          <div
            key={b.day}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              height: "100%",
              justifyContent: "flex-end",
            }}
            title={`${b.day}: ${b.value.toLocaleString()}`}
          >
            <div
              style={{
                width: "100%",
                borderRadius: 999,
                // The peak day is picked out, as the draft does.
                background: b.value === peak ? "var(--accent)" : "var(--bar)",
                height: `${Math.max(4, (b.value / max) * 100)}%`,
              }}
            />
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          marginTop: 8,
        }}
      >
        {bars.map((b) => (
          <div
            key={b.day}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 11,
              color: "var(--txt4)",
            }}
          >
            {new Date(b.day).getDate()}
          </div>
        ))}
      </div>
    </>
  )
}

function Divider() {
  return (
    <div
      style={{
        height: 1,
        background: "var(--line)",
        margin: "16px 0 14px",
      }}
    />
  )
}
