"use client"

import { useState } from "react"

import {
  usePreviewPerHead,
  useRaisePerHead,
} from "@/modules/billing/hooks/use-billing"
import { formatMinor } from "@/modules/billing/lib/money"
import type {
  PerHeadPreview,
  RollMovedError,
  Subscription,
} from "@/modules/billing/types"

type Roll = "students" | "active_students"

/**
 * Raise a per-head bill, lifted from the draft.
 *
 * Two steps, never one. The roll is counted live at the moment of billing, so
 * the operator approves a total they have actually seen rather than an
 * instruction to charge whatever the number happens to be.
 *
 * Committing re-counts. If the roll moved in between, the server refuses and
 * this dialog re-opens its preview on the fresh figures instead of billing —
 * students enrol and withdraw while a dialog sits open, and on a per-head rate
 * every one of them is money.
 */
export function RaisePerHeadBillDialog({
  subscription,
  onClose,
}: {
  subscription: Subscription
  onClose: () => void
}) {
  const [roll, setRoll] = useState<Roll>("students")
  const [session, setSession] = useState("")
  const [preview, setPreview] = useState<PerHeadPreview | null>(null)
  const [moved, setMoved] = useState<RollMovedError | null>(null)

  const previewing = usePreviewPerHead()
  const raising = useRaisePerHead()

  const currency = preview?.currency ?? subscription.currency ?? "NGN"

  function runPreview(next: Roll = roll) {
    previewing.mutate(
      { tenantId: subscription.tenantId, metric: next },
      {
        onSuccess: (data) => {
          setPreview(data)
          setMoved(null)
        },
      }
    )
  }

  function commit() {
    if (preview === null) return

    raising.mutate(
      {
        tenantId: subscription.tenantId,
        expectedStudentsCounted: preview.studentsCounted,
        metric: roll,
        sessionLabel: session.trim() === "" ? null : session.trim(),
      },
      {
        onSuccess: () => onClose(),
        onError: (error) => {
          const body = (
            error as {
              response?: { data?: { error?: RollMovedError } }
            }
          )?.response?.data?.error

          // The roll moved. Re-open the preview on what is true now rather
          // than billing a total nobody approved.
          if (body?.code === "ROLL_MOVED") {
            setPreview({
              tenantId: subscription.tenantId,
              metric: roll,
              studentsCounted: body.studentsCounted,
              includedByPlan: body.includedByPlan,
              studentsBillable: body.studentsBillable,
              perStudentMinor: body.perStudentMinor,
              totalMinor: body.totalMinor,
              currency: body.currency,
              countedAt: body.countedAt,
            })
            setMoved(body)
          }
        },
      }
    )
  }

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
        aria-label="Raise per-head bill"
        style={{
          position: "relative",
          width: 560,
          maxWidth: "calc(94vw / var(--zoom))",
          background: "var(--surface-solid)",
          border: "1px solid var(--line-strong)",
          borderRadius: 18,
          boxShadow: "0 30px 80px rgba(8,12,18,.35)",
          padding: 24,
          color: "var(--txt)",
        }}
      >
        <div
          style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.015em" }}
        >
          Raise per-head bill — {subscription.institution ?? "institution"}
        </div>

        <div style={{ fontSize: 12.5, color: "var(--txt3)", marginTop: 4 }}>
          The roll is counted live at the moment of billing — preview first,
          always.
        </div>

        <Label>WHICH ROLL</Label>

        <div style={{ display: "flex", gap: 8 }}>
          {(
            [
              ["students", "All students on the platform"],
              ["active_students", "Active students only"],
            ] as const
          ).map(([key, label]) => {
            const on = roll === key

            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setRoll(key)
                  // The figures on screen belong to the other roll; drop them
                  // rather than leave a total that no longer matches the choice.
                  setPreview(null)
                  setMoved(null)
                }}
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  padding: "9px 14px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  color: on ? "#fff" : "var(--txt2)",
                  background: on ? "var(--accent)" : "transparent",
                  border: `1px solid ${on ? "var(--accent)" : "var(--line-strong)"}`,
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 8 }}>
          {roll === "students"
            ? "Includes withdrawn and suspended students still on the roll."
            : "Excludes withdrawn and suspended students — the difference is what you are choosing not to charge for."}
        </div>

        <Label>SESSION LABEL — OPTIONAL, LANDS ON THE INVOICE</Label>

        <input
          value={session}
          onChange={(e) => setSession(e.target.value)}
          placeholder="2026/2027"
          maxLength={60}
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: "var(--card)",
            border: "1px solid var(--line-strong)",
            borderRadius: 10,
            padding: "10px 13px",
            fontSize: 13,
            color: "var(--txt)",
            outline: "none",
            fontFamily: "inherit",
          }}
        />

        {preview === null ? (
          <Footer>
            <Ghost onClick={onClose}>Cancel</Ghost>
            <Primary
              disabled={previewing.isPending}
              onClick={() => runPreview()}
            >
              {previewing.isPending ? "Counting…" : "Preview the bill"}
            </Primary>
          </Footer>
        ) : (
          <>
            {moved !== null && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "var(--warn-bg)",
                  border: "1px solid var(--warn)",
                  borderRadius: 11,
                  padding: "10px 14px",
                  marginTop: 16,
                  fontSize: 12.5,
                  color: "var(--txt)",
                }}
              >
                The roll moved while this dialog was open — nothing was billed.
                These are the fresh figures; commit bills exactly what you see
                now.
              </div>
            )}

            <div
              style={{
                border: "1px solid var(--accent-brd)",
                background: "var(--accent-soft)",
                borderRadius: 14,
                padding: "16px 18px",
                marginTop: 18,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "8px 0",
                  fontSize: 13,
                }}
              >
                <div style={{ color: "var(--txt2)" }}>Students counted</div>
                <div
                  className="qhub-mono"
                  style={{ fontWeight: 600, textAlign: "right" }}
                >
                  {preview.studentsCounted.toLocaleString()}
                </div>

                {preview.includedByPlan > 0 && (
                  <>
                    <div style={{ color: "var(--txt2)" }}>
                      Included by the plan
                    </div>
                    <div
                      className="qhub-mono"
                      style={{ fontWeight: 600, textAlign: "right" }}
                    >
                      −{preview.includedByPlan.toLocaleString()}
                    </div>
                  </>
                )}

                <div style={{ color: "var(--txt2)" }}>Rate per student</div>
                <div
                  className="qhub-mono"
                  style={{ fontWeight: 600, textAlign: "right" }}
                >
                  {formatMinor(preview.perStudentMinor, currency)}
                </div>

                <div
                  style={{
                    color: "var(--txt2)",
                    fontWeight: 600,
                    paddingTop: 6,
                    borderTop: "1px solid var(--accent-brd)",
                  }}
                >
                  Total
                </div>
                <div
                  className="qhub-mono"
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "var(--accent)",
                    paddingTop: 6,
                    borderTop: "1px solid var(--accent-brd)",
                    textAlign: "right",
                  }}
                >
                  {formatMinor(preview.totalMinor, currency)}
                </div>
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: "var(--txt4)",
                  marginTop: 10,
                  lineHeight: 1.5,
                }}
              >
                Counted at the moment you preview — {moment(preview.countedAt)}.
                Committing re-counts; if the roll moved, the preview re-opens
                instead of billing.
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 16,
              }}
            >
              <Ghost onClick={onClose}>Cancel</Ghost>
              <Primary disabled={raising.isPending} onClick={commit}>
                {raising.isPending
                  ? "Raising…"
                  : `Raise invoice for ${formatMinor(preview.totalMinor, currency)}`}
              </Primary>
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
        marginTop: 16,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  )
}

function Footer({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 8,
        marginTop: 20,
        paddingTop: 14,
        borderTop: "1px solid var(--line)",
      }}
    >
      {children}
    </div>
  )
}

function Ghost({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: "1px solid var(--line-strong)",
        background: "transparent",
        color: "var(--txt2)",
        fontSize: 12.5,
        fontWeight: 500,
        padding: "8px 14px",
        borderRadius: 10,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  )
}

function Primary({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        border: "1px solid var(--accent)",
        background: "var(--accent)",
        color: "#fff",
        fontSize: 12.5,
        fontWeight: 500,
        padding: "8px 18px",
        borderRadius: 10,
        cursor: disabled === true ? "not-allowed" : "pointer",
        opacity: disabled === true ? 0.55 : 1,
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  )
}

/** The counting moment, in the reader's own zone rather than a fixed WAT. */
function moment(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
