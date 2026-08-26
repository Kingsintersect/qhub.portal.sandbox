"use client"

import type { NotificationKind } from "@/modules/platform-notifications/types"

/**
 * The kind chip, with the tone the design assigns each kind.
 *
 * Seven kinds, seven tones — the point is that an incident does not look like
 * a billing notice at a glance. Colours come from the console tokens so both
 * themes resolve as a set.
 */
const TONES: Record<
  NotificationKind,
  { tone: string; bg: string; label: string }
> = {
  report: { tone: "var(--accent)", bg: "var(--accent-soft)", label: "REPORT" },
  tenant: { tone: "var(--accent)", bg: "var(--good-bg)", label: "TENANT" },
  task: { tone: "var(--accent)", bg: "var(--accent-soft)", label: "TASK" },
  ticket: { tone: "var(--series2)", bg: "var(--warn-bg)", label: "TICKET" },
  incident: { tone: "var(--neg)", bg: "var(--neg-bg)", label: "INCIDENT" },
  billing: { tone: "var(--txt3)", bg: "var(--panel)", label: "BILLING" },
  user: { tone: "var(--accent)", bg: "var(--good-bg)", label: "USER" },
}

export function NotificationKindBadge({ kind }: { kind: NotificationKind }) {
  const t = TONES[kind] ?? TONES.tenant

  return (
    <span
      className="qhub-mono"
      style={{
        color: t.tone,
        background: t.bg,
        fontSize: 9.5,
        letterSpacing: ".06em",
        padding: "3px 6px",
        whiteSpace: "nowrap",
      }}
    >
      {t.label}
    </span>
  )
}

export const NOTIFICATION_TONES = TONES
