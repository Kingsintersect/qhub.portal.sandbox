"use client"

import { useMemo, useState } from "react"

import { AnnouncementComposer } from "@/modules/announcements/components/AnnouncementComposer"
import {
  useAnnouncements,
  useDeleteAnnouncement,
  usePublishAnnouncement,
} from "@/modules/announcements/hooks/use-announcements"
import type {
  AnnouncementSeverity,
  PlatformAnnouncement,
} from "@/modules/announcements/types"

const GRID = "108px minmax(0,1.8fr) minmax(0,1.1fr) 168px 108px 92px 160px"

type Tab = "all" | "scheduled" | "sent"

/**
 * Announcements from the platform to the institutions it hosts, lifted from
 * the draft.
 *
 * Not the same thing as an institution announcing to its own students — same
 * word, opposite direction.
 */
export function PlatformAnnouncementsShell() {
  const [tab, setTab] = useState<Tab>("all")
  const [severity, setSeverity] = useState<AnnouncementSeverity | "">("")
  const [page, setPage] = useState(1)
  const [composing, setComposing] = useState(false)

  const { data, isPending } = useAnnouncements()
  const publish = usePublishAnnouncement()
  const remove = useDeleteAnnouncement()

  const all = useMemo(() => data?.data ?? [], [data])

  const rows = useMemo(() => {
    let list = all

    if (tab === "scheduled") list = list.filter((a) => !a.isPublished)
    if (tab === "sent") list = list.filter((a) => a.isPublished)
    if (severity) list = list.filter((a) => a.severity === severity)

    return list
  }, [all, tab, severity])

  const perPage = 8
  const lastPage = Math.max(1, Math.ceil(rows.length / perPage))
  const pageRows = rows.slice((page - 1) * perPage, page * perPage)

  const scheduled = all.filter((a) => !a.isPublished).length
  const sent = all.filter((a) => a.isPublished).length
  const live = data?.meta.liveCount ?? 0

  const select = (next: Tab) => {
    setTab(next)
    setPage(1)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "-0.015em",
              color: "var(--txt)",
              margin: 0,
            }}
          >
            Announcements
          </h1>
          <div style={{ fontSize: 12.5, color: "var(--txt3)", marginTop: 3 }}>
            From the platform to its institutions · {live} live right now
          </div>
        </div>

        <button
          type="button"
          onClick={() => setComposing(true)}
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 9,
            background: "var(--accent)",
            color: "#fff",
            fontSize: 13.5,
            fontWeight: 500,
            padding: "11px 18px",
            borderRadius: 11,
            border: "none",
            cursor: "pointer",
            whiteSpace: "nowrap",
            fontFamily: "inherit",
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          New announcement
        </button>
      </div>

      <div
        style={{
          background: "var(--card)",
          borderRadius: 20,
          padding: 4,
          boxShadow: "var(--shadow-card)",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
        }}
      >
        <Stat label="Live now" value={live} note="visible to institutions" />
        <Stat
          label="Scheduled"
          value={scheduled}
          note="not sent yet"
          tone={scheduled > 0 ? "warn" : undefined}
        />
        <Stat label="Sent" value={sent} note="all time" />
        <Stat
          label="Reached"
          value={all.reduce((sum, a) => sum + (a.recipientCount ?? 0), 0)}
          note="institution deliveries"
          last
        />
      </div>

      <div
        style={{
          background: "var(--card)",
          borderRadius: 20,
          boxShadow: "var(--shadow-card)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "14px 18px 0",
            flexWrap: "wrap",
          }}
        >
          <TabPill
            label="All"
            count={all.length}
            active={tab === "all"}
            onClick={() => select("all")}
          />
          <TabPill
            label="Scheduled"
            count={scheduled}
            active={tab === "scheduled"}
            onClick={() => select("scheduled")}
          />
          <TabPill
            label="Sent"
            count={sent}
            active={tab === "sent"}
            onClick={() => select("sent")}
          />

          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            {(["", "INFO", "WARNING", "CRITICAL"] as const).map((s) => (
              <TypeChip
                key={s || "any"}
                label={s === "" ? "All types" : titleCase(s)}
                active={severity === s}
                onClick={() => {
                  setSeverity(s)
                  setPage(1)
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              columnGap: 16,
              padding: "16px 24px 10px",
              fontSize: 10.5,
              letterSpacing: ".09em",
              color: "var(--txt4)",
              minWidth: 960,
              boxSizing: "border-box",
            }}
          >
            <div>TYPE</div>
            <div>ANNOUNCEMENT</div>
            <div>AUDIENCE</div>
            <div>DELIVERY</div>
            <div>STATUS</div>
            <div>READ</div>
            <div />
          </div>

          {isPending && <Empty>Loading…</Empty>}

          {!isPending && pageRows.length === 0 && (
            <Empty>No announcements match these filters.</Empty>
          )}

          {pageRows.map((a) => (
            <Row
              key={a.id}
              announcement={a}
              onSendNow={() => publish.mutate({ id: a.id, publish: true })}
              onDelete={() => remove.mutate(a.id)}
              deleting={remove.isPending}
              sending={publish.isPending}
            />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 24px",
            borderTop: "1px solid var(--line2)",
            fontSize: 12.5,
            color: "var(--txt3)",
          }}
        >
          <div>
            {rows.length} announcement{rows.length === 1 ? "" : "s"} · email
            copies cannot be recalled
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 12, color: "var(--txt4)" }}>
              Page {page} of {lastPage}
            </div>
            <Pager
              label="Previous"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            />
            <Pager
              label="Next"
              disabled={page >= lastPage}
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            />
          </div>
        </div>
      </div>

      <AnnouncementComposer open={composing} onOpenChange={setComposing} />
    </div>
  )
}

