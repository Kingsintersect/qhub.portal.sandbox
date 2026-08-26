"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationFeed,
} from "@/modules/platform-notifications/hooks/use-platform-notifications"
import { NotificationKindBadge } from "@/modules/platform-notifications/components/NotificationKindBadge"
import type { PlatformNotification } from "@/modules/platform-notifications/types"

/**
 * The bell, and the dropdown behind it.
 *
 * Polls every fifteen seconds. Shows the latest fourteen — the design's
 * number, and a deliberate cap: a dropdown is for noticing, not for reading a
 * week's backlog, which is what the full page is for.
 */
export function NotificationBell() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const { data, isLoading } = useNotificationFeed()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const unread = data?.unread ?? 0
  const rows = data?.data ?? []

  // Clicking anywhere else closes it. Without this the panel stays open behind
  // whatever the operator clicked next and covers the thing they wanted.
  useEffect(() => {
    if (!open) return

    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onEsc)

    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onEsc)
    }
  }, [open])

  const openRow = (n: PlatformNotification) => {
    if (!n.read) markRead.mutate(n.id)
    setOpen(false)
    if (n.link) router.push(n.link)
  }

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={
          unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
        }
        aria-expanded={open}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 44,
          height: 44,
          borderRadius: 999,
          background: "var(--card)",
          boxShadow: "var(--shadow-sm)",
          border: "none",
          cursor: "pointer",
          color: "var(--icon-strong)",
        }}
      >
        <Bell size={18} strokeWidth={1.7} aria-hidden="true" />
        {unread > 0 && (
          <span
            className="qhub-mono"
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              minWidth: 16,
              height: 16,
              borderRadius: 999,
              background: "var(--neg)",
              color: "#fff",
              fontSize: 9.5,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
              boxSizing: "border-box",
            }}
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            zIndex: 250,
            width: 420,
            display: "flex",
            flexDirection: "column",
            background: "var(--surface-solid)",
            border: "1px solid var(--line-strong)",
            borderRadius: 16,
            boxShadow: "0 24px 64px rgba(8,12,18,.3)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              borderBottom: "1px solid var(--line2)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--txt)" }}>
              Notifications
            </div>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                style={{
                  fontSize: 11.5,
                  color: "var(--accent)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontFamily: "inherit",
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: 420, overflow: "auto" }}>
            {isLoading && (
              <div
                style={{
                  padding: "18px 14px",
                  fontSize: 12.5,
                  color: "var(--txt3)",
                }}
              >
                Loading…
              </div>
            )}

            {!isLoading && rows.length === 0 && (
              // Product rule: every empty list says so explicitly.
              <div
                style={{
                  padding: "22px 14px",
                  fontSize: 12.5,
                  color: "var(--txt3)",
                }}
              >
                Nothing yet. Assignments, incidents and report results land
                here.
              </div>
            )}

            {rows.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => openRow(n)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "11px 14px",
                  borderBottom: "1px solid var(--line2)",
                  background: n.read ? "transparent" : "var(--row-open)",
                  border: "none",
                  borderLeft: n.read
                    ? "2px solid transparent"
                    : "2px solid var(--accent)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    marginBottom: 4,
                  }}
                >
                  <NotificationKindBadge kind={n.kind} />
                  <span
                    className="qhub-mono"
                    style={{ fontSize: 10.5, color: "var(--txt4)" }}
                  >
                    {relativeTime(n.createdAt)}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--txt)",
                    fontWeight: n.read ? 400 : 500,
                    lineHeight: 1.45,
                  }}
                >
                  {n.title}
                </div>
                {n.body && (
                  <div
                    style={{
                      fontSize: 11.5,
                      color: "var(--txt3)",
                      marginTop: 2,
                      lineHeight: 1.45,
                    }}
                  >
                    {n.body}
                  </div>
                )}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setOpen(false)
              router.push("/platform/notifications")
            }}
            style={{
              padding: "11px 14px",
              borderTop: "1px solid var(--line)",
              fontSize: 12.5,
              color: "var(--accent)",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "inherit",
            }}
          >
            View all notifications →
          </button>
        </div>
      )}
    </div>
  )
}

/** Short relative time. Long enough ago and the date is more useful. */
function relativeTime(iso: string | null): string {
  if (!iso) return ""

  const then = new Date(iso).getTime()
  const mins = Math.floor((Date.now() - then) / 60000)

  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
  if (mins < 10080) return `${Math.floor(mins / 1440)}d ago`

  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  })
}
