"use client"

import { useState } from "react"
import { toast } from "sonner"

import type { Infrastructure } from "@/modules/platform-infrastructure/types"

type Domain = NonNullable<Infrastructure["customDomain"]>

/**
 * A school's own hostname, lifted from the draft.
 *
 * Every other card on this tab describes something we operate. This one
 * describes something we are *waiting for*: a university's IT department
 * creates the DNS record, and we can neither do it nor hurry it.
 *
 * Which is why the card's main content is an instruction to hand somebody
 * rather than a button to press — the copyable CNAME is the actual unit of
 * work, because a staff member emails it to a registry.
 */
export function CustomDomainCard({
  domain,
  onRetry,
  retrying,
}: {
  domain: Domain | null
  onRetry: () => void
  retrying: boolean
}) {
  const [copied, setCopied] = useState(false)

  if (domain === null) {
    return null
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access can be refused outright. Saying so beats a button
      // that silently does nothing — the text is on screen to select by hand.
      toast.error("Could not copy — select the line and copy it manually")
    }
  }

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
        <div style={{ fontSize: 14, fontWeight: 600 }}>Custom domain</div>
        <span
          className="qhub-mono"
          style={{
            marginLeft: "auto",
            fontSize: 9.5,
            letterSpacing: ".07em",
            padding: "3px 9px",
            borderRadius: 999,
            ...stateTone(domain.state),
          }}
        >
          {label(domain.state)}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 10,
          marginTop: 10,
          flexWrap: "wrap",
        }}
      >
        <div
          className="qhub-mono"
          style={{ fontSize: 13, color: "var(--accent)" }}
        >
          {domain.host}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--txt4)" }}>
          the school&rsquo;s own domain — we never create it and cannot
        </div>
      </div>

      {domain.state === "PENDING" && (
        <>
          <div
            style={{
              fontSize: 12.5,
              color: "var(--txt2)",
              marginTop: 10,
              lineHeight: 1.55,
            }}
          >
            Waiting on the university&rsquo;s IT department to create one DNS
            record. Nothing for QHub to do until they have.
          </div>

          <CnameRow
            cname={domain.cname}
            copied={copied}
            onCopy={() => void copy(domain.cname)}
          />

          <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 8 }}>
            Forwardable version: &ldquo;Please add a CNAME record pointing{" "}
            {domain.host} to {domain.cnameTarget} — one entry, nothing else
            changes.&rdquo;
          </div>

          {domain.waitingDays !== null && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 10,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  // Amber only once it has been long enough to act on.
                  // Colouring day one would make the normal case look wrong.
                  color: domain.worthChasing ? "var(--series2)" : "var(--txt3)",
                }}
              >
                Waiting {domain.waitingDays}{" "}
                {domain.waitingDays === 1 ? "day" : "days"}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--txt4)" }}>
                · a week of silence means somebody should telephone the registry
              </div>
            </div>
          )}

          {/* The common mistake: pointed, but at the wrong server. Invisible
              unless the card says what it actually saw. */}
          {domain.resolvedTo !== null && (
            <div
              className="qhub-mono"
              style={{ fontSize: 11, color: "var(--txt4)", marginTop: 8 }}
            >
              Last lookup resolved to {domain.resolvedTo} — not us
            </div>
          )}
        </>
      )}

      {(domain.state === "POINTED" || domain.state === "SECURING") && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 10,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              border: "2px solid var(--accent)",
              borderTopColor: "transparent",
              animation: "qhub-spin 1s linear infinite",
              flex: "0 0 14px",
            }}
          />
          <div
            style={{ fontSize: 12.5, color: "var(--txt2)", lineHeight: 1.55 }}
          >
            DNS resolves to us — that is the proof of ownership. Issuing the
            certificate for exactly this hostname; seconds to a minute, and
            nothing is required of anybody.
          </div>
        </div>
      )}

      {domain.state === "LIVE" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "6px 0",
            fontSize: 12.5,
            marginTop: 10,
          }}
        >
          <div style={{ color: "var(--txt2)" }}>Reachable</div>
          <div style={{ color: "var(--accent)", fontWeight: 500 }}>
            Yes · serving students
          </div>

          <div style={{ color: "var(--txt2)" }}>Certificate</div>
          <div style={{ fontWeight: 500 }}>Valid · renews automatically</div>

          <div style={{ color: "var(--txt2)" }}>Expires</div>
          <div
            className="qhub-mono"
            style={{
              fontSize: 11.5,
              color: expiryTone(domain.daysUntilExpiry),
            }}
          >
            {expiry(domain.certExpiresAt, domain.daysUntilExpiry)}
          </div>
        </div>
      )}

      {domain.state === "FAILED" && (
        <div
          style={{
            background: "var(--warn-bg)",
            border: "1px solid var(--line-strong)",
            borderRadius: 11,
            padding: "11px 14px",
            marginTop: 10,
          }}
        >
          <div
            style={{ fontSize: 12.5, color: "var(--txt2)", lineHeight: 1.55 }}
          >
            {domain.lastError ?? "The certificate could not be issued."}
          </div>

          <CnameRow
            cname={domain.cname}
            copied={copied}
            onCopy={() => void copy(domain.cname)}
          />

          {/* Said plainly, because the obvious reading of a red card here is
              "the onboarding broke" — and somebody acting on that would
              rebuild a school that is perfectly healthy. */}
          <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 6 }}>
            The institution is provisioned and healthy throughout — only its
            public address is not ready. This is not a failed onboarding, and
            nothing needs rebuilding.
          </div>

          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            style={{
              display: "inline-block",
              marginTop: 8,
              border: "1px solid var(--line-strong)",
              background: "transparent",
              color: "var(--txt2)",
              fontSize: 12,
              fontWeight: 500,
              padding: "6px 12px",
              borderRadius: 9,
              cursor: retrying ? "default" : "pointer",
              opacity: retrying ? 0.6 : 1,
              fontFamily: "inherit",
            }}
          >
            {retrying ? "Retrying…" : "Retry issuance"}
          </button>
        </div>
      )}
    </div>
  )
}

