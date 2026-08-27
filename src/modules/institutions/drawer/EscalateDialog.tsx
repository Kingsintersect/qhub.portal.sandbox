"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import apiClient from "@/lib/clients/apiClient"
import { useInstitutionObservability } from "@/modules/platform-observability/hooks/use-observability"

const TEAMS = ["Platform", "Media / CDN", "Integrations", "Identity", "Data"]
const URGENCIES = ["Page on-call now", "Business hours"] as const

type Urgency = (typeof URGENCIES)[number]

type Done = { reference: string; team: string }

/**
 * Escalate an institution to engineering, lifted from the draft.
 *
 * The description is sent verbatim and the placeholder says so — an engineer
 * reading a paraphrase of a fault is an engineer debugging the wrong thing.
 */
export function EscalateDialog({
  tenantId,
  name,
  onClose,
}: {
  tenantId: number
  name: string
  onClose: () => void
}) {
  // Read the institution's own worst failing check rather than asking the
  // operator to retype it. Frozen onto the escalation at submit, so the
  // record still reads correctly once the issue is fixed.
  const { data: observability } = useInstitutionObservability(tenantId)

  const openIssue =
    (observability?.checks ?? []).find((c) => c.status === "FAIL")?.summary ??
    (observability?.checks ?? []).find((c) => c.status === "WARN")?.summary ??
    null

  const [team, setTeam] = useState("Platform")
  const [urgency, setUrgency] = useState<Urgency>("Business hours")
  const [detail, setDetail] = useState("")
  const [done, setDone] = useState<Done | null>(null)

  const submit = useMutation({
    mutationFn: async () =>
      apiClient.post<{ data: { reference: string; team: string } }>(
        `/platform/tenants/${tenantId}/escalations`,
        {
          team,
          urgency:
            urgency === "Page on-call now" ? "PAGE_ON_CALL" : "BUSINESS_HOURS",
          detail: detail.trim(),
          openIssue: openIssue ?? null,
        },
        { access_token: true }
      ),
    onSuccess: (res) => setDone(res.data),
    onError: (e) =>
      toast.error(
        (e as { message?: string } | null)?.message ??
          "The escalation was not raised."
      ),
  })

  const ready = detail.trim().length > 0 && !submit.isPending

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(8,12,18,.45)",
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Escalate to engineering"
        style={{
          position: "relative",
          width: 540,
          maxHeight: "88vh",
          overflow: "auto",
          background: "var(--surface-solid)",
          border: "1px solid var(--line-strong)",
          borderRadius: 18,
          boxShadow: "0 30px 80px rgba(8,12,18,.35)",
          padding: 26,
          color: "var(--txt)",
        }}
      >
        {done !== null ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "14px 10px",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 999,
                background: "var(--good-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 12l5 5L20 6" />
              </svg>
            </div>

            <div
              style={{
                fontSize: 17,
                fontWeight: 600,
                letterSpacing: "-0.015em",
                marginTop: 14,
              }}
            >
              Escalated to engineering
            </div>
            <div
              className="qhub-mono"
              style={{ fontSize: 12, color: "var(--txt3)", marginTop: 6 }}
            >
              {done.reference} · {name}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--txt2)",
                lineHeight: 1.6,
                marginTop: 12,
                maxWidth: 380,
              }}
            >
              {urgency === "Page on-call now"
                ? `The on-call engineer for ${done.team} has been paged. You and the tenant's ticket thread get every update.`
                : `Queued for the ${done.team} team · first response within one business day. Updates post back to this tenant's activity feed.`}
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                marginTop: 20,
                background: "var(--accent)",
                color: "#fff",
                fontSize: 12.5,
                fontWeight: 500,
                padding: "9px 22px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                fontSize: 17,
                fontWeight: 600,
                letterSpacing: "-0.015em",
              }}
            >
              Escalate to engineering
            </div>
            <div style={{ fontSize: 12.5, color: "var(--txt3)", marginTop: 4 }}>
              {name}
            </div>

            <div
              style={{
                fontSize: 12,
                color: openIssue ? "var(--neg)" : "var(--txt4)",
                marginTop: 8,
                padding: "9px 12px",
                border: "1px solid var(--line-strong)",
                borderRadius: 10,
                background: "var(--panel)",
              }}
            >
              {openIssue
                ? `Open issue: ${openIssue}`
                : "No open issue on this tenant — describe what engineering should look at."}
            </div>

            <Label>TEAM</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {TEAMS.map((t) => {
                const on = team === t

                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTeam(t)}
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: on ? "var(--accent)" : "var(--txt2)",
                      border: `1px solid ${on ? "var(--accent)" : "var(--line-strong)"}`,
                      background: on ? "var(--accent-soft)" : "transparent",
                      padding: "7px 12px",
                      borderRadius: 999,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      fontFamily: "inherit",
                    }}
                  >
                    {t}
                  </button>
                )
              })}
            </div>

            <Label>URGENCY</Label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  display: "flex",
                  background: "var(--panel)",
                  borderRadius: 11,
                  padding: 3,
                  width: "fit-content",
                }}
              >
                {URGENCIES.map((u) => {
                  const on = urgency === u
                  const hot = u === "Page on-call now"

                  return (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUrgency(u)}
                      style={{
                        fontSize: 12.5,
                        fontWeight: on ? 600 : 400,
                        color: on
                          ? hot
                            ? "var(--neg)"
                            : "var(--txt)"
                          : "var(--txt3)",
                        background: on ? "var(--card)" : "transparent",
                        boxShadow: on ? "var(--shadow-sm)" : "none",
                        padding: "7px 13px",
                        borderRadius: 9,
                        border: "none",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        fontFamily: "inherit",
                      }}
                    >
                      {u}
                    </button>
                  )
                })}
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 8 }}>
              {urgency === "Page on-call now"
                ? "Pages the on-call engineer immediately. Reserve for active user-facing impact."
                : "Lands in the team's queue · first response within one business day."}
            </div>

            <Label>WHAT ENGINEERING NEEDS TO KNOW</Label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={4}
              placeholder="What is broken, since when, what you have already tried, and the user-facing impact. Engineering sees this verbatim."
              aria-label="What engineering needs to know"
              style={{
                width: "100%",
                boxSizing: "border-box",
                resize: "vertical",
                background: "var(--card)",
                border: "1px solid var(--line-strong)",
                borderRadius: 10,
                padding: "11px 13px",
                fontSize: 13,
                lineHeight: 1.55,
                color: "var(--txt)",
                outline: "none",
                fontFamily: "inherit",
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 20,
                paddingTop: 16,
                borderTop: "1px solid var(--line)",
              }}
            >
              <div style={{ fontSize: 11.5, color: "var(--txt4)" }}>
                The tenant&rsquo;s recent health data and audit trail attach
                automatically.
              </div>

              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    border: "1px solid var(--line-strong)",
                    color: "var(--txt2)",
                    background: "transparent",
                    fontSize: 12.5,
                    fontWeight: 500,
                    padding: "8px 14px",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={!ready}
                  onClick={() => submit.mutate()}
                  style={{
                    background: ready ? "var(--accent)" : "var(--panel)",
                    color: ready ? "#fff" : "var(--txt4)",
                    border: "none",
                    fontSize: 12.5,
                    fontWeight: 500,
                    padding: "8px 16px",
                    borderRadius: 10,
                    cursor: ready ? "pointer" : "default",
                    whiteSpace: "nowrap",
                    fontFamily: "inherit",
                  }}
                >
                  {submit.isPending ? "Escalating…" : "Escalate"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        letterSpacing: ".07em",
        color: "var(--txt4)",
        marginTop: 18,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  )
}