function Row({
  announcement: a,
  onSendNow,
  onDelete,
  deleting,
  sending,
}: {
  announcement: PlatformAnnouncement
  onSendNow: () => void
  onDelete: () => void
  deleting: boolean
  sending: boolean
}) {
  const [confirming, setConfirming] = useState<"send" | "delete" | null>(null)

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: GRID,
        columnGap: 16,
        alignItems: "center",
        padding: "14px 24px",
        fontSize: 13.5,
        borderTop: "1px solid var(--line2)",
        minWidth: 960,
        boxSizing: "border-box",
      }}
    >
      <div>
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
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontWeight: 500,
            color: "var(--txt)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {a.title}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--txt3)",
            marginTop: 3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {a.body}
        </div>
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: "var(--txt2)" }}>
          {audienceLabel(a)}
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: "var(--txt4)",
            marginTop: 2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {a.recipientCount !== null
            ? `${a.recipientCount} institution${a.recipientCount === 1 ? "" : "s"}`
            : "audience not resolved yet"}
        </div>
      </div>

      <div
        style={{ fontSize: 12.5, color: "var(--txt2)", whiteSpace: "nowrap" }}
      >
        {a.publishedAt
          ? new Date(a.publishedAt).toLocaleString(undefined, {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "not sent"}
      </div>

      <div>
        <span
          className="qhub-mono"
          style={{
            fontSize: 10,
            letterSpacing: ".05em",
            padding: "4px 8px",
            borderRadius: 7,
            ...statusTone(a),
          }}
        >
          {a.isPublished ? (a.isLive ? "LIVE" : "SENT") : "SCHEDULED"}
        </span>
      </div>

      <div
        style={{ fontSize: 12.5, color: "var(--txt3)", whiteSpace: "nowrap" }}
      >
        {a.notifiedCount !== null && a.recipientCount
          ? `${Math.round((a.notifiedCount / Math.max(1, a.recipientCount)) * 100)}%`
          : "—"}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
        {!a.isPublished &&
          (confirming === "send" ? (
            <>
              <Ghost onClick={onSendNow} disabled={sending} tone="accent">
                Send it now
              </Ghost>
              <Ghost onClick={() => setConfirming(null)}>Cancel</Ghost>
            </>
          ) : (
            <Ghost onClick={() => setConfirming("send")}>Send now</Ghost>
          ))}

        {a.isPublished &&
          (confirming === "delete" ? (
            <>
              <Ghost onClick={onDelete} disabled={deleting} tone="danger">
                Delete — email copies stay sent
              </Ghost>
              <Ghost onClick={() => setConfirming(null)}>Cancel</Ghost>
            </>
          ) : (
            <Ghost tone="muted" onClick={() => setConfirming("delete")}>
              Delete
            </Ghost>
          ))}
      </div>
    </div>
  )
}

