"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import apiClient from "@/lib/clients/apiClient"
import { usePlans } from "@/modules/billing/hooks/use-billing"
import { formatMinor } from "@/modules/billing/lib/money"
import type { Subscription } from "@/modules/billing/types"

/**
 * Move an institution onto a different plan, lifted from the draft.
 *
 * Only plans in the subscription's own currency are offered. Money here is
 * per-currency and never converted — moving a school to another currency
 * means cancelling and re-subscribing, which is deliberate: a plan change
 * that silently invented an exchange rate would put a wrong number on a real
 * invoice.
 */
export function ChangePlanDialog({
  subscription,
  onClose,
}: {
  subscription: Subscription
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const { data: plans } = usePlans()

  const [planId, setPlanId] = useState<number | null>(null)

  const change = useMutation({
    mutationFn: async (id: number) =>
      apiClient.post<{ data: Subscription }, { planId: number }>(
        `/platform/billing/subscriptions/${subscription.id}/change-plan`,
        { planId: id },
        { access_token: true }
      ),
    onSuccess: () => {
      toast.success("Plan changed")
      void queryClient.invalidateQueries({ queryKey: ["platform-billing"] })
      onClose()
    },
    onError: (e) =>
      toast.error("Could not change that plan", {
        description:
          (e as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ?? "The subscription is unchanged.",
      }),
  })

  const choices = (plans ?? []).filter(
    (p) => p.isActive && p.currency === subscription.currency
  )

  const ready = planId !== null && planId !== subscription.planId

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
        aria-label="Change plan"
        style={{
          position: "relative",
          width: 520,
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
          Change plan — {subscription.institution ?? "institution"}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--txt3)", marginTop: 4 }}>
          Current: {subscription.plan ?? "none"}
        </div>

        <div
          style={{
            fontSize: 11.5,
            color: "var(--series2)",
            background: "var(--warn-bg)",
            borderRadius: 9,
            padding: "8px 12px",
            marginTop: 12,
          }}
        >
          Plan changes stay in {subscription.currency ?? "the same currency"} —
          there is no FX. Moving to another currency means cancelling and
          re-subscribing, which is deliberate.
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginTop: 16,
            maxHeight: 320,
            overflowY: "auto",
          }}
        >
          {choices.length === 0 && (
            <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>
              No other active plan is priced in{" "}
              {subscription.currency ?? "this currency"}.
            </div>
          )}

          {choices.map((plan) => {
            const isCurrent = plan.id === subscription.planId
            const on = planId === plan.id

            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setPlanId(plan.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  border: `1px solid ${on ? "var(--accent)" : "var(--line-strong)"}`,
                  background: on ? "var(--accent-soft)" : "transparent",
                  borderRadius: 12,
                  padding: "12px 15px",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: on ? "var(--accent)" : "var(--txt)",
                    }}
                  >
                    {plan.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: "var(--txt4)",
                      marginTop: 1,
                    }}
                  >
                    {plan.includedStudents.toLocaleString()} students included ·
                    then {formatMinor(plan.perStudentMinor, plan.currency)} each
                  </div>
                </div>

                <div
                  className="qhub-mono"
                  style={{
                    marginLeft: "auto",
                    fontSize: 12,
                    color: "var(--txt2)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatMinor(plan.basePriceMinor, plan.currency)} /{" "}
                  {plan.interval.toLowerCase()}
                </div>

                {isCurrent && (
                  <span
                    style={{
                      fontSize: 9.5,
                      fontWeight: 600,
                      letterSpacing: ".06em",
                      color: "var(--txt3)",
                      background: "var(--panel)",
                      padding: "3px 8px",
                      borderRadius: 6,
                    }}
                  >
                    CURRENT
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 18,
            paddingTop: 14,
            borderTop: "1px solid var(--line)",
          }}
        >
          <div style={{ fontSize: 11.5, color: "var(--txt4)" }}>
            Takes effect on the next billing run — the current invoice is not
            reissued.
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
              disabled={!ready || change.isPending}
              onClick={() => planId !== null && change.mutate(planId)}
              style={{
                background: ready ? "var(--accent)" : "var(--line-strong)",
                color: ready ? "#fff" : "var(--txt4)",
                border: "none",
                fontSize: 12.5,
                fontWeight: 500,
                padding: "8px 16px",
                borderRadius: 10,
                cursor: ready ? "pointer" : "default",
                fontFamily: "inherit",
              }}
            >
              {change.isPending ? "Changing…" : "Change plan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
