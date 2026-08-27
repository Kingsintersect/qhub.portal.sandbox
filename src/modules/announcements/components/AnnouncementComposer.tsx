"use client"

import { useState } from "react"

import { AudiencePicker } from "@/modules/announcements/components/AudiencePicker"
import {
  useCreateAnnouncement,
  usePublishAnnouncement,
} from "@/modules/announcements/hooks/use-announcements"
import type {
  AnnouncementAudience,
  AnnouncementSeverity,
} from "@/modules/announcements/types"

const SEVERITIES: Array<{ value: AnnouncementSeverity; label: string }> = [
  { value: "INFO", label: "Information" },
  { value: "WARNING", label: "Warning" },
  { value: "CRITICAL", label: "Critical" },
]

/**
 * Write an announcement and, optionally, send it in the same step.
 *
 * "Save as draft" and "Publish now" are separate buttons rather than a
 * checkbox: publishing reaches other organisations and cannot be quietly
 * undone from their point of view, so it should take a deliberate click that
 * says what it does.
 */
export function AnnouncementComposer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const create = useCreateAnnouncement()
  const publish = usePublishAnnouncement()

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [severity, setSeverity] = useState<AnnouncementSeverity>("INFO")
  const [audience, setAudience] = useState<AnnouncementAudience>("ALL")
  const [category, setCategory] = useState<string | null>(null)
  const [tenantIds, setTenantIds] = useState<number[]>([])
  const [expiresAt, setExpiresAt] = useState("")
  const [notifyStaff, setNotifyStaff] = useState(false)

  const busy = create.isPending || publish.isPending

  const audienceReady =
    audience === "ALL" ||
    (audience === "CATEGORY" && Boolean(category)) ||
    (audience === "SELECTED" && tenantIds.length > 0)

  const ready =
    title.trim().length > 0 && body.trim().length > 0 && audienceReady

  const reset = () => {
    setTitle("")
    setBody("")
    setSeverity("INFO")
    setAudience("ALL")
    setCategory(null)
    setTenantIds([])
    setExpiresAt("")
    setNotifyStaff(false)
  }

  const close = () => {
    reset()
    onOpenChange(false)
  }

  const submit = async (thenPublish: boolean) => {
    if (!ready) return

    const announcement = await create.mutateAsync({
      title: title.trim(),
      body: body.trim(),
      severity,
      audience,
      audienceCategory: category,
      tenantIds,
      // A datetime-local value has no zone; sending it as-is lets the API read
      // it in the server's zone rather than guessing here.
      expiresAt: expiresAt || null,
      notifyStaff,
    })

    if (thenPublish) {
      await publish.mutateAsync({ id: announcement.id, publish: true })
    }

    reset()
    onOpenChange(false)
  }

  if (!open) return null

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
        onClick={close}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(8,12,18,.45)",
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="New announcement"
        style={{
          position: "relative",
          width: 640,
          maxWidth: "94vw",
          maxHeight: "88vh",
          overflow: "auto",
          background: "var(--surface-solid)",
          border: "1px solid var(--line-strong)",
          borderRadius: 18,
          boxShadow: "0 30px 80px rgba(8,12,18,.35)",
          padding: 26,
          color: "var(--txt)",
        }}
      >
        <div
          style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em" }}
        >
          New announcement
        </div>
        <div style={{ fontSize: 12.5, color: "var(--txt3)", marginTop: 4 }}>
          This goes to the institutions QHub hosts, not to their students.
        </div>

        <Label>TYPE</Label>
        <div
          style={{
            display: "flex",
            background: "var(--panel)",
            borderRadius: 11,
            padding: 3,
            width: "fit-content",
          }}
        >
          {SEVERITIES.map((option) => {
            const on = severity === option.value
            const hot = option.value === "CRITICAL"

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSeverity(option.value)}
                style={{
                  fontSize: 12.5,
                  fontWeight: on ? 600 : 400,
                  color: on
                    ? hot
                      ? "var(--neg)"
                      : "var(--txt)"
                    : "var(--txt3)",
                  background: on ? "var(--card)" : "transparent",
                  boxShadow: on ? "var(--shadow-sm)" : "none",
                  padding: "7px 14px",
                  borderRadius: 9,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {option.label}
              </button>
            )
          })}
        </div>

        <Label>MESSAGE</Label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title — what tenants see first"
          aria-label="Title"
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: "var(--card)",
            border: "1px solid var(--line-strong)",
            borderRadius: 10,
            padding: "11px 13px",
            fontSize: 13.5,
            color: "var(--txt)",
            outline: "none",
            fontFamily: "inherit",
          }}
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="The announcement body. Plain language — tenants forward these to their staff."
          aria-label="Body"
          style={{
            width: "100%",
            boxSizing: "border-box",
            marginTop: 8,
            resize: "vertical",
            background: "var(--card)",
            border: "1px solid var(--line-strong)",
            borderRadius: 10,
            padding: "11px 13px",
            fontSize: 13,
            lineHeight: 1.55,
            color: "var(--txt)",
            outline: "none",
            fontFamily: "inherit",
          }}
        />

        <Label>AUDIENCE</Label>
        <AudiencePicker
          audience={audience}
          category={category}
          tenantIds={tenantIds}
          disabled={busy}
          onChange={(next) => {
            setAudience(next.audience)
            setCategory(next.category)
            setTenantIds(next.tenantIds)
          }}
        />

        <Label>DELIVERY</Label>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12.5,
              color: "var(--txt2)",
            }}
          >
            <input
              type="checkbox"
              checked={notifyStaff}
              onChange={(e) => setNotifyStaff(e.target.checked)}
              style={{ accentColor: "var(--accent)" }}
            />
            Also email each institution&rsquo;s staff digest
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12.5,
              color: "var(--txt2)",
            }}
          >
            Expires
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              aria-label="Expires at"
              style={{
                background: "var(--card)",
                border: "1px solid var(--line-strong)",
                borderRadius: 9,
                padding: "7px 11px",
                fontSize: 12.5,
                color: "var(--txt)",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </label>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 8 }}>
          Leave the expiry empty to keep it up until you unpublish it.
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 22,
            paddingTop: 16,
            borderTop: "1px solid var(--line)",
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 12, color: "var(--txt3)" }}>
            {/* Publishing reaches other organisations — say so before the click,
                not in a toast afterwards. */}
            Publishing delivers immediately and cannot be recalled from inboxes.
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={close}
              disabled={busy}
              style={{
                border: "1px solid var(--line-strong)",
                color: "var(--txt2)",
                background: "transparent",
                fontSize: 12.5,
                fontWeight: 500,
                padding: "8px 14px",
                borderRadius: 10,
                cursor: busy ? "default" : "pointer",
                whiteSpace: "nowrap",
                fontFamily: "inherit",
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!ready || busy}
              onClick={() => void submit(false)}
              style={{
                border: "1px solid var(--line-strong)",
                color: ready && !busy ? "var(--txt2)" : "var(--txt4)",
                background: "transparent",
                fontSize: 12.5,
                fontWeight: 500,
                padding: "8px 14px",
                borderRadius: 10,
                cursor: ready && !busy ? "pointer" : "default",
                whiteSpace: "nowrap",
                fontFamily: "inherit",
              }}
            >
              Save as draft
            </button>

            <button
              type="button"
              disabled={!ready || busy}
              onClick={() => void submit(true)}
              style={{
                background: ready && !busy ? "var(--accent)" : "var(--panel)",
                color: ready && !busy ? "#fff" : "var(--txt4)",
                border: "none",
                fontSize: 12.5,
                fontWeight: 500,
                padding: "8px 16px",
                borderRadius: 10,
                cursor: ready && !busy ? "pointer" : "default",
                whiteSpace: "nowrap",
                fontFamily: "inherit",
              }}
            >
              {busy ? "Sending…" : "Publish now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        letterSpacing: ".07em",
        color: "var(--txt4)",
        marginTop: 18,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  )
}