// --- Small pieces -----------------------------------------------------------

function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase()
}

function audienceLabel(a: PlatformAnnouncement): string {
  if (a.audience === "ALL") return "All institutions"
  if (a.audience === "CATEGORY") {
    return `Category · ${a.audienceCategory ?? "unset"}`
  }

  return "Selected institutions"
}

function severityTone(severity: AnnouncementSeverity) {
  if (severity === "CRITICAL") {
    return { color: "var(--neg)", background: "var(--neg-bg)" }
  }
  if (severity === "WARNING") {
    return { color: "var(--warn)", background: "var(--warn-bg)" }
  }

  return { color: "var(--accent)", background: "var(--accent-soft)" }
}

function statusTone(a: PlatformAnnouncement) {
  if (!a.isPublished) {
    return { color: "var(--warn)", background: "var(--warn-bg)" }
  }
  if (a.isLive) {
    return { color: "var(--accent)", background: "var(--accent-soft)" }
  }

  return { color: "var(--txt3)", background: "var(--panel)" }
}

function Stat({
  label,
  value,
  note,
  tone,
  last,
}: {
  label: string
  value: number
  note: string
  tone?: "warn"
  last?: boolean
}) {
  return (
    <div
      style={{
        padding: "18px 20px",
        borderRight: last ? "none" : "1px solid var(--line)",
      }}
    >
      <div style={{ fontSize: 13, color: "var(--txt3)", marginBottom: 7 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <div
          className="qhub-mono"
          style={{
            fontSize: 23,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: tone === "warn" ? "var(--warn)" : "var(--txt)",
          }}
        >
          {value.toLocaleString()}
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--txt4)" }}>
          {note}
        </div>
      </div>
    </div>
  )
}

function TabPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "9px 15px",
        borderRadius: 999,
        fontSize: 12.5,
        fontWeight: active ? 600 : 500,
        color: active ? "var(--accent)" : "var(--txt3)",
        background: active ? "var(--accent-soft)" : "transparent",
        border: "none",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {label}
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: active ? "var(--accent)" : "var(--txt4)",
        }}
      >
        {count}
      </span>
    </button>
  )
}

function TypeChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontSize: 11.5,
        fontWeight: 500,
        color: active ? "var(--accent)" : "var(--txt3)",
        border: `1px solid ${active ? "var(--accent-brd)" : "var(--line-strong)"}`,
        background: active ? "var(--accent-soft)" : "transparent",
        padding: "5px 11px",
        borderRadius: 999,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  )
}

function Ghost({
  children,
  onClick,
  disabled,
  tone,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  tone?: "accent" | "danger" | "muted"
}) {
  const color =
    tone === "accent"
      ? "var(--accent)"
      : tone === "danger"
        ? "var(--neg)"
        : tone === "muted"
          ? "var(--txt4)"
          : "var(--txt2)"

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        border: "1px solid var(--line-strong)",
        borderRadius: 9,
        background: "transparent",
        color,
        fontSize: 11.5,
        fontWeight: 500,
        padding: "6px 11px",
        cursor: disabled ? "default" : "pointer",
        whiteSpace: "nowrap",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "26px 24px",
        borderTop: "1px solid var(--line2)",
        fontSize: 13,
        color: "var(--txt3)",
      }}
    >
      {children}
    </div>
  )
}

function Pager({
  label,
  disabled,
  onClick,
}: {
  label: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "6px 12px",
        borderRadius: 9,
        background: "var(--panel)",
        border: "none",
        color: disabled ? "var(--txt4)" : "var(--txt2)",
        fontSize: 12.5,
        cursor: disabled ? "default" : "pointer",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  )
}