/** The line somebody emails to a university. */
function CnameRow({
  cname,
  copied,
  onCopy,
}: {
  cname: string
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "var(--panel)",
        border: "1px solid var(--line2)",
        borderRadius: 11,
        padding: "11px 14px",
        marginTop: 10,
      }}
    >
      <div
        className="qhub-mono"
        style={{ fontSize: 12, color: "var(--txt)", wordBreak: "break-all" }}
      >
        {cname}
      </div>
      <button
        type="button"
        onClick={onCopy}
        style={{
          marginLeft: "auto",
          border: "1px solid var(--line-strong)",
          background: "transparent",
          color: copied ? "var(--accent)" : "var(--txt2)",
          fontSize: 11.5,
          fontWeight: 500,
          padding: "6px 12px",
          borderRadius: 9,
          cursor: "pointer",
          whiteSpace: "nowrap",
          fontFamily: "inherit",
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  )
}

function label(state: Domain["state"]): string {
  switch (state) {
    case "PENDING":
      return "WAITING ON THEIR IT"
    case "POINTED":
    case "SECURING":
      return "POINTED · SECURING"
    case "LIVE":
      return "LIVE"
    default:
      return "ISSUANCE FAILED"
  }
}

function stateTone(state: Domain["state"]): {
  color: string
  background: string
} {
  switch (state) {
    case "LIVE":
      return { color: "var(--accent)", background: "var(--good-bg)" }
    case "FAILED":
      return { color: "var(--neg)", background: "var(--neg-bg)" }
    default:
      return { color: "var(--series2)", background: "var(--warn-bg)" }
  }
}

/**
 * The expiry date, and how long that is.
 *
 * Both, because a date alone needs mental arithmetic and a countdown alone
 * hides which morning somebody should care about.
 */
function expiry(iso: string | null, days: number | null): string {
  if (iso === null) return "—"

  const date = new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  return days === null ? date : `${date} · ${days} days`
}

function expiryTone(days: number | null): string {
  if (days === null) return "var(--txt2)"
  // Renewal runs at 30 days out, so anything under 14 means renewal has been
  // failing for a fortnight and nobody has noticed.
  if (days <= 14) return "var(--neg)"
  if (days <= 30) return "var(--series2)"

  return "var(--txt2)"
}
