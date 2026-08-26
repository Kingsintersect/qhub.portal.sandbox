"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"

import { setPlatformPassword } from "@/lib/auth/platformAuth"

/**
 * Where an invitation or reset link lands.
 *
 * This is the design's "Welcome to QHub" card, rendered at the point in the
 * flow where it can actually work: the link carries a single-use token, and
 * the token is what proves the person owns the address. Collecting a password
 * against a bare email address — which is what the draft's card does on the
 * sign-in screen — would let anyone take over any account.
 */

const C = {
  ink: "#141A22",
  body: "#5A6472",
  bodyStrong: "#3E4753",
  label: "#8A93A0",
  accent: "#1D5FBF",
  field: "#F5F7FA",
  fieldBorder: "#DCE1E8",
  negText: "#C2453A",
  negBg: "#FBEBE9",
  okText: "#25784A",
  okBg: "#E9F4EC",
  infoBg: "#EDF3FC",
} as const

const MIN_LENGTH = 8

const fieldStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: C.field,
  border: `1px solid ${C.fieldBorder}`,
  padding: "12px 14px",
  fontSize: 14,
  color: C.ink,
  outline: "none",
  fontFamily: "inherit",
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: ".07em",
  color: C.label,
  marginTop: 22,
  marginBottom: 7,
}

function SetPasswordCard() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get("token") ?? ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!token) {
      setError(
        "This link is missing its token. Use the link from your email exactly as it was sent."
      )
      return
    }
    if (password.length < MIN_LENGTH) {
      setError(`Choose a password of at least ${MIN_LENGTH} characters.`)
      return
    }
    if (password !== confirm) {
      setError("Those two passwords do not match.")
      return
    }

    setError(null)
    setBusy(true)

    try {
      await setPlatformPassword({
        token,
        password,
        passwordConfirmation: confirm,
      })
      setDone(true)
    } catch (e) {
      setError(
        (e as { message?: string } | null)?.message ??
          "That link has already been used or has expired. Ask for a new one from the sign-in screen."
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      style={{
        position: "relative",
        width: 400,
        background: "#FFFFFF",
        boxShadow: "0 40px 100px rgba(8,12,18,.45)",
        padding: "34px 34px 30px",
        color: C.ink,
      }}
    >
      <div style={{ fontSize: 21, fontWeight: 600, letterSpacing: "-0.02em" }}>
        Welcome to QHub
      </div>

      {done ? (
        <>
          <div
            style={{
              fontSize: 13,
              color: C.okText,
              background: C.okBg,
              padding: "12px 14px",
              marginTop: 14,
              lineHeight: 1.6,
            }}
          >
            Your password is set. Every other session on this account has been
            signed out.
          </div>
          <div
            style={{
              fontSize: 12,
              color: C.label,
              marginTop: 12,
              lineHeight: 1.6,
            }}
          >
            You&apos;ll be asked to enrol an authenticator app next — QHub staff
            accounts require MFA.
          </div>
          <button
            type="button"
            onClick={() => router.replace("/platform/signin")}
            style={{
              marginTop: 20,
              background: C.accent,
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              padding: 13,
              textAlign: "center",
              cursor: "pointer",
              border: "none",
              width: "100%",
              fontFamily: "inherit",
            }}
          >
            Go to sign in
          </button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 13, color: C.body, marginTop: 5 }}>
            Set your password to activate the account your admin created.
          </div>

          <div style={labelStyle}>CHOOSE A PASSWORD</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void submit()}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            aria-label="Choose a password"
            style={fieldStyle}
          />

          <div style={labelStyle}>CONFIRM PASSWORD</div>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void submit()}
            placeholder="Type it again"
            autoComplete="new-password"
            aria-label="Confirm password"
            style={fieldStyle}
          />

          {error && (
            <div
              style={{
                fontSize: 12.5,
                color: C.negText,
                background: C.negBg,
                padding: "9px 12px",
                marginTop: 12,
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ fontSize: 12, color: C.label, marginTop: 12 }}>
            You&apos;ll be asked to enrol an authenticator app next — QHub staff
            accounts require MFA.
          </div>

          <button
            type="button"
            onClick={() => void submit()}
            disabled={busy}
            style={{
              marginTop: 16,
              background: C.accent,
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              padding: 13,
              textAlign: "center",
              cursor: busy ? "default" : "pointer",
              border: "none",
              width: "100%",
              fontFamily: "inherit",
            }}
          >
            Set password
          </button>

          <button
            type="button"
            onClick={() => router.replace("/platform/signin")}
            style={{
              marginTop: 16,
              fontSize: 12.5,
              color: C.accent,
              cursor: "pointer",
              background: "none",
              border: "none",
              padding: 0,
              fontFamily: "inherit",
              display: "block",
            }}
          >
            ← Back to sign in
          </button>
        </>
      )}
    </div>
  )
}

export default function PlatformSetPasswordPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "url('/platform/login-bg.jpg') center / cover no-repeat",
        fontFamily: "var(--font-geist), Geist, 'Helvetica Neue', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(10,16,28,.22)",
        }}
        aria-hidden="true"
      />

      <div
        style={{
          position: "absolute",
          top: 28,
          left: 32,
          display: "flex",
          alignItems: "center",
          gap: 11,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            background: "rgba(255,255,255,.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(8,12,18,.25)",
          }}
        >
          <svg
            style={{ stroke: C.accent }}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18M3 12h18" />
          </svg>
        </div>
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: "#fff",
              textShadow: "0 1px 8px rgba(8,12,18,.4)",
            }}
          >
            QHub
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: "rgba(255,255,255,.85)",
              textShadow: "0 1px 6px rgba(8,12,18,.4)",
            }}
          >
            Institutions manager
          </div>
        </div>
      </div>

      <Suspense
        fallback={
          <div
            style={{
              position: "relative",
              width: 400,
              background: "#FFFFFF",
              boxShadow: "0 40px 100px rgba(8,12,18,.45)",
              padding: "34px 34px 30px",
              color: C.ink,
              fontSize: 13,
            }}
          >
            <div
              style={{
                background: C.infoBg,
                padding: "12px 14px",
                color: C.bodyStrong,
              }}
            >
              Checking your link…
            </div>
          </div>
        }
      >
        <SetPasswordCard />
      </Suspense>

      <div
        style={{
          position: "absolute",
          bottom: 22,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 11.5,
          color: "rgba(255,255,255,.75)",
          textShadow: "0 1px 6px rgba(8,12,18,.4)",
        }}
      >
        © 2026 QHub · access is logged to the platform audit trail
      </div>
    </div>
  )
}
