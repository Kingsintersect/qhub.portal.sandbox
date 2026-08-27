"use client"

import { useState } from "react"

import { usePlatformAudit } from "@/modules/platform-team/hooks/use-platform-team"
import type { PlatformAuditEntry } from "@/modules/platform-team/types"

const ACTORS = ["All", "QHub", "System"] as const
const CATEGORIES = [
  "All",
  "Data",
  "Sync",
  "Security",
  "Access",
  "Platform",
  "Billing",
] as const
const SIZES = [25, 50, 100] as const

/**
 * The platform audit log, lifted from the draft.
 *
 * Append-only: there is no edit and no delete, and the footer says so because
 * that is the property the log is FOR. Filtering happens server-side so it
 * covers the whole history rather than the page on screen — a filter that
 * only searched the visible fifty rows would be worse than none, because it
 * looks like it worked.
 */
export function PlatformAuditPanel() {
  const [live, setLive] = useState(true)
  const [search, setSearch] = useState("")
  const [actor, setActor] = useState<string>("All")
  const [category, setCategory] = useState<string>("All")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState<number>(50)

  const { data, isError } = usePlatformAudit(
    {
      page,
      perPage,
      ...(search.trim() === "" ? {} : { search: search.trim() }),
      ...(actor === "All" ? {} : { actorClass: actor }),
      ...(category === "All" ? {} : { category }),
    },
    live
  )

  const rows = data?.data ?? []
  const meta = data?.meta
  const summary = meta?.summary

  const reset = () => {
    setSearch("")
    setActor("All")
    setCategory("All")
    setPage(1)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: "-0.015em",
                margin: 0,
              }}
            >
              Platform audit log
            </h1>

            <span
              className="qhub-mono"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 10,
                letterSpacing: ".08em",
                padding: "4px 9px",
                borderRadius: 999,
                color: live ? "var(--accent)" : "var(--warn)",
                background: live ? "var(--good-bg)" : "var(--warn-bg)",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: live ? "var(--accent)" : "var(--warn)",
                }}
              />
              {live ? "LIVE" : "PAUSED"}
            </span>
          </div>

          <div style={{ fontSize: 12.5, color: "var(--txt3)", marginTop: 3 }}>
            Every action on the platform, append-only · exports are themselves
            logged
          </div>
        </div>

        {isError && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "var(--warn-bg)",
              border: "1px solid var(--warn)",
              borderRadius: 12,
              padding: "11px 16px",
              fontSize: 12.5,
              color: "var(--txt)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--warn)"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
              style={{ flex: "0 0 14px" }}
            >
              <path d="M12 8v5M12 16.5v.5" />
              <circle cx="12" cy="12" r="9" />
            </svg>
            Connection lost — showing events up to the last received. Nothing is
            missing from the log itself; the feed resumes when the connection
            returns.
          </div>
        )}

        <div style={{ marginLeft: "auto" }}>
          <button
            type="button"
            onClick={() => setLive((l) => !l)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid var(--line-strong)",
              color: "var(--txt2)",
              background: "transparent",
              fontSize: 13,
              fontWeight: 500,
              padding: "10px 16px",
              borderRadius: 11,
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
            }}
          >
            {live ? "Pause stream" : "Resume stream"}
          </button>
        </div>
      </div>

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
          label="Events · 24h"
          value={summary?.events24h ?? 0}
          delta={live ? "live" : "paused"}
          deltaColor={live ? "var(--accent)" : "var(--warn)"}
        />
        <Stat
          label="Active actors"
          value={summary?.actors24h ?? 0}
          delta={`across ${summary?.tenants24h ?? 0} tenant${summary?.tenants24h === 1 ? "" : "s"}`}
        />
        <Stat
          label="Security events"
          value={summary?.security24h ?? 0}
          delta="24h"
          deltaColor={
            (summary?.security24h ?? 0) > 0 ? "var(--neg)" : "var(--txt4)"
          }
        />
        <Stat
          label="Data events"
          value={summary?.dataEvents24h ?? 0}
          delta="all attributed"
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
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search tenant, actor, action, IP…"
              aria-label="Search the audit log"
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
            {ACTORS.map((a) => {
              const on = actor === a

              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => {
                    setActor(a)
                    setPage(1)
                  }}
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
                    fontFamily: "inherit",
                  }}
                >
                  {a}
                </button>
              )
            })}
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {CATEGORIES.map((c) => {
              const on = category === c

              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setCategory(c)
                    setPage(1)
                  }}
                  style={{
                    fontSize: 11.5,
                    fontWeight: 500,
                    color: on ? "var(--accent)" : "var(--txt2)",
                    border: `1px solid ${on ? "var(--accent)" : "var(--line-strong)"}`,
                    background: on ? "var(--accent-soft)" : "transparent",
                    padding: "5px 11px",
                    borderRadius: 999,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {c}
                </button>
              )
            })}
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
              {(meta?.total ?? 0).toLocaleString()} event
              {meta?.total === 1 ? "" : "s"}
            </div>
            <button
              type="button"
              onClick={reset}
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

        <div style={{ overflowX: "auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "82px minmax(0,1.2fr) 160px minmax(0,2fr) 104px 116px",
              columnGap: 16,
              padding: "16px 24px 10px",
              fontSize: 10.5,
              letterSpacing: ".09em",
              color: "var(--txt4)",
              minWidth: 960,
              boxSizing: "border-box",
            }}
          >
            <div>WHEN</div>
            <div>TENANT</div>
            <div>ACTOR</div>
            <div>ACTION</div>
            <div>CATEGORY</div>
            <div>SOURCE IP</div>
          </div>

          {rows.map((entry) => (
            <Row key={entry.id} entry={entry} />
          ))}

          {rows.length === 0 && (
            <div
              style={{
                padding: "26px 24px",
                borderTop: "1px solid var(--line2)",
                fontSize: 13,
                color: "var(--txt3)",
              }}
            >
              No audit events match these filters.
            </div>
          )}
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
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            New events stream in every few seconds while live · append-only,
            nothing can be edited or deleted.
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 11.5, color: "var(--txt4)" }}>Rows:</div>

            {SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setPerPage(size)
                  setPage(1)
                }}
                style={{
                  fontSize: 12,
                  fontWeight: perPage === size ? 600 : 400,
                  color: perPage === size ? "var(--txt)" : "var(--txt4)",
                  padding: "4px 6px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {size}
              </button>
            ))}

            <div
              style={{ width: 1, height: 16, background: "var(--divider)" }}
            />

            <div style={{ fontSize: 12, color: "var(--txt4)" }}>
              Page {meta?.currentPage ?? 1} of {meta?.lastPage ?? 1}
            </div>

            <button
              type="button"
              disabled={(meta?.currentPage ?? 1) <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={pager((meta?.currentPage ?? 1) > 1)}
            >
              Previous
            </button>

            <button
              type="button"
              disabled={(meta?.currentPage ?? 1) >= (meta?.lastPage ?? 1)}
              onClick={() => setPage((p) => p + 1)}
              style={pager((meta?.currentPage ?? 1) < (meta?.lastPage ?? 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ entry }: { entry: PlatformAuditEntry }) {
  const tone = categoryTone(entry.category)

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "82px minmax(0,1.2fr) 160px minmax(0,2fr) 104px 116px",
        columnGap: 16,
        alignItems: "center",
        padding: "11px 24px",
        fontSize: 12.5,
        borderTop: "1px solid var(--line2)",
        minWidth: 960,
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: 999,
            background: tone.color,
            flex: "0 0 5px",
          }}
        />
        <span
          className="qhub-mono"
          style={{ fontSize: 11.5, color: "var(--txt3)" }}
        >
          {clock(entry.createdAt)}
        </span>
      </div>

      <div
        style={{
          fontWeight: 500,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {entry.institution ?? "— estate-wide"}
      </div>

      <div
        style={{
          color: "var(--txt2)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {entry.actor ?? "System"}
      </div>

      <div
        style={{
          color: "var(--txt2)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {readable(entry.action)}
        {entry.entityType !== null && (
          <span style={{ color: "var(--txt4)" }}>
            {" "}
            · {entry.entityType}
            {entry.entityId === null ? "" : ` ${entry.entityId}`}
          </span>
        )}
      </div>

      <div>
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 500,
            padding: "3px 8px",
            borderRadius: 6,
            color: tone.color,
            background: tone.background,
          }}
        >
          {entry.category}
        </span>
      </div>

      <div className="qhub-mono" style={{ fontSize: 11, color: "var(--txt4)" }}>
        {entry.ipAddress ?? "—"}
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  delta,
  deltaColor,
}: {
  label: string
  value: number
  delta: string
  deltaColor?: string
}) {
  return (
    <div style={{ padding: "18px 20px", borderRight: "1px solid var(--line)" }}>
      <div style={{ fontSize: 13, color: "var(--txt3)", marginBottom: 7 }}>
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          whiteSpace: "nowrap",
        }}
      >
        <div
          className="qhub-mono"
          style={{
            fontSize: 23,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--txt)",
          }}
        >
          {value.toLocaleString()}
        </div>
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 500,
            color: deltaColor ?? "var(--txt4)",
          }}
        >
          {delta}
        </div>
      </div>
    </div>
  )
}

function pager(enabled: boolean): React.CSSProperties {
  return {
    padding: "6px 12px",
    borderRadius: 9,
    background: "var(--panel)",
    border: "none",
    cursor: enabled ? "pointer" : "default",
    color: enabled ? "var(--txt2)" : "var(--txt4)",
    fontSize: 12,
    fontFamily: "inherit",
  }
}

function categoryTone(category: string): {
  color: string
  background: string
} {
  switch (category) {
    case "Security":
      return { color: "var(--neg)", background: "var(--neg-bg)" }
    case "Data":
      return { color: "var(--warn)", background: "var(--warn-bg)" }
    case "Access":
      return { color: "var(--accent)", background: "var(--accent-soft)" }
    default:
      return { color: "var(--txt3)", background: "var(--panel)" }
  }
}

/** TENANT_DATA_EXPORT → Tenant data export. */
function readable(action: string): string {
  const words = action.toLowerCase().replace(/_/g, " ")

  return words.charAt(0).toUpperCase() + words.slice(1)
}

function clock(iso: string | null): string {
  if (iso === null) return "—"

  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}
