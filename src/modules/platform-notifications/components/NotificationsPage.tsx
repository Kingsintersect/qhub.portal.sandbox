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
  const [unreadOnly] = useState(false)
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
            Notifications
          </h1>
          <div style={{ fontSize: 12.5, color: "var(--txt3)", marginTop: 3 }}>
            {meta
              ? `${meta.total} in total · ${meta.unread} unread`
              : "Everything addressed to you"}
          </div>
        </div>

        {(meta?.unread ?? 0) > 0 && (
          <button
            type="button"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            style={{
              marginLeft: "auto",
              border: "1px solid var(--line-strong)",
              borderRadius: 10,
              background: "transparent",
              color: "var(--txt2)",
              fontSize: 12.5,
              fontWeight: 500,
              padding: "9px 16px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
            }}
          >
            Mark all read
          </button>
        )}
      </div>

      {/* The draft's kind tabs: one panel-ground pill group, sized to content. */}
      <div
        style={{
          display: "flex",
          background: "var(--panel)",
          borderRadius: 12,
          padding: 3,
          width: "fit-content",
          flexWrap: "wrap",
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
      </div>

      <div
        style={{
          background: "var(--card)",
          borderRadius: 20,
          boxShadow: "var(--shadow-card)",
          overflow: "hidden",
        }}
      >
        {isLoading && (
          <div
            style={{ padding: "26px 24px", fontSize: 13, color: "var(--txt3)" }}
          >
            Loading…
          </div>
        )}

        {!isLoading && rows.length === 0 && (
          <div
            style={{ padding: "26px 24px", fontSize: 13, color: "var(--txt3)" }}
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
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              width: "100%",
              textAlign: "left",
              padding: "14px 24px",
              borderBottom: "1px solid var(--line2)",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              background: "transparent",
              cursor: n.link ? "pointer" : "default",
              fontFamily: "inherit",
            }}
          >
            <span style={{ marginTop: 2, display: "flex" }}>
              <NotificationKindBadge kind={n.kind} />
            </span>

            <span style={{ minWidth: 0, flex: 1 }}>
              <span
                style={{
                  display: "block",
                  fontSize: 13,
                  lineHeight: 1.55,
                  fontWeight: n.read ? 400 : 600,
                  color: n.read ? "var(--txt2)" : "var(--txt)",
                }}
              >
                {n.title}
              </span>
              {n.body && (
                <span
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: "var(--txt3)",
                    marginTop: 2,
                    lineHeight: 1.5,
                  }}
                >
                  {n.body}
                </span>
              )}
            </span>

            <span
              style={{
                flex: "0 0 auto",
                fontSize: 11.5,
                color: "var(--txt4)",
                whiteSpace: "nowrap",
              }}
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

            {!n.read && (
              <span
                style={{
                  flex: "0 0 auto",
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  background: "var(--accent)",
                  marginTop: 6,
                }}
              />
            )}
          </button>
        ))}

        {meta && meta.lastPage > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 24px",
              fontSize: 12.5,
              color: "var(--txt3)",
            }}
          >
            <span>
              Page {meta.currentPage} of {meta.lastPage}
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

        <div
          style={{ padding: "12px 24px", fontSize: 11.5, color: "var(--txt4)" }}
        >
          Notifications older than 90 days are archived to the audit log.
        </div>
      </div>
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
        fontSize: 12.5,
        fontWeight: active ? 600 : 500,
        color: active ? "var(--txt)" : "var(--txt3)",
        background: active ? "var(--card)" : "transparent",
        boxShadow: active ? "var(--shadow-sm)" : "none",
        padding: "7px 14px",
        borderRadius: 9,
        border: "none",
        cursor: "pointer",
        textTransform: "capitalize",
        fontFamily: "inherit",
      }}
    >
      {label}
      {!!unread && unread > 0 && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: active ? "var(--accent)" : "var(--txt4)",
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
        fontSize: 12.5,
        padding: "6px 12px",
        borderRadius: 9,
        border: "none",
        background: "var(--panel)",
        color: disabled ? "var(--txt4)" : "var(--txt2)",
        cursor: disabled ? "default" : "pointer",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  )
}
