"use client"

import { useState } from "react"

import { useComputeGate } from "@/modules/platform-infrastructure/hooks/use-infrastructure"
import type { Infrastructure } from "@/modules/platform-infrastructure/types"

const OPS = [
  {
    label: "Resize volume",
    danger: false,
    note: "grow only — never shrinks; applied live",
  },
  {
    label: "Detach / re-attach",
    danger: false,
    note: "brief IO pause; the tenant is warned first",
  },
  {
    label: "Destroy volume",
    danger: true,
    note: "irreversible — typed confirmation names the institution",
  },
] as const

/**
 * Compute and storage, behind a second factor, lifted from the draft.
 *
 * A gate parallel to the tab's own — never merged with it. Opening storage
 * writes changes an institution's rows; opening compute can destroy its
 * estate, so it costs a code even inside an already-open write window.
 *
 * Nothing here is wired until a provider is chosen. The card says so rather
 * than offering buttons that cannot work.
 */
export function ComputeCard({
  tenantId,
  institution,
  compute,
  mfaEnrolled,
  onGoToSettings,
}: {
  tenantId: number
  institution: string
  compute: Infrastructure["compute"] | undefined
  /** Without one the section is unavailable — no exceptions, owners included. */
  mfaEnrolled: boolean
  onGoToSettings: () => void
}) {
  const gate = useComputeGate(tenantId)

  const [challenging, setChallenging] = useState(false)
  const [code, setCode] = useState("")
  const [destroying, setDestroying] = useState(false)
  const [typed, setTyped] = useState("")

  const open = compute?.enabled === true

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 18,
        boxShadow: "var(--shadow-card)",
        padding: "16px 20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>
          Compute &amp; storage
        </div>
        <span style={{ fontSize: 10, color: "var(--txt3)" }}>
          ⚠ verify — provider undecided (S3-compatible either way); nothing here
          is wired until it is
        </span>

        <button
          type="button"
          onClick={() => {
            if (open) {
              gate.mutate(null)

              return
            }

            setChallenging((c) => !c)
          }}
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: `1px solid ${open ? "var(--accent)" : "var(--line-strong)"}`,
            color: open ? "var(--accent)" : "var(--txt2)",
            background: "transparent",
            fontSize: 12,
            fontWeight: 500,
            padding: "8px 14px",
            borderRadius: 10,
            cursor: "pointer",
            whiteSpace: "nowrap",
            fontFamily: "inherit",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <rect x="5" y="10" width="14" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 018 0v3" />
          </svg>
          {open
            ? `Compute open · until ${clock(compute?.expiresAt ?? null)}`
            : "Unlock compute"}
        </button>
      </div>

      <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 4 }}>
        A second gate, not the same one: opening compute writes requires a
        6-digit code even inside an open write window. One challenge per
        10-minute window; only Destroy asks again.
      </div>

      {challenging && !open && !mfaEnrolled && (
        <div
          style={{
            marginTop: 12,
            border: "1px solid var(--warn)",
            background: "var(--warn-bg)",
            borderRadius: 12,
            padding: "13px 16px",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            This section needs an authenticator, and this account doesn&rsquo;t
            have one
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--txt2)",
              lineHeight: 1.55,
              marginTop: 5,
            }}
          >
            Compute operations can destroy an institution&rsquo;s estate, so
            they are gated on a second factor — no exceptions, including for
            owners.
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button
              type="button"
              onClick={onGoToSettings}
              style={{
                background: "var(--accent)",
                color: "#fff",
                border: "none",
                fontSize: 12,
                fontWeight: 500,
                padding: "8px 14px",
                borderRadius: 9,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Enrol in Settings →
            </button>
            <button
              type="button"
              onClick={() => setChallenging(false)}
              style={{
                border: "1px solid var(--line-strong)",
                color: "var(--txt2)",
                background: "transparent",
                fontSize: 12,
                fontWeight: 500,
                padding: "8px 14px",
                borderRadius: 9,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {challenging && !open && mfaEnrolled && (
        <div
          style={{
            marginTop: 12,
            border: "1px solid var(--accent-brd)",
            background: "var(--accent-soft)",
            borderRadius: 12,
            padding: "13px 16px",
          }}
        >
          <div style={{ fontSize: 12.5, color: "var(--txt2)" }}>
            Enter the 6-digit code from your authenticator. The window lasts 10
            minutes and the challenge is logged with every operation it
            authorises.
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 10,
              alignItems: "center",
            }}
          >
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="••••••"
              aria-label="Authenticator code"
              className="qhub-mono"
              style={{
                width: 120,
                background: "var(--card)",
                border: "1px solid var(--line-strong)",
                borderRadius: 10,
                padding: "9px 13px",
                fontSize: 14,
                letterSpacing: ".2em",
                color: "var(--txt)",
                outline: "none",
              }}
            />
            <button
              type="button"
              disabled={code.trim().length < 6 || gate.isPending}
              onClick={() =>
                gate.mutate(code.trim(), {
                  onSuccess: () => {
                    setCode("")
                    setChallenging(false)
                  },
                })
              }
              style={{
                background:
                  code.trim().length >= 6 ? "var(--accent)" : "var(--panel)",
                color: code.trim().length >= 6 ? "#fff" : "var(--txt4)",
                border: "none",
                fontSize: 12.5,
                fontWeight: 500,
                padding: "9px 16px",
                borderRadius: 10,
                cursor: code.trim().length >= 6 ? "pointer" : "default",
                fontFamily: "inherit",
              }}
            >
              Open compute writes · 10 min
            </button>
            <button
              type="button"
              onClick={() => setChallenging(false)}
              style={{
                fontSize: 12,
                color: "var(--txt3)",
                background: "none",
                border: "none",
                padding: "9px 4px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginTop: 14,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: ".08em",
              color: "var(--txt4)",
              marginBottom: 8,
            }}
          >
            RESOURCES
          </div>

          {resources(institution).map((r) => (
            <div
              key={r.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 0",
                borderBottom: "1px solid var(--line2)",
                fontSize: 12.5,
              }}
            >
              <div
                className="qhub-mono"
                style={{ fontSize: 11, color: "var(--txt2)" }}
              >
                {r.name}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--txt4)" }}>
                {r.what}
              </div>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  color: "var(--txt3)",
                }}
              >
                ⚠ verify
              </span>
            </div>
          ))}
        </div>

        <div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: ".08em",
              color: "var(--txt4)",
              marginBottom: 8,
            }}
          >
            OPERATIONS · ALL + NET-NEW
          </div>

          {OPS.map((op) => (
            <button
              key={op.label}
              type="button"
              onClick={() => {
                if (!open) {
                  setChallenging(true)

                  return
                }

                if (op.danger) setDestroying(true)
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                border: `1px solid ${
                  open
                    ? op.danger
                      ? "var(--neg)"
                      : "var(--line-strong)"
                    : "var(--line2)"
                }`,
                borderRadius: 10,
                padding: "8px 12px",
                marginBottom: 7,
                cursor: "pointer",
                background: "transparent",
                fontFamily: "inherit",
              }}
            >
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: open
                    ? op.danger
                      ? "var(--neg)"
                      : "var(--txt)"
                    : "var(--txt4)",
                }}
              >
                {op.label}
              </div>
              <div
                style={{ fontSize: 10.5, color: "var(--txt4)", marginTop: 1 }}
              >
                {op.note}
              </div>
            </button>
          ))}
        </div>
      </div>

      {destroying && (
        <div
          style={{
            marginTop: 12,
            border: "1px solid var(--neg)",
            background: "var(--neg-bg)",
            borderRadius: 12,
            padding: "14px 16px",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--neg)" }}>
            Destroy volume — irreversible
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--txt2)",
              lineHeight: 1.55,
              marginTop: 5,
            }}
          >
            The audit line is written <b>before</b> the act. Type the
            institution&rsquo;s name —{" "}
            <span className="qhub-mono" style={{ fontSize: 11.5 }}>
              {institution}
            </span>{" "}
            — to arm it. Refused outright if there is no completed backup from
            the last 24 hours.
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 10,
              alignItems: "center",
            }}
          >
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Type the institution's full name"
              aria-label="Type the institution's name to confirm"
              style={{
                flex: 1,
                minWidth: 0,
                background: "var(--card)",
                border: "1px solid var(--line-strong)",
                borderRadius: 10,
                padding: "9px 13px",
                fontSize: 13,
                color: "var(--txt)",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            <button
              type="button"
              disabled={typed.trim() !== institution}
              style={{
                background:
                  typed.trim() === institution ? "var(--neg)" : "var(--panel)",
                color: typed.trim() === institution ? "#fff" : "var(--txt4)",
                border: "none",
                fontSize: 12.5,
                fontWeight: 500,
                padding: "9px 16px",
                borderRadius: 10,
                cursor: typed.trim() === institution ? "pointer" : "default",
                whiteSpace: "nowrap",
                fontFamily: "inherit",
              }}
            >
              Destroy volume
            </button>
            <button
              type="button"
              onClick={() => {
                setDestroying(false)
                setTyped("")
              }}
              style={{
                fontSize: 12,
                color: "var(--txt3)",
                background: "none",
                border: "none",
                padding: "9px 4px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/** The draft's two rows, named from the institution as it does. */
function resources(institution: string): Array<{ name: string; what: string }> {
  const slug = institution
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 18)

  return [
    { name: `vol-${slug}`, what: "Block volume · attached" },
    {
      name: `bucket/${slug}`,
      what: "Object storage · per-school prefix or bucket",
    },
  ]
}

function clock(iso: string | null): string {
  if (iso === null) return "—"

  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })
}
