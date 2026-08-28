"use client"

import { useState } from "react"

import {
  useProvisioningProgress,
  useResumeProvisioning,
} from "@/modules/institutions/hooks/use-institution-mutations"

/**
 * A provisioning run in flight, lifted from the draft.
 *
 * Five states, not three. Running and done and failed are the obvious ones;
 * the other two exist because a dedicated database server's password is never
 * collected in the wizard — the run stops at step 1 and waits for a person,
 * and abandons itself if nobody comes.
 */
export function ProvisioningPanel({
  tenantId,
  name,
  host,
  onDone,
  onBackToForm,
}: {
  tenantId: number
  name: string
  /** Named in the credential prompt so nobody pastes the wrong server's secret. */
  host: string | null
  onDone: () => void
  onBackToForm: () => void
}) {
  const { data } = useProvisioningProgress(tenantId)
  const resume = useResumeProvisioning(tenantId)

  const [password, setPassword] = useState("")

  const percent = data?.percent ?? 0
  const current = data?.steps.find((s) => !s.done)?.label ?? "Finishing up"

  const failed = data?.status === "FAILED"
  const paused = data?.awaitingCredential === true
  const timedOut = data?.timedOut === true
  const done = data?.status === "SUCCEEDED"

  return (
    <div style={{ padding: "8px 4px 12px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <div
          style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.015em" }}
        >
          Provisioning {name}
        </div>
        <div
          className="qhub-mono"
          style={{
            marginLeft: "auto",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--accent)",
          }}
        >
          {percent}%
        </div>
      </div>

      <div
        style={{
          height: 8,
          borderRadius: 999,
          background: "var(--panel)",
          marginTop: 12,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percent}%`,
            background: "linear-gradient(90deg, var(--accent), var(--series2))",
            borderRadius: 999,
            transition: "width .55s cubic-bezier(.3,.7,.3,1)",
          }}
        />
      </div>

      <div style={{ fontSize: 12, color: "var(--txt3)", marginTop: 8 }}>
        {done
          ? "Done"
          : paused
            ? "Waiting for the database password"
            : `${current}…`}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 7,
          marginTop: 16,
          border: "1px solid var(--line2)",
          borderRadius: 12,
          background: "var(--panel)",
          padding: "14px 16px",
          maxHeight: 280,
          overflow: "auto",
        }}
      >
        {(data?.steps ?? []).map((step) => {
          const isFailure = failed && data?.failedAt === step.key

          return (
            <div
              key={step.key}
              style={{ display: "flex", alignItems: "baseline", gap: 10 }}
            >
              <div
                style={{
                  flex: "0 0 14px",
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: step.done
                    ? "var(--accent)"
                    : isFailure
                      ? "var(--neg)"
                      : "var(--txt4)",
                }}
              >
                {step.done ? "✓" : isFailure ? "✕" : "·"}
              </div>
              <div style={{ minWidth: 0 }}>
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: step.done || isFailure ? 500 : 400,
                    color: step.done
                      ? "var(--txt)"
                      : isFailure
                        ? "var(--neg)"
                        : "var(--txt3)",
                  }}
                >
                  {step.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {paused && (
        <div
          style={{
            marginTop: 14,
            background: "var(--warn-bg)",
            border: "1px solid var(--warn)",
            borderRadius: 12,
            padding: "14px 16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              className="qhub-mono"
              style={{
                fontSize: 9.5,
                letterSpacing: ".05em",
                padding: "3px 8px",
                borderRadius: 6,
                color: "var(--warn)",
                background: "var(--card)",
              }}
            >
              PAUSED · WAITING FOR CREDENTIAL
            </span>
            <div style={{ fontSize: 12, color: "var(--txt3)" }}>
              step 1 of {data?.total ?? 10} · the tenant record exists, nothing
              else has been built
            </div>
          </div>

          <div
            style={{
              fontSize: 12.5,
              color: "var(--txt2)",
              lineHeight: 1.55,
              marginTop: 8,
            }}
          >
            The job needs the database password for{" "}
            <span className="qhub-mono" style={{ fontSize: 11.5 }}>
              {host ?? "the dedicated server"}
            </span>
            . It is entered once, stored encrypted on the tenant record, and
            never shown again — this prompt is the only place it ever exists in
            a browser. (A dedicated secret manager is on the roadmap; until then
            this is an encrypted column, and we say so.)
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 12,
              alignItems: "center",
            }}
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Database password"
              aria-label="Database password"
              style={{
                flex: 1,
                minWidth: 0,
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
            <button
              type="button"
              disabled={password.length < 8 || resume.isPending}
              onClick={() =>
                resume.mutate(password, { onSuccess: () => setPassword("") })
              }
              style={{
                background:
                  password.length >= 8 ? "var(--accent)" : "var(--panel)",
                color: password.length >= 8 ? "#fff" : "var(--txt4)",
                border: "none",
                fontSize: 12.5,
                fontWeight: 500,
                padding: "10px 16px",
                borderRadius: 10,
                cursor: password.length >= 8 ? "pointer" : "default",
                whiteSpace: "nowrap",
                fontFamily: "inherit",
              }}
            >
              {resume.isPending ? "Resuming…" : "Store in vault & resume"}
            </button>
          </div>

          <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 9 }}>
            Safe to close — the run stays paused for <b>7 days</b>; anyone with
            the onboarding permission can supply the credential from the
            Provisioning tab. After 7 days the run times out and the tenant
            record is cleaned up — nothing half-provisioned is left in the
            estate.
          </div>
        </div>
      )}

      {timedOut && (
        <div
          style={{
            marginTop: 14,
            border: "1px solid var(--line2)",
            borderRadius: 10,
            background: "var(--panel)",
            padding: "10px 13px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              className="qhub-mono"
              style={{
                fontSize: 9.5,
                letterSpacing: ".05em",
                padding: "3px 8px",
                borderRadius: 6,
                color: "var(--txt3)",
                background: "var(--card)",
              }}
            >
              TIMED OUT · CLEANED UP
            </span>
            <div style={{ fontSize: 11.5, color: "var(--txt3)" }}>
              Paused 7 days with no credential — the tenant record was removed.
              Start the wizard again; the form&rsquo;s answers are kept for 30
              days and prefill.
            </div>
          </div>
        </div>
      )}

      {failed && (
        <div
          style={{
            marginTop: 14,
            background: "var(--neg-bg)",
            border: "1px solid var(--neg)",
            borderRadius: 12,
            padding: "13px 16px",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--neg)" }}>
            Provisioning failed at step {(data?.completed ?? 0) + 1} of{" "}
            {data?.total ?? 10}
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "var(--txt2)",
              lineHeight: 1.55,
              marginTop: 6,
            }}
          >
            {data?.error ?? "The run stopped before it finished."}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 8 }}>
            Nothing was left half-built — completed steps were rolled back. Fix
            the inputs and retry; the run and its failure are in the audit
            trail.
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              type="button"
              onClick={onBackToForm}
              style={{
                background: "var(--accent)",
                color: "#fff",
                border: "none",
                fontSize: 12.5,
                fontWeight: 500,
                padding: "8px 16px",
                borderRadius: 10,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Back to the form
            </button>
          </div>
        </div>
      )}

      {!paused && !failed && !timedOut && (
        <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 12 }}>
          Safe to close — provisioning runs server-side as a queued job; this
          view polls it every 3 seconds, and every operation is written to the
          audit trail.
        </div>
      )}

      {done && (
        <button
          type="button"
          onClick={onDone}
          style={{
            display: "inline-flex",
            marginTop: 18,
            background: "var(--accent)",
            color: "#fff",
            fontSize: 13.5,
            fontWeight: 500,
            padding: "11px 22px",
            borderRadius: 11,
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Done
        </button>
      )}
    </div>
  )
}
