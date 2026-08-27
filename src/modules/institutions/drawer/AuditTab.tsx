"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import apiClient from "@/lib/clients/apiClient"
import { useInstitutionActivity } from "@/modules/platform-observability/hooks/use-observability"

type SupportSessionRow = {
  id: number
  reference: string
  by: string | null
  reason: string
  readOnly: boolean
  startedAt: string | null
  expiresAt: string | null
  endedAt: string | null
  live: boolean
  ip: string | null
}

/**
 * The drawer's Audit tab, lifted from the draft.
 *
 * Support access sits ABOVE the audit log, not inside it. The draft's line is
 * that every session QHub staff opened into this tenant is "theirs to see
 * too" — putting it first is what makes that a promise rather than a row
 * somebody has to go looking for.
 */
export function AuditTab({ tenantId }: { tenantId: number }) {
  const [query, setQuery] = useState("")
  const [actor, setActor] = useState("")

  const { data: sessions } = useQuery({
    queryKey: ["platform", "support-sessions", tenantId],
    queryFn: async () =>
      (
        await apiClient.get<{ data: SupportSessionRow[] }>(
          `/platform/tenants/${tenantId}/support-sessions`,
          { access_token: true }
        )
      ).data,
  })

  const { data: activity, isPending } = useInstitutionActivity(tenantId)

  const rows = useMemo(() => {
    let list = activity ?? []

    if (query.trim()) {
      const q = query.toLowerCase()

      list = list.filter(
        (a) =>
          a.action.toLowerCase().includes(q) ||
          (a.actor ?? "").toLowerCase().includes(q) ||
          (a.ipAddress ?? "").toLowerCase().includes(q)
      )
    }

    if (actor === "support") {
      list = list.filter((a) => a.action.startsWith("SUPPORT_SESSION"))
    }
    if (actor === "tenant") {
      list = list.filter((a) => !a.action.startsWith("SUPPORT_SESSION"))
    }

    return list
  }, [activity, query, actor])

  return (
    <>
      <div
        style={{
          background: "var(--card)",
          borderRadius: 18,
          boxShadow: "var(--shadow-card)",
          padding: "16px 22px",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--txt)" }}>
            Support access
          </div>
          <div style={{ fontSize: 11.5, color: "var(--txt4)" }}>
            every session QHub staff opened into this tenant — theirs to see too
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
          {(sessions ?? []).length === 0 && (
            <div
              style={{
                fontSize: 12.5,
                color: "var(--txt3)",
                padding: "10px 0",
              }}
            >
              No support sessions have been opened into this institution.
            </div>
          )}

          {(sessions ?? []).map((s) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderBottom: "1px solid var(--line2)",
                fontSize: 12.5,
              }}
            >
              <div
                style={{
                  fontWeight: 500,
                  width: 110,
                  flex: "0 0 110px",
                  color: "var(--txt)",
                }}
              >
                {s.by ?? "—"}
              </div>
              <div
                style={{
                  color: "var(--txt3)",
                  minWidth: 0,
                  flex: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                &quot;{s.reason}&quot;
              </div>
              <div style={{ color: "var(--txt4)", whiteSpace: "nowrap" }}>
                {s.startedAt
                  ? new Date(s.startedAt).toLocaleString(undefined, {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </div>
              <div
                className="qhub-mono"
                style={{
                  fontSize: 11,
                  color: s.live ? "var(--neg)" : "var(--txt4)",
                  whiteSpace: "nowrap",
                  width: 120,
                  textAlign: "right",
                }}
              >
                {duration(s)}
              </div>
              {s.live && (
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 999,
                    background: "var(--neg)",
                    flex: "0 0 7px",
                  }}
                  title="Live now"
                />
              )}
            </div>
          ))}
        </div>
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
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--txt)" }}>
            System audit log
          </div>
          <div
            style={{ marginLeft: "auto", fontSize: 12, color: "var(--txt3)" }}
          >
            Append-only · this institution&apos;s own trail
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
              alignItems: "center",
              gap: 8,
              background: "var(--card)",
              border: "1px solid var(--line-strong)",
              borderRadius: 10,
              padding: "8px 12px",
              width: 230,
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
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search actor, action, IP…"
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
            {[
              ["", "All actors"],
              ["tenant", "Institution"],
              ["support", "QHub support"],
            ].map(([value, label]) => (
              <button
                key={value || "all"}
                type="button"
                onClick={() => setActor(value)}
                style={{
                  fontSize: 12,
                  fontWeight: actor === value ? 600 : 500,
                  color: actor === value ? "var(--txt)" : "var(--txt3)",
                  background: actor === value ? "var(--card)" : "transparent",
                  boxShadow: actor === value ? "var(--shadow-sm)" : "none",
                  padding: "6px 11px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "inherit",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div
            style={{
              marginLeft: "auto",
              fontSize: 11.5,
              color: "var(--txt4)",
              whiteSpace: "nowrap",
            }}
          >
            {rows.length} event{rows.length === 1 ? "" : "s"}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "150px minmax(0,1fr) minmax(0,1.2fr) 130px",
            columnGap: 16,
            padding: "14px 22px 8px",
            fontSize: 10.5,
            letterSpacing: ".09em",
            color: "var(--txt4)",
          }}
        >
          <div>WHEN</div>
          <div>ACTOR</div>
          <div>ACTION</div>
          <div>IP</div>
        </div>

        {isPending && (
          <div
            style={{
              padding: "26px 22px",
              borderTop: "1px solid var(--line2)",
              fontSize: 13,
              color: "var(--txt3)",
            }}
          >
            Loading…
          </div>
        )}

        {!isPending && rows.length === 0 && (
          <div
            style={{
              padding: "26px 22px",
              borderTop: "1px solid var(--line2)",
              fontSize: 13,
              color: "var(--txt3)",
            }}
          >
            No events match these filters.
          </div>
        )}

        {rows.map((a) => {
          const isSupport = a.action.startsWith("SUPPORT_SESSION")

          return (
            <div
              key={a.id}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "150px minmax(0,1fr) minmax(0,1.2fr) 130px",
                columnGap: 16,
                alignItems: "center",
                padding: "11px 22px",
                fontSize: 12.5,
                borderTop: "1px solid var(--line2)",
                // Our own activity in their log is marked, so they can tell
                // it apart at a glance.
                background: isSupport ? "var(--warn-bg)" : "transparent",
              }}
            >
              <div
                className="qhub-mono"
                style={{ fontSize: 11, color: "var(--txt4)" }}
              >
                {a.createdAt
                  ? new Date(a.createdAt).toLocaleString(undefined, {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </div>
              <div
                style={{
                  color: "var(--txt2)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {a.actor ?? "—"}
              </div>
              <div
                className="qhub-mono"
                style={{
                  fontSize: 11.5,
                  color: isSupport ? "var(--warn)" : "var(--txt2)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {a.action}
              </div>
              <div
                className="qhub-mono"
                style={{ fontSize: 11, color: "var(--txt4)" }}
              >
                {a.ipAddress ?? "—"}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

/** How long the session ran, or how long it has been running. */
function duration(s: SupportSessionRow): string {
  if (!s.startedAt) return "—"

  const start = new Date(s.startedAt).getTime()
  const end = s.endedAt ? new Date(s.endedAt).getTime() : Date.now()
  const mins = Math.max(0, Math.round((end - start) / 60000))

  if (s.live) return `${mins}m · live`

  return `${mins}m`
}
