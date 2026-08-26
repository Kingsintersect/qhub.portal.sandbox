"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationCounts,
  useNotificationPage,
} from "@/modules/platform-notifications/hooks/use-platform-notifications"
import { NotificationKindBadge } from "@/modules/platform-notifications/components/NotificationKindBadge"
import {
  NOTIFICATION_KINDS,
  type NotificationKind,
  type PlatformNotification,
} from "@/modules/platform-notifications/types"

type Tab = NotificationKind | "all"

/**
 * Everything, tabbed by kind.
 *
 * The page somebody opens to catch up after a week away, so it paginates
 * rather than capping — a silent truncation would read as "nothing else
 * happened".
 */
export function NotificationsPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("all")
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useNotificationPage({
    kind: tab,
    unreadOnly,
    page,
  })
  const { data: counts } = useNotificationCounts()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const rows = data?.data ?? []
  const meta = data?.meta

  const countFor = (kind: NotificationKind) =>
    counts?.find((c) => c.kind === kind)

  const select = (next: Tab) => {
    setTab(next)
    setPage(1)
  }

  const open = (n: PlatformNotification) => {
    if (!n.read) markRead.mutate(n.id)
    if (n.link) router.push(n.link)
  }

  return (
    <div style={{ padding: "26px 30px", maxWidth: 980 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 21,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "var(--txt)",
              margin: 0,
            }}
          >
            Notifications
          </h1>
          <p style={{ fontSize: 13, color: "var(--txt3)", marginTop: 5 }}>
            Everything addressed to you. Ticket assignments are visible to the
            whole team by design — muting a kind mutes the bell, not the record.
          </p>
        </div>

        {(meta?.unread ?? 0) > 0 && (
          <button
            type="button"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            style={{
              fontSize: 12.5,
              color: "var(--accent)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              whiteSpace: "nowrap",
              fontFamily: "inherit",
            }}
          >
            Mark all read
          </button>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap",
          marginTop: 20,
          paddingBottom: 12,
          borderBottom: "1px solid var(--line)",
        }}
      >
        <TabChip
          label="All"
          active={tab === "all"}
          onClick={() => select("all")}
          unread={counts?.reduce((sum, c) => sum + c.unread, 0)}
        />
        {NOTIFICATION_KINDS.map((kind) => {
          const c = countFor(kind)
          if (!c || c.total === 0) return null

          return (
            <TabChip
              key={kind}
              label={kind}
              active={tab === kind}
              onClick={() => select(kind)}
              unread={c.unread}
            />
          )
        })}

        <label
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: "var(--txt3)",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => {
              setUnreadOnly(e.target.checked)
              setPage(1)
            }}
          />
          Unread only
        </label>
      </div>

      <div style={{ marginTop: 4 }}>
        {isLoading && (
          <div
            style={{ padding: "22px 2px", fontSize: 13, color: "var(--txt3)" }}
          >
            Loading…
          </div>
        )}

        {!isLoading && rows.length === 0 && (
          <div
            style={{ padding: "26px 2px", fontSize: 13, color: "var(--txt3)" }}
          >
            No notifications match these filters.
          </div>
        )}

        {rows.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => open(n)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "13px 14px",
              borderBottom: "1px solid var(--line2)",
              borderLeft: n.read
                ? "2px solid transparent"
                : "2px solid var(--accent)",
              borderTop: "none",
              borderRight: "none",
              background: n.read ? "transparent" : "var(--row-open)",
              cursor: n.link ? "pointer" : "default",
              fontFamily: "inherit",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <NotificationKindBadge kind={n.kind} />
              <span
                className="qhub-mono"
                style={{ fontSize: 10.5, color: "var(--txt4)" }}
              >
                {n.createdAt
                  ? new Date(n.createdAt).toLocaleString(undefined, {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </span>
              {n.actor && (
                <span style={{ fontSize: 11, color: "var(--txt4)" }}>
                  · {n.actor}
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--txt)",
                fontWeight: n.read ? 400 : 500,
                lineHeight: 1.5,
              }}
            >
              {n.title}
            </div>
            {n.body && (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--txt3)",
                  marginTop: 2,
                  lineHeight: 1.5,
                }}
              >
                {n.body}
              </div>
            )}
          </button>
        ))}
      </div>

      {meta && meta.lastPage > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 16,
          }}
        >
          <span style={{ fontSize: 12, color: "var(--txt3)" }}>
            Page {meta.currentPage} of {meta.lastPage} · {meta.total} total
          </span>
          <span style={{ display: "flex", gap: 8 }}>
            <PagerButton
              label="Previous"
              disabled={meta.currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            />
            <PagerButton
              label="Next"
              disabled={meta.currentPage >= meta.lastPage}
              onClick={() => setPage((p) => p + 1)}
            />
          </span>
        </div>
      )}
    </div>
  )
}

function TabChip({
  label,
  active,
  unread,
  onClick,
}: {
  label: string
  active: boolean
  unread?: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 11px",
        fontSize: 12,
        textTransform: "capitalize",
        color: active ? "var(--accent)" : "var(--txt3)",
        background: active ? "var(--accent-soft)" : "transparent",
        border: "none",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {label}
      {!!unread && unread > 0 && (
        <span
          className="qhub-mono"
          style={{
            fontSize: 9.5,
            color: "#fff",
            background: "var(--neg)",
            padding: "1px 5px",
            borderRadius: 7,
          }}
        >
          {unread}
        </span>
      )}
    </button>
  )
}

function PagerButton({
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
        fontSize: 12,
        padding: "6px 12px",
        border: "1px solid var(--line-strong)",
        background: "var(--card)",
        color: disabled ? "var(--txt4)" : "var(--txt2)",
        cursor: disabled ? "default" : "pointer",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  )
}
