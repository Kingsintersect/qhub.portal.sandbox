"use client"

import { useAnnouncementReads } from "@/modules/announcements/hooks/use-announcements"
import type { PlatformAnnouncement } from "@/modules/announcements/types"

/**
 * One announcement, read as its recipients read it, lifted from the draft.
 *
 * The table truncates the body to one line, which is enough to find a row and
 * not enough to check what was actually said. This is where you check — before
 * sending a scheduled one, or after a tenant asks what they were told.
 */
export function AnnouncementViewer({
  announcement: a,
  onClose,
}: {
  announcement: PlatformAnnouncement
  onClose: () => void
}) {
  const { data: reads } = useAnnouncementReads(a.id)

  const status = a.isPublished ? (a.isLive ? "LIVE" : "SENT") : "SCHEDULED"

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
        aria-label={a.title}
        style={{
          position: "relative",
          width: 560,
          maxWidth: "94vw",
          maxHeight: "86vh",
          overflow: "auto",
          background: "var(--surface-solid)",
          border: "1px solid var(--line-strong)",
          borderRadius: 18,
          boxShadow: "0 30px 80px rgba(8,12,18,.35)",
          padding: 26,
          color: "var(--txt)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 500,
              padding: "4px 9px",
              borderRadius: 7,
              ...severityTone(a.severity),
            }}
          >
            {titleCase(a.severity)}
          </span>

          <span
            className="qhub-mono"
            style={{
              fontSize: 10,
              letterSpacing: ".05em",
              padding: "4px 8px",
              borderRadius: 7,
              color: a.isPublished ? "var(--accent)" : "var(--txt3)",
              background: a.isPublished ? "var(--good-bg)" : "var(--panel)",
            }}
          >
            {status}
          </span>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              marginLeft: "auto",
              width: 32,
              height: 32,
              borderRadius: 10,
              border: "1px solid var(--line-strong)",
              background: "var(--panel)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg
              style={{ stroke: "var(--icon-strong)" }}
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div
          style={{
            fontSize: 19,
            fontWeight: 600,
            letterSpacing: "-0.015em",
            marginTop: 14,
            lineHeight: 1.3,
          }}
        >
          {a.title}
        </div>

        <div
          style={{
            fontSize: 13.5,
            color: "var(--txt2)",
            lineHeight: 1.65,
            marginTop: 10,
            whiteSpace: "pre-wrap",
          }}
        >
          {a.body}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "110px 1fr",
            rowGap: 10,
            columnGap: 14,
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid var(--line)",
            fontSize: 12.5,
          }}
        >
          <div style={{ color: "var(--txt4)" }}>Audience</div>
          <div
            style={{
              color: "var(--txt)",
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            {audienceLabel(a, reads?.recipients ?? a.recipientCount ?? null)}
          </div>

          <div style={{ color: "var(--txt4)" }}>Delivery</div>
          <div style={{ color: "var(--txt)", fontWeight: 500 }}>
            {deliveryLabel(a)}
          </div>

          <div style={{ color: "var(--txt4)" }}>Read</div>
          <div style={{ color: "var(--txt2)", lineHeight: 1.5 }}>
            {readLabel(reads ?? null, a)}
          </div>
        </div>
      </div>
    </div>
  )
}

function severityTone(severity: string): {
  color: string
  background: string
} {
  switch (severity) {
    case "CRITICAL":
      return { color: "var(--neg)", background: "var(--neg-bg)" }
    case "WARNING":
      return { color: "var(--warn)", background: "var(--warn-bg)" }
    default:
      return { color: "var(--accent)", background: "var(--accent-soft)" }
  }
}

function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase()
}

function audienceLabel(
  a: PlatformAnnouncement,
  recipients: number | null
): string {
  const count =
    recipients === null
      ? ""
      : ` (${recipients} institution${recipients === 1 ? "" : "s"})`

  if (a.audience === "ALL") return `All institutions · fleet-wide${count}`

  if (a.audience === "CATEGORY") {
    return `Programme type · ${a.audienceCategory ?? "unset"}${count}`
  }

  return `Selected institutions${count}`
}

function deliveryLabel(a: PlatformAnnouncement): string {
  if (!a.isPublished) {
    return a.scheduledFor === null
      ? "Draft — not scheduled"
      : `Scheduled for ${stamp(a.scheduledFor)}`
  }

  const sent = `Sent ${stamp(a.publishedAt)}`

  // An expiry that has passed is why a SENT announcement no longer shows in
  // anyone's console — worth saying, rather than leaving it a mystery.
  if (a.expiresAt === null) return sent

  return `${sent} · ${new Date(a.expiresAt) < new Date() ? "expired" : "expires"} ${stamp(a.expiresAt)}`
}

function readLabel(
  reads: { recipients: number; read: number } | null,
  a: PlatformAnnouncement
): string {
  if (!a.isPublished) return "Nothing delivered yet."

  if (reads === null) return "—"

  if (reads.recipients === 0) return "This reached nobody."

  const pct = Math.round((reads.read / reads.recipients) * 100)

  return `${reads.read} of ${reads.recipients} institutions · ${pct}%`
}

function stamp(iso: string | null): string {
  if (iso === null) return "—"

  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
