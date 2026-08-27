"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import apiClient from "@/lib/clients/apiClient"
import { useConfirm } from "@/modules/platform-shared/ConfirmProvider"

export type Offboarding = {
  id: number
  reference: string
  tenantId: number | null
  institution: string
  slug: string
  status: "REQUESTED" | "APPROVED" | "EXPORTED" | "ERASED" | "CANCELLED"
  reason: string
  requestedBy: string | null
  requestedAt: string | null
  approvedBy: string | null
  approvedAt: string | null
  eraseAfter: string | null
  exportedAt: string | null
  erasedAt: string | null
  erasable: boolean
  certificate: Record<string, unknown> | null
}

/**
 * The four-step offboarding tracker, lifted from the draft.
 *
 * Requested → second-owner approval → export delivered → erasure. The
 * dominant state while waiting for approval is "waiting for somebody who
 * isn't you", because the requester cannot approve their own request and the
 * screen should say so rather than showing a button that will be refused.
 */
export function OffboardingTracker({ tenantId }: { tenantId: number }) {
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const [typed, setTyped] = useState("")

  const { data } = useQuery({
    queryKey: ["platform", "offboardings", tenantId],
    queryFn: async () =>
      (
        await apiClient.get<{ data: Offboarding[] }>("/platform/offboardings", {
          access_token: true,
        })
      ).data.find((o) => o.tenantId === tenantId) ?? null,
  })

  const act = useMutation({
    mutationFn: async (input: {
      path: string
      body?: Record<string, unknown>
    }) =>
      apiClient.post(
        `/platform/offboardings/${data?.id}/${input.path}`,
        input.body ?? {},
        { access_token: true }
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["platform"] })
    },
    onError: (e) =>
      toast.error(
        (e as { message?: string } | null)?.message ??
          "That step could not run."
      ),
  })

  if (!data || data.status === "CANCELLED") return null

  const steps = [
    {
      n: 1,
      label: "Requested",
      sub: data.requestedBy
        ? `by ${data.requestedBy}`
        : "asked for, no clock yet",
      done: true,
    },
    {
      n: 2,
      label: "Second-owner approval",
      sub: data.approvedBy ? `by ${data.approvedBy}` : "not yet signed",
      done: data.approvedAt !== null,
    },
    {
      n: 3,
      label: "Export delivered",
      sub: data.exportedAt
        ? new Date(data.exportedAt).toLocaleDateString()
        : "erasure refused until this happens",
      done: data.exportedAt !== null,
    },
    {
      n: 4,
      label: "Erasure",
      sub: data.erasedAt
        ? new Date(data.erasedAt).toLocaleDateString()
        : data.eraseAfter
          ? `unlocks ${new Date(data.eraseAfter).toLocaleDateString()}`
          : "clock not started",
      done: data.erasedAt !== null,
    },
  ]

  const eraseDate = data.eraseAfter
    ? new Date(data.eraseAfter).toLocaleDateString()
    : "—"

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 18,
        boxShadow: "var(--shadow-card)",
        padding: "18px 22px",
        border: "1px solid var(--neg)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--txt)" }}>
          Offboarding in progress
        </div>
        <div
          className="qhub-mono"
          style={{ fontSize: 11, color: "var(--txt3)" }}
        >
          {data.reference}
        </div>

        {data.status !== "ERASED" && (
          <button
            type="button"
            onClick={async () => {
              const ok = await confirm({
                title: "Cancel this offboarding?",
                body: `${data.institution} stays on the estate and nothing is erased. The record of the request and its approvals is kept.`,
                label: "Cancel offboarding",
              })

              if (ok) act.mutate({ path: "cancel" })
            }}
            style={{
              marginLeft: "auto",
              border: "1px solid var(--line-strong)",
              borderRadius: 9,
              background: "transparent",
              color: "var(--txt2)",
              fontSize: 11.5,
              fontWeight: 500,
              padding: "6px 12px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancel offboarding
          </button>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 10,
          marginTop: 14,
        }}
      >
        {steps.map((s) => (
          <div
            key={s.n}
            style={{
              border: `1px solid ${s.done ? "var(--accent-brd)" : "var(--line-strong)"}`,
              background: s.done ? "var(--accent-soft)" : "transparent",
              borderRadius: 12,
              padding: "11px 14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div
                style={{
                  width: 18,
                  height: 18,
                  flex: "0 0 18px",
                  borderRadius: 999,
                  background: s.done ? "var(--accent)" : "var(--panel)",
                  color: s.done ? "#fff" : "var(--txt4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                {s.n}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: s.done ? "var(--accent)" : "var(--txt3)",
                }}
              >
                {s.label}
              </div>
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--txt4)",
                marginTop: 6,
                lineHeight: 1.45,
              }}
            >
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Waiting on somebody else is the dominant state, and it says so. */}
      {data.status === "REQUESTED" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 14,
            background: "var(--warn-bg)",
            borderRadius: 11,
            padding: "11px 15px",
            fontSize: 12.5,
            color: "var(--txt2)",
          }}
        >
          <div>
            Waiting for <b>a second owner</b> — whoever requested this cannot
            approve it. No clock is running yet; nothing happens until someone
            else signs.
          </div>
          <button
            type="button"
            onClick={async () => {
              const ok = await confirm({
                title: `Approve offboarding for ${data.institution}?`,
                body: `This starts the 30-day clock. Erasure is still refused until the export has been delivered, and cancelling stays available right up to erasure.`,
                label: "Approve and start the clock",
                danger: true,
              })

              if (ok) act.mutate({ path: "approve" })
            }}
            style={{
              marginLeft: "auto",
              border: "1px solid var(--accent)",
              borderRadius: 9,
              background: "transparent",
              color: "var(--accent)",
              fontSize: 11.5,
              fontWeight: 500,
              padding: "6px 12px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
            }}
          >
            Approve as a second owner
          </button>
        </div>
      )}

      {data.status === "APPROVED" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 14,
            background: "var(--accent-soft)",
            borderRadius: 11,
            padding: "11px 15px",
            fontSize: 12.5,
            color: "var(--txt2)",
          }}
        >
          <div>
            Approved · the 30-day clock runs to <b>{eraseDate}</b>. Erasure is
            refused until the export is generated and delivered to the
            institution.
          </div>
          <button
            type="button"
            onClick={() => act.mutate({ path: "export" })}
            disabled={act.isPending}
            style={{
              marginLeft: "auto",
              background: "var(--accent)",
              color: "#fff",
              fontSize: 11.5,
              fontWeight: 500,
              padding: "7px 13px",
              borderRadius: 9,
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
            }}
          >
            Generate &amp; deliver export
          </button>
        </div>
      )}

      {data.status === "EXPORTED" && (
        <div
          style={{
            marginTop: 14,
            background: "var(--neg-bg)",
            borderRadius: 11,
            padding: "13px 15px",
          }}
        >
          <div
            style={{ fontSize: 12.5, color: "var(--txt2)", lineHeight: 1.55 }}
          >
            Export delivered{" "}
            {data.exportedAt
              ? new Date(data.exportedAt).toLocaleDateString()
              : ""}
            . Erasure unlocks on <b>{eraseDate}</b> — typing the offboarding
            reference is required; it is the last deliberate step. Cancelling is
            available right up to erasure, including now.
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 11,
            }}
          >
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={`Type ${data.reference} to unlock`}
              aria-label="Type the offboarding reference to unlock erasure"
              className="qhub-mono"
              style={{
                width: 260,
                background: "var(--card)",
                border: "1px solid var(--line-strong)",
                borderRadius: 9,
                padding: "8px 12px",
                fontSize: 12.5,
                color: "var(--txt)",
                outline: "none",
                fontFamily: "var(--font-mono), monospace",
              }}
            />
            <button
              type="button"
              disabled={
                typed !== data.reference || !data.erasable || act.isPending
              }
              onClick={async () => {
                const ok = await confirm({
                  title: `Erase ${data.institution} permanently?`,
                  body: "Every learner record, course and file is destroyed. This cannot be undone. The erasure certificate — who asked, who approved, what was destroyed, counted by table — is kept indefinitely.",
                  label: "Erase permanently",
                  danger: true,
                })

                if (ok)
                  act.mutate({ path: "complete", body: { confirm: typed } })
              }}
              style={{
                background:
                  typed === data.reference && data.erasable
                    ? "var(--neg)"
                    : "var(--line-strong)",
                color:
                  typed === data.reference && data.erasable
                    ? "#fff"
                    : "var(--txt4)",
                fontSize: 12,
                fontWeight: 600,
                padding: "8px 15px",
                borderRadius: 9,
                border: "none",
                cursor:
                  typed === data.reference && data.erasable
                    ? "pointer"
                    : "default",
                whiteSpace: "nowrap",
                fontFamily: "inherit",
              }}
            >
              Erase permanently
            </button>

            {!data.erasable && (
              <span style={{ fontSize: 11.5, color: "var(--txt4)" }}>
                The notice period has not finished.
              </span>
            )}
          </div>
        </div>
      )}

      {data.status === "ERASED" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 14,
            background: "var(--panel)",
            borderRadius: 11,
            padding: "11px 15px",
            fontSize: 12.5,
            color: "var(--txt2)",
          }}
        >
          <div>
            Erased{" "}
            {data.erasedAt ? new Date(data.erasedAt).toLocaleDateString() : ""}.
            The institution is gone; the certificate survives.
          </div>
        </div>
      )}
    </div>
  )
}
