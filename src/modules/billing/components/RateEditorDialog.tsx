"use client"

import { useState } from "react"

import { useSetRate } from "@/modules/billing/hooks/use-billing"
import { toMajorInput, toMinor } from "@/modules/billing/lib/money"
import type { Subscription } from "@/modules/billing/types"

/**
 * The rate agreed with one institution, lifted from the draft.
 *
 * Setting a figure here marks it NEGOTIATED — agreed with this school rather
 * than inherited from the shared plan list. Clearing it hands the row back to
 * the plan.
 *
 * Zero is not clearing. A negotiated zero is a free pilot, a decision somebody
 * made, and the two must never collapse into one another — so an empty field
 * clears the override and a typed 0 saves a real rate of nothing.
 */
export function RateEditorDialog({
  subscription,
  onClose,
}: {
  subscription: Subscription
  onClose: () => void
}) {
  const currency = subscription.currency ?? "NGN"
  const setRate = useSetRate(subscription.id)

  const [value, setValue] = useState(() =>
    subscription.rateSource === "NEGOTIATED" &&
    subscription.perStudentMinor !== null
      ? toMajorInput(subscription.perStudentMinor, currency)
      : ""
  )

  const trimmed = value.trim()
  const parsed = trimmed === "" ? null : toMinor(trimmed, currency)
  const valid =
    trimmed === "" || (Number.isFinite(Number(trimmed)) && Number(trimmed) >= 0)

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
        aria-label="Per-student rate"
        style={{
          position: "relative",
          width: 460,
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
          Per-student rate — {subscription.institution ?? "institution"}
        </div>

        <div style={{ fontSize: 12.5, color: "var(--txt3)", marginTop: 4 }}>
          The number the whole relationship turns on. Setting it here marks it
          NEGOTIATED — agreed with this school, not inherited from the plan
          list.
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 18,
          }}
        >
          <div
            className="qhub-mono"
            style={{ fontSize: 14, color: "var(--txt3)" }}
          >
            {currency}
          </div>

          <input
            autoFocus
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="10000"
            className="qhub-mono"
            style={{
              flex: 1,
              minWidth: 0,
              background: "var(--card)",
              border: "1px solid var(--line-strong)",
              borderRadius: 10,
              padding: "11px 14px",
              fontSize: 16,
              fontWeight: 600,
              color: "var(--txt)",
              outline: "none",
            }}
          />

          <div
            style={{
              fontSize: 12,
              color: "var(--txt4)",
              whiteSpace: "nowrap",
            }}
          >
            per student · per session
          </div>
        </div>

        {trimmed !== "" && Number(trimmed) === 0 && (
          <div
            style={{
              fontSize: 12,
              color: "var(--accent)",
              background: "var(--good-bg)",
              borderRadius: 9,
              padding: "9px 12px",
              marginTop: 12,
            }}
          >
            Zero is a real rate — a free pilot. It renders as {currency} 0 ·
            NEGOTIATED, never as &ldquo;not set&rdquo;.
          </div>
        )}

        {trimmed === "" && subscription.rateSource === "NEGOTIATED" && (
          <div
            style={{
              fontSize: 12,
              color: "var(--series2)",
              background: "var(--warn-bg)",
              borderRadius: 9,
              padding: "9px 12px",
              marginTop: 12,
            }}
          >
            Leaving this empty clears the negotiated rate — this institution
            goes back to its plan&rsquo;s list rate.
          </div>
        )}

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
          <button
            type="button"
            onClick={onClose}
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
            Cancel
          </button>

          <button
            type="button"
            disabled={!valid || setRate.isPending}
            onClick={() =>
              setRate.mutate(parsed, { onSuccess: () => onClose() })
            }
            style={{
              border: "1px solid var(--accent)",
              background: "var(--accent)",
              color: "#fff",
              fontSize: 12.5,
              fontWeight: 500,
              padding: "8px 16px",
              borderRadius: 10,
              cursor: valid && !setRate.isPending ? "pointer" : "not-allowed",
              opacity: valid && !setRate.isPending ? 1 : 0.55,
              fontFamily: "inherit",
            }}
          >
            {trimmed === "" ? "Clear negotiated rate" : "Set negotiated rate"}
          </button>
        </div>
      </div>
    </div>
  )
}
