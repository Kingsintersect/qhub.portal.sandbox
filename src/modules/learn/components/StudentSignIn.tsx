"use client"

import { useState } from "react"

/**
 * Student sign-in, lifted from the bundle 25 canvas as the presentation layer
 * over the real authentication call.
 *
 * Students sign in with a matric number rather than an email, which is the one
 * identifier every enrolled student is certain to have and to remember.
 *
 * The canvas paints this screen in literal hex rather than tokens because it
 * is always light — it sits on a photograph — and that is kept: it removes any
 * chance of the app's dark theme reaching a card that was never designed for
 * it.
 *
 * Unlike the portal's, this form is single-step, so there is no identity card
 * to leak an account's existence. The failure copy is still deliberately
 * generic: a wrong password and an unknown matric number read the same.
 */

export function StudentSignIn({
  school,
  host,
  schoolInitials,
  onSignIn,
}: {
  school: string
  host: string
  schoolInitials: string
  /** Resolves to an error message, or null when the session is established. */
  onSignIn: (matric: string, password: string) => Promise<string | null>
}) {
  const [matric, setMatric] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (busy) return

    if (matric.length < 6 || password.length < 4) {
      setError("Enter your matric number and password.")
      return
    }

    setBusy(true)
    setError("")
    const message = await onSignIn(matric.trim(), password)
    setBusy(false)
    if (message !== null) setError(message)
  }

  return (
    <div
      data-theme="light"
      style={{
        minHeight: "100vh",
        background: "url('/student-login-bg.jpg') center/cover no-repeat",
        fontFamily: "Geist, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(10,14,26,.28)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 26,
          left: 32,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 11,
            background: "rgba(255,255,255,.94)",
            color: "#0E2A55",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            fontWeight: 700,
            boxShadow: "0 8px 24px rgba(8,12,18,.3)",
          }}
        >
          {schoolInitials}
        </div>
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#fff",
              textShadow: "0 1px 8px rgba(8,12,18,.5)",
            }}
          >
            {school}
          </div>
          <div
            className="learn-mono"
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,.85)",
              textShadow: "0 1px 6px rgba(8,12,18,.5)",
            }}
          >
            {host}
          </div>
        </div>
      </div>

      <div style={{ width: 400, position: "relative" }}>
        <div
          style={{
            background: "#FFFFFF",
            boxShadow: "0 40px 100px rgba(8,12,18,.45)",
            padding: "32px 32px 28px",
            color: "#151C26",
          }}
        >
          <div
            style={{
              fontSize: 19,
              fontWeight: 600,
              letterSpacing: "-0.015em",
            }}
          >
            Student sign in
          </div>
          {/* Says where staff go, so a lecturer who lands here is redirected
              by the copy rather than by a failed attempt. */}
          <div
            style={{
              fontSize: 12.5,
              color: "#7A8490",
              margin: "5px 0 20px",
              lineHeight: 1.5,
            }}
          >
            Your matric number and portal password. Staff sign in on the
            institution portal.
          </div>

          <div style={{ fontSize: 12, color: "#7A8490", marginBottom: 6 }}>
            Matric number
          </div>
          <input
            value={matric}
            onChange={(e) => setMatric(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void submit()
            }}
            placeholder="UNILAG/2023/41207"
            autoComplete="username"
            className="learn-mono"
            style={{ ...FIELD, fontSize: 12.5 }}
          />

          <div style={{ fontSize: 12, color: "#7A8490", margin: "14px 0 6px" }}>
            Password
          </div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void submit()
            }}
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            style={FIELD}
          />

          {error !== "" && (
            <div style={{ fontSize: 12, color: "#B4553C", marginTop: 10 }}>
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={busy}
            onClick={() => void submit()}
            style={{
              width: "100%",
              background: "#1D5FBF",
              color: "#fff",
              textAlign: "center",
              fontSize: 13.5,
              fontWeight: 500,
              padding: "12px 0",
              borderRadius: 11,
              cursor: busy ? "default" : "pointer",
              marginTop: 18,
              border: "none",
              fontFamily: "inherit",
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? "…" : "Sign in"}
          </button>

          <div
            style={{
              fontSize: 11.5,
              color: "#A4ACB6",
              marginTop: 14,
              lineHeight: 1.5,
            }}
          >
            Forgot your password? A reset link goes to your student email. Your
            account was created when the registry enrolled you — there is no
            signup.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            marginTop: 16,
            fontSize: 11.5,
            color: "rgba(255,255,255,.9)",
            textShadow: "0 1px 6px rgba(8,12,18,.5)",
          }}
        >
          Powered by
          {/* eslint-disable-next-line @next/next/no-img-element -- supplied GIF artwork, used verbatim */}
          <img
            src="/brand/qverse-lockup-color-white.gif"
            alt="Qverse"
            style={{ height: 16, width: "auto" }}
          />
        </div>
      </div>
    </div>
  )
}

const FIELD: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "#F5F7FA",
  border: "1px solid #DFE4EA",
  borderRadius: 10,
  padding: "11px 13px",
  fontSize: 13.5,
  color: "#151C26",
  fontFamily: "inherit",
  outline: "none",
}
