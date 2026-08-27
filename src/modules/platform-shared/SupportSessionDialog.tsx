"use client"

import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import apiClient from "@/lib/clients/apiClient"

export type SupportSession = {
  reference: string
  token: string
  url: string
  expiresAt: string
  readOnly: boolean
}

/**
 * Opening a support session into an institution's own portal.
 *
 * The reason is required and the dialog says why: the institution reads it in
 * their own audit trail. Support access is never silent, and never unexplained
 * — so this cannot be dismissed past without typing something.
 */
export function SupportSessionDialog({
  tenantId,
  name,
  slug,
  onClose,
  onOpened,
}: {
  tenantId: number
  name: string
  slug: string
  onClose: () => void
  onOpened: (session: SupportSession) => void
}) {
  const [reason, setReason] = useState("")

  const open = useMutation({
    mutationFn: async () =>
      (
        await apiClient.post<{ data: SupportSession }>(
          `/platform/tenants/${tenantId}/support-sessions`,
          { reason },
          { access_token: true }
        )
      ).data,
    onSuccess: (session) => {
      onOpened(session)
      onClose()
    },
    onError: (e) =>
      toast.error(
        (e as { message?: string } | null)?.message ??
          "That session could not be opened."
      ),
  })

  const ready = reason.trim().length > 0

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <button
        type="button"
        aria-label="Cancel"
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(8,12,18,.5)",
          border: "none",
          padding: 0,
          cursor: "default",
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Open ${name}'s console`}
        style={{
          position: "relative",
          width: 480,
          maxWidth: "calc(100vw - 32px)",
          background: "var(--surface-solid)",
          border: "1px solid var(--line-strong)",
          borderRadius: 18,
          boxShadow: "0 30px 80px rgba(8,12,18,.4)",
          padding: 24,
          color: "var(--txt)",
          fontFamily: "var(--font-geist), Geist, 'Helvetica Neue', sans-serif",
        }}
      >
        <div
          style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.015em" }}
        >
          Open {name}&apos;s console?
        </div>

        <div
          style={{
            fontSize: 13,
            color: "var(--txt2)",
            lineHeight: 1.6,
            marginTop: 10,
          }}
        >
          This opens{" "}
          <span
            className="qhub-mono"
            style={{ fontSize: 12, color: "var(--accent)" }}
          >
            {slug}
          </span>{" "}
          in a <b>support session</b>: you act as the <b>QHub Support</b>{" "}
          principal — never as one of their admins — read-only, for{" "}
          <b>30 minutes</b>. The session and your reason are written to the
          tenant&apos;s audit trail and visible to them. Support access is never
          silent.
        </div>

        <div
          style={{
            fontSize: 11,
            letterSpacing: ".07em",
            color: "var(--txt4)",
            marginTop: 16,
            marginBottom: 7,
          }}
        >
          REASON — REQUIRED, THE TENANT READS THIS
        </div>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          placeholder="e.g. Reproducing the gradebook display issue reported in TKT-4451"
          aria-label="Reason for opening a support session"
          style={{
            width: "100%",
            boxSizing: "border-box",
            resize: "vertical",
            background: "var(--card)",
            border: "1px solid var(--line-strong)",
            borderRadius: 10,
            padding: "10px 13px",
            fontSize: 13,
            lineHeight: 1.5,
            color: "var(--txt)",
            outline: "none",
            fontFamily: "inherit",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 16,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "1px solid var(--line-strong)",
              borderRadius: 10,
              background: "transparent",
              color: "var(--txt2)",
              fontSize: 12.5,
              fontWeight: 500,
              padding: "9px 16px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => ready && open.mutate()}
            disabled={!ready || open.isPending}
            style={{
              background: ready ? "var(--accent)" : "var(--line-strong)",
              color: ready ? "#fff" : "var(--txt4)",
              fontSize: 12.5,
              fontWeight: 500,
              padding: "9px 18px",
              borderRadius: 10,
              border: "none",
              cursor: ready ? "pointer" : "default",
              fontFamily: "inherit",
            }}
          >
            Open support session · 30 min
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * The in-session frame, lifted from the draft.
 *
 * Undismissible by design: an operator inside somebody else's portal should
 * never be able to forget they are there. The orange border and banner are the
 * whole point.
 *
 * The Courses table is THEIR live data, read with the session token against
 * their own host — which is what "you see what their admins see" means. The
 * Edit control makes a real write attempt, so the blocked-write banner is a
 * demonstration of the two controls refusing rather than a description of
 * them.
 */
export function SupportSessionFrame({
  session,
  institution,
  slug,
  reason,
  onEnd,
}: {
  session: SupportSession
  institution: string
  slug: string
  reason: string
  onEnd: () => void
}) {
  const [blocked, setBlocked] = useState(false)

  const expires = new Date(session.expiresAt).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })

  // Their host, their token. The console's own base URL would resolve to the
  // platform host, where this token is not valid.
  const base = session.url.replace(/\/$/, "")

  const courses = useQuery({
    queryKey: ["support-session", session.reference, "courses"],
    queryFn: async () => {
      const res = await fetch(`${base}/api/v1/courses`, {
        headers: { Authorization: `Bearer ${session.token}` },
      })

      if (!res.ok) throw new Error(String(res.status))

      const body = (await res.json()) as {
        data: Array<{
          id: number
          code: string
          title: string
          creditUnits: number | null
          isActive: boolean
        }>
      }

      return body.data
    },
  })

  /** Deliberately attempts a write, so the refusal is real. */
  const tryWrite = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${base}/api/v1/courses/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "support-session write test" }),
      })

      if (res.ok) {
        // Would mean both controls failed. Loud, not silent.
        throw new Error("WRITE_SUCCEEDED")
      }

      return res.status
    },
    onSuccess: () => setBlocked(true),
    onError: (e) => {
      if ((e as Error).message === "WRITE_SUCCEEDED") {
        toast.error(
          "A write went through in a read-only session. Stop and report this."
        )

        return
      }

      setBlocked(true)
    },
  })

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 380,
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        border: "4px solid var(--series2)",
        boxSizing: "border-box",
        color: "var(--txt)",
        fontFamily: "var(--font-geist), Geist, 'Helvetica Neue', sans-serif",
      }}
    >
      <div
        style={{
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "var(--series2)",
          color: "#fff",
          padding: "10px 20px",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5.5 20c.9-3.4 3.5-5 6.5-5s5.6 1.6 6.5 5" />
        </svg>

        <div style={{ fontSize: 13, fontWeight: 600 }}>
          SUPPORT SESSION — {institution}
        </div>
        <div style={{ fontSize: 12, opacity: 0.9 }}>
          Read-only · acting as QHub Support · expires {expires}
        </div>
        <div
          style={{
            fontSize: 11.5,
            opacity: 0.85,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 420,
          }}
        >
          Reason on their audit trail: &quot;{reason}&quot;
        </div>

        <button
          type="button"
          onClick={onEnd}
          style={{
            marginLeft: "auto",
            background: "rgba(255,255,255,.18)",
            border: "1px solid rgba(255,255,255,.5)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            padding: "7px 16px",
            borderRadius: 9,
            cursor: "pointer",
            whiteSpace: "nowrap",
            fontFamily: "inherit",
          }}
        >
          End session now
        </button>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "34px 44px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: "var(--accent)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {institution.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {institution} — Learning portal
            </div>
            <div
              className="qhub-mono"
              style={{ fontSize: 11, color: "var(--txt4)" }}
            >
              {slug} · you see what their admins see
            </div>
          </div>
        </div>

        {blocked && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 18,
              background: "var(--warn-bg)",
              border: "1px solid var(--warn)",
              borderRadius: 12,
              padding: "11px 16px",
              fontSize: 12.5,
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--warn)"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V7a4 4 0 018 0v4" />
            </svg>
            Writes are blocked in support sessions — two independent controls
            refused this edit (the session flag and the QHub Support principal).
            Nothing was changed, and the attempt was logged.
            <button
              type="button"
              onClick={() => setBlocked(false)}
              aria-label="Dismiss"
              style={{
                marginLeft: "auto",
                fontSize: 12,
                color: "var(--txt4)",
                background: "none",
                border: "none",
                padding: "0 4px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              ✕
            </button>
          </div>
        )}

        <div
          style={{
            background: "var(--card)",
            borderRadius: 18,
            boxShadow: "var(--shadow-card)",
            overflow: "hidden",
            marginTop: 20,
            maxWidth: 980,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "16px 22px 4px",
            }}
          >
            <div style={{ fontSize: 14.5, fontWeight: 600 }}>Courses</div>
            <div
              style={{
                marginLeft: "auto",
                fontSize: 11.5,
                color: "var(--txt4)",
              }}
            >
              their data, live · read-only
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "90px minmax(0,1.6fr) 160px 110px 120px",
              columnGap: 14,
              padding: "12px 22px 9px",
              fontSize: 10.5,
              letterSpacing: ".09em",
              color: "var(--txt4)",
            }}
          >
            <div>CODE</div>
            <div>COURSE</div>
            <div>CREDITS</div>
            <div>STATUS</div>
            <div />
          </div>

          {courses.isPending && (
            <div
              style={{
                padding: "20px 22px",
                fontSize: 13,
                color: "var(--txt3)",
              }}
            >
              Loading their courses…
            </div>
          )}

          {courses.isError && (
            <div
              style={{
                padding: "20px 22px",
                fontSize: 13,
                color: "var(--neg)",
              }}
            >
              Their portal could not be read with this session.
            </div>
          )}

          {courses.data?.length === 0 && (
            <div
              style={{
                padding: "20px 22px",
                fontSize: 13,
                color: "var(--txt3)",
              }}
            >
              This institution has no courses yet.
            </div>
          )}

          {(courses.data ?? []).map((c) => (
            <div
              key={c.id}
              style={{
                display: "grid",
                gridTemplateColumns: "90px minmax(0,1.6fr) 160px 110px 120px",
                columnGap: 14,
                alignItems: "center",
                padding: "11px 22px",
                fontSize: 13,
                borderTop: "1px solid var(--line2)",
              }}
            >
              <div
                className="qhub-mono"
                style={{ fontSize: 11, color: "var(--txt3)" }}
              >
                {c.code}
              </div>
              <div style={{ fontWeight: 500 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: "var(--txt3)" }}>
                {c.creditUnits ?? "—"}
              </div>
              <div style={{ fontSize: 12, color: "var(--txt2)" }}>
                {c.isActive ? "Active" : "Inactive"}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => tryWrite.mutate(c.id)}
                  title="Writes are blocked in support sessions"
                  style={{
                    border: "1px solid var(--line-strong)",
                    borderRadius: 8,
                    background: "transparent",
                    color: "var(--txt4)",
                    fontSize: 11.5,
                    fontWeight: 500,
                    padding: "5px 11px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Edit ⃠
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 14 }}>
          This frame cannot be dismissed. The session ends at {expires} or when
          you end it — whichever comes first.
        </div>
      </div>
    </div>
  )
}
