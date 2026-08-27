"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
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
 * The in-session frame.
 *
 * Undismissible by design: an operator inside somebody else's portal should
 * never be able to forget they are there. The orange border and banner are the
 * whole point.
 */
export function SupportSessionFrame({
  session,
  institution,
  slug,
  onEnd,
}: {
  session: SupportSession
  institution: string
  slug: string
  onEnd: () => void
}) {
  const expires = new Date(session.expiresAt).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
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
          flexWrap: "wrap",
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

        {/*
          The session token belongs to the institution's host, not this one, so
          the portal itself is opened in its own tab rather than embedded — an
          iframe here would be a cross-origin request carrying their token from
          our page, which is exactly the shape we should not build.
        */}
        <div
          style={{
            background: "var(--card)",
            borderRadius: 18,
            boxShadow: "var(--shadow-card)",
            padding: "20px 22px",
            marginTop: 20,
            maxWidth: 980,
          }}
        >
          <div style={{ fontSize: 14.5, fontWeight: 600 }}>
            Session {session.reference} is open
          </div>
          <p
            style={{
              fontSize: 13,
              color: "var(--txt2)",
              lineHeight: 1.6,
              marginTop: 8,
            }}
          >
            Their portal opens in a separate tab, signed in as the QHub Support
            principal. Every write is refused by two independent controls — the
            session flag and that principal&apos;s permissions — and each
            refusal is written to their audit trail as well as ours.
          </p>

          <a
            href={session.url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              marginTop: 14,
              background: "var(--accent)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 500,
              padding: "10px 18px",
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            Open {slug} →
          </a>
        </div>

        <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 14 }}>
          This frame cannot be dismissed. The session ends at {expires} or when
          you end it — whichever comes first.
        </div>
      </div>
    </div>
  )
}
